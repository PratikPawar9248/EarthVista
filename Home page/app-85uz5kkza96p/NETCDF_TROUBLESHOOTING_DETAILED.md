# NetCDF Troubleshooting Guide - "No Valid Data Points Found"

## Error Message

```
Error processing NetCDF: No valid data points found. Check that your data contains valid lat/lon coordinates and non-NaN values.
```

## What This Means

The NetCDF file was successfully parsed and variables were detected, but when extracting data points, none passed validation. This can happen for several reasons.

---

## Diagnostic Steps

### Step 1: Check Browser Console (F12)

Open the browser console and look for detailed logs starting with `[NetCDF]`. You should see:

```
[NetCDF] Starting to parse file: your_file.nc
[NetCDF] File size: X.XX MB
[NetCDF] NetCDFReader loaded successfully
[NetCDF] NetCDF file parsed successfully
[NetCDF] Variables found: [...]
[NetCDF] Dimensions found: [...]
[NetCDF] Detected lat variable: lat
[NetCDF] Detected lon variable: lon
[NetCDF] Selected value variable: temperature
[NetCDF] Coordinate arrays: lat=X, lon=Y
[NetCDF] Sample lat values: [...]
[NetCDF] Sample lon values: [...]
[NetCDF] Lat range: [min, max]
[NetCDF] Lon range: [min, max]
[NetCDF] Value data structure: {...}
[NetCDF] Starting data extraction from XxY grid...
[NetCDF] First successful data access at [i,j] using METHOD: value=X, lat=Y, lon=Z
[NetCDF] Extraction complete: N valid points out of M total
```

### Step 2: Identify the Problem

Look for these specific log messages:

#### Problem A: Invalid Coordinate Ranges

```
[NetCDF] Lat range: [-180, 180]  ← WRONG! Should be [-90, 90]
[NetCDF] Lon range: [-90, 90]    ← WRONG! Should be [-180, 180]
```

**Cause**: Latitude and longitude variables are swapped or incorrectly named.

**Solution**:
```bash
# Check your file structure
ncdump -h your_file.nc

# Look for the actual coordinate variables
# If lat contains values outside [-90, 90], it's probably longitude
# If lon contains values outside [-180, 180], it's probably latitude

# Fix by renaming variables
ncrename -v lat,temp_var your_file.nc
ncrename -v lon,lat your_file.nc
ncrename -v temp_var,lon your_file.nc
```

#### Problem B: No Successful Data Access

```
[NetCDF] Starting data extraction from 180x360 grid...
[NetCDF] Error accessing data at [0, 0] using 2D[lat][lon]: ...
[NetCDF] Error accessing data at [0, 1] using 2D[lat][lon]: ...
[NetCDF] Extraction complete: 0 valid points out of 64800 total
```

**Cause**: Data array dimensions don't match coordinate array dimensions.

**Solution**: Check the actual dimension order in your file:

```bash
ncdump -h your_file.nc
```

Look for the variable definition:
```
float temperature(time, lat, lon) ;  ← 3D: [time, lat, lon]
float temperature(lat, lon) ;        ← 2D: [lat, lon]
float temperature(lon, lat) ;        ← 2D but REVERSED: [lon, lat]
```

If dimensions are reversed (lon, lat instead of lat, lon), you need to transpose:
```bash
ncpdq -a lat,lon input.nc output.nc
```

#### Problem C: All Values are NaN or Fill Values

```
[NetCDF] First successful data access at [0,0] using 2D[lat][lon]: value=NaN, lat=X, lon=Y
[NetCDF] Extraction complete: 0 valid points out of 64800 total
```

**Cause**: All data values are NaN or fill values.

**Solution**: Check your data:
```bash
# View actual data values
ncdump -v temperature your_file.nc | head -50

# Check for fill values
ncdump -h your_file.nc | grep -i fill

# Check statistics
ncap2 -s 'print(temperature.min())' your_file.nc
ncap2 -s 'print(temperature.max())' your_file.nc
```

If all values are fill values, your data might not be properly written. Check the source.

#### Problem D: Dimension Mismatch

```
[NetCDF] Coordinate arrays: lat=180, lon=360
[NetCDF] Value data structure: { isArray: true, length: 12, ... }
```

**Cause**: Value variable has different dimensions (e.g., time dimension first).

**Solution**: The parser should handle this automatically. If not, extract a single time slice:
```bash
ncks -d time,0 input.nc output.nc
```

---

## Common NetCDF File Issues

### Issue 1: Swapped Lat/Lon

**Symptoms**:
- Lat range is [-180, 180]
- Lon range is [-90, 90]

**Fix**:
```bash
ncrename -v lat,temp your_file.nc
ncrename -v lon,lat your_file.nc
ncrename -v temp,lon your_file.nc
```

### Issue 2: Reversed Dimensions

**Symptoms**:
- Variable defined as `float temp(lon, lat)` instead of `float temp(lat, lon)`

**Fix**:
```bash
ncpdq -a lat,lon input.nc output.nc
```

### Issue 3: Time Dimension First

**Symptoms**:
- Variable defined as `float temp(time, lat, lon)`
- Only want first time step

**Fix**:
```bash
ncks -d time,0 input.nc output.nc
```

### Issue 4: Packed Data Not Unpacked

**Symptoms**:
- Data has `scale_factor` and `add_offset` attributes
- Values look wrong (e.g., all integers when expecting floats)

**Fix**: The parser should handle this automatically. If not:
```bash
ncpdq -U input.nc output.nc
```

### Issue 5: Non-Standard Coordinate Names

**Symptoms**:
- Coordinates named something other than lat/lon (e.g., latitude_t, longitude_t)

**Fix**: Rename to standard names:
```bash
ncrename -v latitude_t,lat -v longitude_t,lon input.nc output.nc
```

---

## Testing Your NetCDF File

### Quick Test Script (Python)

```python
import netCDF4 as nc
import numpy as np

# Open file
ds = nc.Dataset('your_file.nc', 'r')

# List all variables
print("Variables:", list(ds.variables.keys()))

# Check dimensions
print("\nDimensions:")
for dim in ds.dimensions.values():
    print(f"  {dim.name}: {dim.size}")

# Find coordinate variables
lat_var = None
lon_var = None
for var_name in ds.variables.keys():
    var = ds.variables[var_name]
    if 'lat' in var_name.lower():
        lat_var = var_name
        lat_data = var[:]
        print(f"\nLatitude variable: {lat_var}")
        print(f"  Range: [{lat_data.min()}, {lat_data.max()}]")
        print(f"  Shape: {lat_data.shape}")
    if 'lon' in var_name.lower():
        lon_var = var_name
        lon_data = var[:]
        print(f"\nLongitude variable: {lon_var}")
        print(f"  Range: [{lon_data.min()}, {lon_data.max()}]")
        print(f"  Shape: {lon_data.shape}")

# Find data variables
print("\nData variables:")
for var_name in ds.variables.keys():
    if var_name not in [lat_var, lon_var, 'time', 'depth', 'level']:
        var = ds.variables[var_name]
        if len(var.dimensions) >= 2:
            data = var[:]
            print(f"  {var_name}:")
            print(f"    Dimensions: {var.dimensions}")
            print(f"    Shape: {data.shape}")
            print(f"    Type: {data.dtype}")
            print(f"    Range: [{np.nanmin(data)}, {np.nanmax(data)}]")
            print(f"    NaN count: {np.isnan(data).sum()}")
            print(f"    Valid count: {(~np.isnan(data)).sum()}")

ds.close()
```

### Expected Output

```
Variables: ['lat', 'lon', 'time', 'temperature', 'salinity']

Dimensions:
  lat: 180
  lon: 360
  time: 12

Latitude variable: lat
  Range: [-90.0, 90.0]  ← Should be in this range
  Shape: (180,)

Longitude variable: lon
  Range: [-180.0, 180.0]  ← Should be in this range
  Shape: (360,)

Data variables:
  temperature:
    Dimensions: ('time', 'lat', 'lon')
    Shape: (12, 180, 360)
    Type: float32
    Range: [-2.0, 35.0]
    NaN count: 0
    Valid count: 777600  ← Should have valid data
```

---

## Creating a Test NetCDF File

If you want to test with a known-good file:

```python
import netCDF4 as nc
import numpy as np

# Create file
ds = nc.Dataset('test_ocean.nc', 'w', format='NETCDF4')

# Create dimensions
lat_dim = ds.createDimension('lat', 180)
lon_dim = ds.createDimension('lon', 360)

# Create coordinate variables
lats = ds.createVariable('lat', 'f4', ('lat',))
lons = ds.createVariable('lon', 'f4', ('lon',))

# Create data variable
temp = ds.createVariable('temperature', 'f4', ('lat', 'lon'))

# Set coordinate values
lats[:] = np.linspace(-90, 90, 180)
lons[:] = np.linspace(-180, 180, 360)

# Set data values (simple gradient)
lat_grid, lon_grid = np.meshgrid(lats[:], lons[:], indexing='ij')
temp[:, :] = 20 + 10 * np.sin(np.radians(lat_grid))

# Add attributes
lats.units = 'degrees_north'
lats.long_name = 'Latitude'
lons.units = 'degrees_east'
lons.long_name = 'Longitude'
temp.units = 'degrees_C'
temp.long_name = 'Sea Surface Temperature'

# Close file
ds.close()

print("✅ Created test_ocean.nc")
print("Upload this file to test NetCDF support")
```

---

## Still Having Issues?

### Provide This Information

When reporting issues, please provide:

1. **Console logs** (F12 → Console → Copy all `[NetCDF]` messages)

2. **File structure**:
   ```bash
   ncdump -h your_file.nc
   ```

3. **Sample data**:
   ```bash
   ncdump -v lat,lon your_file.nc | head -50
   ```

4. **File size and source**:
   - Where did the file come from?
   - What software created it?
   - What data does it contain?

### Quick Fixes to Try

1. **Extract a subset**:
   ```bash
   ncks -d lat,0,89 -d lon,0,179 input.nc output.nc
   ```

2. **Convert to NetCDF-4 Classic**:
   ```bash
   nccopy -k netCDF-4 classic model input.nc output.nc
   ```

3. **Simplify to 2D**:
   ```bash
   ncks -d time,0 -d depth,0 input.nc output.nc
   ```

4. **Rename variables to standard names**:
   ```bash
   ncrename -v latitude,lat -v longitude,lon input.nc output.nc
   ```

---

## Summary

The "No valid data points found" error means:
- ✅ File was parsed successfully
- ✅ Variables were detected
- ❌ Data extraction failed

Most common causes:
1. Swapped or invalid lat/lon coordinates
2. Dimension order mismatch
3. All values are NaN or fill values
4. Non-standard variable names

**Next Steps**:
1. Check browser console logs
2. Verify file structure with `ncdump -h`
3. Check coordinate ranges
4. Try the test script above
5. Report issue with console logs and file structure

---

**Last Updated**: 2025-12-11  
**Version**: 2.0.0
