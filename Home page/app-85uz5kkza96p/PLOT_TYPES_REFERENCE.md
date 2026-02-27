# Plot Types Reference Guide

## Quick Reference Table

| Plot Type | Category | Best For | Dimensions | Interactive |
|-----------|----------|----------|------------|-------------|
| 2D Scatter | 2D | Spatial distribution | 2D + Color | ✅ |
| 2D Line | 2D | Sequential trends | 2D | ✅ |
| 3D Scatter | 3D | Spatial-value relationships | 3D + Color | ✅ |
| 3D Surface | 3D | Gridded data | 3D | ✅ |
| Heatmap Grid | Heatmap | Spatial patterns | 2D | ✅ |
| Contour | Heatmap | Gradients & boundaries | 2D | ✅ |
| Density Heatmap | Heatmap | Data clustering | 2D | ✅ |
| Histogram | Statistical | Value distribution | 1D | ✅ |
| Box Plot | Statistical | Statistical summary | 1D | ✅ |
| Violin Plot | Statistical | Distribution density | 1D | ✅ |
| Depth Profile | Oceanographic | Vertical profiles | 2D | ✅ |
| T-S Diagram | Oceanographic | Water mass analysis | 2D + Color | ✅ |

## Detailed Descriptions

### 2D Plots

#### 2D Scatter Plot
```
Purpose: Visualize spatial distribution of data points
X-Axis: Longitude (°)
Y-Axis: Latitude (°)
Color: Value intensity
Features:
  - Hover tooltips with exact values
  - Zoom and pan
  - Color scale legend
Use Cases:
  - General spatial data exploration
  - Identifying geographic patterns
  - Spotting outliers
```

#### 2D Line Plot
```
Purpose: Show sequential data trends
X-Axis: Data point index
Y-Axis: Value
Features:
  - Line + markers visualization
  - Trend identification
Use Cases:
  - Time-series data
  - Sequential measurements
  - Trend analysis
```

### 3D Plots

#### 3D Scatter Plot
```
Purpose: Three-dimensional data exploration
X-Axis: Longitude (°)
Y-Axis: Latitude (°)
Z-Axis: Value
Color: Value intensity
Features:
  - Interactive 3D rotation
  - Zoom and pan in 3D space
  - Multiple viewing angles
Use Cases:
  - Comprehensive spatial-value relationships
  - Multi-dimensional analysis
  - Presentation-quality visualizations
```

#### 3D Surface Plot
```
Purpose: Visualize gridded data as continuous surface
X-Axis: Longitude (°)
Y-Axis: Latitude (°)
Z-Axis: Value
Features:
  - Smooth surface interpolation
  - 3D rotation and zoom
  - Color-coded elevation
Use Cases:
  - Regularly spaced grid data
  - Terrain-like visualizations
  - Continuous field data
Requirements:
  - Works best with gridded data
  - Automatically interpolates irregular data
```

### Heatmaps & Contours

#### Heatmap Grid
```
Purpose: Binned spatial data visualization
Method: Data averaged into grid cells (50x50 bins)
Features:
  - Clear spatial patterns
  - Reduced noise
  - Color-coded intensity
Use Cases:
  - Identifying hotspots
  - Spatial pattern recognition
  - Aggregated data views
```

#### Contour Plot
```
Purpose: Show iso-value contour lines
Features:
  - Labeled contour lines
  - Smooth gradients
  - Multiple contour levels
Use Cases:
  - Visualizing gradients
  - Identifying boundaries
  - Topographic-style maps
```

#### Density Heatmap
```
Purpose: 2D density distribution
Method: Histogram2D of lat/lon coordinates
Features:
  - Shows data concentration
  - Identifies clustering
Use Cases:
  - Finding data clusters
  - Identifying sampling density
  - Coverage analysis
```

### Statistical Plots

#### Histogram
```
Purpose: Value distribution analysis
X-Axis: Value bins
Y-Axis: Frequency
Features:
  - 50 bins by default
  - Shows distribution shape
Use Cases:
  - Understanding data distribution
  - Identifying modes
  - Detecting skewness
```

#### Box Plot
```
Purpose: Statistical summary
Shows:
  - Median (center line)
  - Q1 and Q3 (box edges)
  - Min and Max (whiskers)
  - Outliers (individual points)
  - Mean and standard deviation
Use Cases:
  - Quick statistical overview
  - Outlier detection
  - Comparing distributions
```

#### Violin Plot
```
Purpose: Distribution density visualization
Combines:
  - Box plot (statistical summary)
  - Density curve (distribution shape)
Features:
  - Shows full distribution
  - Identifies multi-modal distributions
Use Cases:
  - Detailed distribution analysis
  - Comparing complex distributions
  - Publication-quality statistics
```

### Oceanographic Plots

#### Depth Profile
```
Purpose: Vertical profile visualization
X-Axis: Value (e.g., Temperature, Salinity)
Y-Axis: Depth Index (reversed, increasing downward)
Features:
  - Reversed Y-axis (depth convention)
  - Line + markers
Use Cases:
  - CTD data visualization
  - Vertical structure analysis
  - Depth-dependent measurements
Note:
  - Assumes value represents depth-related measurement
  - Y-axis is data point index, not actual depth
```

#### T-S Diagram
```
Purpose: Temperature-Salinity relationships
X-Axis: Salinity (PSU)
Y-Axis: Temperature (°C)
Color: Depth or other value
Features:
  - Classic oceanographic plot
  - Water mass identification
Use Cases:
  - Water mass analysis
  - Oceanographic research
  - Identifying mixing processes
Note:
  - Demonstration uses lon as Salinity, lat as Temperature
  - Adapt based on your actual data fields
```

## Data Requirements

### Minimum Requirements
All plots require:
- At least 2 data points
- Valid latitude values (-90 to 90)
- Valid longitude values (-180 to 180)
- Numeric value field

### Optimal Data Sizes
- **2D Plots**: 100 - 100,000 points
- **3D Plots**: 100 - 50,000 points
- **Heatmaps**: 1,000 - 1,000,000 points
- **Statistical**: Any size
- **Oceanographic**: 10 - 10,000 points

### Special Considerations

#### 3D Surface Plot
- Works best with gridded data
- Irregular data is automatically interpolated
- May show artifacts with very sparse data

#### Heatmap Grid
- Automatically bins data into 50x50 grid
- Averages values in each bin
- Good for noisy data

#### Depth Profile
- Sorts data by value before plotting
- Y-axis is index, not actual depth
- Adapt for your specific depth field

## Interactive Controls

### All Plots Support
- **Zoom**: Mouse wheel or pinch
- **Pan**: Click and drag
- **Hover**: Tooltips with values
- **Reset**: Double-click
- **Export**: Camera icon (PNG, SVG)

### 3D Plots Additional Controls
- **Rotate**: Click and drag
- **Tilt**: Shift + drag
- **Reset View**: Home icon

## Color Scales

All plots use the "Jet" color scale by default:
- Blue: Low values
- Green: Medium-low values
- Yellow: Medium-high values
- Orange: High values
- Red: Highest values

## Performance Tips

### For Large Datasets
1. Start with statistical plots (fast)
2. Try 2D scatter (medium speed)
3. Use heatmap grid for aggregation
4. 3D plots may be slower with 50K+ points

### For Best Visualization
1. Choose plot type based on data structure
2. Use 3D for presentation
3. Use statistical for analysis
4. Use heatmaps for patterns

## Common Use Cases

### Oceanography
1. Upload CTD data
2. Use Depth Profile for vertical structure
3. Use T-S Diagram for water masses
4. Use 3D Scatter for spatial distribution

### Climate Science
1. Upload temperature/precipitation data
2. Use Heatmap Grid for spatial patterns
3. Use Histogram for distribution
4. Use Contour for gradients

### Environmental Monitoring
1. Upload sensor data
2. Use 2D Scatter for coverage
3. Use Box Plot for statistics
4. Use Density Heatmap for hotspots

### General Research
1. Upload any geospatial data
2. Start with 2D Scatter for overview
3. Use Statistical plots for analysis
4. Use 3D for comprehensive view

## Troubleshooting

### Plot Not Showing
- Ensure dataset is loaded
- Check data has valid lat/lon
- Verify values are numeric

### Slow Rendering
- Large datasets take longer
- Try statistical plots first
- Consider data sampling

### Unexpected Results
- Check data format
- Verify coordinate system
- Review value ranges

## Export Options

All plots can be exported as:
- PNG (raster image)
- SVG (vector graphics)
- Interactive HTML (via Plotly)

Export button in plot toolbar (camera icon).

## Keyboard Shortcuts

- **Esc**: Close dialogs
- **Double-click**: Reset plot view
- **Shift + Drag**: Tilt 3D plots

## Browser Compatibility

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- WebGL for 3D plots
- Modern JavaScript support
- Canvas API

## Additional Resources

- Plotly.js Documentation: https://plotly.com/javascript/
- Oceanographic Plots: https://plotly.com/python/oceanography/
- Statistical Plots: https://plotly.com/python/statistical-charts/

## Version History

- v1.7.0: Initial release with 12 plot types
- Future: Additional plot types planned

## Feedback

For feature requests or bug reports:
1. Check USAGE_GUIDE.md
2. Review CHANGELOG.md
3. Check browser console
4. Document steps to reproduce
