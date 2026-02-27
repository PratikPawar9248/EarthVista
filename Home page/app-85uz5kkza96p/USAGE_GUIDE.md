# Usage Guide - Advanced Data Visualization

## Getting Started

### 1. Upload Your Dataset
1. Click the "Upload Dataset" button in the Dashboard
2. Select a CSV, JSON, or NetCDF file containing geospatial data
3. The system will automatically detect latitude, longitude, and value fields
4. Your data will be displayed as an interactive heatmap on the world map

### 2. Explore the Heatmap (Dashboard)
- **Adjust Controls**: Use the control panel to modify:
  - Radius: Size of heat points
  - Opacity: Transparency of the heatmap
  - Intensity: Color intensity
- **View Statistics**: Click "Statistics" to see data distribution
- **Measure**: Use measurement tools to calculate distances and areas
- **Export**: Download your visualization as PNG or GeoTIFF

### 3. Advanced Plots (NEW!)
Click the "Advanced Plots" button to access comprehensive data visualization:

#### 2D Visualizations
- **2D Scatter Plot**: View spatial distribution of your data points
  - X-axis: Longitude
  - Y-axis: Latitude
  - Color: Value intensity
  
- **2D Line Plot**: Analyze sequential data trends
  - Shows value progression across data points

#### 3D Visualizations
- **3D Scatter Plot**: Explore data in three dimensions
  - X: Longitude, Y: Latitude, Z: Value
  - Interactive rotation and zoom
  
- **3D Surface Plot**: Visualize gridded data as a surface
  - Best for regularly spaced data
  - Shows continuous value distribution

#### Heatmaps & Contours
- **Grid-based Heatmap**: Binned spatial data visualization
  - Data is averaged into grid cells
  - Shows spatial patterns clearly
  
- **Density Heatmap**: 2D density distribution
  - Shows concentration of data points
  
- **Contour Plot**: Iso-value contour lines
  - Similar to topographic maps
  - Shows value gradients

#### Statistical Analysis
- **Histogram**: Value distribution analysis
  - Shows frequency of different values
  - Helps identify data patterns
  
- **Box Plot**: Statistical summary
  - Shows median, quartiles, and outliers
  - Useful for understanding data spread
  
- **Violin Plot**: Distribution density
  - Combines box plot with density visualization
  - Shows full distribution shape

#### Oceanographic Plots
- **Depth Profile**: Vertical profile visualization
  - Shows how values change with depth
  - Useful for oceanographic data
  
- **T-S Diagram**: Temperature-Salinity relationships
  - Classic oceanographic visualization
  - Shows water mass characteristics

## Tips for Best Results

### Data Format
Your dataset should include:
- **Latitude**: Column named `lat`, `latitude`, or similar
- **Longitude**: Column named `lon`, `longitude`, or similar
- **Value**: Any numeric column (temperature, salinity, pressure, etc.)

### Performance
- For datasets with 50,000+ points, automatic optimization is applied
- You'll receive performance recommendations
- Large datasets may take a few seconds to render

### Plot Selection
- **Use 2D Scatter** for general spatial visualization
- **Use 3D Surface** for gridded/regular data
- **Use Histogram/Box Plot** for statistical analysis
- **Use Contour Plot** for smooth spatial gradients
- **Use Depth Profile** for vertical oceanographic data

### Interactive Features
All plots support:
- **Zoom**: Scroll or pinch to zoom
- **Pan**: Click and drag to move
- **Hover**: Hover over points for detailed information
- **Reset**: Double-click to reset view

## Example Workflows

### Workflow 1: Ocean Temperature Analysis
1. Upload ocean temperature dataset (CSV with lat, lon, temp)
2. View global distribution on Dashboard heatmap
3. Click "Advanced Plots"
4. Select "3D Surface Plot" to see temperature surface
5. Switch to "Histogram" to analyze temperature distribution
6. Use "Contour Plot" to identify temperature gradients

### Workflow 2: Climate Data Exploration
1. Upload climate dataset (NetCDF or CSV)
2. Adjust heatmap intensity on Dashboard
3. Use measurement tools to calculate affected areas
4. Navigate to "Advanced Plots"
5. Use "2D Scatter Plot" for spatial overview
6. Switch to "Box Plot" for statistical summary
7. Export visualizations for reports

### Workflow 3: Oceanographic Research
1. Upload CTD (Conductivity-Temperature-Depth) data
2. View spatial distribution on Dashboard
3. Go to "Advanced Plots"
4. Use "Depth Profile" to analyze vertical structure
5. Use "T-S Diagram" to identify water masses
6. Use "3D Scatter Plot" for comprehensive view

## Troubleshooting

### No Data Displayed
- Check that your file contains lat/lon columns
- Verify that values are numeric
- Ensure coordinates are in decimal degrees (-90 to 90 for lat, -180 to 180 for lon)

### Slow Performance
- Large datasets (100K+ points) are automatically optimized
- Consider using a subset of your data for initial exploration
- Close other browser tabs to free up memory

### Plot Not Rendering
- Ensure dataset is loaded (check Dashboard first)
- Try refreshing the page
- Check browser console for errors

## Keyboard Shortcuts

- **Dashboard**: Press `Esc` to close dialogs
- **Advanced Plots**: Use mouse wheel to zoom in plots
- **All Pages**: Use browser back/forward buttons to navigate

## Data Privacy

- All data processing happens in your browser
- No data is uploaded to external servers
- Your datasets remain on your local machine

## Support

For issues or questions:
1. Check the CHANGELOG.md for recent updates
2. Review this usage guide
3. Check browser console for error messages
4. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## Version Information

Current Version: 1.7.0
- Added Advanced Plots page with 12 visualization types
- Improved dataset sharing between pages
- Enhanced performance for large datasets

See CHANGELOG.md for complete version history.
