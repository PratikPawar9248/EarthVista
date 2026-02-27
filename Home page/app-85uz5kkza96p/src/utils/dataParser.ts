import Papa from 'papaparse';
import type { DataPoint, Dataset, FileUploadResult } from '@/types/heatmap';
import { parseNetCDFFile } from './netcdfParser';
import { parseHDF5File } from './hdf5Parser';
import { cacheFileData } from './fieldSwitcher';

// No file size limit - support any size dataset
const MAX_POINTS = 100000;

/**
 * Simple file parser - supports CSV, JSON, NetCDF, and HDF5 formats
 */
export async function parseFile(
  file: File,
  options?: {
    maxPoints?: number;
    onProgress?: (progress: number, message: string) => void;
  }
): Promise<FileUploadResult> {
  const maxPoints = options?.maxPoints || MAX_POINTS;
  const onProgress = options?.onProgress || (() => {});

  console.log('Starting file parse:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

  if (file.size === 0) {
    return {
      success: false,
      error: 'File is empty'
    };
  }

  // Route to appropriate parser based on file extension
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop() || '';
  
  console.log('File type detected:', extension);
  
  if (fileName.endsWith('.csv')) {
    return parseCSV(file, maxPoints, onProgress);
  } else if (fileName.endsWith('.json')) {
    return parseJSON(file, maxPoints, onProgress);
  } else if (fileName.endsWith('.nc')) {
    return parseNetCDF(file, maxPoints, onProgress);
  } else if (fileName.endsWith('.hdf') || fileName.endsWith('.hdf5') || fileName.endsWith('.h5')) {
    return parseHDF5(file, maxPoints, onProgress);
  } else {
    return {
      success: false,
      error: `Unsupported file format: .${extension}. Please use CSV, JSON, NetCDF (.nc), or HDF5 (.hdf, .hdf5, .h5) files`
    };
  }
}

/**
 * Parse CSV file with streaming support for large files
 */
async function parseCSV(
  file: File,
  maxPoints: number,
  onProgress: (progress: number, message: string) => void
): Promise<FileUploadResult> {
  return new Promise((resolve) => {
    try {
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`Parsing CSV file: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
      
      onProgress(10, `Reading CSV file (${fileSizeMB.toFixed(1)} MB)...`);
      
      // Use streaming for files larger than 50MB
      const useStreaming = file.size > 50 * 1024 * 1024;
      
      if (useStreaming) {
        console.log('Using streaming mode for large CSV file');
        onProgress(15, 'Processing large file with streaming...');
      }
      
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        worker: useStreaming, // Use web worker for large files
        chunkSize: useStreaming ? 1024 * 1024 : undefined, // 1MB chunks for streaming
        complete: (results) => {
          try {
            console.log('CSV parse complete. Rows:', results.data.length);
            onProgress(50, `Processing ${results.data.length.toLocaleString()} rows...`);
            
            if (!results.data || results.data.length === 0) {
              resolve({ success: false, error: 'File is empty or contains no data' });
              return;
            }

            const headers = results.meta.fields || [];
            console.log('CSV headers:', headers);
            
            if (headers.length === 0) {
              resolve({ success: false, error: 'No columns found in CSV file' });
              return;
            }
            
            // Find lat/lon columns (case-insensitive, trim whitespace)
            const latCol = headers.find(h => 
              /^(lat|latitude|y)$/i.test(h.toLowerCase().trim())
            );
            const lonCol = headers.find(h => 
              /^(lon|long|longitude|x)$/i.test(h.toLowerCase().trim())
            );

            console.log('Detected columns - lat:', latCol, 'lon:', lonCol);

            if (!latCol || !lonCol) {
              resolve({ 
                success: false, 
                error: `Missing required columns. Found: ${headers.join(', ')}. Need: lat, lon, value` 
              });
              return;
            }

            // Find value column (first numeric column that's not lat/lon)
            const valueCol = headers.find(h => h !== latCol && h !== lonCol) || headers[headers.length - 1];
            
            console.log('Value column:', valueCol);
            
            if (!valueCol) {
              resolve({ success: false, error: 'No value column found' });
              return;
            }
            
            const points: DataPoint[] = [];

            onProgress(60, `Extracting data points from ${results.data.length.toLocaleString()} rows...`);

            // Extract data points with validation and progress reporting
            const totalRows = results.data.length;
            let processedRows = 0;
            let lastProgressUpdate = 0;
            
            for (const row of results.data as Record<string, unknown>[]) {
              try {
                const lat = Number(row[latCol]);
                const lon = Number(row[lonCol]);
                const value = Number(row[valueCol]);

                // Validate numbers
                if (isNaN(lat) || isNaN(lon) || isNaN(value)) continue;
                
                // Validate ranges
                if (lat < -90 || lat > 90) continue;
                if (lon < -180 || lon > 180) continue;
                
                // Validate value is finite
                if (!isFinite(value)) continue;
                
                points.push({ lat, lon, value });
                
                // Update progress every 10% for large files
                processedRows++;
                const currentProgress = Math.floor((processedRows / totalRows) * 100);
                if (currentProgress - lastProgressUpdate >= 10) {
                  onProgress(60 + Math.floor(currentProgress * 0.2), `Extracted ${points.length.toLocaleString()} valid points...`);
                  lastProgressUpdate = currentProgress;
                }
              } catch {
                // Skip invalid rows
                continue;
              }
            }

            console.log('Valid points extracted:', points.length);

            if (points.length === 0) {
              resolve({ 
                success: false, 
                error: 'No valid data points found. Check that lat is -90 to 90, lon is -180 to 180' 
              });
              return;
            }

            onProgress(85, `Optimizing ${points.length.toLocaleString()} points...`);

            // Decimate if too many points
            const needsDecimation = points.length > maxPoints;
            if (needsDecimation) {
              console.log(`Decimating ${points.length} points to ${maxPoints} for performance`);
              onProgress(90, `Optimizing dataset (${points.length.toLocaleString()} → ${maxPoints.toLocaleString()} points)...`);
            }
            
            const finalPoints = needsDecimation 
              ? decimatePoints(points, maxPoints)
              : points;

            console.log('Final points after decimation:', finalPoints.length);
            
            if (needsDecimation) {
              console.log(`Dataset optimized: ${points.length} → ${finalPoints.length} points (${((finalPoints.length / points.length) * 100).toFixed(1)}% retained)`);
            }

            // Cache raw data for field switching
            const allFields = headers.filter(h => h !== latCol && h !== lonCol);
            cacheFileData(file.name, {
              file,
              type: 'csv',
              rawData: results.data,
              latCol,
              lonCol,
              allFields
            });

            const dataset: Dataset = {
              name: file.name,
              points: finalPoints,
              valueRange: getValueRange(finalPoints),
              fields: allFields,
              selectedField: valueCol
            };

            onProgress(100, 'Complete');
            console.log('CSV parsing successful!');
            resolve({ success: true, data: dataset });
          } catch (error) {
            console.error('Error in CSV complete handler:', error);
            resolve({ 
              success: false, 
              error: `Error processing CSV: ${error instanceof Error ? error.message : 'Unknown error'}` 
            });
          }
        },
        error: (error) => {
          resolve({ success: false, error: `Failed to read CSV: ${error.message}` });
        }
      });
    } catch (error) {
      resolve({ 
        success: false, 
        error: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });
}

/**
 * Parse JSON file
 */
async function parseJSON(
  file: File,
  maxPoints: number,
  onProgress: (progress: number, message: string) => void
): Promise<FileUploadResult> {
  try {
    onProgress(20, 'Reading JSON file...');
    
    const text = await file.text();
    
    if (!text || text.trim().length === 0) {
      return { success: false, error: 'File is empty' };
    }
    
    let json;
    try {
      json = JSON.parse(text);
    } catch (error) {
      return { 
        success: false, 
        error: `Invalid JSON format: ${error instanceof Error ? error.message : 'Parse error'}` 
      };
    }
    
    onProgress(50, 'Processing data...');
    
    let data = Array.isArray(json) ? json : json.data || [];
    
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, error: 'No data array found in JSON file' };
    }

    const points: DataPoint[] = [];
    
    onProgress(70, 'Extracting points...');
    
    for (const item of data) {
      try {
        const lat = Number(item.lat || item.latitude || item.y);
        const lon = Number(item.lon || item.long || item.longitude || item.x);
        const value = Number(item.value || item.val || item.data || item.temperature || item.temp);

        // Validate numbers
        if (isNaN(lat) || isNaN(lon) || isNaN(value)) continue;
        
        // Validate ranges
        if (lat < -90 || lat > 90) continue;
        if (lon < -180 || lon > 180) continue;
        
        // Validate value is finite
        if (!isFinite(value)) continue;
        
        points.push({ lat, lon, value });
      } catch {
        // Skip invalid items
        continue;
      }
    }

    if (points.length === 0) {
      return { 
        success: false, 
        error: 'No valid data points found. Check that lat is -90 to 90, lon is -180 to 180' 
      };
    }

    onProgress(90, 'Finalizing...');

    const finalPoints = points.length > maxPoints 
      ? decimatePoints(points, maxPoints)
      : points;

    // Detect lat/lon columns
    const firstItem = data[0] || {};
    const latCol = Object.keys(firstItem).find(k => ['lat', 'latitude', 'y'].includes(k.toLowerCase())) || 'lat';
    const lonCol = Object.keys(firstItem).find(k => ['lon', 'longitude', 'long', 'x'].includes(k.toLowerCase())) || 'lon';
    const allFields = Object.keys(firstItem).filter(k => !['lat', 'latitude', 'lon', 'longitude', 'x', 'y'].includes(k.toLowerCase()));

    // Cache raw data for field switching
    cacheFileData(file.name, {
      file,
      type: 'json',
      rawData: data,
      latCol,
      lonCol,
      allFields
    });

    const dataset: Dataset = {
      name: file.name,
      points: finalPoints,
      valueRange: getValueRange(finalPoints),
      fields: allFields,
      selectedField: allFields[0] || 'value'
    };

    onProgress(100, 'Complete');
    return { success: true, data: dataset };
  } catch (error) {
    return { 
      success: false, 
      error: `Error processing JSON: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Parse NetCDF file
 */
async function parseNetCDF(
  file: File,
  maxPoints: number,
  onProgress: (progress: number, message: string) => void
): Promise<FileUploadResult> {
  try {
    const result = await parseNetCDFFile(file, { maxPoints, onProgress });
    
    // Cache file for field switching
    cacheFileData(file.name, {
      file,
      type: 'netcdf',
      rawData: null,
      latCol: 'lat',
      lonCol: 'lon',
      allFields: result.metadata.variables
    });

    const dataset: Dataset = {
      name: file.name,
      points: result.data,
      valueRange: getValueRange(result.data),
      fields: result.metadata.variables,
      selectedField: result.metadata.valueVariable
    };

    return { success: true, data: dataset };
  } catch (error) {
    return {
      success: false,
      error: `Error processing NetCDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Parse HDF5 file
 */
async function parseHDF5(
  file: File,
  maxPoints: number,
  onProgress: (progress: number, message: string) => void
): Promise<FileUploadResult> {
  try {
    const result = await parseHDF5File(file, { maxPoints, onProgress });
    
    const dataset: Dataset = {
      name: file.name,
      points: result.data,
      valueRange: getValueRange(result.data),
      fields: result.metadata.variables,
      selectedField: result.metadata.valueVariable
    };

    return { success: true, data: dataset };
  } catch (error) {
    return {
      success: false,
      error: `Error processing HDF5: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Decimate points using systematic sampling
 */
function decimatePoints(points: DataPoint[], maxPoints: number): DataPoint[] {
  const step = Math.ceil(points.length / maxPoints);
  const decimated: DataPoint[] = [];
  
  for (let i = 0; i < points.length; i += step) {
    decimated.push(points[i]);
  }
  
  return decimated;
}

/**
 * Calculate value range
 */
function getValueRange(points: DataPoint[]): { min: number; max: number } {
  if (points.length === 0) return { min: 0, max: 1 };
  
  const values = points.map(p => p.value);
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}
