# How to Upload Your Dataset

## Quick Start (3 Steps)

### 1. Prepare Your File

Your file must have three columns:
- **lat** (latitude: -90 to 90)
- **lon** (longitude: -180 to 180)
- **value** (any number)

**Example CSV**:
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
```

### 2. Upload the File

- Click **"Choose File"** button
- Or **drag and drop** your file
- Wait for the progress bar to complete

### 3. View Your Heatmap

Your data will appear as a heatmap on the global map!

---

## Supported File Formats

### CSV Files (.csv)
```csv
lat,lon,value
0,0,25
45,90,30
-45,-90,20
```

### JSON Files (.json)
```json
[
  {"lat": 0, "lon": 0, "value": 25},
  {"lat": 45, "lon": 90, "value": 30}
]
```

### NetCDF Files (.nc)
- Must contain `lat` and `lon` variables
- Must contain at least one 2D data variable

---

## Requirements

✅ **File size**: Maximum 1GB
✅ **Latitude**: Between -90 and 90
✅ **Longitude**: Between -180 and 180
✅ **Values**: Valid numbers (not text)

---

## Common Mistakes

### ❌ Wrong Column Names
```csv
latitude,longitude,temperature
23.5,88.2,29.1
```
**Fix**: Use `lat`, `lon`, `value`

### ❌ Invalid Coordinates
```csv
lat,lon,value
999,999,25
```
**Fix**: Use valid ranges (-90 to 90 for lat, -180 to 180 for lon)

### ❌ Text Instead of Numbers
```csv
lat,lon,value
abc,def,ghi
```
**Fix**: Use numbers only

---

## Need Help?

### If Upload Fails:

1. **Press F12** to open browser console
2. **Try uploading again**
3. **Read the error message** in the console
4. **Check DEBUG_UPLOAD.md** for detailed troubleshooting

### Download Sample File

Click the **"Sample CSV"** button to download a working example file.

---

## Tips

💡 **Large files**: Files with > 100,000 points will be automatically optimized

💡 **Invalid rows**: Invalid data rows are automatically skipped

💡 **Progress**: Watch the progress bar to see upload status

💡 **Console**: Press F12 to see detailed upload progress

---

**All upload issues have been fixed with comprehensive error handling and logging!**

If you encounter any problems, press F12 and check the console for detailed information.
