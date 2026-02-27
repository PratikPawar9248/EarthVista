# Debug Upload Issues - Step by Step Guide

## How to Debug Upload Errors

### Step 1: Open Browser Console
1. Press **F12** (or right-click → Inspect)
2. Click on the **Console** tab
3. Clear the console (click the 🚫 icon)

### Step 2: Try Uploading Your File
1. Click "Choose File" or drag and drop your file
2. Watch the console for messages

### Step 3: Check Console Output

You should see messages like:
```
Starting file parse: yourfile.csv Size: 1234 bytes
File type detected: csv
CSV parse complete. Rows: 10
CSV headers: ['lat', 'lon', 'value']
Detected columns - lat: lat lon: lon
Value column: value
Valid points extracted: 10
Final points after decimation: 10
CSV parsing successful!
```

## Common Error Patterns

### Error Pattern 1: No Console Output
**Symptom**: Nothing appears in console when you upload
**Cause**: JavaScript error before parsing starts
**Solution**: 
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Try again
3. Check for browser errors in console

### Error Pattern 2: "Missing required columns"
**Console shows**:
```
CSV headers: ['latitude', 'longitude', 'temp']
Detected columns - lat: undefined lon: undefined
```
**Cause**: Column names don't match expected patterns
**Solution**: Rename columns to `lat`, `lon`, `value`

### Error Pattern 3: "No valid data points found"
**Console shows**:
```
Valid points extracted: 0
```
**Cause**: All data points failed validation
**Possible reasons**:
- Coordinates out of range (lat must be -90 to 90, lon must be -180 to 180)
- Values are NaN or Infinity
- Data is in wrong format

**Solution**: Check your data:
```csv
# ✅ CORRECT
lat,lon,value
23.5,88.2,29.1

# ❌ WRONG - lat out of range
lat,lon,value
123.5,88.2,29.1

# ❌ WRONG - non-numeric values
lat,lon,value
abc,def,ghi
```

### Error Pattern 4: File Upload Doesn't Start
**Symptom**: Click button but nothing happens
**Solution**:
1. Check file size (must be < 1GB)
2. Check file extension (.csv, .json, or .nc)
3. Try a different file
4. Check browser console for errors

## Test Files

### Test 1: Simple CSV (Should Work)
Create a file named `test.csv`:
```csv
lat,lon,value
0,0,25
45,90,30
-45,-90,20
```

### Test 2: JSON Format (Should Work)
Create a file named `test.json`:
```json
[
  {"lat": 0, "lon": 0, "value": 25},
  {"lat": 45, "lon": 90, "value": 30},
  {"lat": -45, "lon": -90, "value": 20}
]
```

### Test 3: Invalid Coordinates (Should Fail)
Create a file named `test_invalid.csv`:
```csv
lat,lon,value
999,999,25
```
**Expected**: Error message about invalid coordinates

## Detailed Debugging Steps

### For CSV Files

1. **Check file opens in text editor**
   - Open file in Notepad/TextEdit
   - Verify it has content
   - Check for proper CSV format

2. **Verify column names**
   - First line should have: `lat,lon,value`
   - Or variations: `latitude,longitude,temperature`
   - Case doesn't matter: `LAT,LON,VALUE` works too

3. **Check data format**
   - Numbers should be plain numbers: `23.5` not `"23.5"`
   - No special characters in numbers
   - Use dot for decimals: `23.5` not `23,5`

4. **Verify coordinates**
   - Latitude: -90 to 90
   - Longitude: -180 to 180
   - Example valid coordinates:
     - New York: 40.7, -74.0
     - Tokyo: 35.7, 139.7
     - Sydney: -33.9, 151.2

### For JSON Files

1. **Validate JSON syntax**
   - Use jsonlint.com to check
   - Must be valid JSON format
   - Check for missing commas, brackets

2. **Check structure**
   - Should be array of objects: `[{...}, {...}]`
   - Or object with data property: `{"data": [{...}]}`

3. **Verify field names**
   - Each object needs: `lat`, `lon`, `value`
   - Or variations: `latitude`, `longitude`, etc.

### For NetCDF Files

1. **Check file is valid NetCDF**
   - Use `ncdump -h yourfile.nc` if available
   - Or open in Panoply/other NetCDF viewer

2. **Verify variables**
   - Must have `lat` or `latitude` variable
   - Must have `lon` or `longitude` variable
   - Must have at least one 2D data variable

## Console Commands for Testing

Open browser console and run:

```javascript
// Test if file input works
document.querySelector('input[type="file"]')

// Should show the file input element
```

## Still Having Issues?

### Checklist
- [ ] Browser console is open (F12)
- [ ] Console shows messages when uploading
- [ ] File is correct format (.csv, .json, or .nc)
- [ ] File is not empty
- [ ] File size < 1GB
- [ ] Column names are correct (lat, lon, value)
- [ ] Coordinates are in valid ranges
- [ ] No JavaScript errors in console

### What to Share When Asking for Help

1. **Console output** (copy all messages)
2. **First few lines of your file**:
   ```
   lat,lon,value
   23.5,88.2,29.1
   -10.2,45.1,26.4
   ```
3. **File size and format**
4. **Exact error message**

## Quick Fixes

### Fix 1: Column Names
```csv
# Before
latitude,longitude,temperature
23.5,88.2,29.1

# After
lat,lon,value
23.5,88.2,29.1
```

### Fix 2: Coordinate Ranges
```csv
# Before (invalid)
lat,lon,value
123.5,200.0,29.1

# After (valid)
lat,lon,value
23.5,88.2,29.1
```

### Fix 3: Number Format
```csv
# Before (invalid)
lat,lon,value
"23.5","88.2","29.1"

# After (valid)
lat,lon,value
23.5,88.2,29.1
```

## Expected Console Output for Successful Upload

```
Starting file parse: test.csv Size: 156 bytes
File type detected: csv
CSV parse complete. Rows: 6
CSV headers: ['lat', 'lon', 'value']
Detected columns - lat: lat lon: lon
Value column: value
Valid points extracted: 6
Final points after decimation: 6
CSV parsing successful!
```

## Error Messages Explained

| Error Message | Meaning | Fix |
|---------------|---------|-----|
| "File is empty" | File has no content | Check file was saved correctly |
| "Missing required columns" | Can't find lat/lon columns | Rename columns to lat, lon, value |
| "No valid data points found" | All data failed validation | Check coordinate ranges |
| "Invalid JSON format" | JSON syntax error | Validate JSON at jsonlint.com |
| "File too large" | File > 1GB | Reduce file size or sample data |
| "Unsupported file format" | Wrong file extension | Use .csv, .json, or .nc |

---

**With console logging enabled, you can now see exactly what's happening during upload!**

Press F12 and watch the console to debug any issues.
