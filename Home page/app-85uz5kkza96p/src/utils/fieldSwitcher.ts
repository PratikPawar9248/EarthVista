import Papa from 'papaparse';
import type { Dataset, DataPoint } from '@/types/heatmap';
import { parseNetCDFFile } from './netcdfParser';

/**
 * Store raw file data for field switching
 */
interface RawFileData {
  file: File;
  type: 'csv' | 'json' | 'netcdf';
  rawData: any;
  latCol: string;
  lonCol: string;
  allFields: string[];
}

const fileDataCache = new Map<string, RawFileData>();

/**
 * Cache raw file data for later field switching
 */
export function cacheFileData(fileName: string, data: RawFileData): void {
  fileDataCache.set(fileName, data);
}

/**
 * Get cached file data
 */
export function getCachedFileData(fileName: string): RawFileData | undefined {
  return fileDataCache.get(fileName);
}

/**
 * Clear file data cache
 */
export function clearFileDataCache(): void {
  fileDataCache.clear();
}

/**
 * Switch to a different field in the dataset
 */
export async function switchDatasetField(
  dataset: Dataset,
  newField: string
): Promise<Dataset> {
  const cachedData = getCachedFileData(dataset.name);
  
  if (!cachedData) {
    throw new Error('Original file data not found. Please re-upload the file.');
  }

  if (!cachedData.allFields.includes(newField)) {
    throw new Error(`Field "${newField}" not found in dataset`);
  }

  // Re-parse data with new field
  const points: DataPoint[] = [];
  
  if (cachedData.type === 'csv') {
    // Parse CSV data with new field
    for (const row of cachedData.rawData as Record<string, unknown>[]) {
      try {
        const lat = Number(row[cachedData.latCol]);
        const lon = Number(row[cachedData.lonCol]);
        const value = Number(row[newField]);

        if (isNaN(lat) || isNaN(lon) || isNaN(value)) continue;
        if (lat < -90 || lat > 90) continue;
        if (lon < -180 || lon > 180) continue;
        if (!isFinite(value)) continue;
        
        points.push({ lat, lon, value });
      } catch {
        continue;
      }
    }
  } else if (cachedData.type === 'json') {
    // Parse JSON data with new field
    for (const item of cachedData.rawData as Record<string, unknown>[]) {
      try {
        const lat = Number(item[cachedData.latCol] || item['lat'] || item['latitude']);
        const lon = Number(item[cachedData.lonCol] || item['lon'] || item['longitude']);
        const value = Number(item[newField]);

        if (isNaN(lat) || isNaN(lon) || isNaN(value)) continue;
        if (lat < -90 || lat > 90) continue;
        if (lon < -180 || lon > 180) continue;
        if (!isFinite(value)) continue;
        
        points.push({ lat, lon, value });
      } catch {
        continue;
      }
    }
  } else if (cachedData.type === 'netcdf') {
    // For NetCDF, we need to re-parse with the new variable
    const result = await parseNetCDFFile(cachedData.file, newField);
    
    // Calculate value range
    const values = result.data.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      name: dataset.name,
      points: result.data,
      valueRange: { min, max },
      fields: dataset.fields,
      selectedField: newField
    };
  }

  if (points.length === 0) {
    throw new Error(`No valid data points found for field "${newField}"`);
  }

  // Calculate value range
  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    name: dataset.name,
    points,
    valueRange: { min, max },
    fields: dataset.fields,
    selectedField: newField
  };
}

/**
 * Parse and cache CSV file data
 */
export async function parseAndCacheCSV(file: File): Promise<{
  rawData: any[];
  headers: string[];
  latCol: string;
  lonCol: string;
}> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const latCol = headers.find(h => 
          /^(lat|latitude|y)$/i.test(h.toLowerCase().trim())
        );
        const lonCol = headers.find(h => 
          /^(lon|long|longitude|x)$/i.test(h.toLowerCase().trim())
        );

        if (!latCol || !lonCol) {
          reject(new Error('Missing lat/lon columns'));
          return;
        }

        resolve({
          rawData: results.data as any[],
          headers,
          latCol,
          lonCol
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
