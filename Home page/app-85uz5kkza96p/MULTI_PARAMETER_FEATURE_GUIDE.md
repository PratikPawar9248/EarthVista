# Multi-Parameter Heatmap Switching Feature

## Overview

Your Geospatial Heatmap Visualization Platform includes a **dynamic parameter switching feature** that allows you to visualize different parameters from the same dataset without re-uploading the file.

## How It Works

When you upload a dataset containing multiple parameters (e.g., temperature, salinity, wind_speed, chlorophyll), the system:

1. **Automatically detects** all numeric fields in your dataset
2. **Displays a Parameter Selector** in the top-left corner of the map
3. **Allows instant switching** between parameters with a single click
4. **Updates the heatmap** in real-time to show the selected parameter

## Supported File Formats

- **CSV**: Multiple columns with lat, lon, and various parameters
- **JSON**: Array of objects with lat, lon, and parameter fields
- **NetCDF**: Multi-variable NetCDF files with latitude, longitude, and data variables

## Using the Feature

### Step 1: Upload a Multi-Parameter Dataset

Upload a file containing:
- Latitude column (lat/latitude)
- Longitude column (lon/longitude)
- **Multiple parameter columns** (temperature, salinity, wind_speed, etc.)

**Example CSV Structure:**
```csv
lat,lon,temperature,salinity,wind_speed,chlorophyll
23.5,88.2,29.1,35.2,12.5,0.8
-10.2,45.1,26.4,34.8,8.3,1.2
35.7,-120.4,18.5,33.5,15.7,0.5
```

### Step 2: Locate the Parameter Selector

After uploading, look for the **"Parameters"** panel in the **top-left corner** of the map (below the color legend).

### Step 3: Switch Between Parameters

Click on any parameter button to instantly update the heatmap:
- **Temperature** → Shows temperature distribution
- **Salinity** → Shows salinity distribution
- **Wind Speed** → Shows wind speed distribution
- **Chlorophyll** → Shows chlorophyll concentration

### Visual Feedback

- **Active parameter**: Highlighted with gradient color and "Active" badge
- **Loading state**: Toast notification shows "Switching to [parameter]..."
- **Success state**: Toast notification confirms "Now displaying: [parameter]"
- **Color legend**: Automatically updates to show the new parameter's value range

## Sample Dataset

A sample multi-parameter dataset is included at:
```
public/sample-multi-parameter.csv
```

This file contains 4 parameters:
1. **Temperature** (°C)
2. **Salinity** (PSU)
3. **Wind Speed** (m/s)
4. **Chlorophyll** (mg/m³)

## Technical Details

### How Field Switching Works

1. **File Caching**: When you upload a file, the system caches the raw data
2. **Field Detection**: All numeric columns (except lat/lon) are identified as parameters
3. **On-Demand Processing**: When you switch fields, the system:
   - Retrieves the cached raw data
   - Extracts the selected parameter's values
   - Recalculates statistics (min, max, mean, median)
   - Updates the heatmap visualization
   - Updates the color legend

### Performance

- **Instant switching**: No need to re-upload or re-parse the file
- **Efficient caching**: Raw data is stored in memory for fast access
- **Smooth transitions**: Heatmap updates seamlessly without page reload

## UI Components

### Compact Mode (Default)
- Small card in top-left corner
- Horizontal button layout
- Minimal space usage
- Perfect for map visualization

### Full Mode (Optional)
- Larger card with grid layout
- Detailed parameter information
- "Active" badges for selected parameter
- Better for datasets with many parameters

## Error Handling

If field switching fails:
- **Error message**: Toast notification explains the issue
- **Fallback**: Original parameter remains displayed
- **Re-upload option**: If cache is lost, re-upload the file

## Best Practices

### Dataset Preparation

1. **Use consistent column names**: temperature, salinity, wind_speed (use underscores)
2. **Include all parameters**: Don't split data across multiple files
3. **Ensure data quality**: Remove or handle missing values
4. **Use appropriate units**: Document units in your dataset

### Visualization Tips

1. **Compare parameters**: Switch between fields to identify correlations
2. **Check value ranges**: Each parameter has its own color scale
3. **Export reports**: Generate PDF reports for each parameter
4. **Use AI insights**: Get parameter-specific analysis from AI

## Example Workflows

### Oceanographic Analysis
1. Upload ocean dataset with temperature, salinity, chlorophyll
2. View temperature distribution → Identify warm/cold regions
3. Switch to salinity → Check salinity patterns
4. Switch to chlorophyll → Analyze biological activity
5. Compare patterns across parameters

### Climate Research
1. Upload climate dataset with temperature, precipitation, wind_speed
2. View temperature → Identify climate zones
3. Switch to precipitation → Analyze rainfall patterns
4. Switch to wind_speed → Study wind patterns
5. Generate comprehensive report with all parameters

### Environmental Monitoring
1. Upload environmental data with multiple pollutants
2. Switch between pollutant types
3. Identify hotspots for each parameter
4. Export visualizations for each parameter
5. Share findings with stakeholders

## Keyboard Shortcuts (Future Enhancement)

- `1-9`: Quick switch to parameter 1-9
- `Tab`: Cycle through parameters
- `Shift+Tab`: Cycle backwards

## API Integration

### Programmatic Field Switching

```typescript
import { switchDatasetField } from '@/utils/fieldSwitcher';

// Switch to a different field
const updatedDataset = await switchDatasetField(currentDataset, 'salinity');
```

## Troubleshooting

### Parameter Selector Not Showing

**Cause**: Dataset has only one parameter  
**Solution**: Upload a dataset with multiple numeric columns

### "Original file data not found" Error

**Cause**: File cache was cleared  
**Solution**: Re-upload your dataset

### Wrong Parameter Values

**Cause**: Column name mismatch  
**Solution**: Ensure parameter columns have clear, unique names

## Future Enhancements

- [ ] Side-by-side parameter comparison
- [ ] Parameter correlation analysis
- [ ] Custom parameter formulas (e.g., temperature - salinity)
- [ ] Parameter animation over time
- [ ] Export all parameters as separate images

## Support

For issues or questions about the multi-parameter feature:
1. Check this documentation
2. Review the sample dataset
3. Verify your file format matches the examples
4. Check browser console for detailed error messages

---

**Feature Status**: ✅ Fully Implemented and Tested  
**Last Updated**: 2025-12-11  
**Version**: 1.0.0
