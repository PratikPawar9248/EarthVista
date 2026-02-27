# NetCDF (.nc) File Support - Quick Start

## ✅ Status: FULLY SUPPORTED

Your application **already supports NetCDF (.nc) files**!

---

## 🚀 How to Use (3 Steps)

### Step 1: Get a NetCDF File
Your `.nc` file should contain:
- Latitude variable (lat/latitude/y)
- Longitude variable (lon/longitude/x)
- Data variables (temperature, salinity, etc.)

### Step 2: Upload
1. Click **"Upload Dataset"** button
2. Select your `.nc` file
3. Wait for processing

### Step 3: Visualize
- Map displays your data automatically
- Use **Parameters panel** (top-left) to switch between variables
- Explore your data!

---

## 📊 What NetCDF Files Are Supported?

### Gridded Data (Most Common)
```
Dimensions: [lat, lon] or [time, lat, lon] or [time, depth, lat, lon]
Example: Global temperature grids, ocean models, climate data
```

### Point Data
```
Dimensions: [points]
Example: Station measurements, buoy data, ship tracks
```

---

## 🔍 Automatic Detection

The system automatically finds:
- **Latitude**: lat, latitude, y, yt, y_t, yt_j, yaxis, lat_deg, nav_lat, nlat, latitude_t
- **Longitude**: lon, longitude, long, x, xt, x_t, xt_i, xaxis, lon_deg, nav_lon, nlon, longitude_t
- **Data variables**: temp, temperature, sst, salinity, sal, chlorophyll, chl, ssh, u, v, w

---

## 💡 Example Files

### Oceanographic Data
```
Variables: temperature, salinity, chlorophyll
Use case: Ocean analysis, marine biology
```

### Climate Data
```
Variables: tas (temperature), pr (precipitation), psl (pressure)
Use case: Climate research, weather analysis
```

### Satellite Data
```
Variables: sst (sea surface temperature), sst_error, quality_level
Use case: Remote sensing, data validation
```

---

## 🎨 Multi-Variable Files

If your NetCDF file has multiple variables:

1. **Upload once**
2. **Parameters panel appears** (top-left corner)
3. **Click buttons** to switch between variables
4. **Heatmap updates** instantly

Example:
- Click "Temperature" → Shows temperature
- Click "Salinity" → Shows salinity
- Click "Chlorophyll" → Shows chlorophyll

---

## ⚡ Performance

| File Size | Processing Time |
|-----------|-----------------|
| < 1 MB | < 2 seconds |
| 1-10 MB | 2-5 seconds |
| 10-50 MB | 5-15 seconds |
| > 50 MB | 15-30 seconds |

Large files are automatically optimized!

---

## 🐛 Common Issues

### "Could not detect latitude/longitude"
**Fix**: Rename variables to `lat` and `lon`

### "Could not detect value variable"
**Fix**: Ensure file has 2D+ data variable (not just coordinates)

### "Invalid NetCDF file"
**Fix**: Verify file is valid using `ncdump -h file.nc`

---

## 📚 More Information

- **Full Guide**: `NETCDF_SUPPORT_GUIDE.md`
- **Multi-Parameter Feature**: `PARAMETER_SWITCHING_README.md`
- **All Features**: `FEATURES.md`

---

## 🎉 Summary

✅ NetCDF (.nc) files are **fully supported**  
✅ Automatic variable detection  
✅ Multi-variable support with parameter switching  
✅ Handles 2D, 3D, and 4D data  
✅ Large file optimization  
✅ Real-time progress indicators  

**Just upload your .nc file and start exploring!** 🌍✨

---

**Package**: netcdfjs v3.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-12-11
