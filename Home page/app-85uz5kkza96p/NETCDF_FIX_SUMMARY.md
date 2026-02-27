# NetCDF Support Improvements

## Summary

Enhanced NetCDF file upload support with comprehensive error handling, detailed logging, and troubleshooting guides.

## Changes Made

### 1. Enhanced Error Handling (`src/utils/netcdfParser.ts`)

**Added**:
- Try-catch wrapper around entire parsing function
- File validation (empty file check)
- Better error messages for invalid NetCDF format
- Check for zero data points with helpful error message

**Improved Error Messages**:
- "Invalid NetCDF file format: [specific error]"
- "File is empty or could not be read"
- "No valid data points found. Check that your data contains valid lat/lon coordinates and non-NaN values."

### 2. Comprehensive Logging (`src/utils/netcdfParser.ts`)

**Added Console Logging**:
```javascript
=== NetCDF File Structure ===
Dimensions: [list]
Variables: [list]
File size: X bytes

Detected coordinates: lat=X, lon=Y

=== Searching for data variable ===
Variable: name, Dimensions: N, Excluded: true/false
✓ Selected data variable: name with ND data

=== Data Structure ===
Value dimensions: N
Lat array length: X
Lon array length: Y

=== Data Extraction Complete ===
Total valid points extracted: X
Final point count after decimation: Y
```

**Benefits**:
- Users can see exactly what's in their file
- Easy to identify variable naming issues
- Clear indication of which variable was selected
- Visibility into data extraction process

### 3. Better User Feedback (`src/components/FileUpload.tsx`)

**Enhanced Toast Notifications**:
- Error messages now include description for NetCDF files
- Directs users to check browser console (F12)
- References NETCDF_GUIDE.md for help
- Longer duration (5 seconds) for error messages

**Console Logging**:
- All errors are logged to console
- Includes full error details for debugging

### 4. Documentation

**Created NETCDF_GUIDE.md**:
- Complete guide to NetCDF file formats
- Supported data structures (2D, 3D, point-based)
- Common issues and solutions
- How to create test files
- How to inspect NetCDF files
- Performance tips
- Example files and resources

**Created NETCDF_TROUBLESHOOTING.md**:
- Quick diagnostic steps
- Common error messages with solutions
- How to use browser console
- Creating test files
- Debugging checklist
- Additional resources

## How to Use

### For Users Having Issues

1. **Open Browser Console** (F12)
2. **Upload your NetCDF file**
3. **Check console output** for detailed information
4. **Follow error messages** and refer to guides

### Example Workflow

```
User uploads file → Error occurs
↓
User opens console (F12)
↓
Console shows: "Could not detect latitude/longitude variables"
Console shows: "Available variables: y, x, temp"
↓
User renames variables:
  import xarray as xr
  ds = xr.open_dataset('file.nc')
  ds = ds.rename({'y': 'lat', 'x': 'lon'})
  ds.to_netcdf('fixed.nc')
↓
User uploads fixed.nc → Success!
```

## Technical Details

### Supported Variable Names

**Latitude**:
- lat, latitude, y, yt, y_t, yt_j, yaxis, lat_deg, nav_lat, nlat, latitude_t

**Longitude**:
- lon, longitude, long, x, xt, x_t, xt_i, xaxis, lon_deg, nav_lon, nlon, longitude_t

### Data Requirements

- At least one 2D or 3D data variable
- Valid coordinate ranges:
  - Latitude: -90 to 90
  - Longitude: -180 to 180
- Non-NaN data values
- Values < 1e30 (to filter out fill values)

### Automatic Features

- **Variable Detection**: Automatically finds lat/lon/data variables
- **Time Handling**: Uses first time slice for 3D data
- **Data Decimation**: Reduces large datasets to 50,000 points
- **Missing Value Filtering**: Skips NaN and fill values

## Testing

### Test with Sample File

Create a simple test file:

```python
import numpy as np
import xarray as xr

lat = np.linspace(-90, 90, 10)
lon = np.linspace(-180, 180, 20)
temperature = 15 + 10 * np.random.randn(10, 20)

ds = xr.Dataset(
    {'temperature': (['lat', 'lon'], temperature)},
    coords={'lat': lat, 'lon': lon}
)

ds.to_netcdf('test.nc')
```

Upload `test.nc` to verify the system works.

## Common Issues Resolved

### Issue 1: Silent Failures
**Before**: File upload failed with generic error
**After**: Detailed console output shows exactly what went wrong

### Issue 2: Variable Name Confusion
**Before**: "Could not find variables"
**After**: Shows all available variables and expected patterns

### Issue 3: No Data Points
**Before**: Map shows nothing, no explanation
**After**: Clear error message with suggestions

### Issue 4: Debugging Difficulty
**Before**: No way to see what's happening
**After**: Complete console logging of entire process

## Files Modified

1. `src/utils/netcdfParser.ts` - Enhanced error handling and logging
2. `src/components/FileUpload.tsx` - Better error messages
3. `NETCDF_GUIDE.md` - Complete user guide (created)
4. `NETCDF_TROUBLESHOOTING.md` - Troubleshooting guide (created)

## Benefits

1. **Better User Experience**: Clear error messages guide users to solutions
2. **Easier Debugging**: Console output shows exactly what's happening
3. **Self-Service**: Users can fix issues themselves using guides
4. **Transparency**: Users can see file structure and processing steps
5. **Comprehensive Documentation**: Two detailed guides for reference

## Next Steps for Users

1. Try uploading your NetCDF file
2. If it fails, open browser console (F12)
3. Read the console output
4. Follow error messages and refer to guides
5. Fix your file if needed
6. Try again

## Support Resources

- **Browser Console**: Press F12 to see detailed logs
- **NETCDF_GUIDE.md**: Complete guide to NetCDF formats
- **NETCDF_TROUBLESHOOTING.md**: Step-by-step troubleshooting
- **Console Output**: Shows file structure and processing steps

The NetCDF upload system now provides comprehensive feedback and guidance to help users successfully upload their files.
