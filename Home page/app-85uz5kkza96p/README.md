# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-85uz5kkza96p

# Geospatial Heatmap Visualization Platform

A professional, industry-ready web application for visualizing scientific geospatial datasets with interactive heatmaps, advanced analytics, and **AI-powered insights**.

## 🚀 What's New - Industry-Ready Features

### 🌐 **Large Dataset & NetCDF Support** ⭐ NEW
- **1GB File Support**: Handle massive scientific datasets (10x increase from 100MB)
- **NetCDF Format**: Full support for .nc files used in climate and oceanography
- **Automatic Optimization**: Smart decimation for datasets with millions of points
- **Real-time Progress**: Detailed progress tracking during file processing
- **Multi-dimensional Data**: Support for 1D, 2D, 3D, and 4D NetCDF structures
- **Memory Efficient**: 90% memory reduction for large datasets
- 📖 [Quick Start Guide](QUICK_START_LARGE_FILES.md) | [Full Documentation](LARGE_DATASET_SUPPORT.md)

### 💾 **Dataset Management System**
- **Save & Load Datasets**: Persistent storage using IndexedDB
- **Dataset Library**: Search, filter, and manage multiple datasets
- **Metadata Tracking**: Name, description, upload date, file info
- **Quick Access**: Fast loading from local storage

### 📊 **Comprehensive Statistical Analysis**
- **Descriptive Statistics**: Mean, median, std dev, quartiles, skewness, kurtosis
- **Spatial Statistics**: Coverage area, point density, centroid, bounds
- **Data Quality Assessment**: Quality score, completeness, outlier detection
- **Real-time Updates**: Statistics update as you filter data

### 🎨 **Professional Color Schemes**
- **15+ Scientific Palettes**: Viridis, Plasma, Inferno, Ocean, Thermal, and more
- **Colorblind-Safe Options**: Clearly marked accessible palettes
- **Perceptually Uniform**: Accurate data representation
- **Category Filtering**: Sequential, Diverging, Qualitative, Cyclic

### 🔍 **Advanced Filtering**
- **Value Range Filtering**: Interactive sliders for min/max values
- **Geographic Filtering**: Latitude and longitude bounds
- **Outlier Detection**: IQR and Z-score methods
- **Real-time Preview**: See filtered data count instantly

### 📤 **Multi-Format Export**
- **CSV Export**: Standard format for spreadsheets and GIS
- **JSON Export**: Structured data for programmatic use
- **PNG Export**: High-resolution map screenshots
- **PDF Reports**: Professional reports with statistics and visualizations
- **Statistics Reports**: Comprehensive text-based analysis

### 🎯 **New Data Management Page**
Dedicated page with tabbed interface for:
- Dataset Library & Search
- Statistical Analysis Dashboard
- Advanced Filtering Controls
- Export & Download Center
- Color Scheme Selection

---

## Features

### 🤖 AI-Powered Analysis (v1.9.0)
- **AI Chat Assistant**: Natural language interface for data exploration
  - Ask questions about your data in plain English
  - Real-time streaming responses with markdown formatting
  - Conversation history with context awareness
  - Accessible via floating ⚡ Sparkles button
  
- **AI Insights Panel**: Automated data analysis
  - Automatic summary generation
  - Key findings identification
  - Analysis recommendations
  - Anomaly detection with explanations
  - One-click refresh for new insights

- **Powered by Google Gemini 2.5 Flash**: State-of-the-art AI model for intelligent data analysis

### 🗺️ Interactive Global Heatmap
- Upload CSV, JSON, or NetCDF datasets with geospatial data
- Automatic detection of latitude, longitude, and value fields
- Smooth, color-graded heatmaps on interactive world map
- Real-time adjustable controls (radius, opacity, intensity)
- Multiple color schemes (Jet, Viridis, Plasma, etc.)
- Coordinate display and grid overlay
- Distance and area measurement tools

### 📊 Advanced Data Visualization (v1.8.0 - 17 Plot Types)
Access comprehensive data visualization through the "Advanced Plots" button:

**2D Plots:**
- Scatter Plot: Visualize spatial distribution
- Line Plot: Sequential data trends

**3D Plots:**
- 3D Scatter Plot: Three-dimensional data exploration
- 3D Surface Plot: Gridded data surface visualization

**Heatmaps & Contours:**
- Grid-based Heatmap: Binned spatial data
- Density Heatmap: 2D density distribution
- Contour Plot: Iso-value contour lines

**Statistical Plots:**
- Histogram: Value distribution analysis
- Box Plot: Statistical summary with quartiles
- Violin Plot: Distribution density visualization

**Oceanographic Plots:**
- Depth Profile: Vertical profile visualization
- T-S Diagram: Temperature-Salinity relationships
- **Vertical Section**: Cross-section depth analysis (NEW)
- **Hovmöller Diagram**: Spatial evolution patterns (NEW)
- **T-S with Density Contours**: Enhanced T-S with σ_t isolines (NEW)
- **Water Mass Analysis**: Multi-parameter water mass identification (NEW)
- **Stratification Profile**: Vertical stability and mixed layer analysis (NEW)

### ⚡ Performance Optimization
- Automatic optimization for large datasets (100K+ points)
- Smart sampling algorithms (uniform, random, grid)
- Point clustering for improved rendering
- Memory usage estimation and recommendations

### 🎨 Modern UI/UX
- ISRO-inspired color scheme (Deep Blue & Orange)
- Responsive design for desktop and mobile
- Dark mode support
- Interactive tooltips and hover effects
- Export functionality (PNG, GeoTIFF)

## Project Info

## Project Directory

```
├── README.md # Documentation
├── components.json # Component library configuration
├── eslint.config.js # ESLint configuration
├── index.html # Entry file
├── package.json # Package management
├── postcss.config.js # PostCSS configuration
├── public # Static resources directory
│   ├── favicon.png # Icon
│   └── images # Image resources
├── src # Source code directory
│   ├── App.tsx # Entry file
│   ├── components # Components directory
│   ├── context # Context directory
│   ├── db # Database configuration directory
│   ├── hooks # Common hooks directory
│   ├── index.css # Global styles
│   ├── layout # Layout directory
│   ├── lib # Utility library directory
│   ├── main.tsx # Entry file
│   ├── routes.tsx # Routing configuration
│   ├── pages # Pages directory
│   ├── services # Database interaction directory
│   ├── types # Type definitions directory
├── tsconfig.app.json # TypeScript frontend configuration file
├── tsconfig.json # TypeScript configuration file
├── tsconfig.node.json # TypeScript Node.js configuration file
└── vite.config.ts # Vite configuration file
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui, Tailwind CSS
- **Mapping**: Leaflet.js with heatmap plugin
- **Data Visualization**: Plotly.js, Recharts
- **State Management**: React Context API
- **Routing**: React Router v6
- **AI Integration**: Google Gemini 2.5 Flash (Streaming API)
- **Backend**: Supabase (optional)

## Documentation

Comprehensive guides are available to help you get the most out of the platform:

- **[AI Features Guide](AI_FEATURES_GUIDE.md)**: Complete guide to AI-powered features
  - AI Chat Assistant usage
  - AI Insights Panel
  - Tips for effective prompting
  - Technical details and troubleshooting
  
- **[Usage Guide](USAGE_GUIDE.md)**: General platform usage instructions
  - Data upload and format requirements
  - Interactive heatmap controls
  - Export and sharing options
  
- **[Oceanographic Plots Guide](OCEANOGRAPHIC_PLOTS_GUIDE.md)**: Specialized plot documentation
  - All 17 plot types explained
  - Scientific interpretation
  - Best practices for oceanographic data

- **[Changelog](CHANGELOG.md)**: Version history and updates

## Development Guidelines

### How to edit code locally?

You can choose [VSCode](https://code.visualstudio.com/Download) or any IDE you prefer. The only requirement is to have Node.js and npm installed.

### Environment Requirements

```
# Node.js ≥ 20
# npm ≥ 10
Example:
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

### Installing Node.js on Windows

```
# Step 1: Visit the Node.js official website: https://nodejs.org/, click download. The website will automatically suggest a suitable version (32-bit or 64-bit) for your system.
# Step 2: Run the installer: Double-click the downloaded installer to run it.
# Step 3: Complete the installation: Follow the installation wizard to complete the process.
# Step 4: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### Installing Node.js on macOS

```
# Step 1: Using Homebrew (Recommended method): Open Terminal. Type the command `brew install node` and press Enter. If Homebrew is not installed, you need to install it first by running the following command in Terminal:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Alternatively, use the official installer: Visit the Node.js official website. Download the macOS .pkg installer. Open the downloaded .pkg file and follow the prompts to complete the installation.
# Step 2: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### After installation, follow these steps:

```
# Step 1: Download the code package
# Step 2: Extract the code package
# Step 3: Open the code package with your IDE and navigate into the code directory
# Step 4: In the IDE terminal, run the command to install dependencies: npm i
# Step 5: In the IDE terminal, run the command to start the development server: npm run dev -- --host 127.0.0.1
# Step 6: if step 5 failed, try this command to start the development server: npx vite --host 127.0.0.1
```

### How to develop backend services?

Configure environment variables and install relevant dependencies.If you need to use a database, please use the official version of Supabase.

## Learn More

You can also check the help documentation: Download and Building the app（ [https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en](https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en)）to learn more detailed content.
