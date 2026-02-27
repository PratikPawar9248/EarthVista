# Oceanographic Plots Guide

## Overview
This guide provides detailed information about the specialized oceanographic visualization tools available in the Geospatial Heatmap Visualization Platform.

## Available Oceanographic Plots

### 1. Depth Profile
**Purpose**: Visualize vertical structure of oceanographic parameters

**Description**:
- Shows how values change with depth
- Y-axis is reversed (depth increases downward)
- Line + markers visualization
- Ideal for CTD (Conductivity-Temperature-Depth) data

**Use Cases**:
- Temperature profiles
- Salinity profiles
- Dissolved oxygen profiles
- Nutrient concentration profiles

**Interpretation**:
- Look for thermocline (rapid temperature change)
- Identify mixed layer depth
- Spot stratification patterns
- Detect anomalies or inversions

---

### 2. T-S Diagram (Temperature-Salinity)
**Purpose**: Identify water masses and their characteristics

**Description**:
- Classic oceanographic plot
- X-axis: Salinity (PSU - Practical Salinity Units)
- Y-axis: Temperature (°C)
- Color: Depth or other parameter
- Each point represents a water sample

**Use Cases**:
- Water mass identification
- Mixing analysis
- Ocean circulation studies
- Climate change monitoring

**Interpretation**:
- Clusters indicate distinct water masses
- Linear patterns suggest mixing
- Curved patterns indicate non-conservative mixing
- Vertical spread shows stratification

---

### 3. Vertical Section (NEW)
**Purpose**: Visualize cross-sectional view of oceanographic data

**Description**:
- Shows depth vs horizontal distance
- Filled area plot
- Simulates transect across ocean
- Y-axis reversed (depth downward)

**Use Cases**:
- Transect analysis
- Front detection
- Upwelling/downwelling visualization
- Bathymetry profiles

**Interpretation**:
- Steep gradients indicate fronts
- Filled area shows water column structure
- Horizontal variations reveal spatial patterns
- Depth changes show topographic influence

**Technical Notes**:
- Data sorted by longitude
- Distance calculated as 10 km per data point
- Negative values represent depth

---

### 4. Hovmöller Diagram (NEW)
**Purpose**: Visualize spatial evolution and patterns

**Description**:
- 2D heatmap showing latitude vs longitude
- Grid-based averaging (30x30 bins)
- Color represents value intensity
- Shows spatial distribution patterns

**Use Cases**:
- Spatial pattern identification
- Regional analysis
- Gradient detection
- Coverage assessment

**Interpretation**:
- Hot colors: High values
- Cold colors: Low values
- Gradients show transition zones
- Patterns reveal oceanographic features

**Technical Notes**:
- Automatic gridding with 30x30 resolution
- Nearest-neighbor averaging
- Handles irregular data spacing
- Jet colorscale for maximum contrast

---

### 5. T-S Diagram with Density Contours (NEW)
**Purpose**: Enhanced water mass analysis with density information

**Description**:
- Traditional T-S diagram
- Overlaid with potential density contours (σ_t)
- Density isolines from σ_t = 20 to 30
- Gray dashed lines for density
- Colored markers for data points

**Use Cases**:
- Precise water mass identification
- Density-driven circulation analysis
- Mixing ratio calculations
- Stability assessment

**Interpretation**:
- Points along density lines: isopycnal mixing
- Points crossing density lines: diapycnal mixing
- Density gradient indicates stability
- Clustering shows water mass properties

**Technical Notes**:
- Simplified density calculation: σ_t ≈ -0.2T + 0.8S - 28
- Contours at 2 kg/m³ intervals
- Full oceanographic equation available for enhancement
- Legend shows all density lines

**Oceanographic Significance**:
- σ_t < 24: Surface/warm water
- σ_t 24-27: Intermediate water
- σ_t > 27: Deep/dense water

---

### 6. Water Mass Analysis (NEW)
**Purpose**: Classify and visualize different water masses

**Description**:
- Multi-parameter classification
- Three water mass categories:
  - Surface Water (top 20% of values)
  - Intermediate Water (middle 40%)
  - Deep Water (bottom 40%)
- Color-coded by water mass type
- Spatial distribution on lat-lon plot

**Use Cases**:
- Water mass distribution mapping
- Circulation pattern identification
- Frontal zone detection
- Ecosystem habitat mapping

**Interpretation**:
- **Orange (Surface Water)**: Warm, less dense, high biological activity
- **Cyan (Intermediate Water)**: Transition zone, mixing region
- **Blue (Deep Water)**: Cold, dense, slow circulation

**Technical Notes**:
- Automatic classification based on value ranges
- Adaptive thresholds
- Spatial clustering visible
- Interactive legend

**Applications**:
- Fisheries: Identify productive zones
- Climate: Track water mass changes
- Navigation: Understand current patterns
- Research: Study ocean dynamics

---

### 7. Stratification Profile (NEW)
**Purpose**: Analyze vertical stability and mixed layer structure

**Description**:
- Dual-axis plot
- Left axis: Value profile (temperature, salinity, etc.)
- Right axis: Stratification index (gradient)
- Shows both absolute values and their vertical changes

**Use Cases**:
- Mixed layer depth determination
- Stability analysis
- Vertical mixing assessment
- Seasonal thermocline tracking

**Interpretation**:
- **Value Profile (solid line)**:
  - Shows vertical distribution
  - Depth increases downward
  - Markers indicate data points

- **Stratification Index (dashed line)**:
  - Positive: Stable stratification
  - Near zero: Well-mixed layer
  - Negative: Unstable (rare)
  - Large values: Strong stratification

**Key Features to Identify**:
1. **Mixed Layer**: Near-zero stratification index at surface
2. **Thermocline/Halocline**: Peak in stratification index
3. **Deep Layer**: Low stratification index below thermocline

**Technical Notes**:
- Stratification index = dValue/dDepth
- Simplified calculation for demonstration
- Can be enhanced with Brunt-Väisälä frequency
- Dual x-axis for simultaneous viewing

**Oceanographic Significance**:
- Strong stratification inhibits vertical mixing
- Weak stratification allows nutrient transport
- Seasonal variations in mixed layer depth
- Climate change affects stratification patterns

---

## Comparison Table

| Plot Type | Dimensions | Best For | Complexity | Oceanographic Use |
|-----------|------------|----------|------------|-------------------|
| Depth Profile | 2D | Vertical structure | Low | CTD analysis |
| T-S Diagram | 2D | Water masses | Medium | Water mass ID |
| Vertical Section | 2D | Cross-sections | Medium | Transects |
| Hovmöller | 2D | Spatial patterns | Medium | Regional analysis |
| T-S + Density | 2D | Advanced water mass | High | Mixing studies |
| Water Mass Analysis | 2D | Classification | Medium | Distribution mapping |
| Stratification | 2D (dual-axis) | Stability | High | Mixed layer analysis |

## Data Requirements

### Minimum Requirements
- At least 10 data points for meaningful analysis
- Valid latitude (-90 to 90°)
- Valid longitude (-180 to 180°)
- Numeric values (temperature, salinity, depth, etc.)

### Optimal Data
- **Depth Profile**: 20-100 points, evenly spaced in depth
- **T-S Diagram**: 50-500 points, covering depth range
- **Vertical Section**: 30-200 points along transect
- **Hovmöller**: 100-10,000 points for good coverage
- **T-S + Density**: 50-500 points, wide T-S range
- **Water Mass**: 100-1,000 points for classification
- **Stratification**: 20-100 points, high vertical resolution

## Workflow Examples

### Example 1: CTD Cast Analysis
1. Upload CTD data (lat, lon, temperature/salinity/depth)
2. Start with **Depth Profile** to see vertical structure
3. Use **Stratification Profile** to identify mixed layer
4. Switch to **T-S Diagram** to identify water masses
5. Use **T-S + Density** for detailed analysis

### Example 2: Transect Study
1. Upload transect data
2. Use **Vertical Section** to see cross-section
3. Use **Hovmöller Diagram** for spatial overview
4. Use **Water Mass Analysis** to classify regions
5. Export plots for publication

### Example 3: Regional Survey
1. Upload regional survey data
2. Use **Hovmöller Diagram** for spatial patterns
3. Use **Water Mass Analysis** for classification
4. Use **T-S + Density** for water mass properties
5. Use **Stratification Profile** for stability assessment

## Tips for Best Results

### Data Preparation
- Ensure consistent units (°C, PSU, meters)
- Remove obvious outliers
- Check for missing values
- Verify coordinate system

### Plot Selection
- **For vertical analysis**: Depth Profile, Stratification
- **For water mass ID**: T-S Diagram, T-S + Density
- **For spatial patterns**: Hovmöller, Water Mass Analysis
- **For transects**: Vertical Section

### Interpretation
- Compare multiple plots for comprehensive analysis
- Look for patterns and anomalies
- Consider oceanographic context
- Cross-reference with known water masses

## Advanced Features

### Interactive Controls
All plots support:
- **Zoom**: Mouse wheel or pinch
- **Pan**: Click and drag
- **Hover**: Detailed tooltips
- **Reset**: Double-click
- **Export**: PNG, SVG formats

### Customization
- Automatic color scaling
- ISRO color scheme integration
- Responsive design
- High-resolution export

## Oceanographic Parameters

### Common Parameters
- **Temperature (T)**: °C or K
- **Salinity (S)**: PSU (Practical Salinity Units)
- **Depth (D)**: meters (positive down)
- **Density (ρ)**: kg/m³ or σ_t
- **Dissolved Oxygen (DO)**: mg/L or μmol/kg
- **Nutrients**: μmol/L

### Derived Parameters
- **Potential Temperature (θ)**: Temperature corrected for pressure
- **Potential Density (σ_θ)**: Density at reference pressure
- **Brunt-Väisälä Frequency (N²)**: Stratification strength
- **Mixed Layer Depth (MLD)**: Depth of surface mixed layer

## References

### Oceanographic Concepts
- **Water Masses**: Large bodies of water with distinct T-S properties
- **Stratification**: Vertical layering due to density differences
- **Mixing**: Process combining different water masses
- **Fronts**: Boundaries between water masses

### Standard Practices
- UNESCO Equation of State for seawater
- TEOS-10 (Thermodynamic Equation of Seawater)
- Standard oceanographic conventions
- Quality control procedures

## Troubleshooting

### Plot Not Showing Expected Pattern
- Check data units and ranges
- Verify coordinate system
- Ensure sufficient data points
- Review data quality

### Density Contours Look Wrong
- Current implementation uses simplified equation
- For precise work, use full EOS-80 or TEOS-10
- Consider pressure effects for deep water

### Water Mass Classification Unclear
- May need more data points
- Check value range distribution
- Consider using T-S + Density for better insight

## Future Enhancements

Potential additions:
- Real density calculations (EOS-80, TEOS-10)
- Brunt-Väisälä frequency calculation
- Mixed layer depth algorithms
- Oxygen-temperature plots
- Nutrient-salinity relationships
- Time-series animations
- Multi-parameter clustering

## Version History

- **v1.8.0**: Added 5 advanced oceanographic plots
- **v1.7.0**: Initial oceanographic plots (Depth Profile, T-S Diagram)

## Support

For oceanographic-specific questions:
1. Review this guide
2. Check USAGE_GUIDE.md for general instructions
3. Consult oceanographic textbooks for theory
4. Verify data format and units

## Conclusion

These oceanographic visualization tools provide comprehensive analysis capabilities for marine science research, education, and operational oceanography. The combination of traditional plots (T-S diagrams) with modern visualizations (Hovmöller, Water Mass Analysis) enables both classical and contemporary oceanographic analysis.

**Happy Ocean Exploring! 🌊**
