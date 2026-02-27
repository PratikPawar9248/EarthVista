# Quick Start Guide: Large Files and NetCDF Support

## What's New?

The platform now supports:
- ✅ **Large files up to 1GB** (previously 100MB)
- ✅ **NetCDF (.nc) files** - the standard format for scientific data
- ✅ **Automatic optimization** for datasets with millions of points
- ✅ **Real-time progress tracking** during file processing

## Supported File Formats

### 1. CSV Files
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
...
```
- Simple comma-separated format
- Requires columns: `lat`, `lon`, and a value column
- Best for: Small to medium datasets (< 50MB)

### 2. JSON Files
```json
[
  {"lat": 23.5, "lon": 88.2, "temperature": 29.1},
  {"lat": -10.2, "lon": 45.1, "temperature": 26.4},
  ...
]
```
- Array of objects
- Requires fields: `lat`, `lon`, and a value field
- Best for: Structured data with multiple fields

### 3. NetCDF Files (.nc)
- Scientific data format used in climate, oceanography, and atmospheric science
- Supports multi-dimensional arrays
- Automatic variable detection
- Best for: Large gridded datasets (> 50MB)

## How to Upload Large Files

### Step 1: Prepare Your File
- Ensure file is under 1GB
- For NetCDF: Include `lat`, `lon`, and data variables
- For CSV/JSON: Include `lat`, `lon`, and value columns

### Step 2: Upload
1. Click the **"Upload Dataset"** button or drag-and-drop your file
2. Watch the progress bar for real-time updates
3. Wait for processing to complete

### Step 3: View Results
- Heatmap appears automatically on the global map
- Check browser console for detailed statistics
- If dataset was large, you'll see: "Dataset decimated: X → Y points"

## What Happens with Large Datasets?

### Automatic Optimization
When your dataset has more than **100,000 points**, the system automatically:
1. Samples every Nth point to reduce total count
2. Maintains geographic distribution
3. Preserves visual quality
4. Reduces memory usage by up to 90%

### Example
- **Original dataset**: 1,000,000 points
- **After optimization**: 100,000 points
- **Result**: Smooth visualization, no browser lag

## NetCDF Files: What You Need to Know

### Variable Names
The parser looks for these variable names (supports multiple naming conventions):
- **Latitude**: `lat`, `latitude`, `y`, `yt`, `y_t`, `yt_j`, `yaxis`, `lat_deg`, `nav_lat`, `nlat`, `latitude_t`
- **Longitude**: `lon`, `longitude`, `long`, `x`, `xt`, `x_t`, `xt_i`, `xaxis`, `lon_deg`, `nav_lon`, `nlon`, `longitude_t`
- **Data**: Any variable with 2D+ dimensions (excludes coordinates, time, depth, and bounds variables)

### Data Structures Supported
- ✅ **1D Point Data**: Arrays of lat, lon, value
- ✅ **2D Gridded Data**: lat × lon grids
- ✅ **3D Temporal Data**: time × lat × lon (uses first time slice)
- ✅ **4D Multi-level Data**: time × level × lat × lon (uses first slice)

### Example NetCDF Structure
```
Dimensions:
  lat: 180
  lon: 360
  time: 12

Variables:
  lat(lat): -90 to 90
  lon(lon): -180 to 180
  temperature(time, lat, lon): temperature values
```

**Result**: 64,800 points (180 × 360) from first time slice

## Progress Messages Explained

During file upload, you'll see these messages:

### CSV/JSON Files
1. **"Reading file..."** - Loading file into memory
2. **"Parsing data..."** - Converting to data structure
3. **"Extracting data points..."** - Creating point array
4. **"Optimizing dataset..."** - Applying decimation if needed
5. **"Complete!"** - Ready to visualize

### NetCDF Files
1. **"Reading NetCDF file..."** - Loading file
2. **"Parsing NetCDF structure..."** - Reading metadata
3. **"Detecting coordinate variables..."** - Finding lat/lon
4. **"Extracting data from [variable]..."** - Reading values
5. **"Processing data points..."** - Converting to points
6. **"Optimizing dataset..."** - Decimating if needed
7. **"Complete!"** - Ready to visualize

## Troubleshooting

### Problem: Upload is slow
**Solution**: This is normal for large files. Progress bar shows current status. A 100MB file may take 10-30 seconds.

### Problem: "File is too large" error
**Solution**: File exceeds 1GB limit. Try:
- Filtering data to reduce size
- Splitting into multiple files
- Using NetCDF format (more efficient than CSV)

### Problem: "Could not detect latitude/longitude" error
**Solution**: 
- For CSV: Ensure columns are named `lat`, `lon`, or similar
- For NetCDF: Check variable names match expected patterns
- See error message for available variables

### Problem: Heatmap looks sparse
**Solution**: Dataset was automatically decimated. This is normal for large datasets. Original point count is shown in console.

### Problem: Browser becomes slow
**Solution**: 
- Close other browser tabs
- Try a smaller file
- Check if decimation is working (console message)

## Tips for Best Results

### For CSV Files
- Use simple column names: `lat`, `lon`, `value`
- Remove unnecessary columns
- Ensure no missing values in coordinate columns

### For JSON Files
- Use array format (not nested objects)
- Keep field names simple
- Ensure consistent structure across all objects

### For NetCDF Files
- Use standard variable names
- Check dimensions are reasonable (lat × lon < 1,000,000)
- Verify coordinate ranges (lat: -90 to 90, lon: -180 to 180)
- For temporal data, consider extracting specific time slices beforehand

## Performance Tips

### File Size Recommendations
- **< 10MB**: Instant processing
- **10-50MB**: 2-10 seconds
- **50-200MB**: 10-30 seconds
- **200-1GB**: 30-60 seconds

### Optimal Dataset Sizes
- **< 50,000 points**: No decimation, full detail
- **50,000-100,000 points**: Minimal decimation
- **> 100,000 points**: Automatic decimation to 100,000

### Browser Requirements
- Modern browser (Chrome, Firefox, Edge, Safari)
- Minimum 4GB RAM recommended
- For files > 200MB: 8GB RAM recommended

## Example Datasets

### Small Test Dataset (CSV)
Click **"Download Sample"** button in the upload dialog to get a small test file.

### Creating Your Own CSV
```csv
lat,lon,temperature
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
35.7,139.7,22.8
```

### NetCDF Resources
- NOAA Climate Data: https://www.ncei.noaa.gov/
- NASA Earth Data: https://earthdata.nasa.gov/
- Copernicus Marine Service: https://marine.copernicus.eu/

## Need Help?

1. **Check browser console** (F12) for detailed logs
2. **Review error messages** - they include helpful information
3. **Verify file format** matches examples above
4. **Try sample file first** to ensure system is working

## Technical Details

For developers and advanced users:

### Maximum Limits
- File size: 1GB
- Points before decimation: Unlimited (memory permitting)
- Points after decimation: 100,000 (configurable)

### Decimation Algorithm
- Method: Systematic sampling (every Nth point)
- Preserves: Geographic distribution, data patterns
- Reduces: Memory usage, rendering time

### NetCDF Library
- Uses: netcdfjs v3.0.0
- Supports: NetCDF-3 and NetCDF-4 formats
- Handles: Multi-dimensional arrays, missing values

## Summary

The platform now handles large scientific datasets efficiently:
- ✅ Upload files up to 1GB
- ✅ Automatic optimization for performance
- ✅ Real-time progress tracking
- ✅ Full NetCDF format support
- ✅ Maintains visual quality

Start by uploading a small test file, then try your large datasets!
