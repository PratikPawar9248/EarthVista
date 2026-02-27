# Simplified File Upload System

## What Changed

The file upload system has been completely simplified to make it more reliable and easier to use.

## Key Improvements

### 1. Simplified Code
- Removed excessive logging and debug code
- Streamlined validation logic
- Cleaner error messages
- More straightforward data processing

### 2. Better User Experience
- Clear upload interface
- Drag and drop support
- Progress indicator
- Sample CSV download button
- Simple error messages

### 3. Reliable Parsing
- CSV: Uses Papa Parse library
- JSON: Native JSON parsing
- NetCDF: Dedicated NetCDF parser
- Automatic column detection
- Smart data validation

## How to Use

### Quick Start
1. Open the application
2. Click "Sample CSV" to download test data
3. Click "Choose File" or drag the sample file
4. Watch the heatmap appear!

### Upload Your Own Data
1. Prepare a CSV file with columns: `lat`, `lon`, `value`
2. Upload the file
3. View your data on the map

## File Format Requirements

### CSV Format
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
```

### JSON Format
```json
[
  {"lat": 23.5, "lon": 88.2, "value": 29.1},
  {"lat": -10.2, "lon": 45.1, "value": 26.4}
]
```

## Technical Details

### File Size Limit
- Maximum: 1GB
- Recommended: Under 100MB for best performance

### Data Point Limit
- Maximum: 100,000 points displayed
- Larger datasets are automatically decimated

### Supported Formats
- CSV (`.csv`)
- JSON (`.json`)
- NetCDF (`.nc`)

## Error Messages

All error messages are now simple and clear:

- "File is too large. Maximum size is 1GB"
- "No data found in file"
- "Could not find lat/lon columns"
- "No valid data points found"

## Testing

A sample CSV file is included:
- `sample_data.csv` - 10 global data points
- Download via "Sample CSV" button
- Use for testing the upload system

## Code Structure

### Main Files
- `src/components/FileUpload.tsx` - Upload UI component
- `src/utils/dataParser.ts` - File parsing logic
- `src/utils/netcdfParser.ts` - NetCDF specific parser

### Key Functions
- `parseFile()` - Main entry point
- `parseCSV()` - CSV parsing
- `parseJSON()` - JSON parsing
- `parseNetCDF()` - NetCDF parsing

## No More Issues

The simplified system eliminates common problems:
- ✅ No complex validation chains
- ✅ No excessive logging
- ✅ No confusing error messages
- ✅ No unnecessary checks
- ✅ Straightforward data flow

## Support

If you encounter any issues:
1. Check the file format matches the examples
2. Verify file size is under 1GB
3. Ensure data contains valid lat/lon values
4. Try the sample CSV first

For more details, see `FILE_UPLOAD_GUIDE.md`
