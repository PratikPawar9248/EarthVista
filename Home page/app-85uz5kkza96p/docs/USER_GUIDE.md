# Geospatial Heatmap Visualization Platform - User Guide

## Overview

The Geospatial Heatmap Visualization Platform is a powerful web application that enables scientists, researchers, and data analysts to visualize geospatial datasets as interactive global heatmaps. The platform supports multiple data formats and provides real-time visualization controls.

## Features

### 🌍 Interactive Global Map
- Full-screen interactive world map with zoom and pan controls
- Dark theme optimized for scientific visualization
- Smooth heatmap rendering with color gradients
- Real-time updates as you adjust parameters

### 📊 Multiple Data Format Support
- **CSV Files**: Comma-separated values with automatic column detection
- **JSON Files**: Array of objects with latitude/longitude fields
- **NetCDF Files**: Scientific data format commonly used in climate and oceanography research

### 🎨 Customizable Visualization
- **Radius Control**: Adjust the size of heat points (5-50 pixels)
- **Opacity Control**: Fine-tune transparency (10-100%)
- **Intensity Control**: Amplify or reduce heat intensity (0.5x-3.0x)
- **Color Legend**: Dynamic color scale showing value ranges

### 🚀 Quick Start with Sample Data
- Pre-loaded global temperature dataset (CSV)
- Pre-loaded ocean salinity dataset (JSON)
- One-click loading for immediate visualization

## Getting Started

### 1. Upload Your Dataset

Click the **"Upload Dataset"** button in the header or drag and drop a file onto the upload area.

**Supported File Formats:**
- `.csv` - Comma-separated values
- `.json` - JSON array format
- `.nc` or `.netcdf` - NetCDF scientific format

### 2. Data Format Requirements

Your dataset must contain:
- **Latitude field**: Named `lat`, `latitude`, `y`, or `lat_deg`
- **Longitude field**: Named `lon`, `long`, `longitude`, `x`, or `lon_deg`
- **Value field**: Any numeric field (temperature, salinity, pressure, etc.)

**Example CSV Format:**
```csv
lat,lon,temperature
23.5,88.2,29.1
-10.2,45.1,26.4
35.7,-120.3,18.5
```

**Example JSON Format:**
```json
[
  {"latitude": 23.5, "longitude": 88.2, "temperature": 29.1},
  {"latitude": -10.2, "longitude": 45.1, "temperature": 26.4},
  {"latitude": 35.7, "longitude": -120.3, "temperature": 18.5}
]
```

### 3. Adjust Visualization Parameters

Once your data is loaded, use the **Control Panel** on the right side to adjust:

- **Radius**: Controls the size of each heat point
  - Smaller values (5-15): Precise, detailed visualization
  - Larger values (30-50): Smooth, blended heatmap

- **Opacity**: Controls transparency of the heatmap layer
  - Lower values (10-40%): See underlying map features
  - Higher values (70-100%): Emphasize data patterns

- **Intensity**: Amplifies or reduces the heat effect
  - Lower values (0.5-1.0): Subtle, natural appearance
  - Higher values (1.5-3.0): Dramatic, high-contrast visualization

### 4. Interpret the Color Legend

The color legend at the bottom shows the value range of your dataset:

- **Blue**: Lowest values (coldest/minimum)
- **Cyan**: Low-medium values
- **Green**: Medium values
- **Yellow**: Medium-high values
- **Orange**: High values
- **Red**: Highest values (hottest/maximum)

## Use Cases

### Climate Research
Visualize global temperature anomalies, precipitation patterns, or climate model outputs.

### Oceanography
Display sea surface temperature, salinity distributions, or ocean current data.

### Environmental Monitoring
Map air quality indices, pollution levels, or environmental sensor networks.

### Earth Observation
Analyze satellite data, vegetation indices, or land surface characteristics.

## Tips for Best Results

1. **Data Density**: For best visualization, aim for 100-10,000 data points
   - Too few points: Sparse, disconnected visualization
   - Too many points: May slow down rendering

2. **Value Range**: Ensure your data has meaningful variation
   - The platform auto-normalizes values for optimal color mapping

3. **Coordinate Validation**: Verify coordinates are in decimal degrees
   - Latitude: -90 to 90
   - Longitude: -180 to 180

4. **File Size**: Keep files under 10MB for optimal performance
   - For larger datasets, consider sampling or aggregation

## Troubleshooting

### "Could not detect latitude/longitude columns"
- Ensure your column names match expected patterns
- Rename columns to: `lat`, `lon`, `latitude`, or `longitude`

### "No valid data points found"
- Check that coordinates are in decimal degrees format
- Verify values are numeric (not text)
- Ensure coordinates are within valid ranges

### Heatmap appears too faint
- Increase the **Intensity** slider
- Increase the **Opacity** slider
- Reduce the **Radius** for more concentrated heat points

### Heatmap appears too blurry
- Decrease the **Radius** slider
- Reduce the **Intensity** slider for more subtle gradients

## Keyboard Shortcuts

- **Zoom In**: `+` or scroll up
- **Zoom Out**: `-` or scroll down
- **Pan**: Click and drag on the map

## Browser Compatibility

The platform works best on modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Privacy & Data Security

- All data processing happens in your browser
- No data is uploaded to external servers
- Your datasets remain completely private
- No account or login required

## Sample Datasets

### Global Temperature Sample
- 200+ data points covering global temperature distribution
- Demonstrates typical climate data visualization
- Values range from 1.5°C to 38.8°C

### Ocean Salinity Sample
- 80+ data points showing ocean salinity patterns
- Demonstrates oceanographic data visualization
- Values range from 34.2 to 38.6 PSU (Practical Salinity Units)

## Support

For technical issues or questions, please refer to the project documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2025
