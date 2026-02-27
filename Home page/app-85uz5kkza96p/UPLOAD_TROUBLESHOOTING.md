# File Upload Troubleshooting Guide

## Overview
This guide helps you troubleshoot and fix any issues with uploading datasets to the Geospatial Heatmap Visualization Platform.

---

## Quick Start - Test Upload

### Step 1: Download Sample Data
1. Click the **"Upload Dataset"** button in the header
2. In the upload dialog, click **"Download Sample"** button
3. A file named `sample-geospatial-data.csv` will be downloaded

### Step 2: Upload Sample Data
1. Click **"Choose File"** button
2. Select the downloaded `sample-geospatial-data.csv` file
3. The file should upload successfully and display a heatmap

If this works, your upload system is functioning correctly!

---

## Common Issues and Solutions

### Issue 1: "Choose File" Button Not Working

**Symptoms:**
- Clicking "Choose File" does nothing
- File browser doesn't open

**Solutions:**
1. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for any error messages

2. **Try Different Browser**
   - Test in Chrome, Firefox, or Edge
   - Some browsers may have restrictions

3. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear cached images and files
   - Reload the page

4. **Disable Browser Extensions**
   - Ad blockers or privacy extensions may interfere
   - Try in Incognito/Private mode

### Issue 2: File Selected But Nothing Happens

**Symptoms:**
- File browser opens and you select a file
- No loading indicator appears
- No error message shown

**Debug Steps:**
1. **Open Browser Console** (F12)
2. Look for messages starting with "=== FILE UPLOAD DEBUG ==="
3. Check which step number appears last

**Step-by-Step Debug Output:**
```
1. handleFile called
2. File object: [File object details]
3. File name: your-file.csv
4. File type: text/csv
5. File size: 1234 bytes
6. Starting progress animation
7. Calling parseFile...
8. parseFile completed
9. Result: {success: true, data: {...}}
10. SUCCESS - Data parsed successfully
```

**If you see:**
- **Steps 1-5 only**: File validation failed
- **Steps 1-7 only**: Parser is stuck or crashed
- **Steps 1-9 with success: false**: File format issue
- **All steps**: Upload successful!

### Issue 3: "Could not detect latitude/longitude columns"

**Symptoms:**
- Error message: "Could not detect latitude/longitude columns"

**Solution:**
Your CSV file must have columns named one of these:
- **Latitude**: `lat`, `latitude`, `y`, `lat_deg`
- **Longitude**: `lon`, `long`, `longitude`, `x`, `lon_deg`
- **Value**: Any other numeric column

**Example of CORRECT format:**
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
```

**Example of INCORRECT format:**
```csv
Latitude,Longitude,Temperature
23.5,88.2,29.1
```
*Fix: Rename columns to `lat`, `lon`, `value`*

### Issue 4: "No valid data points found"

**Symptoms:**
- File uploads but shows "No valid data points found"

**Causes:**
1. **Invalid coordinate ranges**
   - Latitude must be between -90 and 90
   - Longitude must be between -180 and 180

2. **Non-numeric values**
   - All values must be numbers
   - No text in data rows (except headers)

3. **Missing values**
   - No empty cells in data rows

**Solution:**
Check your data:
```csv
lat,lon,value
23.5,88.2,29.1     ✅ Valid
200,45.1,26.4      ❌ Invalid lat (>90)
51.5,-0.1,         ❌ Missing value
51.5,-0.1,abc      ❌ Non-numeric value
```

### Issue 5: File Too Large

**Symptoms:**
- Error: "File is too large. Maximum size is 100MB"

**Solutions:**
1. **Reduce data points**
   - Sample your dataset (e.g., every 10th row)
   - Use data aggregation tools

2. **Compress data**
   - Remove unnecessary columns
   - Round values to fewer decimal places

3. **Split into multiple files**
   - Upload regions separately
   - Combine visualizations later

### Issue 6: Empty File Error

**Symptoms:**
- Error: "The selected file is empty"

**Solutions:**
1. **Check file size**
   - Right-click file → Properties
   - Size should be > 0 bytes

2. **Re-export data**
   - Export from source again
   - Ensure data is included

3. **Check file encoding**
   - Save as UTF-8 encoding
   - Avoid special characters

### Issue 7: Drag and Drop Not Working

**Symptoms:**
- Dragging file over upload area doesn't work
- No visual feedback when dragging

**Solutions:**
1. **Use "Choose File" button instead**
   - More reliable than drag-and-drop

2. **Check browser permissions**
   - Some browsers restrict drag-and-drop

3. **Try different file location**
   - Don't drag from compressed folders
   - Copy file to desktop first

---

## Supported File Formats

### CSV (Comma-Separated Values) ✅ Recommended
**Format:**
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
```

**Requirements:**
- First row must be headers
- Columns: lat, lon, value (or variations)
- Comma-separated
- UTF-8 encoding

### JSON ✅ Supported
**Format:**
```json
[
  {"lat": 23.5, "lon": 88.2, "value": 29.1},
  {"lat": -10.2, "lon": 45.1, "value": 26.4}
]
```

**Requirements:**
- Array of objects
- Each object has lat, lon, value properties
- Valid JSON syntax

### NetCDF (.nc) ✅ Supported
**Requirements:**
- Contains lat, lon, and value variables
- Standard CF conventions
- Readable by netcdfjs library

### Other Formats
- **HDF5** (.h5, .hdf5): Partial support
- **GeoTIFF** (.tif, .tiff): Partial support

---

## Browser Console Debugging

### How to Open Console
- **Windows/Linux**: Press `F12` or `Ctrl+Shift+I`
- **Mac**: Press `Cmd+Option+I`
- Click "Console" tab

### What to Look For

**Successful Upload:**
```
=== FILE UPLOAD DEBUG ===
1. handleFile called
2. File object: File {name: "data.csv", ...}
3. File name: data.csv
4. File type: text/csv
5. File size: 1234 bytes
6. Starting progress animation
7. Calling parseFile...
8. parseFile completed
9. Result: {success: true, data: {...}}
10. SUCCESS - Data parsed successfully
11. Data points: 20
12. Fields: ["value"]
13. Value range: {min: 11.2, max: 29.8}
14. Calling onDataLoaded callback...
15. onDataLoaded callback completed
```

**Failed Upload:**
```
=== FILE UPLOAD DEBUG ===
1. handleFile called
...
ERROR: Parse failed
Error message: Could not detect latitude/longitude columns
```

### Common Error Messages

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| `No file provided` | File object is null | Try selecting file again |
| `File is empty` | File size is 0 bytes | Check file content |
| `File too large` | File > 100MB | Reduce file size |
| `Could not detect lat/lon` | Column names not recognized | Rename columns |
| `No valid data points` | All rows filtered out | Check data validity |
| `CSV parsing failed` | Invalid CSV format | Check file structure |
| `JSON parsing failed` | Invalid JSON syntax | Validate JSON |

---

## Testing Checklist

Use this checklist to verify upload functionality:

- [ ] Click "Upload Dataset" button - dialog opens
- [ ] Click "Download Sample" - CSV file downloads
- [ ] Click "Choose File" - file browser opens
- [ ] Select sample CSV - file browser closes
- [ ] Loading indicator appears with progress bar
- [ ] Success toast notification appears
- [ ] Heatmap displays on map
- [ ] Dataset info shows in header (name, point count)
- [ ] No errors in browser console

If all items pass, upload is working correctly!

---

## Advanced Debugging

### Enable Verbose Logging

The upload system now includes detailed logging. Every step is logged to console:

1. Open browser console (F12)
2. Upload a file
3. Review step-by-step output
4. Identify where process stops

### Check Network Tab

If file upload seems stuck:

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Upload file
4. Look for any failed requests
5. Check request/response details

### Test with Different Files

Try uploading:
1. ✅ Sample CSV (from Download Sample button)
2. ✅ Your own CSV with same format
3. ✅ JSON file with same data
4. ✅ Small file (< 1KB)
5. ✅ Large file (> 1MB)

This helps identify if issue is file-specific or system-wide.

---

## File Format Examples

### Minimal CSV (3 points)
```csv
lat,lon,value
0,0,10
10,10,20
-10,-10,15
```

### CSV with Multiple Fields
```csv
lat,lon,temperature,salinity,depth
23.5,88.2,29.1,35.2,100
-10.2,45.1,26.4,34.8,150
```
*System will use first non-coordinate column (temperature)*

### JSON Format
```json
[
  {"lat": 23.5, "lon": 88.2, "value": 29.1},
  {"lat": -10.2, "lon": 45.1, "value": 26.4},
  {"lat": 51.5, "lon": -0.1, "value": 15.3}
]
```

### JSON with Nested Structure
```json
{
  "data": [
    {"latitude": 23.5, "longitude": 88.2, "temp": 29.1},
    {"latitude": -10.2, "longitude": 45.1, "temp": 26.4}
  ]
}
```
*System will detect nested arrays*

---

## Performance Tips

### For Large Datasets

1. **Optimize Before Upload**
   - Remove unnecessary columns
   - Round values to 2-3 decimal places
   - Sample data if > 100,000 points

2. **Expected Performance**
   - < 1,000 points: Instant
   - 1,000 - 10,000 points: < 1 second
   - 10,000 - 100,000 points: 1-5 seconds
   - 100,000+ points: 5-30 seconds

3. **Browser Memory**
   - Large datasets use more RAM
   - Close other tabs if slow
   - Use desktop browser (not mobile)

---

## Still Having Issues?

### Collect Debug Information

1. **Browser Console Output**
   - Copy all messages from console
   - Include error stack traces

2. **File Information**
   - File name and extension
   - File size
   - First few rows of data

3. **Browser Information**
   - Browser name and version
   - Operating system
   - Any extensions installed

4. **Steps to Reproduce**
   - Exact steps you took
   - When error occurred
   - Any error messages shown

### Workarounds

If upload still doesn't work:

1. **Try Sample Data First**
   - Use "Download Sample" button
   - Upload the sample file
   - If this works, issue is with your data format

2. **Convert Your Data**
   - Open your data in Excel/Google Sheets
   - Ensure columns are: lat, lon, value
   - Save as CSV (UTF-8)
   - Try uploading again

3. **Use Different Browser**
   - Try Chrome, Firefox, or Edge
   - Test in Incognito/Private mode

4. **Check File Permissions**
   - Ensure file is not read-only
   - Copy file to desktop
   - Try uploading from there

---

## Success Indicators

You'll know upload worked when you see:

1. ✅ **Progress bar** reaches 100%
2. ✅ **Success toast** notification appears
3. ✅ **Heatmap** displays on map with colored regions
4. ✅ **Dataset name** appears in header
5. ✅ **Point count** shows in header
6. ✅ **Console shows** "SUCCESS - Data parsed successfully"

---

## Conclusion

The file upload system includes:
- ✅ Comprehensive error handling
- ✅ Step-by-step debug logging
- ✅ Sample data download
- ✅ Clear error messages
- ✅ File validation
- ✅ Progress indicators

If you follow this guide and still have issues, the debug console output will help identify the exact problem. The system logs every step, making it easy to pinpoint where the process fails.
