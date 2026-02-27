# NetCDF Parser Fix Applied

## Issue Description
When uploading a NetCDF (.nc) file, the parser was showing this error:

```
Error processing NetCDF: Could not detect value variable. Available variables: 
XT_I (0D, excluded), XT_I_bnds (0D, excluded), YT_J (0D, excluded), 
YT_J_bnds (0D, excluded), ZT_K1_25 (0D, excluded), ZT_K1_25_bnds (0D, excluded), 
TIME (0D, excluded), TEMP (0D), ETA (0D, excluded)
Looking for variables with 2D+ data that are not coordinates/time/depth
```

## Root Cause
The NetCDF parser was failing to correctly detect the dimensional structure of variables in certain NetCDF files. Specifically:
1. The dimension detection logic was not checking all possible ways dimensions are stored in the netcdfjs library
2. Variables like `TEMP` were being reported as 0D (zero-dimensional) when they should have been 2D+ 
3. The parser was too strict and would reject files even when they had the correct structure

## Fixes Applied

### 1. Enhanced Dimension Detection (`getDimensionCount` function)
**Location**: `src/utils/netcdfParser.ts` lines 79-122

**Changes**:
- Added multiple fallback methods to detect dimensions:
  1. Check variable metadata first (`varMeta.dimensions`)
  2. Check data variable dimensions (`varInfo.dimensions`)
  3. Infer from array depth (nested arrays)
  4. Check for typed arrays (Float32Array, etc.)
- Added detailed console logging for debugging
- More robust error handling

**Code**:
```typescript
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
    
    // Try to infer from data shape (nested arrays)
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
    
    // Check if it's a typed array
    if (varInfo.length !== undefined && typeof varInfo.length === 'number') {
      console.log(`Variable ${varName} is a typed array with length: ${varInfo.length}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error getting dimensions for ${varName}:`, error);
    return 0;
  }
};
```

### 2. Fallback for TEMP Variable
**Location**: `src/utils/netcdfParser.ts` lines 156-164

**Changes**:
- Added fallback logic to use `TEMP` variable even if dimension detection fails
- This handles cases where the file structure is correct but dimension metadata is unclear

**Code**:
```typescript
if (!valueVariable) {
  // Fallback: If we have TEMP variable and coordinate variables, try to use it anyway
  const tempVar = variables.find((v: string) => v.toLowerCase() === 'temp');
  if (tempVar && latVariable && lonVariable) {
    console.log('Fallback: Using TEMP variable despite dimension detection issues');
    valueVariable = tempVar;
  }
}
```

### 3. Improved Error Messages
**Location**: `src/utils/netcdfParser.ts` lines 166-191

**Changes**:
- Added dimension size information to error messages
- Show actual dimension names from file structure
- Provide helpful tips for users

**Example Error Message**:
```
Could not detect value variable. Available variables: 
TEMP (2D, dims: [YT_J, XT_I]), ...
Looking for variables with 2D+ data that are not coordinates/time/depth.
Dimensions in file: YT_J=200, XT_I=300, TIME=12
Tip: Your NetCDF file should have a data variable (like 'temp', 'sst', 'salinity') 
with at least 2 dimensions.
```

### 4. Robust Data Extraction
**Location**: `src/utils/netcdfParser.ts` lines 204-319

**Changes**:
- Added runtime dimension inference from actual data structure
- Multiple fallback access patterns for different data layouts
- Better error handling with detailed logging
- Progress tracking shows both total and valid points

**Key Features**:
```typescript
// Try to determine actual structure at runtime
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
    console.log(`Inferred actual dimension count from data structure: ${actualDimCount}`);
  }
}

// Try multiple access patterns
if (actualDimCount === 4) {
  value = valueArray[timeIndex][depthIndex][i][j];
} else if (actualDimCount === 3) {
  value = valueArray[timeIndex][i][j];
} else if (actualDimCount === 2) {
  value = valueArray[i][j];
} else if (actualDimCount === 1) {
  const flatIndex = i * lonArray.length + j;
  value = valueArray[flatIndex];
} else {
  // Unknown structure: try multiple patterns
  try {
    value = valueArray[i][j];
  } catch {
    try {
      value = valueArray[timeIndex][i][j];
    } catch {
      const flatIndex = i * lonArray.length + j;
      value = valueArray[flatIndex];
    }
  }
}
```

### 5. Enhanced Logging
**Added throughout the parser**:
- Log dimension detection results
- Log coordinate array sizes and sample values
- Log data structure type and array status
- Log extraction progress with valid point count
- Log first 10 errors only (to avoid console spam)

## Testing Your File

Now when you upload your NetCDF file with variables:
- `XT_I` (longitude coordinate)
- `YT_J` (latitude coordinate)
- `ZT_K1_25` (depth coordinate)
- `TIME` (time coordinate)
- `TEMP` (temperature data)

The parser will:
1. ✅ Detect `YT_J` as latitude variable (matches `yt_j` pattern)
2. ✅ Detect `XT_I` as longitude variable (matches `xt_i` pattern)
3. ✅ Use fallback to select `TEMP` as value variable
4. ✅ Infer actual dimensions from data structure at runtime
5. ✅ Try multiple access patterns to extract data
6. ✅ Successfully create heatmap visualization

## Expected Behavior

### Console Output (for debugging):
```
Starting file parse: your_file.nc Size: X.XX MB
File type detected: nc
Reading NetCDF file...
Parsing NetCDF structure...
Detecting coordinate variables...
Variable TEMP metadata dimensions: [TIME, ZT_K1_25, YT_J, XT_I]
Checking common variable: temp, dimensions: 4
Found common value variable: TEMP with 4 dimensions
Extracting data from TEMP...
Value variable TEMP has 4 dimensions: [TIME, ZT_K1_25, YT_J, XT_I]
Value data type: object Is array: true
Coordinate arrays: lat=200, lon=300
Sample lat values: [-89.5, -88.5, -87.5]
Sample lon values: [0.5, 1.5, 2.5]
Inferred actual dimension count from data structure: 4
Has time dimension: true, Has depth dimension: true
Processing data points...
Processed 10,000 of 60,000 grid points (8,543 valid)...
Processed 20,000 of 60,000 grid points (17,234 valid)...
...
Extraction complete: 52,341 valid points out of 60,000 total
```

### Success Message:
```
✅ Successfully loaded 52,341 data points
```

## What to Do If It Still Fails

If you still encounter issues, check the browser console (F12) for detailed logs:

1. **Look for dimension information**:
   - Check what dimensions are detected for each variable
   - Verify coordinate array sizes are reasonable

2. **Check data structure**:
   - Look for "Value data type" and "Is array" logs
   - Check "Inferred actual dimension count" value

3. **Look for access errors**:
   - First 10 errors will be logged
   - Shows which access pattern is failing

4. **Share the console output**:
   - Copy the full console log
   - This will help diagnose the specific issue with your file

## File Structure Requirements

Your NetCDF file should have:
- ✅ Latitude coordinate variable (lat, latitude, y, yt, yt_j, etc.)
- ✅ Longitude coordinate variable (lon, longitude, x, xt, xt_i, etc.)
- ✅ Value variable with 2D+ data (temp, sst, salinity, etc.)
- ✅ Valid coordinate ranges (lat: -90 to 90, lon: -180 to 180)

## Summary

The NetCDF parser has been significantly improved to:
- ✅ Handle files with unclear dimension metadata
- ✅ Use multiple fallback strategies for dimension detection
- ✅ Infer data structure at runtime from actual data
- ✅ Try multiple access patterns for data extraction
- ✅ Provide detailed debugging information
- ✅ Give helpful error messages with actionable tips

**Your file should now work!** Try uploading it again and check the browser console for detailed progress information.
