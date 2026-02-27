import * as jsfive from 'jsfive';
import type { DataPoint } from '@/types/heatmap';

interface HDF5ParseResult {
  data: DataPoint[];
  metadata: {
    variables: string[];
    valueVariable: string;
  };
}

interface ParseOptions {
  maxPoints?: number;
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Parse HDF5 file and extract geospatial data
 * Supports .hdf, .hdf5, and .h5 formats
 */
export async function parseHDF5File(
  file: File,
  options: ParseOptions = {}
): Promise<HDF5ParseResult> {
  const { maxPoints = 100000, onProgress = () => {} } = options;

  console.log('Starting HDF5 parse:', file.name);
  onProgress(10, 'Reading HDF5 file...');

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    onProgress(30, 'Parsing HDF5 structure...');
    
    // Parse HDF5 file
    const hdf5File = new jsfive.File(arrayBuffer);
    
    onProgress(50, 'Extracting datasets...');
    
    // Try to find latitude, longitude, and value datasets
    const latData = findDataset(hdf5File, ['lat', 'latitude', 'y', 'LAT', 'LATITUDE']);
    const lonData = findDataset(hdf5File, ['lon', 'longitude', 'long', 'x', 'LON', 'LONGITUDE']);
    const valueData = findDataset(hdf5File, [
      'value', 'data', 'temperature', 'temp', 'sst', 'salinity', 
      'chlorophyll', 'pressure', 'depth', 'elevation', 'VALUE', 'DATA'
    ]);

    if (!latData || !lonData || !valueData) {
      throw new Error(
        'Could not find required datasets. Expected lat/latitude, lon/longitude, and value/data fields'
      );
    }

    onProgress(70, 'Processing data points...');

    // Convert to flat arrays
    const latArray = flattenArray(latData);
    const lonArray = flattenArray(lonData);
    const valueArray = flattenArray(valueData);

    console.log('HDF5 data dimensions:', {
      lat: latArray.length,
      lon: lonArray.length,
      value: valueArray.length
    });

    // Create data points
    const points: DataPoint[] = [];
    
    // Handle different data structures
    if (latArray.length === lonArray.length && latArray.length === valueArray.length) {
      // 1D arrays - direct mapping
      for (let i = 0; i < latArray.length; i++) {
        const lat = Number(latArray[i]);
        const lon = Number(lonArray[i]);
        const value = Number(valueArray[i]);

        if (isValidPoint(lat, lon, value)) {
          points.push({ lat, lon, value });
        }
      }
    } else if (latArray.length > 0 && lonArray.length > 0 && valueArray.length === latArray.length * lonArray.length) {
      // 2D grid - create meshgrid
      for (let i = 0; i < latArray.length; i++) {
        for (let j = 0; j < lonArray.length; j++) {
          const lat = Number(latArray[i]);
          const lon = Number(lonArray[j]);
          const value = Number(valueArray[i * lonArray.length + j]);

          if (isValidPoint(lat, lon, value)) {
            points.push({ lat, lon, value });
          }
        }
      }
    } else {
      throw new Error(
        `Incompatible data dimensions: lat=${latArray.length}, lon=${lonArray.length}, value=${valueArray.length}`
      );
    }

    if (points.length === 0) {
      throw new Error('No valid data points found in HDF5 file');
    }

    console.log(`Extracted ${points.length} valid points from HDF5`);

    onProgress(90, 'Finalizing...');

    // Decimate if needed
    const finalPoints = points.length > maxPoints
      ? decimatePoints(points, maxPoints)
      : points;

    onProgress(100, 'Complete');

    return {
      data: finalPoints,
      metadata: {
        variables: getAllDatasetNames(hdf5File),
        valueVariable: 'value'
      }
    };
  } catch (error) {
    console.error('HDF5 parsing error:', error);
    throw new Error(
      `Failed to parse HDF5 file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Find dataset by trying multiple possible names
 */
function findDataset(hdf5File: any, possibleNames: string[]): any {
  for (const name of possibleNames) {
    try {
      // Try root level
      if (hdf5File.get(name)) {
        const dataset = hdf5File.get(name);
        if (dataset && dataset.value) {
          return dataset.value;
        }
      }

      // Try common group paths
      const commonPaths = [
        `/${name}`,
        `/data/${name}`,
        `/geophysical_data/${name}`,
        `/science_data/${name}`,
        `/HDFEOS/GRIDS/Grid/Data Fields/${name}`,
        `/Grid/${name}`
      ];

      for (const path of commonPaths) {
        try {
          const dataset = hdf5File.get(path);
          if (dataset && dataset.value) {
            return dataset.value;
          }
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Flatten multi-dimensional array to 1D
 */
function flattenArray(arr: any): number[] {
  if (!arr) return [];
  
  if (Array.isArray(arr)) {
    return arr.flat(Infinity).map(Number);
  }
  
  // Handle typed arrays
  if (ArrayBuffer.isView(arr)) {
    return Array.from(arr as any).map(Number);
  }
  
  return [Number(arr)];
}

/**
 * Validate data point
 */
function isValidPoint(lat: number, lon: number, value: number): boolean {
  return (
    !isNaN(lat) && !isNaN(lon) && !isNaN(value) &&
    isFinite(lat) && isFinite(lon) && isFinite(value) &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
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
  
  console.log(`Decimated ${points.length} points to ${decimated.length}`);
  return decimated;
}

/**
 * Get all dataset names from HDF5 file
 */
function getAllDatasetNames(hdf5File: any): string[] {
  const names: string[] = [];
  
  try {
    // Try to get keys from root
    if (hdf5File.keys) {
      names.push(...hdf5File.keys());
    }
  } catch (error) {
    console.warn('Could not extract dataset names:', error);
  }
  
  return names.length > 0 ? names : ['value'];
}
