# Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Try Sample Data
Click one of the sample buttons in the header:
- **Load Temperature Sample** - Global temperature distribution
- **Load Salinity Sample** - Ocean salinity patterns

### 2️⃣ Adjust Visualization
Use the control panel on the right to customize:
- **Radius** (5-50px): Size of heat points
- **Opacity** (10-100%): Transparency level
- **Intensity** (0.5-3.0x): Heat amplification

### 3️⃣ Upload Your Own Data
Click **"Upload Dataset"** and select a file:
- CSV with `lat`, `lon`, and value columns
- JSON array with latitude/longitude fields
- NetCDF (.nc) scientific data files

## Data Format Examples

### CSV Format
```csv
lat,lon,temperature
23.5,88.2,29.1
-10.2,45.1,26.4
```

### JSON Format
```json
[
  {"lat": 23.5, "lon": 88.2, "value": 29.1},
  {"lat": -10.2, "lon": 45.1, "value": 26.4}
]
```

## Tips

✅ **DO**:
- Use decimal degrees for coordinates
- Include 100-10,000 data points for best results
- Ensure numeric values for all fields

❌ **DON'T**:
- Use DMS (degrees/minutes/seconds) format
- Upload files larger than 10MB
- Include text values in numeric fields

## Need Help?

- 📖 Read the [User Guide](./USER_GUIDE.md) for detailed instructions
- 🔧 Check [Technical Documentation](./TECHNICAL.md) for developers
- 🐛 Verify data format if upload fails

## Keyboard Shortcuts

- **+** or **Scroll Up**: Zoom in
- **-** or **Scroll Down**: Zoom out
- **Click + Drag**: Pan the map

---

**Ready to visualize your data? Start with a sample dataset!**
