# NetCDF Upload - Quick Help

## 🚨 File Not Working?

### 1. Open Browser Console
Press **F12** → Click **Console** tab

### 2. Upload Your File Again
Look for detailed error messages in console

### 3. Common Fixes

#### "Could not detect latitude/longitude variables"
**Fix**: Rename your variables to `lat` and `lon`

```python
import xarray as xr
ds = xr.open_dataset('yourfile.nc')
ds = ds.rename({'your_lat': 'lat', 'your_lon': 'lon'})
ds.to_netcdf('fixed.nc')
```

#### "Could not detect value variable"
**Fix**: Ensure you have a 2D data variable (not just coordinates)

#### "No valid data points found"
**Fix**: Check your data:
- Latitude must be -90 to 90
- Longitude must be -180 to 180
- Values must not be all NaN

## ✅ Requirements

- [ ] File extension: `.nc`
- [ ] File size: < 1GB
- [ ] Has `lat` or `latitude` variable
- [ ] Has `lon` or `longitude` variable
- [ ] Has at least one 2D data variable
- [ ] Valid coordinate ranges
- [ ] Non-NaN data values

## 📚 More Help

- **NETCDF_GUIDE.md** - Complete guide
- **NETCDF_TROUBLESHOOTING.md** - Detailed troubleshooting
- **Browser Console (F12)** - Detailed error logs

## 🧪 Test File

Create a simple test file to verify the system works:

```python
import numpy as np
import xarray as xr

lat = np.linspace(-90, 90, 10)
lon = np.linspace(-180, 180, 20)
temp = 15 + 10 * np.random.randn(10, 20)

ds = xr.Dataset(
    {'temperature': (['lat', 'lon'], temp)},
    coords={'lat': lat, 'lon': lon}
)

ds.to_netcdf('test.nc')
```

Upload `test.nc` to verify everything works!
