# Quick Start Guide

## Test the Upload System in 3 Steps

### Step 1: Download Sample Data
Click the **"Sample CSV"** button in the upload dialog

### Step 2: Upload the File
Click **"Choose File"** or drag the downloaded file

### Step 3: View the Heatmap
Watch your data appear on the global map!

---

## Create Your Own Data

### CSV Format (Easiest)
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
```

### Requirements
- Column names: `lat`, `lon`, `value`
- Latitude: -90 to 90
- Longitude: -180 to 180
- Values: any numbers

---

## Supported Formats

| Format | Extension | Example |
|--------|-----------|---------|
| CSV | `.csv` | `data.csv` |
| JSON | `.json` | `data.json` |
| NetCDF | `.nc` | `data.nc` |

---

## File Size Limits

- **Maximum:** 1GB
- **Recommended:** Under 100MB
- **Points:** Up to 100,000 displayed

---

## Common Issues

### "Could not find lat/lon columns"
✅ Use column names: `lat`, `lon`, `value`

### "No valid data points found"
✅ Check latitude is -90 to 90
✅ Check longitude is -180 to 180

### "File is too large"
✅ Maximum size is 1GB
✅ Reduce file size or use subset

---

## Need Help?

See detailed guides:
- `FILE_UPLOAD_GUIDE.md` - Complete user guide
- `SIMPLIFIED_UPLOAD.md` - Technical details
- `UPLOAD_FIX_SUMMARY.md` - Recent changes

---

## That's It!

The system is now simple and reliable. Just upload your data and visualize it on the map.
