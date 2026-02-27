# Troubleshooting Guide

## Common Issues and Solutions

### 1. Map Not Responding to Interactions

**Symptoms**:
- Cannot zoom in/out with mouse wheel
- Cannot pan by clicking and dragging
- Zoom controls (+/-) don't work

**Solutions**:

#### Check Browser Console
1. Open DevTools (F12)
2. Look for JavaScript errors
3. Verify you see: `Map initialized successfully`

#### Verify Leaflet CSS is Loaded
1. Open DevTools → Network tab
2. Refresh page
3. Look for `leaflet.css` - should return 200 status
4. If missing, check `src/index.css` has: `@import 'leaflet/dist/leaflet.css';`

#### Check Z-Index Conflicts
1. Open DevTools → Elements tab
2. Inspect the map container
3. Verify it has `z-index: 0` or no z-index
4. Verify control panels have higher z-index (1000+)

#### Clear Browser Cache
```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Heatmap Not Displaying After Upload

**Symptoms**:
- File uploads successfully
- No heatmap appears on map
- Console shows data loaded

**Solutions**:

#### Check Console Logs
Look for these messages in order:
```
Dataset loaded: {...}
Number of points: [number]
Normalized data: {...}
Rendering heatmap with [number] points
Heatmap layer added to map
```

If any are missing, note which step failed.

#### Verify Data Format

**CSV Format**:
```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
```

**JSON Format**:
```json
[
  {"lat": 23.5, "lon": 88.2, "value": 29.1},
  {"lat": -10.2, "lon": 45.1, "value": 26.4}
]
```

**Common Issues**:
- Column names must be exactly: `lat`, `lon`, `value` (or `latitude`, `longitude`)
- Values must be numbers, not strings
- Latitude range: -90 to 90
- Longitude range: -180 to 180

#### Check Data Normalization
1. Open console
2. Look for "Normalized data" log
3. Verify `normalizedCount` matches `originalCount`
4. Check sample values are between 0 and 1

#### Adjust Heatmap Parameters
If heatmap is too faint:
1. Increase **Intensity** slider to 2.0 or higher
2. Increase **Opacity** slider to 1.0
3. Increase **Radius** slider to 30-40

### 3. File Upload Fails

**Symptoms**:
- Error message after selecting file
- "Failed to parse file" toast notification

**Solutions**:

#### Check File Size
- Maximum recommended: 50MB
- For larger files, consider sampling the data

#### Verify File Format

**CSV**:
- Must have header row
- Comma-separated (not semicolon or tab)
- UTF-8 encoding

**JSON**:
- Valid JSON syntax
- Array of objects
- Each object has lat, lon, value fields

**NetCDF**:
- Must have lat/lon dimensions
- Must have at least one data variable
- File extension: `.nc`

#### Check File Encoding
```bash
# Convert to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

### 4. Performance Issues

**Symptoms**:
- Slow rendering
- Browser freezes
- Laggy interactions

**Solutions**:

#### Reduce Data Points
```javascript
// Sample every Nth point
const sampledData = data.filter((_, index) => index % 10 === 0);
```

#### Adjust Heatmap Parameters
- Reduce **Radius** to 15-20
- Reduce **Blur** to 10
- Lower **Intensity** to 0.5-1.0

#### Close Other Browser Tabs
- Leaflet.js is memory-intensive
- Close unnecessary tabs to free up RAM

### 5. Colors Not Showing Correctly

**Symptoms**:
- All one color
- Wrong gradient
- Too faint or too bright

**Solutions**:

#### Check Value Range
1. Open console
2. Look for "Value range" log
3. Verify min and max are different
4. If min === max, all points will be same color

#### Adjust Intensity
- Low values (< 10): Increase intensity to 2.0+
- High values (> 100): Decrease intensity to 0.5

#### Verify Gradient Configuration
Check `src/pages/Dashboard.tsx`:
```typescript
gradient: {
  0.0: 'rgb(0, 0, 255)',    // Blue
  0.2: 'rgb(0, 255, 255)',  // Cyan
  0.4: 'rgb(0, 255, 0)',    // Green
  0.6: 'rgb(255, 255, 0)',  // Yellow
  0.8: 'rgb(255, 165, 0)',  // Orange
  1.0: 'rgb(255, 0, 0)'     // Red
}
```

### 6. Map Tiles Not Loading

**Symptoms**:
- Gray background instead of satellite imagery
- Missing street labels
- Network errors in console

**Solutions**:

#### Check Internet Connection
- Tiles are loaded from external servers
- Requires active internet connection

#### Verify Tile URLs
Check `src/components/HeatmapViewer.tsx`:
```typescript
// Satellite imagery
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

// Labels
'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
```

#### Check for CORS Issues
- Open DevTools → Console
- Look for CORS errors
- If present, tile servers may be blocking requests

#### Try Alternative Tile Servers
```typescript
// OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
})
```

## Debug Mode

### Enable Verbose Logging

Add to `src/components/HeatmapViewer.tsx`:
```typescript
useEffect(() => {
  console.log('=== HeatmapViewer Debug ===');
  console.log('Map ref:', mapRef.current);
  console.log('Data length:', data.length);
  console.log('Config:', config);
  console.log('Heat layer ref:', heatLayerRef.current);
}, [data, config]);
```

### Check Leaflet Version
```bash
npm list leaflet
npm list leaflet.heat
```

Expected versions:
- leaflet: ^1.9.4
- leaflet.heat: ^0.2.0

## Getting Help

### Information to Provide

When reporting issues, include:

1. **Browser & Version**: Chrome 120, Firefox 121, etc.
2. **Console Logs**: Copy all relevant console output
3. **Data Sample**: First 5-10 rows of your dataset
4. **Steps to Reproduce**: Exact steps that cause the issue
5. **Screenshots**: Visual evidence of the problem

### Useful Console Commands

```javascript
// Check if map is initialized
console.log(window.L);

// Check Leaflet version
console.log(L.version);

// Inspect map object (in browser console after map loads)
// Note: This requires accessing the component's internal state
```

## Performance Optimization

### For Large Datasets (> 10,000 points)

1. **Sample the data**:
```javascript
const sampleRate = 0.1; // 10% of data
const sampled = data.filter(() => Math.random() < sampleRate);
```

2. **Use clustering** (future enhancement):
- Group nearby points
- Show aggregate values

3. **Implement pagination**:
- Load data in chunks
- Render visible area only

### Browser Recommendations

**Best Performance**:
- Chrome/Edge (Chromium)
- 8GB+ RAM
- Hardware acceleration enabled

**Settings to Check**:
1. Chrome → Settings → System
2. Enable "Use hardware acceleration when available"

## Known Limitations

1. **Maximum Points**: ~50,000 for smooth performance
2. **File Size**: ~50MB recommended maximum
3. **NetCDF Support**: Limited to simple gridded data
4. **Browser Support**: Modern browsers only (no IE11)
5. **Mobile Performance**: May be slow on older devices

---

**Last Updated**: December 11, 2025  
**Version**: 1.0.2
