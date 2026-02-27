# Heatmap Control Panel Guide

## Overview
The Control Panel provides three sliders to adjust the visual appearance of the heatmap in real-time:
- **Radius**: Controls the size of heat points
- **Opacity**: Controls the transparency of the heatmap
- **Intensity**: Controls the strength of heat values

## How to Access
1. Click the **"Controls"** button in the top-right corner of the Dashboard
2. A dropdown panel will appear with three sliders

## Control Details

### 1. Radius (5px - 50px)
**What it does**: Controls the size of each heat point on the map.
- **Lower values (5-15px)**: Creates sharp, focused heat points - good for precise data visualization
- **Medium values (20-30px)**: Balanced view with moderate spread
- **Higher values (35-50px)**: Creates large, smooth heat areas - good for general patterns

**Visual Effect**: Immediately changes the size of the colored areas on the map.

### 2. Opacity (10% - 100%)
**What it does**: Controls how transparent or solid the heatmap appears.
- **Lower values (10-40%)**: Semi-transparent, allows seeing the base map underneath
- **Medium values (50-70%)**: Balanced visibility of both heatmap and base map
- **Higher values (80-100%)**: Solid, opaque heatmap that dominates the view

**Visual Effect**: Changes how see-through the colored heat areas are.

### 3. Intensity (0.5x - 3.0x)
**What it does**: Multiplies the data values, making the heatmap more or less pronounced.
- **Lower values (0.5-1.0x)**: Subdued colors, less dramatic differences
- **Medium values (1.5-2.0x)**: Standard intensity (default is 2.0x)
- **Higher values (2.5-3.0x)**: Vivid colors, dramatic contrasts

**Visual Effect**: Changes the brightness and saturation of the heat colors.

## How to Verify Controls Are Working

### Method 1: Visual Inspection
1. Load a dataset (upload CSV, JSON, or NetCDF file)
2. Open the Controls panel
3. Move each slider and observe the map:
   - **Radius**: Heat spots should grow or shrink
   - **Opacity**: Colors should become more or less transparent
   - **Intensity**: Colors should become more or less vivid

### Method 2: Console Logs
Open your browser's Developer Console (F12) and watch for these messages:
```
Radius changed to: 35
Heatmap config updated: {radius: 35, blur: 15, maxOpacity: 1, ...}
Heatmap settings - Radius: 35 Opacity: 1
Heatmap layer added to map with radius: 35 opacity: 1
```

### Method 3: Value Display
The current value is displayed next to each slider label:
- Radius shows as "25px"
- Opacity shows as "100%"
- Intensity shows as "2.0x"

Watch these values update as you move the sliders.

## Technical Implementation

### Data Flow
1. **User moves slider** → `onValueChange` callback fires
2. **State updates** → `setRadius`, `setOpacity`, or `setIntensity` called
3. **Config/Data recalculates** → `useMemo` creates new config or normalized data
4. **HeatmapViewer re-renders** → `useEffect` detects change and recreates heatmap layer
5. **Map updates** → New heatmap layer is added to the map

### Key Files
- **ControlPanelDropdown.tsx**: UI component with sliders
- **Dashboard.tsx**: State management and config creation
- **HeatmapViewer.tsx**: Heatmap rendering with Leaflet.heat

### Dependencies
- **Radius & Opacity**: Affect `heatmapConfig` object
- **Intensity**: Affects `normalizedData` array
- Both trigger HeatmapViewer's `useEffect([data, config, colorScheme])`

## Troubleshooting

### Controls don't seem to work
1. **Check if data is loaded**: Controls only affect the heatmap when data is present
   - Upload a dataset first
   - Look for "Rendering heatmap with X points" in console

2. **Check console for errors**: Open Developer Console (F12)
   - Look for error messages
   - Verify slider change logs appear

3. **Try extreme values**: Move sliders to extreme positions
   - Radius: 5px vs 50px (10x difference)
   - Opacity: 10% vs 100% (very transparent vs solid)
   - Intensity: 0.5x vs 3.0x (6x difference)

4. **Refresh the page**: Sometimes browser caching can cause issues
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Changes are too subtle
- **Radius**: Try zooming in/out on the map - effect is more visible at certain zoom levels
- **Opacity**: More noticeable when there's data overlap or dense areas
- **Intensity**: Most visible in areas with varying data values

### Performance issues
- Large datasets (>10,000 points) may cause lag when adjusting controls
- The app automatically optimizes datasets over 5,000 points
- Check console for "Dataset optimized" messages

## Best Practices

### For Scientific Visualization
- **Radius**: 15-25px for precise data
- **Opacity**: 70-90% to see both data and geography
- **Intensity**: 1.5-2.0x for accurate representation

### For Presentations
- **Radius**: 25-35px for smooth, appealing visuals
- **Opacity**: 80-100% for bold, clear patterns
- **Intensity**: 2.0-2.5x for dramatic effect

### For Detailed Analysis
- **Radius**: 10-20px for fine detail
- **Opacity**: 50-70% to see underlying features
- **Intensity**: 1.0-1.5x for subtle variations

## Example Use Cases

### Case 1: Ocean Temperature Data
```
Radius: 30px (smooth ocean patterns)
Opacity: 85% (clear but not overwhelming)
Intensity: 2.0x (standard temperature gradients)
```

### Case 2: Precipitation Hotspots
```
Radius: 20px (focused rain areas)
Opacity: 90% (prominent display)
Intensity: 2.5x (highlight extreme values)
```

### Case 3: Atmospheric Pressure
```
Radius: 35px (large-scale patterns)
Opacity: 75% (see geography underneath)
Intensity: 1.5x (subtle pressure differences)
```

## Additional Notes

- All three controls work independently
- Changes are applied immediately (no "Apply" button needed)
- Values persist during the session but reset on page reload
- Controls work with all supported file formats (CSV, JSON, NetCDF)
- Compatible with all color schemes (thermal, rainbow, viridis, etc.)
