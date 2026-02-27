# Geospatial Heatmap Visualization Platform - Technical Documentation

## Architecture Overview

### Technology Stack

**Frontend Framework**
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation

**UI Components**
- shadcn/ui component library
- Tailwind CSS for styling
- Radix UI primitives

**Mapping & Visualization**
- Leaflet.js for map rendering
- leaflet.heat plugin for heatmap layer
- Esri World Imagery satellite basemap
- CartoDB Voyager labels overlay

**Data Processing**
- PapaParse for CSV parsing
- Native JSON.parse for JSON files
- netcdfjs for NetCDF file handling

### Project Structure

```
src/
├── components/
│   ├── HeatmapViewer.tsx      # Main map component with Leaflet
│   ├── FileUpload.tsx          # Drag-and-drop file upload
│   ├── ControlPanel.tsx        # Interactive parameter controls
│   ├── ColorLegend.tsx         # Dynamic color scale legend
│   └── ui/                     # shadcn/ui components
├── pages/
│   └── Dashboard.tsx           # Main application page
├── types/
│   ├── heatmap.ts             # TypeScript interfaces
│   └── leaflet-heat.d.ts      # Leaflet.heat type declarations
├── utils/
│   └── dataParser.ts          # File parsing utilities
├── index.css                   # Global styles and design tokens
├── App.tsx                     # Application root
└── main.tsx                    # Entry point

public/
└── samples/
    ├── global_temperature.csv  # Sample temperature dataset
    └── ocean_salinity.json     # Sample salinity dataset
```

## Core Components

### HeatmapViewer Component

**Purpose**: Renders the interactive map with heatmap layer

**Key Features**:
- Initializes Leaflet map with dark basemap
- Creates and updates heatmap layer based on data
- Handles map controls (zoom, pan, bounds)
- Applies dynamic configuration (radius, opacity, gradient)

**Props**:
```typescript
interface HeatmapViewerProps {
  data: DataPoint[];        // Normalized data points
  config: HeatmapConfig;    // Visualization configuration
}
```

**Implementation Details**:
- Uses `useRef` to maintain map instance across renders
- Recreates heatmap layer when data or config changes
- Sets world bounds to prevent infinite panning
- Uses Esri World Imagery satellite tiles with CartoDB labels for clear geographic context

### FileUpload Component

**Purpose**: Handles file upload via drag-and-drop or file picker

**Key Features**:
- Drag-and-drop zone with visual feedback
- File type validation (CSV, JSON, NetCDF)
- Loading state during parsing
- Error handling with user-friendly messages

**Props**:
```typescript
interface FileUploadProps {
  onDataLoaded: (dataset: Dataset) => void;
}
```

**Implementation Details**:
- Uses native HTML5 drag-and-drop API
- Validates file extensions before parsing
- Displays loading spinner during processing
- Shows toast notifications for success/error

### ControlPanel Component

**Purpose**: Provides interactive controls for visualization parameters

**Key Features**:
- Three slider controls (radius, opacity, intensity)
- Real-time value display
- Dataset information display
- Glassmorphism design for modern aesthetic

**Props**:
```typescript
interface ControlPanelProps {
  dataset: Dataset | null;
  radius: number;
  opacity: number;
  intensity: number;
  onRadiusChange: (value: number) => void;
  onOpacityChange: (value: number) => void;
  onIntensityChange: (value: number) => void;
}
```

### ColorLegend Component

**Purpose**: Displays color scale with value range

**Key Features**:
- Dynamic gradient matching heatmap colors
- 5-step value labels
- Auto-calculated from dataset range
- Responsive positioning

**Props**:
```typescript
interface ColorLegendProps {
  dataset: Dataset | null;
}
```

## Data Processing Pipeline

### 1. File Upload
```
User selects file → FileUpload component → parseFile()
```

### 2. Format Detection
```
parseFile() → Detect extension → Route to specific parser
├── .csv → parseCSV()
├── .json → parseJSON()
└── .nc → parseNetCDF()
```

### 3. Column/Field Detection
```
Parser → Detect lat/lon columns → Detect value column
```

**Detection Patterns**:
- Latitude: `lat`, `latitude`, `y`, `lat_deg`
- Longitude: `lon`, `long`, `longitude`, `x`, `lon_deg`
- Value: First non-coordinate numeric field

### 4. Data Validation
```
For each row/object:
├── Parse numeric values
├── Validate coordinate ranges (-90≤lat≤90, -180≤lon≤180)
├── Filter out NaN/invalid values
└── Create DataPoint object
```

### 5. Dataset Creation
```
Valid points → Calculate value range → Create Dataset object
```

### 6. Normalization
```
Dataset → Normalize values (0-1) → Apply intensity multiplier
```

### 7. Visualization
```
Normalized data → HeatmapViewer → Leaflet.heat layer
```

## Type Definitions

### DataPoint
```typescript
interface DataPoint {
  lat: number;      // Latitude in decimal degrees
  lon: number;      // Longitude in decimal degrees
  value: number;    // Numeric value for heat intensity
}
```

### Dataset
```typescript
interface Dataset {
  name: string;                    // Original filename
  points: DataPoint[];             // Array of data points
  valueRange: {                    // Min/max for normalization
    min: number;
    max: number;
  };
  fields?: string[];               // Available value fields
  selectedField?: string;          // Currently selected field
}
```

### HeatmapConfig
```typescript
interface HeatmapConfig {
  radius: number;                  // Heat point radius (pixels)
  blur: number;                    // Blur amount (pixels)
  maxOpacity: number;              // Maximum opacity (0-1)
  minOpacity: number;              // Minimum opacity (0-1)
  gradient: Record<number, string>; // Color gradient stops
}
```

## Color System

### Design Tokens

The application uses a monochromatic color scheme with blue as the primary color:

**Light Mode**:
- Background: `hsl(220 60% 96%)`
- Primary: `hsl(210 100% 50%)` - Vibrant blue
- Secondary: `hsl(150 60% 50%)` - Teal accent
- Accent: `hsl(45 100% 55%)` - Yellow highlight

**Dark Mode**:
- Background: `hsl(225 50% 7%)` - Deep navy
- Primary: `hsl(210 100% 60%)` - Bright blue
- Secondary: `hsl(150 60% 50%)` - Teal accent
- Accent: `hsl(45 100% 60%)` - Yellow highlight

### Heatmap Gradient

The heatmap uses a 6-color gradient optimized for scientific visualization:

```typescript
gradient: {
  0.0: 'rgb(0, 0, 255)',      // Blue (minimum)
  0.2: 'rgb(0, 255, 255)',    // Cyan
  0.4: 'rgb(0, 255, 0)',      // Green
  0.6: 'rgb(255, 255, 0)',    // Yellow
  0.8: 'rgb(255, 165, 0)',    // Orange
  1.0: 'rgb(255, 0, 0)'       // Red (maximum)
}
```

## Performance Considerations

### Data Point Limits
- **Optimal**: 100-10,000 points
- **Maximum tested**: 50,000 points
- **Recommendation**: Sample large datasets before upload

### Rendering Optimization
- Leaflet.heat uses WebGL when available
- Canvas fallback for older browsers
- Heatmap layer recreated only when data/config changes
- Map instance persisted across renders

### Memory Management
- File parsing happens in chunks (PapaParse streaming)
- Data points validated during parsing (not stored then filtered)
- Unused layers removed before creating new ones

## Browser Compatibility

### Minimum Requirements
- ES6 module support
- Canvas API
- File API
- Drag and Drop API

### Tested Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Known Limitations
- NetCDF parsing may be slow on large files (>5MB)
- Very large datasets (>100k points) may cause performance issues
- Mobile browsers have limited zoom/pan performance

## API Reference

### parseFile(file: File): Promise<FileUploadResult>

Main entry point for file parsing.

**Parameters**:
- `file`: File object from input or drag-and-drop

**Returns**:
```typescript
interface FileUploadResult {
  success: boolean;
  data?: Dataset;
  error?: string;
}
```

### parseCSV(file: File): Promise<FileUploadResult>

Parses CSV files using PapaParse.

**Features**:
- Automatic header detection
- Dynamic typing
- Empty line skipping
- Column auto-detection

### parseJSON(file: File): Promise<FileUploadResult>

Parses JSON files using native JSON.parse.

**Requirements**:
- Must be an array of objects
- Each object must have lat/lon fields
- At least one numeric value field

### parseNetCDF(file: File): Promise<FileUploadResult>

Parses NetCDF files using netcdfjs.

**Features**:
- Variable auto-detection
- Multi-dimensional array handling
- Coordinate grid expansion

## Deployment

### Build Command
```bash
npm run build
```

### Output
- Static files in `dist/` directory
- No server-side rendering required
- Can be deployed to any static hosting service

### Environment Variables
None required - all processing is client-side

## Future Enhancements

### Planned Features
- Time-series animation for temporal datasets
- Multiple dataset comparison mode
- Export heatmap as PNG/GeoTIFF
- Custom color gradient editor
- 3D globe view with CesiumJS
- Advanced filtering and data transformation

### Performance Improvements
- Web Worker for file parsing
- Virtual scrolling for large datasets
- Progressive rendering for massive point clouds
- IndexedDB caching for frequently used datasets

## Contributing

### Code Style
- TypeScript strict mode enabled
- ESLint + Biome for linting
- 2-space indentation
- Functional components with hooks

### Testing
- Run `npm run lint` before committing
- Test with sample datasets
- Verify cross-browser compatibility

---

**Version**: 1.0.0  
**Last Updated**: December 2025
