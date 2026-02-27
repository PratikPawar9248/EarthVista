# NetCDF Upload Troubleshooting Guide

## Quick Diagnostic Steps

When a NetCDF file fails to upload, follow these steps:

### Step 1: Open Browser Console
1. Press **F12** to open Developer Tools
2. Click on the **Console** tab
3. Try uploading your file again
4. Look for detailed error messages

### Step 2: Check Console Output

The console will show detailed information about your file:

```
=== NetCDF File Structure ===
Dimensions: [time, lat, lon]
Variables: [time, lat, lon, temperature, pressure]
File size: 1234567 bytes

Detected coordinates: lat=lat, lon=lon

=== Searching for data variable ===
Variable: time, Dimensions: 1, Excluded: true
Variable: lat, Dimensions: 1, Excluded: true
Variable: lon, Dimensions: 1, Excluded: true
Variable: temperature, Dimensions: 3, Excluded: false
✓ Selected data variable: temperature with 3D data

=== Data Structure ===
Value dimensions: 3
Lat array length: 180
Lon array length: 360

=== Data Extraction Complete ===
Total valid points extracted: 64800
Final point count after decimation: 50000
```

## Common Error Messages and Solutions

### Error 1: "Invalid NetCDF file format"

**Causes**:
- File is corrupted
- File is not actually a NetCDF file
- Unsupported NetCDF variant

**Solutions**:
1. Verify file with `ncdump -h yourfile.nc`
2. Re-download the file
3. Convert to NetCDF3 Classic:
   ```bash
   nccopy -k classic input.nc output.nc
   ```

### Error 2: "Could not detect latitude/longitude variables"

**Console shows**: Available variables: [list of variables]

**Solutions**:
1. Check your variable names in console output
2. Rename variables to standard names using Python:
   ```python
   import xarray as xr
   ds = xr.open_dataset('input.nc')
   ds = ds.rename({'your_lat_name': 'lat', 'your_lon_name': 'lon'})
   ds.to_netcdf('output.nc')
   ```

**Accepted latitude names**:
- lat, latitude, y, yt, y_t, yt_j, yaxis, lat_deg, nav_lat, nlat, latitude_t

**Accepted longitude names**:
- lon, longitude, long, x, xt, x_t, xt_i, xaxis, lon_deg, nav_lon, nlon, longitude_t

### Error 3: "Could not detect value variable"

**Console shows**: List of variables with their dimensions

**Solutions**:
1. Check console output for variable dimensions
2. Ensure you have at least one variable with 2D or 3D data
3. Verify your data variable is not being excluded

### Error 4: "No valid data points found"

**Console shows**: Total valid points extracted: 0

**Causes**:
- All data values are NaN or missing
- Latitude/longitude values are out of range
- Data values exceed threshold (> 1e30)

**Solutions**:
1. Verify coordinate ranges:
   - Latitude must be between -90 and 90
   - Longitude must be between -180 and 180
2. Check for NaN values using Python:
   ```python
   import xarray as xr
   ds = xr.open_dataset('yourfile.nc')
   print(ds['temperature'].isnull().sum())
   ```

## Creating a Test File

```python
import numpy as np
import xarray as xr

# Create simple test data
lat = np.linspace(-90, 90, 10)
lon = np.linspace(-180, 180, 20)
temperature = 15 + 10 * np.random.randn(10, 20)

# Create dataset
ds = xr.Dataset(
    {'temperature': (['lat', 'lon'], temperature)},
    coords={'lat': lat, 'lon': lon}
)

# Save
ds.to_netcdf('test_simple.nc')
print("Created test_simple.nc")
```

## Checklist

- [ ] File extension is `.nc`
- [ ] File size < 1GB
- [ ] Variables are named correctly (lat/lon)
- [ ] At least one 2D data variable exists
- [ ] Coordinates are in valid ranges (-90 to 90, -180 to 180)
- [ ] Data contains non-NaN values
- [ ] Browser console shows detailed error messages

## Additional Resources

- **NETCDF_GUIDE.md**: Complete guide to NetCDF file formats
- **NetCDF User Guide**: https://www.unidata.ucar.edu/software/netcdf/docs/
- **xarray Tutorial**: https://tutorial.xarray.dev/
