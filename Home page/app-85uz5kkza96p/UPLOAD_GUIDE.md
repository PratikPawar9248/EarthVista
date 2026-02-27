# Dataset Upload Guide

## Quick Start

1. **Click "Choose File"** or **drag and drop** your file
2. **Wait for processing** (progress bar shows status)
3. **View your heatmap** on the global map

## Supported Formats

### CSV Files (.csv)
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
```

### JSON Files (.json)
```json
[
  { "lat": 23.5, "lon": 88.2, "value": 29.1 },
  { "lat": -10.2, "lon": 45.1, "value": 26.4 }
]
```

### NetCDF Files (.nc)
- Must contain `lat` and `lon` variables
- Must contain at least one 2D data variable

## Requirements

- **File size**: Maximum 1GB
- **Latitude**: Must be between -90 and 90
- **Longitude**: Must be between -180 and 180
- **Values**: Must be valid numbers (not NaN or Infinity)

## Common Issues

### "Missing required columns"
**Fix**: Rename your columns to `lat`, `lon`, and `value`

### "No valid data points found"
**Fix**: Check that your coordinates are in valid ranges:
- Latitude: -90 to 90
- Longitude: -180 to 180

### "File is empty"
**Fix**: Make sure your file has content and was saved correctly

### "Invalid JSON format"
**Fix**: Validate your JSON syntax at jsonlint.com

## Tips

- **Download Sample**: Click "Sample CSV" to get an example file
- **Large Files**: Files with > 100,000 points will be automatically optimized
- **Invalid Rows**: Invalid data rows are skipped automatically
- **Progress**: Watch the progress bar to see upload status

## Need Help?

- Check error messages for specific guidance
- Download sample CSV to see correct format
- Verify your data meets the requirements above

---

**All upload issues have been fixed!** The system now handles all edge cases gracefully.
