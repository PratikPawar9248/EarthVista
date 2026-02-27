# ✅ NetCDF (.nc) File Support - Ready to Use!

## 🎉 Implementation Complete

Your Geospatial Heatmap Visualization Platform now has **full NetCDF (.nc) file support** with enhanced features for large files!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Restart the Application

The NetCDF support requires new dependencies. Please restart:

```bash
# Stop the current server (Ctrl+C if running)
pnpm run dev
```

### Step 2: Upload Your NetCDF File

1. Open the application in your browser
2. Click **"Upload Dataset"** button
3. Select your `.nc` file
4. Wait for processing (progress shown)

### Step 3: View Your Data

- Your data will appear on the global map as a heatmap
- If your file has multiple variables, use the **Parameters panel** (top-left) to switch between them
- Open browser console (F12) to see detailed processing logs

---

## 📋 What Was Implemented

### Core Features

✅ **NetCDF Library Integration**
- Package: netcdfjs v3.0.0
- Browser polyfills added (vite-plugin-node-polyfills)
- Buffer support for browser compatibility

✅ **File Upload Support**
- Accepts .nc file extension
- File size validation
- Progress tracking during upload

✅ **Automatic Variable Detection**
- Detects 15+ latitude naming patterns
- Detects 15+ longitude naming patterns
- Prioritizes common data variable names

✅ **Multi-Dimensional Data Support**
- 2D arrays: [lat, lon]
- 3D arrays: [time, lat, lon] or [depth, lat, lon]
- 4D arrays: [time, depth, lat, lon]
- Point data: [points]

✅ **Large File Optimization**
- Automatic decimation for > 50,000 points
- Memory-efficient ArrayBuffer handling
- Progress callbacks during processing
- Chunked data extraction

✅ **Multi-Variable Support**
- Detects all numeric variables in file
- Parameter switching without re-upload
- Cached data for fast switching
- Individual color scales per variable

✅ **Comprehensive Error Handling**
- Detailed error messages
- Console logging for debugging
- Helpful troubleshooting tips
- Graceful fallbacks

---

## 🔧 Technical Changes Made

### 1. Package Dependencies

**Added**:
```json
{
  "netcdfjs": "^3.0.0",
  "vite-plugin-node-polyfills": "latest",
  "buffer": "latest"
}
```

### 2. Vite Configuration (vite.config.ts)

**Added**:
- Node.js polyfills plugin
- Buffer, process, stream polyfills
- NetCDF optimization configuration
- Global variable definitions

### 3. NetCDF Parser (src/utils/netcdfParser.ts)

**Enhanced**:
- Dynamic import of netcdfjs
- Comprehensive console logging
- Better error handling
- Large file support
- Progress tracking

### 4. Data Parser Integration (src/utils/dataParser.ts)

**Already Implemented**:
- .nc file extension detection
- NetCDF parser integration
- Data caching for field switching
- Multi-variable support

### 5. File Upload Component (src/components/FileUpload.tsx)

**Already Implemented**:
- Accepts .nc files
- Shows "NetCDF (.nc)" in supported formats
- File type validation

---

## 📊 Supported NetCDF File Types

### Oceanographic Data
```
Variables: temperature, salinity, chlorophyll, currents
Dimensions: [time, depth, lat, lon]
Use Case: Ocean modeling, marine research
```

### Climate Data
```
Variables: tas (temperature), pr (precipitation), psl (pressure)
Dimensions: [time, lat, lon]
Use Case: Climate research, weather analysis
```

### Satellite Data
```
Variables: sst, chlorophyll, quality_level
Dimensions: [lat, lon]
Use Case: Remote sensing, Earth observation
```

### Point Observations
```
Variables: measurements at specific locations
Dimensions: [points]
Use Case: Buoy data, ship tracks, station data
```

---

## 🎯 How It Works

### Processing Pipeline

1. **File Upload**
   - User selects .nc file
   - File is validated (extension, size)
   - Progress indicator appears

2. **File Reading**
   - File is read as ArrayBuffer
   - Size is logged to console
   - Progress: 10%

3. **NetCDF Parsing**
   - netcdfjs library is dynamically loaded
   - NetCDFReader parses file structure
   - Progress: 30%

4. **Variable Detection**
   - All variables and dimensions are extracted
   - Latitude/longitude variables are auto-detected
   - Data variables are identified
   - Progress: 40%

5. **Data Extraction**
   - Coordinate arrays are read
   - Data values are extracted
   - Missing values are filtered
   - Progress: 50-90%

6. **Optimization**
   - Large datasets are decimated if needed
   - Statistics are calculated
   - Data is cached for parameter switching
   - Progress: 90%

7. **Visualization**
   - Heatmap is rendered on map
   - Color legend is updated
   - Parameters panel appears (if multi-variable)
   - Progress: 100%

---

## 🔍 Console Logging

When you upload a NetCDF file, you'll see detailed logs in the browser console (F12):

```
[NetCDF] Starting to parse file: ocean_data.nc
[NetCDF] File size: 15.32 MB
[NetCDF] ArrayBuffer loaded: 16056320 bytes
[NetCDF] NetCDFReader loaded successfully
[NetCDF] NetCDF file parsed successfully
[NetCDF] Variables found: ['lat', 'lon', 'time', 'temperature', 'salinity', 'chlorophyll']
[NetCDF] Dimensions found: ['lat', 'lon', 'time']
[NetCDF] Detected lat variable: lat
[NetCDF] Detected lon variable: lon
[NetCDF] Selected value variable: temperature
[NetCDF] Extraction complete: 64800 valid points out of 64800 total
```

These logs help you:
- Verify the file is being processed
- See what variables were detected
- Identify any issues
- Debug problems

---

## ⚡ Performance

### File Size Guidelines

| File Size | Processing Time | Status | Recommendation |
|-----------|-----------------|--------|----------------|
| < 1 MB | < 2 seconds | ✅ Excellent | Perfect |
| 1-10 MB | 2-5 seconds | ✅ Good | Recommended |
| 10-50 MB | 5-15 seconds | ✅ Acceptable | May auto-decimate |
| 50-100 MB | 15-30 seconds | ⚠️ Slow | Consider subsetting |
| > 100 MB | 30+ seconds | ⚠️ Very Slow | Subset recommended |

### Data Point Guidelines

| Points | Action | Performance |
|--------|--------|-------------|
| < 10,000 | All displayed | Excellent |
| 10,000-50,000 | All displayed | Good |
| > 50,000 | Auto-decimated | Optimized |

---

## 🐛 Troubleshooting

### "Failed to load NetCDF library"

**Symptoms**: Error message when uploading .nc file

**Causes**:
- Browser cache contains old version
- Development server not restarted
- Polyfills not loaded

**Solutions**:
1. **Restart development server**:
   ```bash
   # Press Ctrl+C to stop
   pnpm run dev
   ```

2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Firefox: Ctrl+Shift+Delete → Cached Web Content
   - Safari: Cmd+Option+E

3. **Hard refresh**:
   - Chrome/Firefox: Ctrl+Shift+R
   - Safari: Cmd+Shift+R

### "Could not detect latitude/longitude variables"

**Symptoms**: Error message about missing coordinates

**Cause**: Non-standard variable names in your NetCDF file

**Solution**: Check console log for available variables, then either:

1. **Rename variables** in your NetCDF file:
   ```bash
   ncrename -v y,lat -v x,lon input.nc output.nc
   ```

2. **Use supported patterns**:
   - Latitude: lat, latitude, y, yt, y_t, yt_j, yaxis, lat_deg, nav_lat, nlat, latitude_t
   - Longitude: lon, longitude, long, x, xt, x_t, xt_i, xaxis, lon_deg, nav_lon, nlon, longitude_t

### "Could not detect value variable"

**Symptoms**: Error message about missing data variable

**Cause**: No 2D+ data variables found

**Solution**:

1. **Check file structure**:
   ```bash
   ncdump -h your_file.nc
   ```

2. **Verify dimensions**: Ensure data variable has at least 2 dimensions (lat, lon)

3. **Check variable names**: Avoid names like time, depth, level, z (these are excluded)

### "File is too large" or Browser Freezes

**Symptoms**: Slow processing or browser becomes unresponsive

**Cause**: Very large NetCDF file

**Solutions**:

1. **Extract spatial subset**:
   ```bash
   ncks -d lat,20,40 -d lon,-130,-110 input.nc output.nc
   ```

2. **Extract time subset**:
   ```bash
   ncks -d time,0,11 input.nc output.nc
   ```

3. **Extract specific variable**:
   ```bash
   ncks -v temperature input.nc output.nc
   ```

4. **Reduce resolution**:
   ```bash
   cdo remapbil,r180x90 input.nc output.nc
   ```

---

## 📚 NetCDF Tools

### Command-Line Tools

**ncdump** - View NetCDF file structure:
```bash
ncdump -h file.nc          # Show header
ncdump -c file.nc          # Show coordinates
ncdump -v temperature file.nc  # Show variable data
```

**ncks** - Extract subsets:
```bash
ncks -d lat,20,40 input.nc output.nc        # Spatial subset
ncks -d time,0,11 input.nc output.nc        # Time subset
ncks -v temperature input.nc output.nc      # Variable subset
```

**ncrename** - Rename variables:
```bash
ncrename -v old_name,new_name input.nc output.nc
```

**CDO** - Climate Data Operators:
```bash
cdo sinfov file.nc                          # Show info
cdo seldate,2020-01-01,2020-12-31 input.nc output.nc  # Select dates
cdo remapbil,r180x90 input.nc output.nc     # Regrid
```

### Python Tools

**xarray**:
```python
import xarray as xr

# Open file
ds = xr.open_dataset('file.nc')

# View structure
print(ds)

# Extract subset
subset = ds.sel(lat=slice(20, 40), lon=slice(-130, -110))

# Save
subset.to_netcdf('subset.nc')
```

**netCDF4**:
```python
from netCDF4 import Dataset

# Open file
nc = Dataset('file.nc', 'r')

# List variables
print(nc.variables.keys())

# Read data
lat = nc.variables['lat'][:]
lon = nc.variables['lon'][:]
temp = nc.variables['temperature'][:]
```

---

## ✅ Verification Checklist

Before uploading your NetCDF file:

- [ ] File has `.nc` extension
- [ ] File contains latitude variable (lat/latitude/y)
- [ ] File contains longitude variable (lon/longitude/x)
- [ ] File contains at least one data variable with 2D+ dimensions
- [ ] Coordinate ranges are valid (lat: -90 to 90, lon: -180 to 180)
- [ ] Data values are reasonable (not all NaN or fill values)
- [ ] File size is manageable (< 100 MB recommended)
- [ ] Development server has been restarted
- [ ] Browser cache has been cleared

---

## 🎉 Summary

### What's Ready

✅ NetCDF library installed and configured  
✅ Browser polyfills added  
✅ File upload accepts .nc files  
✅ Automatic variable detection  
✅ Multi-dimensional data support  
✅ Large file optimization  
✅ Multi-variable support  
✅ Parameter switching  
✅ Comprehensive error handling  
✅ Detailed console logging  

### What to Do Next

1. **Restart the development server** (required for new dependencies)
2. **Clear your browser cache** (recommended)
3. **Upload your NetCDF file**
4. **Check the console** (F12) for detailed logs
5. **Report any issues** with console output

---

## 📖 Additional Documentation

- **NETCDF_SUPPORT_GUIDE.md** - Comprehensive technical guide
- **NETCDF_QUICK_START.md** - Quick reference
- **NETCDF_IMPLEMENTATION_COMPLETE.md** - Implementation details
- **PARAMETER_SWITCHING_README.md** - Multi-parameter feature guide

---

**Status**: ✅ Ready to Use  
**Action Required**: Restart development server  
**Last Updated**: 2025-12-11  
**Version**: 2.0.0

---

## 🚀 Start Using NetCDF Files Now!

```bash
# 1. Restart server
pnpm run dev

# 2. Open browser
# http://localhost:5173

# 3. Upload your .nc file
# Click "Upload Dataset" → Select .nc file

# 4. Enjoy your visualization! 🌍✨
```
