# NetCDF File Upload Guide

## Overview
This application supports NetCDF (.nc) files containing geospatial data with latitude, longitude, and value fields.

## Supported NetCDF Formats

### Required Variables
Your NetCDF file must contain:
1. **Latitude variable** - One of: `lat`, `latitude`, `y`, `yt`, `y_t`, `yt_j`, `yaxis`, `lat_deg`, `nav_lat`, `nlat`, `latitude_t`
2. **Longitude variable** - One of: `lon`, `longitude`, `long`, `x`, `xt`, `x_t`, `xt_i`, `xaxis`, `lon_deg`, `nav_lon`, `nlon`, `longitude_t`
3. **Data variable** - Any variable with 2D or 3D data (not coordinates/time/depth)

### Data Structures

#### 1. Gridded Data (2D)
```
dimensions:
  lat = 180
  lon = 360

variables:
  float lat(lat)
  float lon(lon)
  float temperature(lat, lon)
```

#### 2. Gridded Data with Time (3D)
```
dimensions:
  time = 12
  lat = 180
  lon = 360

variables:
  float time(time)
  float lat(lat)
  float lon(lon)
  float temperature(time, lat, lon)
```
*Note: The application will use the first time slice*

#### 3. Point-Based Data (1D)
```
dimensions:
  points = 1000

variables:
  float lat(points)
  float lon(points)
  float value(points)
```

## Common Issues and Solutions

### Issue 1: "Could not detect latitude/longitude variables"

**Cause**: Variable names don't match expected patterns

**Solution**: Rename your variables to standard names:
- Latitude: `lat` or `latitude`
- Longitude: `lon` or `longitude`

**Using NCO (NetCDF Operators)**:
```bash
ncrename -v old_lat_name,lat -v old_lon_name,lon input.nc output.nc
```

**Using Python (xarray)**:
```python
import xarray as xr

ds = xr.open_dataset('input.nc')
ds = ds.rename({'old_lat_name': 'lat', 'old_lon_name': 'lon'})
ds.to_netcdf('output.nc')
```

### Issue 2: "Could not detect value variable"

**Cause**: No suitable data variable found

**Solution**: Ensure you have at least one variable with 2D or 3D data that is not a coordinate variable

**Check your file structure**:
```bash
ncdump -h your_file.nc
```

### Issue 3: "Invalid NetCDF file format"

**Cause**: File is corrupted or not a valid NetCDF file

**Solution**:
1. Verify file integrity: `ncdump -h your_file.nc`
2. Re-download or re-create the file
3. Convert from NetCDF4 to NetCDF3 classic:
   ```bash
   nccopy -k classic your_file.nc output.nc
   ```

### Issue 4: "File is empty or could not be read"

**Cause**: File upload failed or file is corrupted

**Solution**:
1. Check file size (must be < 1GB)
2. Try re-uploading the file
3. Verify file is not corrupted

### Issue 5: No data points displayed

**Cause**: Data values are outside valid range or all NaN

**Solution**:
1. Check for fill values: `ncdump -v your_variable your_file.nc | head -20`
2. Ensure latitude is between -90 and 90
3. Ensure longitude is between -180 and 180
4. Check for NaN or missing values

## Creating Test NetCDF Files

### Using Python (xarray)

```python
import numpy as np
import xarray as xr

# Create sample data
lat = np.linspace(-90, 90, 180)
lon = np.linspace(-180, 180, 360)
temperature = 15 + 10 * np.random.randn(180, 360)

# Create dataset
ds = xr.Dataset(
    {
        'temperature': (['lat', 'lon'], temperature)
    },
    coords={
        'lat': lat,
        'lon': lon
    }
)

# Add attributes
ds['temperature'].attrs['units'] = 'degrees_C'
ds['temperature'].attrs['long_name'] = 'Surface Temperature'
ds['lat'].attrs['units'] = 'degrees_north'
ds['lon'].attrs['units'] = 'degrees_east'

# Save to file
ds.to_netcdf('sample_temperature.nc')
print("Created sample_temperature.nc")
```

### Using Python (netCDF4)

```python
from netCDF4 import Dataset
import numpy as np

# Create file
nc = Dataset('sample_data.nc', 'w', format='NETCDF4')

# Create dimensions
lat_dim = nc.createDimension('lat', 180)
lon_dim = nc.createDimension('lon', 360)

# Create variables
lat_var = nc.createVariable('lat', 'f4', ('lat',))
lon_var = nc.createVariable('lon', 'f4', ('lon',))
temp_var = nc.createVariable('temperature', 'f4', ('lat', 'lon'))

# Assign data
lat_var[:] = np.linspace(-90, 90, 180)
lon_var[:] = np.linspace(-180, 180, 360)
temp_var[:] = 15 + 10 * np.random.randn(180, 360)

# Add attributes
lat_var.units = 'degrees_north'
lon_var.units = 'degrees_east'
temp_var.units = 'degrees_C'
temp_var.long_name = 'Surface Temperature'

# Close file
nc.close()
print("Created sample_data.nc")
```

## Inspecting NetCDF Files

### Using ncdump (Command Line)

```bash
# View file structure
ncdump -h your_file.nc

# View all data
ncdump your_file.nc

# View specific variable
ncdump -v temperature your_file.nc
```

### Using Python (xarray)

```python
import xarray as xr

# Open file
ds = xr.open_dataset('your_file.nc')

# View structure
print(ds)

# List variables
print(ds.data_vars)

# List dimensions
print(ds.dims)

# View specific variable
print(ds['temperature'])
```

### Using Python (netCDF4)

```python
from netCDF4 import Dataset

# Open file
nc = Dataset('your_file.nc', 'r')

# List dimensions
print("Dimensions:", nc.dimensions.keys())

# List variables
print("Variables:", nc.variables.keys())

# View variable details
print(nc.variables['temperature'])

# Close file
nc.close()
```

## Performance Tips

### 1. File Size Optimization
- Maximum file size: 1GB
- Recommended: < 100MB for best performance
- Use compression when creating NetCDF files

### 2. Data Decimation
- Files with > 100,000 points are automatically decimated
- Original data is preserved, only display is optimized

### 3. Spatial Resolution
- Higher resolution = more points = slower rendering
- Consider reducing resolution for large datasets

## Troubleshooting Checklist

Before uploading, verify:
- [ ] File extension is `.nc`
- [ ] File size is < 1GB
- [ ] File contains `lat`/`latitude` variable
- [ ] File contains `lon`/`longitude` variable
- [ ] File contains at least one 2D data variable
- [ ] Latitude values are between -90 and 90
- [ ] Longitude values are between -180 and 180
- [ ] Data values are not all NaN or missing

## Getting Help

If you're still having issues:

1. **Check the browser console** (F12) for detailed error messages
2. **Inspect your file** using `ncdump -h your_file.nc`
3. **Verify variable names** match expected patterns
4. **Test with a simple file** first (see examples above)
5. **Check file integrity** - try opening in another tool

## Example NetCDF Files

You can download example NetCDF files from:
- NASA Earthdata: https://earthdata.nasa.gov/
- NOAA Climate Data: https://www.ncei.noaa.gov/
- Copernicus Climate Data Store: https://cds.climate.copernicus.eu/

## Supported NetCDF Versions

- NetCDF-3 Classic ✅
- NetCDF-4 Classic ✅
- NetCDF-4 ✅
- HDF5-based NetCDF ✅

## Additional Resources

- NetCDF Documentation: https://www.unidata.ucar.edu/software/netcdf/
- NCO Tools: http://nco.sourceforge.net/
- xarray Documentation: https://docs.xarray.dev/
- netCDF4-python: https://unidata.github.io/netcdf4-python/
