# How to See the Smart Dashboard Button

## ⚠️ Important: Button Visibility

The **Smart Dashboard** button only appears **AFTER you upload a dataset**.

---

## 📋 Step-by-Step Instructions

### Step 1: Open the Application
Open your Geospatial Heatmap Visualization Platform in your browser.

### Step 2: Upload a Dataset
1. Look for the **"Upload Dataset"** button in the top-right corner
2. Click it
3. Upload any data file:
   - CSV file with lat, lon, value columns
   - JSON file with geospatial data
   - NetCDF (.nc) file

### Step 3: See the Smart Dashboard Button
Once the dataset is loaded, you'll see the **Smart Dashboard** button appear in the header toolbar, right after the "Live Earth" button.

### Step 4: Click the Button
Click the **Smart Dashboard** button to open https://preview--isro-smart-dashboard.lovable.app/ in a new tab.

---

## 🎯 Why Does It Work This Way?

The Smart Dashboard button is grouped with other data analysis tools (Statistics, AI Insights, Advanced Plots, etc.) that only make sense when you have data loaded.

**Button appears when**: `localDataset` exists (i.e., after uploading data)  
**Button hidden when**: No dataset is loaded yet

---

## 🔍 Visual Guide

### Before Uploading Data:
```
┌─────────────────────────────────────────────────────────┐
│ [ISRO Logo] ISRO Oceanography Viz    [Upload Dataset]  │
└─────────────────────────────────────────────────────────┘
```

### After Uploading Data:
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [ISRO Logo] ISRO Oceanography Viz                                                       │
│                                                                                          │
│ [Dataset Info] [Statistics] [AI Insights] [Control Panel] [Data Management]            │
│ [Advanced Plots] [Live Earth] [Smart Dashboard] ← HERE! [Upload Dataset]               │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Quick Test

Want to test it quickly? Here's a minimal CSV you can create:

```csv
lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
40.7,-74.0,15.3
```

1. Save this as `test.csv`
2. Upload it using the "Upload Dataset" button
3. The Smart Dashboard button will appear!

---

## ✅ Checklist

- [ ] Open the application
- [ ] Click "Upload Dataset"
- [ ] Upload a data file (CSV, JSON, or NetCDF)
- [ ] Wait for data to load
- [ ] Look for "Smart Dashboard" button in the header
- [ ] Click it to open ISRO Smart Dashboard

---

**Status**: ✅ Working  
**Location**: Dashboard header (after data upload)  
**Last Updated**: 2025-12-11
