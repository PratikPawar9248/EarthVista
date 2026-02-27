# Large Dataset and NetCDF File Support

## Overview

The Geospatial Heatmap Visualization Platform now supports very large datasets and NetCDF (.nc) file format, enabling scientists and researchers to visualize massive geospatial datasets efficiently.

## Key Features

### 1. Large File Support
- **Maximum File Size**: 1GB (increased from 100MB)
- **Automatic Optimization**: Datasets with more than 100,000 points are automatically decimated
- **Memory Efficient**: Smart data processing prevents browser memory issues
- **Progress Tracking**: Real-time progress indicators during file processing

### 2. NetCDF File Format Support
NetCDF (Network Common Data Form) is a widely-used format in scientific computing, particularly for climate, oceanography, and atmospheric data.

#### Supported NetCDF Features:
- ✅ **Multi-dimensional arrays**: 1D, 2D, 3D, and 4D data structures
- ✅ **Automatic variable detection**: Finds latitude, longitude, and data variables automatically
- ✅ **Gridded data**: Converts lat/lon grids to point-based visualization
- ✅ **Point-based data**: Direct support for point datasets
- ✅ **Missing value handling**: Filters out NaN, null, and fill values
- ✅ **Time-series data**: Extracts first time slice from temporal datasets

#### Variable Detection Patterns:
The parser automatically detects coordinate variables using these patterns:
- **Latitude**: `lat`, `latitude`, `y`, `yt`, `y_t`, `yt_j`, `yaxis`, `lat_deg`, `nav_lat`, `nlat`, `latitude_t`
- **Longitude**: `lon`, `longitude`, `long`, `x`, `xt`, `x_t`, `xt_i`, `xaxis`, `lon_deg`, `nav_lon`, `nlon`, `longitude_t`
- **Data variables**: Any non-coordinate variable with 2D+ dimensions (excludes time, depth, bounds variables)

### 3. Data Decimation Algorithm

When a dataset exceeds 100,000 points, the system automatically applies systematic sampling:

```
Decimation Ratio = Total Points / Max Points
Step Size = ceil(Decimation Ratio)
Decimated Data = Every Nth point where N = Step Size
```

**Example:**
- Original dataset: 500,000 points
- Max points: 100,000
- Step size: 5
- Result: Every 5th point is kept (100,000 points)

**Benefits:**
- Maintains geographic distribution
- Preserves data patterns
- Reduces memory usage by up to 80%
- Maintains visual quality

### 4. Progress Reporting

All file parsers now provide detailed progress updates:

**CSV/JSON Progress Stages:**
1. Reading file (10%)
2. Parsing data (30-60%)
3. Extracting data points (70%)
4. Optimizing dataset (85%)
5. Finalizing (95%)
6. Complete (100%)

**NetCDF Progress Stages:**
1. Reading file (10%)
2. Parsing structure (30%)
3. Detecting variables (40%)
4. Extracting data (50-90%)
5. Optimizing dataset (90%)
6. Complete (100%)

## Usage Examples

### Uploading a Large CSV File

```csv
lat,lon,temperature
23.5,88.2,29.1
-10.2,45.1,26.4
...
(500,000 rows)
```

**Result:**
- File is parsed with progress updates
- Dataset is automatically decimated to 100,000 points
- Visualization renders smoothly
- Console shows: "Dataset decimated: 500,000 → 100,000 points"

### Uploading a NetCDF File

**Example NetCDF Structure:**
```
Dimensions:
  lat: 180
  lon: 360
  time: 12

Variables:
  lat(lat): latitude values
  lon(lon): longitude values
  temperature(time, lat, lon): temperature data
```

**Processing:**
1. Parser detects `lat` and `lon` as coordinate variables
2. Identifies `temperature` as the data variable
3. Extracts first time slice (time=0)
4. Converts 180×360 grid to 64,800 points
5. Renders heatmap on global map

## Performance Characteristics

### File Size vs. Processing Time (Approximate)

| File Size | Format | Points | Processing Time |
|-----------|--------|--------|----------------|
| 1 MB | CSV | 10,000 | < 1 second |
| 10 MB | CSV | 100,000 | 2-3 seconds |
| 50 MB | CSV | 500,000 | 5-8 seconds |
| 100 MB | NetCDF | 1,000,000 | 10-15 seconds |
| 500 MB | NetCDF | 5,000,000 | 30-60 seconds |

*Note: Times vary based on device performance and data complexity*

### Memory Usage

| Dataset Size | Before Decimation | After Decimation | Memory Saved |
|--------------|-------------------|------------------|--------------|
| 100,000 pts | ~8 MB | ~8 MB | 0% (no decimation) |
| 500,000 pts | ~40 MB | ~8 MB | 80% |
| 1,000,000 pts | ~80 MB | ~8 MB | 90% |
| 5,000,000 pts | ~400 MB | ~8 MB | 98% |

## Technical Implementation

### File Parser Architecture

```
parseFile()
  ├── File type detection (.csv, .json, .nc)
  ├── Size validation (max 1GB)
  └── Route to appropriate parser
      ├── parseCSVWithProgress()
      ├── parseJSONWithProgress()
      └── parseNetCDFWithProgress()
          └── parseNetCDFFile()
              ├── Read ArrayBuffer
              ├── Initialize NetCDFReader
              ├── Detect variables
              ├── Extract data
              ├── Decimate if needed
              └── Return DataPoint[]
```

### Data Structures

**DataPoint Interface:**
```typescript
interface DataPoint {
  lat: number;    // Latitude (-90 to 90)
  lon: number;    // Longitude (-180 to 180)
  value: number;  // Data value
}
```

**Dataset Interface:**
```typescript
interface Dataset {
  name: string;              // File name
  points: DataPoint[];       // Array of data points
  valueRange: {              // Min/max values
    min: number;
    max: number;
  };
  fields: string[];          // Available fields
  selectedField: string;     // Currently visualized field
}
```

## Error Handling

The system provides detailed error messages for common issues:

### File Too Large
```
Error: File is too large (550.0MB). Maximum size is 1GB
```

### Missing Coordinates
```
Error: Could not detect latitude/longitude variables.
Available variables: time, depth, salinity
Expected variables containing: lat, latitude, lon, longitude
```

### Invalid Data
```
Error: No valid data points found
```

### Corrupted NetCDF
```
Error: Failed to read NetCDF file: Invalid NetCDF format or corrupted file
```

## Best Practices

### For Large Datasets:
1. **Use NetCDF format** for gridded data (more efficient than CSV)
2. **Pre-filter data** if possible to reduce file size
3. **Monitor browser console** for decimation statistics
4. **Allow sufficient time** for large files to process

### For NetCDF Files:
1. **Ensure proper variable naming** (use standard names like `lat`, `lon`)
2. **Check dimensions** before uploading (lat × lon should be reasonable)
3. **Use 2D or 3D data** (4D data uses first time/level slice)
4. **Verify coordinate ranges** (lat: -90 to 90, lon: -180 to 180)

## Troubleshooting

### Problem: File upload is slow
**Solution:** This is normal for large files. Progress indicator shows current status.

### Problem: Heatmap looks sparse
**Solution:** Dataset was decimated. Original point count is logged in console.

### Problem: NetCDF file not recognized
**Solution:** Check that file has `.nc` extension and contains lat/lon variables.

### Problem: Browser becomes unresponsive
**Solution:** File may be too large. Try reducing file size or filtering data before upload.

## Future Enhancements

Potential improvements for future versions:
- [ ] Web Worker implementation for background processing
- [ ] Streaming parser for extremely large files
- [ ] Configurable decimation threshold
- [ ] Multiple decimation strategies (spatial, value-based)
- [ ] HDF5 file format support
- [ ] GeoTIFF raster support
- [ ] Time-series animation for temporal NetCDF data
- [ ] Multi-variable comparison mode

## Dependencies

- **netcdfjs** (v3.0.0): NetCDF file parsing
- **papaparse** (v5.4.1): CSV file parsing

## API Reference

### parseFile(file, options)

Main file parser function.

**Parameters:**
- `file` (File): File object to parse
- `options` (Object, optional):
  - `maxPoints` (number): Maximum points to keep (default: 100,000)
  - `onProgress` (function): Progress callback (progress: number, message: string)

**Returns:**
- Promise<FileUploadResult>

**Example:**
```typescript
const result = await parseFile(file, {
  maxPoints: 50000,
  onProgress: (progress, message) => {
    console.log(`${progress}%: ${message}`);
  }
});

if (result.success) {
  console.log('Loaded', result.data.points.length, 'points');
}
```

### parseNetCDFFile(file, options)

NetCDF-specific parser.

**Parameters:**
- `file` (File): NetCDF file object
- `options` (Object, optional):
  - `maxPoints` (number): Maximum points to keep
  - `onProgress` (function): Progress callback

**Returns:**
- Promise<{ data: DataPoint[], metadata: NetCDFMetadata }>

## Conclusion

The large dataset and NetCDF support enables the platform to handle real-world scientific datasets efficiently. With automatic optimization, progress tracking, and comprehensive error handling, users can visualize massive geospatial datasets without technical expertise.

For questions or issues, please check the browser console for detailed logging information.
