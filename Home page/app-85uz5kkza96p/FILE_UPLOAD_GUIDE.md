# File Upload Guide

## Simple File Upload Instructions

### Supported File Formats

1. **CSV Files** (`.csv`)
2. **JSON Files** (`.json`)
3. **NetCDF Files** (`.nc`)

Maximum file size: **1GB**

---

## CSV File Format

### Required Columns
- `lat` or `latitude` - Latitude values (-90 to 90)
- `lon` or `longitude` - Longitude values (-180 to 180)
- `value` - Any numeric data

### Example CSV
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
```

---

## JSON File Format

### Required Fields
- `lat` or `latitude` - Latitude values
- `lon` or `longitude` - Longitude values
- `value` - Any numeric data

### Example JSON
```json
[
  {"lat": 23.5, "lon": 88.2, "value": 29.1},
  {"lat": -10.2, "lon": 45.1, "value": 26.4},
  {"lat": 51.5, "lon": -0.1, "value": 15.3}
]
```

---

## How to Upload

### Method 1: Click to Upload
1. Click the "Choose File" button
2. Select your CSV, JSON, or NetCDF file
3. Wait for processing to complete

### Method 2: Drag and Drop
1. Drag your file from file explorer
2. Drop it onto the upload area
3. Wait for processing to complete

### Method 3: Test with Sample
1. Click "Sample CSV" button to download a test file
2. Upload the downloaded file to verify everything works

---

## What Happens After Upload

1. File is validated (size, format)
2. Data is parsed and extracted
3. Points are plotted on the map
4. Heatmap is displayed

---

## Troubleshooting

### "No file selected"
- Make sure you selected a file

### "File is empty"
- Check that your file contains data

### "File is too large"
- Maximum size is 1GB
- Reduce file size or use a subset of data

### "Could not find lat/lon columns"
- Make sure your CSV has columns named `lat` and `lon`
- Or use `latitude` and `longitude`

### "No valid data points found"
- Check that your data contains numeric values
- Verify latitude is between -90 and 90
- Verify longitude is between -180 and 180

---

## Tips

- Start with the sample CSV to test
- Use simple column names: `lat`, `lon`, `value`
- Ensure data is numeric (no text in value columns)
- Remove any empty rows
- Check file size before uploading

---

## Sample Data

Download the sample CSV file to test:
- Click "Sample CSV" button in the upload dialog
- Or use the `sample_data.csv` file in the project root

The sample contains 10 data points from various locations around the world.
