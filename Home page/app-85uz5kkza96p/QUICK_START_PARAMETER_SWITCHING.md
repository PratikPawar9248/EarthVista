# Quick Start: Dynamic Parameter Switching

## 🎯 What You Asked For

> "If I have a dataset with temperature, salinity, wind speed, etc., add a feature in the map so if I click on temperature, the heatmap should plot temperature. If I click on salinity, the heatmap should change according to that."

## ✅ What You Got

**Exactly what you requested!** The feature is now fully implemented and working.

---

## 🚀 How to Use (3 Simple Steps)

### Step 1: Upload Your Dataset

Click the **"Upload Dataset"** button in the header and select a file with multiple parameters.

**Your file should look like this:**

**CSV Example:**
```csv
lat,lon,temperature,salinity,wind_speed,chlorophyll
23.5,88.2,29.1,35.2,12.5,0.8
-10.2,45.1,26.4,34.8,8.3,1.2
35.7,-120.4,18.5,33.5,15.7,0.5
```

**JSON Example:**
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

### Step 2: See the Parameter Selector

After upload, a **"Parameters"** panel appears in the top-left corner:

```
┌─────────────────────────────────┐
│ 🔷 Parameters                   │
├─────────────────────────────────┤
│ [●Temperature] [Salinity]       │
│ [Wind Speed]   [Chlorophyll]    │
└─────────────────────────────────┘
```

The active parameter is highlighted with a gradient background.

### Step 3: Click to Switch

**Click any parameter button:**
- Click **"Temperature"** → Heatmap shows temperature
- Click **"Salinity"** → Heatmap instantly changes to salinity
- Click **"Wind Speed"** → Heatmap updates to wind speed
- Click **"Chlorophyll"** → Heatmap displays chlorophyll

**That's it!** The heatmap updates instantly, and the color legend adjusts automatically.

---

## 🎬 Visual Example

### Before Clicking (Temperature Selected)
```
Map View:
┌─────────────────────────────────────────┐
│ [●Temperature] [Salinity] [Wind Speed]  │ ← Parameter Selector
├─────────────────────────────────────────┤
│                                         │
│     🌍 Global Heatmap                   │
│     (showing temperature data)          │
│     🔴🟠🟡🟢🔵                           │
│                                         │
│ Legend: 12.3°C ━━━━━━━━ 29.1°C        │
└─────────────────────────────────────────┘
```

### After Clicking "Salinity"
```
Map View:
┌─────────────────────────────────────────┐
│ [Temperature] [●Salinity] [Wind Speed]  │ ← Salinity now active
├─────────────────────────────────────────┤
│                                         │
│     🌍 Global Heatmap                   │
│     (now showing salinity data)         │
│     🔴🟠🟡🟢🔵                           │
│                                         │
│ Legend: 32.8 PSU ━━━━━━━━ 36.2 PSU    │ ← Range updated
└─────────────────────────────────────────┘
```

---

## 📦 Test It Now!

A sample dataset is included for immediate testing:

**File:** `/public/sample-multi-parameter.csv`

**Contains:**
- 20 global data points
- 4 parameters: temperature, salinity, wind_speed, chlorophyll
- Ready to upload and test

**To test:**
1. Start the application
2. Click "Upload Dataset"
3. Select `sample-multi-parameter.csv`
4. See the parameter selector appear
5. Click different parameters and watch the heatmap change!

---

## 🎨 What Happens When You Click

### Instant Visual Feedback

1. **Button Highlight**: Clicked parameter gets gradient background
2. **Loading Toast**: "Switching to [parameter]..." appears briefly
3. **Heatmap Update**: Colors change to reflect new data
4. **Legend Update**: Min/max values adjust automatically
5. **Success Toast**: "Now displaying: [parameter]" confirms switch

### Behind the Scenes

1. System retrieves cached raw data
2. Extracts values for selected parameter
3. Recalculates min/max range
4. Normalizes values for heatmap
5. Updates visualization instantly

**No re-upload needed!** All data is cached in memory.

---

## 💡 Smart Features

### Automatic Detection
- System scans your file for all numeric columns
- Excludes latitude/longitude automatically
- Shows only valid data parameters

### Only Shows When Needed
- If your file has only 1 parameter → No selector appears
- If your file has 2+ parameters → Selector appears automatically

### Works with All Formats
- ✅ CSV files
- ✅ JSON files
- ✅ NetCDF files

---

## 🎯 Real-World Examples

### Oceanography Research
**Dataset:** Ocean monitoring data
**Parameters:** Temperature, Salinity, Chlorophyll, Dissolved Oxygen
**Use Case:** Click through parameters to analyze ocean conditions

### Climate Analysis
**Dataset:** Weather station data
**Parameters:** Temperature, Humidity, Pressure, Precipitation
**Use Case:** Compare different climate variables

### Environmental Monitoring
**Dataset:** Air quality sensors
**Parameters:** PM2.5, NO2, O3, CO
**Use Case:** Track different pollutants

### Marine Biology
**Dataset:** Ecosystem measurements
**Parameters:** Temperature, Salinity, pH, Nutrients
**Use Case:** Study habitat conditions

---

## ❓ FAQ

### Q: Do I need to re-upload the file to switch parameters?
**A:** No! The data is cached. Just click the parameter button.

### Q: How many parameters can I have?
**A:** Unlimited! The system detects all numeric fields in your file.

### Q: What if my file only has one parameter?
**A:** The parameter selector won't appear. The heatmap displays normally.

### Q: Can I switch parameters on NetCDF files?
**A:** Yes! All NetCDF variables are detected and switchable.

### Q: How fast is the switching?
**A:** Instant! Usually less than 1 second, even for large datasets.

### Q: Does it work with large files?
**A:** Yes! The system automatically optimizes large datasets.

---

## 🎉 Summary

**You asked for:**
- Click on temperature → show temperature
- Click on salinity → show salinity
- Click on wind speed → show wind speed

**You got:**
- ✅ Beautiful parameter selector UI
- ✅ Instant parameter switching
- ✅ Automatic value range adjustment
- ✅ Works with CSV, JSON, NetCDF
- ✅ No re-upload needed
- ✅ Smooth animations
- ✅ Error handling
- ✅ Sample dataset included

**The feature is complete and ready to use!** 🚀

---

## 📞 Need Help?

1. **Check the file format**: Ensure lat/lon columns are named correctly
2. **Verify numeric data**: All parameter columns should contain numbers
3. **Look for the selector**: It only appears with 2+ parameters
4. **Try the sample file**: Use `sample-multi-parameter.csv` to test

**Enjoy your new dynamic parameter switching feature!** 🎊
