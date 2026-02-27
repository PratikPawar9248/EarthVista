import type { DataPoint } from '@/types/heatmap';

export interface NetCDFMetadata {
  dimensions: string[];
  variables: string[];
  latVariable: string;
  lonVariable: string;
  valueVariable: string;
  originalCount: number;
  decimatedCount: number;
}

/**
 * Parse NetCDF file and extract geospatial data
 * Supports large files with optimized memory usage
 */
export async function parseNetCDFFile(
  file: File,
  variableNameOrOptions?: string | {
    maxPoints?: number;
    onProgress?: (progress: number, message: string) => void;
  }
): Promise<{ data: DataPoint[]; metadata: NetCDFMetadata }> {
  // Handle both string (variable name) and options object
  const specificVariable = typeof variableNameOrOptions === 'string' ? variableNameOrOptions : undefined;
  const options = typeof variableNameOrOptions === 'object' ? variableNameOrOptions : {};
  
  const maxPoints = options?.maxPoints || 50000;
  const onProgress = options?.onProgress || (() => {});

  try {
    onProgress(10, 'Reading NetCDF file...');
    
    console.log(`[NetCDF] Starting to parse file: ${file.name}`);
    console.log(`[NetCDF] File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('File is empty or could not be read');
    }
    
    console.log(`[NetCDF] ArrayBuffer loaded: ${arrayBuffer.byteLength} bytes`);
    
    onProgress(30, 'Parsing NetCDF structure...');

    // Dynamically import netcdfjs to ensure it's loaded
    let NetCDFReader: any;
    try {
      const netcdfModule = await import('netcdfjs');
      NetCDFReader = netcdfModule.NetCDFReader || netcdfModule.default?.NetCDFReader || netcdfModule.default;
      
      if (!NetCDFReader) {
        throw new Error('NetCDFReader not found in netcdfjs module');
      }
      
      console.log('[NetCDF] NetCDFReader loaded successfully');
    } catch (importError) {
      console.error('[NetCDF] Failed to import netcdfjs:', importError);
      throw new Error(`Failed to load NetCDF library: ${importError instanceof Error ? importError.message : 'Unknown error'}`);
    }

    // Parse NetCDF
    let reader: any;
    try {
      reader = new NetCDFReader(arrayBuffer);
      console.log('[NetCDF] NetCDF file parsed successfully');
    } catch (error) {
      console.error('[NetCDF] Failed to parse NetCDF file:', error);
      throw new Error(`Invalid NetCDF file format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

  // Get all variables
  const variables = reader.variables.map((v: any) => v.name);
  const dimensions = reader.dimensions.map((d: any) => d.name);
  
  console.log('[NetCDF] Variables found:', variables);
  console.log('[NetCDF] Dimensions found:', dimensions);

  onProgress(40, 'Detecting coordinate variables...');

  // Auto-detect latitude variable - expanded patterns for various conventions
  const latVariable = variables.find((v: string) => 
    /^(lat|latitude|y|yt|y_t|yt_j|yaxis|lat_deg|nav_lat|nlat|latitude_t)$/i.test(v)
  );

  // Auto-detect longitude variable - expanded patterns for various conventions
  const lonVariable = variables.find((v: string) => 
    /^(lon|longitude|long|x|xt|x_t|xt_i|xaxis|lon_deg|nav_lon|nlon|longitude_t)$/i.test(v)
  );
  
  console.log('[NetCDF] Detected lat variable:', latVariable);
  console.log('[NetCDF] Detected lon variable:', lonVariable);

  if (!latVariable || !lonVariable) {
    throw new Error(
      `Could not detect latitude/longitude variables. Available variables: ${variables.join(', ')}\n` +
      `Expected patterns: lat/latitude/y/yt/yt_j for latitude, lon/longitude/x/xt/xt_i for longitude`
    );
  }

  // Find value variable (first variable that's not lat/lon/time/depth and has 2D+ data)
  // Exclude coordinate variables and their bounds
  const excludePatterns = /^(lat|latitude|lon|longitude|x|y|xt|yt|xt_i|yt_j|x_t|y_t|time|depth|level|z|zt|zt_k.*|.*_bnds|.*_bounds|.*bnds|eta)$/i;
  
  // Common value variable names to prioritize
  const commonValueVars = ['temp', 'temperature', 'sst', 'salinity', 'sal', 'chlorophyll', 'chl', 'ssh', 'u', 'v', 'w'];
  
  let valueVariable = '';
  
  // If specific variable is requested, use it
  if (specificVariable) {
    if (variables.includes(specificVariable)) {
      valueVariable = specificVariable;
      console.log(`Using specified value variable: ${valueVariable}`);
    } else {
      throw new Error(`Specified variable "${specificVariable}" not found in NetCDF file. Available: ${variables.join(', ')}`);
    }
  }
  
  // Helper function to get dimension count from variable
  const getDimensionCount = (varName: string): number => {
    try {
      // First check variable metadata
      const varMeta = reader.variables.find((v: any) => v.name === varName);
      if (varMeta && varMeta.dimensions && Array.isArray(varMeta.dimensions)) {
        console.log(`Variable ${varName} metadata dimensions:`, varMeta.dimensions);
        return varMeta.dimensions.length;
      }
      
      // Try to get data and check its structure
      const varInfo = reader.getDataVariable(varName);
      if (!varInfo) return 0;
      
      // Check if dimensions property exists
      if (varInfo.dimensions && Array.isArray(varInfo.dimensions)) {
        return varInfo.dimensions.length;
      }
      
      // Try to infer from data shape
      if (Array.isArray(varInfo)) {
        let depth = 0;
        let current: any = varInfo;
        while (Array.isArray(current) && current.length > 0) {
          depth++;
          current = current[0];
        }
        console.log(`Variable ${varName} inferred dimensions from array depth: ${depth}`);
        return depth;
      }
      
      // Check if it's a typed array (Float32Array, etc.)
      if (varInfo.length !== undefined && typeof varInfo.length === 'number') {
        console.log(`Variable ${varName} is a typed array with length: ${varInfo.length}`);
        // Single dimension typed array
        return 1;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error getting dimensions for ${varName}:`, error);
      return 0;
    }
  };
  
  // First, try to find common value variables (only if not specified)
  if (!valueVariable) {
    for (const commonVar of commonValueVars) {
      const found = variables.find((v: string) => v.toLowerCase() === commonVar);
      if (found) {
        const dimCount = getDimensionCount(found);
        console.log(`Checking common variable: ${found}, dimensions: ${dimCount}`);
        if (dimCount >= 2) {
          valueVariable = found;
          console.log(`Found common value variable: ${valueVariable} with ${dimCount} dimensions`);
          break;
        }
      }
    }
  }
  
  // If not found, search for any variable with 2D+ data
  if (!valueVariable) {
    for (const varName of variables) {
      if (excludePatterns.test(varName)) {
        continue;
      }
      
      const dimCount = getDimensionCount(varName);
      console.log(`Checking variable: ${varName}, dimensions: ${dimCount}`);
      
      if (dimCount >= 2) {
        valueVariable = varName;
        console.log(`Selected value variable: ${valueVariable}`);
        break;
      }
    }
  }

  if (!valueVariable) {
    // Fallback: If we have TEMP variable and coordinate variables, try to use it anyway
    // This handles cases where dimension detection fails but we have the right structure
    const tempVar = variables.find((v: string) => v.toLowerCase() === 'temp');
    if (tempVar && latVariable && lonVariable) {
      console.log('Fallback: Using TEMP variable despite dimension detection issues');
      valueVariable = tempVar;
    }
  }

  if (!valueVariable) {
    // Provide detailed debug information
    const varDetails = variables.map((v: string) => {
      const dimCount = getDimensionCount(v);
      const excluded = excludePatterns.test(v);
      
      // Also show variable metadata for debugging
      const varMeta = reader.variables.find((vm: any) => vm.name === v);
      const dimNames = varMeta?.dimensions ? `[${varMeta.dimensions.join(', ')}]` : '[]';
      
      return `${v} (${dimCount}D${excluded ? ', excluded' : ''}, dims: ${dimNames})`;
    }).join(', ');
    
    // Also show dimension information
    const dimInfo = dimensions.map((d: string) => {
      const dim = reader.dimensions.find((dim: any) => dim.name === d);
      return `${d}=${dim?.size || '?'}`;
    }).join(', ');
    
    throw new Error(
      `Could not detect value variable. Available variables: ${varDetails}\n` +
      `Looking for variables with 2D+ data that are not coordinates/time/depth.\n` +
      `Dimensions in file: ${dimInfo}\n` +
      `Tip: Your NetCDF file should have a data variable (like 'temp', 'sst', 'salinity') with at least 2 dimensions.`
    );
  }

  onProgress(50, `Extracting data from ${valueVariable}...`);

  // Read coordinate arrays
  const latData = reader.getDataVariable(latVariable);
  const lonData = reader.getDataVariable(lonVariable);
  const valueData = reader.getDataVariable(valueVariable);

  if (!latData || !lonData || !valueData) {
    throw new Error('Failed to read data variables');
  }

  onProgress(60, 'Processing data points...');

  // Handle different data structures
  const dataPoints: DataPoint[] = [];

  // Get dimension information for value variable
  const valueDimCount = getDimensionCount(valueVariable);
  const valueVarMeta = reader.variables.find((v: any) => v.name === valueVariable);
  const valueDimensions = valueVarMeta?.dimensions || [];
  
  console.log(`Value variable ${valueVariable} has ${valueDimCount} dimensions:`, valueDimensions);
  console.log(`Value data type:`, typeof valueData, `Is array:`, Array.isArray(valueData));

  // Convert coordinate data to arrays with proper type handling
  const latArray = Array.from(latData as ArrayLike<number>).map(v => Number(v));
  const lonArray = Array.from(lonData as ArrayLike<number>).map(v => Number(v));
  
  console.log(`[NetCDF] Coordinate arrays: lat=${latArray.length}, lon=${lonArray.length}`);
  console.log(`[NetCDF] Sample lat values:`, latArray.slice(0, 5));
  console.log(`[NetCDF] Sample lon values:`, lonArray.slice(0, 5));
  console.log(`[NetCDF] Lat range: [${Math.min(...latArray)}, ${Math.max(...latArray)}]`);
  console.log(`[NetCDF] Lon range: [${Math.min(...lonArray)}, ${Math.max(...lonArray)}]`);

  // Try to determine the actual structure of the value data
  let actualDimCount = valueDimCount;
  if (actualDimCount === 0 || actualDimCount === 1) {
    // Fallback: try to infer from data structure
    if (Array.isArray(valueData)) {
      let depth = 0;
      let current: any = valueData;
      while (Array.isArray(current) && current.length > 0) {
        depth++;
        current = current[0];
      }
      actualDimCount = depth;
      console.log(`[NetCDF] Inferred actual dimension count from data structure: ${actualDimCount}`);
    }
  }
  
  // Log value data structure
  console.log(`[NetCDF] Value data structure:`, {
    isArray: Array.isArray(valueData),
    length: (valueData as any)?.length,
    type: typeof valueData,
    constructor: (valueData as any)?.constructor?.name
  });
  
  // Sample some values to see what we're working with
  if (Array.isArray(valueData) && valueData.length > 0) {
    console.log(`[NetCDF] First element of value data:`, valueData[0]);
    if (Array.isArray(valueData[0]) && valueData[0].length > 0) {
      console.log(`[NetCDF] First element of first row:`, valueData[0][0]);
    }
  }

  // Check if data is gridded (2D+) or point-based (1D)
  if (actualDimCount >= 2 || (latArray.length > 0 && lonArray.length > 0 && valueData)) {
    // Gridded data: create points from grid
    const valueArray = valueData as any;

    // Determine dimension order and handle multi-dimensional data
    let timeIndex = 0;
    let depthIndex = 0;
    
    // Check if we have time or depth dimensions
    const hasTimeDim = valueDimensions.some((d: string) => /time/i.test(d));
    const hasDepthDim = valueDimensions.some((d: string) => /depth|level|z|zt/i.test(d));
    
    console.log(`[NetCDF] Has time dimension: ${hasTimeDim}, Has depth dimension: ${hasDepthDim}`);
    console.log(`[NetCDF] Starting data extraction from ${latArray.length}x${lonArray.length} grid...`);

    const totalPoints = latArray.length * lonArray.length;
    let processedPoints = 0;
    let successfulPoints = 0;
    let errorCount = 0;
    const maxErrorsToLog = 5;

    for (let i = 0; i < latArray.length; i++) {
      for (let j = 0; j < lonArray.length; j++) {
        let value: number | null = null;
        let accessMethod = 'unknown';
        
        try {
          // Try different access patterns based on detected dimensions
          if (actualDimCount === 4) {
            // 4D data: [time, depth, lat, lon]
            value = valueArray[timeIndex][depthIndex][i][j];
            accessMethod = '4D[time][depth][lat][lon]';
          } else if (actualDimCount === 3) {
            // 3D data: could be [time, lat, lon] or [depth, lat, lon]
            value = valueArray[timeIndex][i][j];
            accessMethod = '3D[time/depth][lat][lon]';
          } else if (actualDimCount === 2) {
            // 2D data: [lat, lon]
            value = valueArray[i][j];
            accessMethod = '2D[lat][lon]';
          } else if (actualDimCount === 1) {
            // 1D data: try to access as flat array
            const flatIndex = i * lonArray.length + j;
            value = valueArray[flatIndex];
            accessMethod = '1D[flat]';
          } else {
            // Unknown structure: try multiple access patterns
            try {
              value = valueArray[i][j];
              accessMethod = 'fallback 2D[i][j]';
            } catch {
              try {
                value = valueArray[timeIndex][i][j];
                accessMethod = 'fallback 3D[0][i][j]';
              } catch {
                const flatIndex = i * lonArray.length + j;
                value = valueArray[flatIndex];
                accessMethod = 'fallback 1D[flat]';
              }
            }
          }

          // Log first successful access
          if (successfulPoints === 0 && value !== null && value !== undefined && !isNaN(value)) {
            console.log(`[NetCDF] First successful data access at [${i},${j}] using ${accessMethod}: value=${value}, lat=${latArray[i]}, lon=${lonArray[j]}`);
          }

          // Skip missing values (NaN, null, undefined, or fill values)
          if (value !== null && value !== undefined && !isNaN(value) && Math.abs(value) < 1e30) {
            const lat = Number(latArray[i]);
            const lon = Number(lonArray[j]);
            
            // Validate coordinates
            if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
              dataPoints.push({
                lat,
                lon,
                value: Number(value)
              });
              successfulPoints++;
            } else if (errorCount < maxErrorsToLog) {
              console.warn(`[NetCDF] Invalid coordinates at [${i},${j}]: lat=${lat}, lon=${lon}`);
              errorCount++;
            }
          }
        } catch (error) {
          // Skip points that can't be accessed
          if (errorCount < maxErrorsToLog) {
            console.warn(`[NetCDF] Error accessing data at [${i}, ${j}] using ${accessMethod}:`, error);
            errorCount++;
          }
        }

        processedPoints++;
        if (processedPoints % 10000 === 0) {
          onProgress(
            60 + (processedPoints / totalPoints) * 30,
            `Processed ${processedPoints.toLocaleString()} of ${totalPoints.toLocaleString()} grid points (${successfulPoints.toLocaleString()} valid)...`
          );
        }
      }
    }
    
    console.log(`[NetCDF] Extraction complete: ${successfulPoints} valid points out of ${processedPoints} total`);
    
    if (successfulPoints === 0) {
      console.error(`[NetCDF] No valid data points extracted!`);
      console.error(`[NetCDF] Debug info:`, {
        latArrayLength: latArray.length,
        lonArrayLength: lonArray.length,
        valueDataType: typeof valueData,
        valueDataLength: (valueData as any)?.length,
        actualDimCount,
        valueDimensions,
        processedPoints,
        errorCount
      });
    }  } else {
    // Point-based data
    const latArray = Array.from(latData as any);
    const lonArray = Array.from(lonData as any);
    const valueArray = Array.from(valueData as any);

    for (let i = 0; i < latArray.length; i++) {
      const lat = Number(latArray[i]);
      const lon = Number(lonArray[i]);
      const value = Number(valueArray[i]);

      if (!isNaN(lat) && !isNaN(lon) && !isNaN(value) && Math.abs(value) < 1e30) {
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          dataPoints.push({ lat, lon, value });
        }
      }

      if (i % 10000 === 0) {
        onProgress(
          60 + (i / latArray.length) * 30,
          `Processed ${i.toLocaleString()} of ${latArray.length.toLocaleString()} points...`
        );
      }
    }
  }

  onProgress(90, 'Optimizing dataset...');

  if (dataPoints.length === 0) {
    throw new Error('No valid data points found. Check that your data contains valid lat/lon coordinates and non-NaN values.');
  }

  // Decimate if needed
  const decimatedData = decimateData(dataPoints, maxPoints);

  onProgress(100, 'Complete!');

  return {
    data: decimatedData,
    metadata: {
      dimensions,
      variables,
      latVariable,
      lonVariable,
      valueVariable,
      originalCount: dataPoints.length,
      decimatedCount: decimatedData.length
    }
  };
  } catch (error) {
    console.error('NetCDF parsing error:', error);
    throw error instanceof Error ? error : new Error('Failed to parse NetCDF file');
  }
}

/**
 * Decimate data using systematic sampling
 */
function decimateData(dataPoints: DataPoint[], maxPoints: number): DataPoint[] {
  if (dataPoints.length <= maxPoints) {
    return dataPoints;
  }

  // Use systematic sampling
  const step = Math.ceil(dataPoints.length / maxPoints);
  const decimated: DataPoint[] = [];

  for (let i = 0; i < dataPoints.length; i += step) {
    decimated.push(dataPoints[i]);
  }

  return decimated;
}

/**
 * Get NetCDF file information without parsing all data
 */
export async function getNetCDFInfo(file: File): Promise<{
  dimensions: string[];
  variables: string[];
  size: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Dynamically import netcdfjs
  const netcdfModule = await import('netcdfjs');
  const NetCDFReader = netcdfModule.NetCDFReader || netcdfModule.default?.NetCDFReader || netcdfModule.default;
  
  if (!NetCDFReader) {
    throw new Error('NetCDFReader not found in netcdfjs module');
  }
  
  const reader = new (NetCDFReader as any)(arrayBuffer);

  return {
    dimensions: reader.dimensions.map((d: any) => d.name),
    variables: reader.variables.map((v: any) => v.name),
    size: file.size
  };
}
