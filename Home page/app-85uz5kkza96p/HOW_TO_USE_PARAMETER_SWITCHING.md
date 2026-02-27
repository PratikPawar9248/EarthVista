# 🎯 How to Use Multi-Parameter Heatmap Switching

## Your Question Answered

> **You asked**: "If I have a dataset with temperature, salinity, wind speed, etc., add a feature in the map so if I click on temperature, the heatmap should plot temperature. If I click on salinity, the heatmap should change according to that."

> **Answer**: ✅ **This feature is already fully implemented and working in your application!**

---

## 📍 Where to Find the Feature

After uploading a multi-parameter dataset, the **Parameter Selector** appears in the **top-left corner** of the map, just below the color legend.

### Visual Location:

```
┌─────────────────────────────────────────────────────────────┐
│  Header: GeoHeatmap AI                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐                                        │
│  │ Color Legend    │  ← Top-left corner                    │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓   │                                        │
│  │ 2.5°C - 30.2°C  │                                        │
│  └─────────────────┘                                        │
│                                                              │
│  ┌─────────────────┐                                        │
│  │ 📋 Parameters   │  ← PARAMETER SELECTOR (LOOK HERE!)    │
│  │                 │                                        │
│  │ [Temperature] ✓ │  ← Currently active (highlighted)     │
│  │ [Salinity]      │  ← Click to switch to salinity        │
│  │ [Wind Speed]    │  ← Click to switch to wind speed      │
│  │ [Chlorophyll]   │  ← Click to switch to chlorophyll     │
│  └─────────────────┘                                        │
│                                                              │
│              🌍 GLOBAL HEATMAP                              │
│         (Shows selected parameter)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Step-by-Step Usage Guide

### Step 1: Prepare Your Dataset

Your dataset must have:
- **Latitude column**: `lat` or `latitude`
- **Longitude column**: `lon` or `longitude`
- **Multiple parameter columns**: `temperature`, `salinity`, `wind_speed`, etc.

**Example CSV:**
```csv
lat,lon,temperature,salinity,wind_speed,chlorophyll
23.5,88.2,29.1,35.2,12.5,0.8
-10.2,45.1,26.4,34.8,8.3,1.2
35.7,-120.4,18.5,33.5,15.7,0.5
```

### Step 2: Upload Your Dataset

1. Click the **"Upload Dataset"** button in the header
2. Select your CSV, JSON, or NetCDF file
3. Wait for the file to process
4. The map will appear with the first parameter displayed

### Step 3: Locate the Parameter Selector

Look at the **top-left corner** of the map. You'll see:
- **Color Legend** (shows current value range)
- **Parameters Panel** (shows all available parameters)

### Step 4: Switch Between Parameters

Click any parameter button to switch the heatmap:

1. **Click "Temperature"**
   - Heatmap updates to show temperature distribution
   - Color legend shows temperature range (e.g., 2.5°C - 30.2°C)
   - Toast notification: "Now displaying: temperature"

2. **Click "Salinity"**
   - Heatmap instantly updates to show salinity distribution
   - Color legend shows salinity range (e.g., 32.8 PSU - 36.2 PSU)
   - Toast notification: "Now displaying: salinity"

3. **Click "Wind Speed"**
   - Heatmap updates to show wind speed distribution
   - Color legend shows wind speed range (e.g., 10.2 m/s - 25.3 m/s)
   - Toast notification: "Now displaying: wind_speed"

4. **Click "Chlorophyll"**
   - Heatmap updates to show chlorophyll concentration
   - Color legend shows chlorophyll range (e.g., 0.2 mg/m³ - 2.6 mg/m³)
   - Toast notification: "Now displaying: chlorophyll"

---

## 🎨 Visual Feedback

### Active Parameter
- **Highlighted** with gradient color (blue to purple)
- **"Active" badge** appears on the button
- **Glow effect** around the button

### Inactive Parameters
- **Outlined** with subtle border
- **Hover effect** when you move mouse over them
- **Scale animation** on hover

### During Switching
- **Loading toast**: "Switching to [parameter]..."
- **Smooth transition**: Heatmap updates seamlessly
- **Success toast**: "Now displaying: [parameter]"

---

## 📦 Try the Demo Dataset

Two sample datasets are included:

### 1. Small Sample (20 points)
**File**: `public/sample-multi-parameter.csv`
- Quick to load
- Good for testing

### 2. Demo Dataset (60 points)
**File**: `public/demo-multi-parameter.csv`
- More data points
- Better visualization
- Covers more of the globe

**To try it:**
1. Click "Upload Dataset"
2. Navigate to the `public` folder
3. Select `demo-multi-parameter.csv`
4. Wait for the map to load
5. Look at top-left corner for "Parameters" panel
6. Click different parameters to see the heatmap change

---

## 🎯 Real-World Example

### Oceanographic Analysis Workflow

**Scenario**: You have ocean data with temperature, salinity, wind speed, and chlorophyll.

**Step 1**: Upload `ocean_data.csv`
```csv
lat,lon,temperature,salinity,wind_speed,chlorophyll
-60,-180,2.5,34.2,25.3,0.2
-30,-150,16.5,34.0,17.2,0.9
0,-120,26.8,34.0,11.8,1.7
30,-90,20.8,34.0,14.5,1.5
60,-60,7.8,33.8,19.8,0.8
```

**Step 2**: Analyze Temperature
- Click "Temperature" button
- Observe: Equator is warmest (26-30°C), poles are coldest (2-10°C)
- Color gradient: Blue (cold) → Red (hot)

**Step 3**: Analyze Salinity
- Click "Salinity" button
- Observe: Salinity ranges from 32.8 to 36.2 PSU
- Identify: High salinity regions (evaporation zones)

**Step 4**: Analyze Wind Speed
- Click "Wind Speed" button
- Observe: Polar regions have highest wind speeds (20-25 m/s)
- Identify: Calm zones near equator (10-12 m/s)

**Step 5**: Analyze Chlorophyll
- Click "Chlorophyll" button
- Observe: Equatorial regions have highest chlorophyll (1.5-2.6 mg/m³)
- Identify: Biological productivity zones

**Step 6**: Compare Patterns
- Switch back and forth between parameters
- Identify correlations (e.g., high chlorophyll where temperature is moderate)
- Generate insights for your research

---

## 🔧 Technical Details

### How It Works

1. **Upload & Detection**
   - System reads your file (CSV, JSON, or NetCDF)
   - Identifies lat/lon columns
   - Detects all numeric columns as parameters
   - Caches raw data in memory

2. **Parameter List Creation**
   - Creates a button for each detected parameter
   - Formats parameter names (e.g., `wind_speed` → "Wind Speed")
   - Sets first parameter as default

3. **Switching Mechanism**
   - When you click a parameter button:
     - Retrieves cached raw data
     - Extracts values for selected parameter
     - Recalculates min, max, mean, median
     - Updates heatmap visualization
     - Updates color legend
     - Shows toast notification

4. **Performance Optimization**
   - **No re-upload needed**: Raw data is cached
   - **Instant switching**: Processing takes < 1 second
   - **Smooth transitions**: No page reload
   - **Memory efficient**: Only active parameter is rendered

### Supported File Formats

#### CSV
```csv
lat,lon,temperature,salinity,wind_speed
23.5,88.2,29.1,35.2,12.5
```

#### JSON
```json
[
  {"lat": 23.5, "lon": 88.2, "temperature": 29.1, "salinity": 35.2, "wind_speed": 12.5},
  {"lat": -10.2, "lon": 45.1, "temperature": 26.4, "salinity": 34.8, "wind_speed": 8.3}
]
```

#### NetCDF
- Must have `lat` and `lon` dimensions
- Multiple data variables (temperature, salinity, etc.)
- System automatically detects all variables

---

## ✨ Key Features

✅ **Automatic Detection**: Finds all parameters in your dataset  
✅ **One-Click Switching**: Instant parameter changes  
✅ **Real-Time Updates**: Heatmap updates immediately  
✅ **Dynamic Legend**: Color scale adjusts automatically  
✅ **Smart Caching**: No need to re-upload  
✅ **Error Handling**: Clear error messages  
✅ **Toast Notifications**: Visual feedback  
✅ **Responsive Design**: Works on all devices  
✅ **Beautiful UI**: Gradient colors and animations  

---

## 🐛 Troubleshooting

### Problem: "I don't see the Parameters panel"

**Possible Causes:**
1. Your dataset has only one parameter (only lat, lon, and one value column)
2. The file didn't upload correctly

**Solutions:**
- Ensure your CSV has multiple numeric columns (besides lat/lon)
- Check that column names are clear (temperature, salinity, etc.)
- Try the demo file: `public/demo-multi-parameter.csv`

### Problem: "Clicking parameters doesn't change the heatmap"

**Possible Causes:**
1. File cache was cleared
2. Browser error occurred

**Solutions:**
- Re-upload your dataset
- Check browser console for errors (F12)
- Refresh the page and try again

### Problem: "Wrong values are displayed"

**Possible Causes:**
1. Column names are ambiguous
2. Data contains non-numeric values

**Solutions:**
- Use clear column names: `temperature`, `salinity`, `wind_speed`
- Ensure all data values are numeric
- Remove or handle missing values (empty cells)

### Problem: "Parameter names look weird"

**Example**: `wind_speed` displays as "Wind Speed" ✓  
**Example**: `TEMP` displays as "Temp" ✓

The system automatically formats parameter names:
- Replaces underscores with spaces
- Capitalizes first letter of each word
- Handles camelCase (e.g., `windSpeed` → "Wind Speed")

---

## 📊 Best Practices

### Dataset Preparation

1. **Use descriptive column names**
   - ✅ Good: `temperature`, `salinity`, `wind_speed`
   - ❌ Bad: `temp`, `sal`, `ws`, `col1`, `col2`

2. **Include units in documentation** (not in column names)
   - ✅ Good: Column name `temperature`, document as "Temperature (°C)"
   - ❌ Bad: Column name `temperature_celsius`

3. **Ensure data quality**
   - Remove or handle missing values
   - Check for outliers
   - Validate lat/lon ranges (-90 to 90, -180 to 180)

4. **Organize parameters logically**
   - Group related parameters
   - Use consistent naming conventions
   - Document parameter meanings

### Visualization Tips

1. **Start with the most important parameter**
   - The first parameter in your file is displayed by default
   - Put your primary variable first

2. **Compare related parameters**
   - Switch between temperature and salinity to see correlations
   - Compare wind speed with chlorophyll to understand mixing

3. **Use AI Insights**
   - Click "AI Insights" button for parameter-specific analysis
   - Get automated interpretations of patterns

4. **Export visualizations**
   - Use "Export" feature to save heatmaps for each parameter
   - Generate PDF reports with all parameters

---

## 🎓 Advanced Usage

### Multiple Dataset Comparison

1. Upload first dataset (e.g., summer data)
2. Switch between parameters to analyze
3. Export visualizations
4. Upload second dataset (e.g., winter data)
5. Switch between same parameters
6. Compare exported images side-by-side

### Time Series Analysis

If your NetCDF file has a time dimension:
1. Upload the file
2. Use the time slider (if available)
3. Switch between parameters at different time steps
4. Observe temporal changes in each parameter

### Custom Analysis Workflow

1. **Upload** → Load your multi-parameter dataset
2. **Explore** → Switch between parameters to understand patterns
3. **Measure** → Use measurement tools to quantify regions
4. **Analyze** → Use AI Insights for automated analysis
5. **Export** → Generate reports for each parameter
6. **Share** → Share findings with your team

---

## 📚 Related Features

### Color Legend
- Automatically updates when you switch parameters
- Shows min and max values for current parameter
- Uses color gradient matching the heatmap

### Statistics Panel
- Click "Statistics" button to see detailed stats
- Shows mean, median, std deviation for current parameter
- Updates when you switch parameters

### AI Insights
- Click "AI Insights" button for AI analysis
- Get parameter-specific interpretations
- Receive recommendations based on current parameter

### Export Feature
- Export current parameter visualization as PNG
- Generate PDF report with current parameter data
- Include statistics and AI insights

---

## 🎉 Summary

**Your requested feature is fully implemented and ready to use!**

### What You Get:

✅ **Upload once** → Analyze multiple parameters  
✅ **Click to switch** → Instant heatmap updates  
✅ **Visual feedback** → Clear notifications and highlights  
✅ **Smart caching** → No need to re-upload  
✅ **Beautiful UI** → Gradient colors and smooth animations  

### How to Use:

1. Upload multi-parameter dataset
2. Look at top-left corner for "Parameters" panel
3. Click any parameter button
4. Watch the heatmap update instantly
5. Switch as many times as you want

### Try It Now:

1. Click "Upload Dataset"
2. Select `public/demo-multi-parameter.csv`
3. Click different parameter buttons in the top-left corner
4. See the magic happen! ✨

---

## 📞 Need Help?

- **Full Documentation**: `MULTI_PARAMETER_FEATURE_GUIDE.md`
- **Quick Start**: `QUICK_START_PARAMETER_SWITCHING.md`
- **Sample Data**: `public/demo-multi-parameter.csv`
- **Component Code**: `src/components/ParameterSelector.tsx`

---

**Feature Status**: ✅ Fully Implemented  
**Last Updated**: 2025-12-11  
**Version**: 1.0.0

**Enjoy exploring your multi-parameter datasets!** 🚀🌍
