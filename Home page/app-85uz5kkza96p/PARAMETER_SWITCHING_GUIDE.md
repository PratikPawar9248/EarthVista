# Dynamic Parameter Switching Feature

## Overview

The Geospatial Heatmap Visualization Platform now supports **dynamic parameter switching**, allowing you to visualize different variables from your dataset without re-uploading the file.

## How It Works

When you upload a dataset (CSV, JSON, or NetCDF) containing multiple data fields, the application:

1. **Automatically detects** all available numeric fields (excluding latitude/longitude)
2. **Displays a Parameter Selector** panel on the map interface
3. **Allows instant switching** between different parameters with a single click

## Supported File Formats

### CSV Files
Your CSV file should have:
- Latitude column: `lat`, `latitude`, or `y`
- Longitude column: `lon`, `longitude`, or `x`
- Multiple value columns: `temperature`, `salinity`, `wind_speed`, `chlorophyll`, etc.

**Example:**
```csv
lat,lon,temperature,salinity,wind_speed,chlorophyll
23.5,88.2,29.1,35.2,12.5,0.8
-10.2,45.1,26.4,34.8,8.3,1.2
35.7,-120.4,18.5,33.5,15.7,0.5
```

### JSON Files
Your JSON file should contain an array of objects with:
- Latitude field: `lat` or `latitude`
- Longitude field: `lon` or `longitude`
- Multiple value fields

**Example:**
```json
[
  {
    "lat": 23.5,
    "lon": 88.2,
    "temperature": 29.1,
    "salinity": 35.2,
    "wind_speed": 12.5
  }
]
```

### NetCDF Files
NetCDF files with multiple variables are fully supported. The system will:
- Detect all available variables
- Allow switching between them dynamically
- Maintain proper coordinate mapping

## Using the Feature

### Step 1: Upload Your Dataset
1. Click the **"Upload Dataset"** button in the header
2. Select a file containing multiple parameters
3. Wait for the file to be processed

### Step 2: View Available Parameters
Once uploaded, if your dataset contains multiple fields, you'll see a **"Parameters"** panel in the top-left corner of the map, below the color legend.

### Step 3: Switch Parameters
1. Click on any parameter button in the Parameters panel
2. The heatmap will instantly update to show the selected parameter
3. The color legend will automatically adjust to the new value range
4. A toast notification will confirm the switch

## Example Use Cases

### Oceanographic Data
Switch between:
- **Temperature** - Sea surface temperature
- **Salinity** - Water salinity levels
- **Chlorophyll** - Chlorophyll concentration
- **Wind Speed** - Surface wind measurements

### Climate Data
Switch between:
- **Temperature** - Air temperature
- **Precipitation** - Rainfall amounts
- **Humidity** - Relative humidity
- **Pressure** - Atmospheric pressure

### Environmental Monitoring
Switch between:
- **PM2.5** - Particulate matter
- **NO2** - Nitrogen dioxide levels
- **O3** - Ozone concentration
- **CO** - Carbon monoxide levels

## Technical Details

### Data Caching
- The original file data is cached in memory when first uploaded
- Switching parameters re-processes the cached data instantly
- No need to re-upload or re-parse the entire file

### Performance
- Parameter switching is optimized for speed
- Large datasets are automatically decimated for smooth visualization
- Value ranges are recalculated for each parameter

### Value Range Normalization
- Each parameter has its own min/max range
- The heatmap automatically normalizes values to 0-1 scale
- Color gradients adapt to the specific parameter's range

## Sample Dataset

A sample multi-parameter dataset is included at:
```
/public/sample-multi-parameter.csv
```

This file contains:
- 20 global data points
- 4 parameters: temperature, salinity, wind_speed, chlorophyll
- Ready to test the parameter switching feature

## Troubleshooting

### Parameter Selector Not Showing
- **Cause**: Your dataset only has one value field
- **Solution**: Ensure your file contains multiple numeric columns beyond lat/lon

### "Field not found" Error
- **Cause**: The selected field doesn't exist in the cached data
- **Solution**: Re-upload the file to refresh the cache

### Slow Switching
- **Cause**: Very large datasets (>100,000 points)
- **Solution**: The system automatically optimizes large datasets, but initial processing may take a moment

## API Reference

### Component: ParameterSelector

**Props:**
- `fields: string[]` - Array of available field names
- `selectedField: string` - Currently selected field
- `onFieldChange: (field: string) => void` - Callback when field changes
- `compact?: boolean` - Use compact layout (default: false)

**Usage:**
```tsx
<ParameterSelector
  fields={['temperature', 'salinity', 'wind_speed']}
  selectedField="temperature"
  onFieldChange={handleFieldChange}
  compact
/>
```

### Utility: switchDatasetField

**Function:**
```typescript
async function switchDatasetField(
  dataset: Dataset,
  newField: string
): Promise<Dataset>
```

**Parameters:**
- `dataset` - Current dataset object
- `newField` - Name of the field to switch to

**Returns:**
- Updated dataset with new field values

**Example:**
```typescript
const updatedDataset = await switchDatasetField(currentDataset, 'salinity');
setDataset(updatedDataset);
```

## Future Enhancements

Planned improvements:
- [ ] Multi-parameter overlay (display multiple parameters simultaneously)
- [ ] Parameter comparison mode (side-by-side view)
- [ ] Custom parameter calculations (e.g., temperature - salinity)
- [ ] Parameter animation (cycle through parameters automatically)
- [ ] Export parameter-specific reports

## Support

For issues or questions about the parameter switching feature:
1. Check that your file format matches the examples above
2. Verify all numeric fields are properly formatted
3. Ensure latitude/longitude columns are correctly named
4. Review the browser console for detailed error messages
