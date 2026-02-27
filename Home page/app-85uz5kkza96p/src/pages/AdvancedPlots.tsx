import { useState, useMemo } from 'react';
import { useDataset } from '@/contexts/DatasetContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, BarChart3, LineChart, ScatterChart, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Plot from 'react-plotly.js';
import { useNavigate } from 'react-router-dom';
import AIFloatingButton from '@/components/ai/AIFloatingButton';

type PlotType = 
  | '2d-scatter'
  | '2d-line'
  | '3d-scatter'
  | 'heatmap'
  | 'contour'
  | 'histogram'
  | 'box'
  | 'violin'
  | 'density-heatmap'
  | 'profile'
  | 'vertical-section'
  | 'hovmoller'
  | 'ts-density'
  | 'water-mass'
  | 'stratification';

interface PlotOption {
  value: PlotType;
  label: string;
  description: string;
  icon: typeof BarChart3;
}

const plotOptions: PlotOption[] = [
  {
    value: '2d-scatter',
    label: '2D Scatter Plot',
    description: 'Scatter plot of lat/lon vs value',
    icon: ScatterChart,
  },
  {
    value: '2d-line',
    label: '2D Line Plot',
    description: 'Line plot for sequential data',
    icon: LineChart,
  },
  {
    value: '3d-scatter',
    label: '3D Scatter Plot',
    description: '3D visualization (lat, lon, value)',
    icon: BarChart3,
  },
  {
    value: 'heatmap',
    label: 'Heatmap Grid',
    description: 'Grid-based heatmap visualization',
    icon: BarChart3,
  },
  {
    value: 'contour',
    label: 'Contour Plot',
    description: 'Contour lines for spatial data',
    icon: LineChart,
  },
  {
    value: 'histogram',
    label: 'Histogram',
    description: 'Distribution of values',
    icon: BarChart3,
  },
  {
    value: 'box',
    label: 'Box Plot',
    description: 'Statistical distribution summary',
    icon: BarChart3,
  },
  {
    value: 'violin',
    label: 'Violin Plot',
    description: 'Distribution density visualization',
    icon: BarChart3,
  },
  {
    value: 'density-heatmap',
    label: 'Density Heatmap',
    description: '2D density distribution',
    icon: BarChart3,
  },
  {
    value: 'profile',
    label: 'Depth Profile',
    description: 'Vertical profile plot (oceanographic)',
    icon: LineChart,
  },
  {
    value: 'vertical-section',
    label: 'Vertical Section',
    description: 'Cross-section showing depth vs distance',
    icon: BarChart3,
  },
  {
    value: 'hovmoller',
    label: 'Hovmöller Diagram',
    description: 'Time-latitude or spatial evolution plot',
    icon: TrendingUp,
  },
  {
    value: 'ts-density',
    label: 'T-S with Density Contours',
    description: 'Enhanced T-S diagram with density lines',
    icon: ScatterChart,
  },
  {
    value: 'water-mass',
    label: 'Water Mass Analysis',
    description: 'Multi-parameter water mass identification',
    icon: BarChart3,
  },
  {
    value: 'stratification',
    label: 'Stratification Profile',
    description: 'Vertical stability and mixed layer analysis',
    icon: LineChart,
  },
];

export default function AdvancedPlots() {
  const { dataset } = useDataset();
  const navigate = useNavigate();
  const [selectedPlot, setSelectedPlot] = useState<PlotType>('2d-scatter');

  const plotData = useMemo(() => {
    if (!dataset) return null;

    const { points } = dataset;
    const lats = points.map(p => p.lat);
    const lons = points.map(p => p.lon);
    const values = points.map(p => p.value);

    switch (selectedPlot) {
      case '2d-scatter':
        return {
          data: [
            {
              x: lons,
              y: lats,
              mode: 'markers',
              type: 'scatter',
              marker: {
                size: 6,
                color: values,
                colorscale: 'Jet',
                showscale: true,
                colorbar: { title: 'Value' },
              },
              text: values.map(v => `Value: ${v.toFixed(2)}`),
              hovertemplate: 'Lon: %{x}<br>Lat: %{y}<br>%{text}<extra></extra>',
            },
          ],
          layout: {
            title: '2D Scatter Plot (Longitude vs Latitude)',
            xaxis: { title: 'Longitude (°)' },
            yaxis: { title: 'Latitude (°)' },
            hovermode: 'closest' as const,
          },
        };

      case '2d-line':
        return {
          data: [
            {
              x: Array.from({ length: points.length }, (_, i) => i),
              y: values,
              mode: 'lines+markers',
              type: 'scatter',
              line: { color: '#FF6B35', width: 2 },
              marker: { size: 4, color: '#0B3D91' },
            },
          ],
          layout: {
            title: '2D Line Plot (Sequential Data)',
            xaxis: { title: 'Data Point Index' },
            yaxis: { title: 'Value' },
          },
        };

      case '3d-scatter':
        return {
          data: [
            {
              x: lons,
              y: lats,
              z: values,
              mode: 'markers',
              type: 'scatter3d',
              marker: {
                size: 4,
                color: values,
                colorscale: 'Jet',
                showscale: true,
                colorbar: { title: 'Value' },
              },
              text: values.map(v => `Value: ${v.toFixed(2)}`),
              hovertemplate: 'Lon: %{x}<br>Lat: %{y}<br>Value: %{z}<extra></extra>',
            },
          ],
          layout: {
            title: '3D Scatter Plot',
            scene: {
              xaxis: { title: 'Longitude (°)' },
              yaxis: { title: 'Latitude (°)' },
              zaxis: { title: 'Value' },
            },
          },
        };

      case 'heatmap':
        // Create grid for heatmap
        const latBins = 50;
        const lonBins = 50;
        const latRange = [Math.min(...lats), Math.max(...lats)];
        const lonRange = [Math.min(...lons), Math.max(...lons)];
        const latStep = (latRange[1] - latRange[0]) / latBins;
        const lonStep = (lonRange[1] - lonRange[0]) / lonBins;
        
        const heatmapGrid: number[][] = Array(latBins).fill(0).map(() => Array(lonBins).fill(0));
        const countGrid: number[][] = Array(latBins).fill(0).map(() => Array(lonBins).fill(0));
        
        points.forEach(p => {
          const latIdx = Math.min(Math.floor((p.lat - latRange[0]) / latStep), latBins - 1);
          const lonIdx = Math.min(Math.floor((p.lon - lonRange[0]) / lonStep), lonBins - 1);
          heatmapGrid[latIdx][lonIdx] += p.value;
          countGrid[latIdx][lonIdx]++;
        });
        
        // Average values in each bin
        for (let i = 0; i < latBins; i++) {
          for (let j = 0; j < lonBins; j++) {
            if (countGrid[i][j] > 0) {
              heatmapGrid[i][j] /= countGrid[i][j];
            }
          }
        }

        return {
          data: [
            {
              z: heatmapGrid,
              type: 'heatmap',
              colorscale: 'Jet',
              showscale: true,
              colorbar: { title: 'Value' },
            },
          ],
          layout: {
            title: 'Heatmap Grid',
            xaxis: { title: 'Longitude Bins' },
            yaxis: { title: 'Latitude Bins' },
          },
        };

      case 'contour':
        return {
          data: [
            {
              x: lons,
              y: lats,
              z: values,
              type: 'contour',
              colorscale: 'Jet',
              showscale: true,
              colorbar: { title: 'Value' },
              contours: {
                showlabels: true,
                labelfont: { size: 10, color: 'white' },
              },
            },
          ],
          layout: {
            title: 'Contour Plot',
            xaxis: { title: 'Longitude (°)' },
            yaxis: { title: 'Latitude (°)' },
          },
        };

      case 'histogram':
        return {
          data: [
            {
              x: values,
              type: 'histogram',
              marker: { color: '#FF6B35' },
              nbinsx: 50,
            },
          ],
          layout: {
            title: 'Histogram (Value Distribution)',
            xaxis: { title: 'Value' },
            yaxis: { title: 'Frequency' },
          },
        };

      case 'box':
        return {
          data: [
            {
              y: values,
              type: 'box',
              name: 'Values',
              marker: { color: '#0B3D91' },
              boxmean: 'sd',
            },
          ],
          layout: {
            title: 'Box Plot (Statistical Summary)',
            yaxis: { title: 'Value' },
          },
        };

      case 'violin':
        return {
          data: [
            {
              y: values,
              type: 'violin',
              name: 'Values',
              marker: { color: '#FF6B35' },
              box: { visible: true },
              meanline: { visible: true },
            },
          ],
          layout: {
            title: 'Violin Plot (Distribution Density)',
            yaxis: { title: 'Value' },
          },
        };

      case 'density-heatmap':
        return {
          data: [
            {
              x: lons,
              y: lats,
              type: 'histogram2d',
              colorscale: 'Jet',
              showscale: true,
              colorbar: { title: 'Density' },
            },
          ],
          layout: {
            title: '2D Density Heatmap',
            xaxis: { title: 'Longitude (°)' },
            yaxis: { title: 'Latitude (°)' },
          },
        };

      case 'profile':
        // Depth profile (assuming value represents depth or vertical measurement)
        const sortedByValue = [...points].sort((a, b) => a.value - b.value);
        return {
          data: [
            {
              x: sortedByValue.map(p => p.value),
              y: sortedByValue.map((_, i) => i),
              mode: 'lines+markers',
              type: 'scatter',
              line: { color: '#0B3D91', width: 2 },
              marker: { size: 4, color: '#FF6B35' },
            },
          ],
          layout: {
            title: 'Depth Profile',
            xaxis: { title: 'Value (e.g., Temperature, Salinity)' },
            yaxis: { title: 'Depth Index', autorange: 'reversed' as const },
          },
        };

      case 'vertical-section':
        // Vertical section: cross-section showing depth vs distance
        const sortedByLon = [...points].sort((a, b) => a.lon - b.lon);
        const distances = sortedByLon.map((_, i) => i * 10); // Simulated distance in km
        return {
          data: [
            {
              x: distances,
              y: sortedByLon.map(p => -p.value), // Negative for depth
              mode: 'lines+markers',
              type: 'scatter',
              fill: 'tozeroy',
              line: { color: '#0B3D91', width: 2 },
              marker: { size: 4, color: '#FF6B35' },
              name: 'Vertical Section',
            },
          ],
          layout: {
            title: 'Vertical Section (Cross-section)',
            xaxis: { title: 'Distance (km)' },
            yaxis: { title: 'Depth (m)', autorange: 'reversed' as const },
          },
        };

      case 'hovmoller':
        // Hovmöller diagram: time-latitude or spatial evolution
        // Create a grid for hovmöller visualization
        const hovLatBins = 30;
        const hovLonBins = 30;
        const hovLatRange = [Math.min(...lats), Math.max(...lats)];
        const hovLonRange = [Math.min(...lons), Math.max(...lons)];
        
        const hovmollerZ: number[][] = [];
        const hovmollerX: number[] = [];
        const hovmollerY: number[] = [];
        
        for (let i = 0; i < hovLatBins; i++) {
          const lat = hovLatRange[0] + (i / hovLatBins) * (hovLatRange[1] - hovLatRange[0]);
          hovmollerY.push(lat);
          const row: number[] = [];
          
          for (let j = 0; j < hovLonBins; j++) {
            const lon = hovLonRange[0] + (j / hovLonBins) * (hovLonRange[1] - hovLonRange[0]);
            if (i === 0) hovmollerX.push(lon);
            
            // Find nearest points and average
            const nearbyPoints = points.filter(p => 
              Math.abs(p.lat - lat) < (hovLatRange[1] - hovLatRange[0]) / hovLatBins &&
              Math.abs(p.lon - lon) < (hovLonRange[1] - hovLonRange[0]) / hovLonBins
            );
            
            const avgValue = nearbyPoints.length > 0
              ? nearbyPoints.reduce((sum, p) => sum + p.value, 0) / nearbyPoints.length
              : 0;
            
            row.push(avgValue);
          }
          hovmollerZ.push(row);
        }
        
        return {
          data: [
            {
              x: hovmollerX,
              y: hovmollerY,
              z: hovmollerZ,
              type: 'heatmap',
              colorscale: 'Jet',
              colorbar: { title: 'Value' },
            },
          ],
          layout: {
            title: 'Hovmöller Diagram (Spatial Evolution)',
            xaxis: { title: 'Longitude (°)' },
            yaxis: { title: 'Latitude (°)' },
          },
        };

      case 'ts-density':
        // T-S diagram with density contours
        // Calculate potential density (simplified)
        const densityContours = [];
        for (let sigma = 20; sigma <= 30; sigma += 2) {
          const contourPoints = [];
          for (let s = Math.min(...lons); s <= Math.max(...lons); s += 0.5) {
            // Simplified density calculation: σ_t ≈ -0.2 * T + 0.8 * S - 28
            const t = (sigma + 28 - 0.8 * s) / 0.2;
            contourPoints.push({ x: s, y: t });
          }
          densityContours.push({
            x: contourPoints.map(p => p.x),
            y: contourPoints.map(p => p.y),
            mode: 'lines',
            type: 'scatter',
            line: { color: 'rgba(128, 128, 128, 0.5)', width: 1, dash: 'dash' },
            name: `σ_t = ${sigma}`,
            showlegend: true,
          });
        }
        
        return {
          data: [
            ...densityContours,
            {
              x: lons,
              y: lats,
              mode: 'markers',
              type: 'scatter',
              marker: {
                size: 8,
                color: values,
                colorscale: 'Jet',
                showscale: true,
                colorbar: { title: 'Depth (m)' },
              },
              name: 'Data Points',
              text: values.map(v => `Depth: ${v.toFixed(2)} m`),
              hovertemplate: 'S: %{x:.2f} PSU<br>T: %{y:.2f} °C<br>%{text}<extra></extra>',
            },
          ],
          layout: {
            title: 'T-S Diagram with Density Contours',
            xaxis: { title: 'Salinity (PSU)', range: [Math.min(...lons) - 1, Math.max(...lons) + 1] },
            yaxis: { title: 'Temperature (°C)', range: [Math.min(...lats) - 2, Math.max(...lats) + 2] },
            showlegend: true,
          },
        };

      case 'water-mass':
        // Water mass analysis: multi-parameter visualization
        // Group data by value ranges to identify water masses
        const waterMasses = [
          { name: 'Surface Water', range: [Math.max(...values) * 0.8, Math.max(...values)], color: '#FF6B35' },
          { name: 'Intermediate Water', range: [Math.max(...values) * 0.4, Math.max(...values) * 0.8], color: '#4ECDC4' },
          { name: 'Deep Water', range: [Math.min(...values), Math.max(...values) * 0.4], color: '#0B3D91' },
        ];
        
        const waterMassTraces = waterMasses.map(wm => {
          const filtered = points.filter(p => p.value >= wm.range[0] && p.value < wm.range[1]);
          return {
            x: filtered.map(p => p.lon),
            y: filtered.map(p => p.lat),
            mode: 'markers',
            type: 'scatter',
            marker: {
              size: 8,
              color: wm.color,
              opacity: 0.7,
            },
            name: wm.name,
            text: filtered.map(p => `Value: ${p.value.toFixed(2)}`),
            hovertemplate: 'Lon: %{x}<br>Lat: %{y}<br>%{text}<extra></extra>',
          };
        });
        
        return {
          data: waterMassTraces,
          layout: {
            title: 'Water Mass Analysis',
            xaxis: { title: 'Longitude (°)' },
            yaxis: { title: 'Latitude (°)' },
            showlegend: true,
          },
        };

      case 'stratification':
        // Stratification profile: vertical stability analysis
        const sortedByValueDesc = [...points].sort((a, b) => b.value - a.value);
        const depthIndices = sortedByValueDesc.map((_, i) => i);
        const stratValues = sortedByValueDesc.map(p => p.value);
        
        // Calculate stratification index (simplified: gradient of value with depth)
        const stratIndex = stratValues.map((v, i) => {
          if (i === 0) return 0;
          return (stratValues[i - 1] - v) / 1; // Change per unit depth
        });
        
        return {
          data: [
            {
              x: stratValues,
              y: depthIndices,
              mode: 'lines+markers',
              type: 'scatter',
              line: { color: '#0B3D91', width: 2 },
              marker: { size: 4, color: '#FF6B35' },
              name: 'Value Profile',
              yaxis: 'y',
            },
            {
              x: stratIndex,
              y: depthIndices,
              mode: 'lines',
              type: 'scatter',
              line: { color: '#4ECDC4', width: 2, dash: 'dash' },
              name: 'Stratification Index',
              yaxis: 'y',
              xaxis: 'x2',
            },
          ],
          layout: {
            title: 'Stratification Profile',
            xaxis: { title: 'Value', domain: [0, 0.6] },
            xaxis2: { title: 'Stratification Index', domain: [0.65, 1], anchor: 'y' as const },
            yaxis: { title: 'Depth Index', autorange: 'reversed' as const },
            showlegend: true,
          },
        };

      default:
        return null;
    }
  }, [dataset, selectedPlot]);

  if (!dataset) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Dataset Loaded</AlertTitle>
            <AlertDescription>
              Please upload a dataset from the Dashboard first.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Advanced Data Visualization</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Explore your dataset with multiple plot types
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar - Plot Selection */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plot Types</CardTitle>
                <CardDescription>
                  Select a visualization type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plot-type">Visualization</Label>
                  <Select value={selectedPlot} onValueChange={(value) => setSelectedPlot(value as PlotType)}>
                    <SelectTrigger id="plot-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2d-scatter">2D Scatter Plot</SelectItem>
                      <SelectItem value="2d-line">2D Line Plot</SelectItem>
                      <SelectItem value="3d-scatter">3D Scatter Plot</SelectItem>
                      <SelectItem value="heatmap">Heatmap Grid</SelectItem>
                      <SelectItem value="contour">Contour Plot</SelectItem>
                      <SelectItem value="histogram">Histogram</SelectItem>
                      <SelectItem value="box">Box Plot</SelectItem>
                      <SelectItem value="violin">Violin Plot</SelectItem>
                      <SelectItem value="density-heatmap">Density Heatmap</SelectItem>
                      <SelectItem value="profile">Depth Profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plot Description */}
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {plotOptions.find(opt => opt.value === selectedPlot)?.description}
                  </p>
                </div>

                {/* Dataset Info */}
                <div className="pt-4 border-t space-y-2">
                  <h3 className="text-sm font-medium">Dataset Info</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{dataset.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points:</span>
                      <span className="font-medium">{dataset.points.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Value:</span>
                      <span className="font-medium">{dataset.valueRange.min.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Value:</span>
                      <span className="font-medium">{dataset.valueRange.max.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Plot Area */}
          <div className="xl:col-span-3">
            <Card>
              <CardContent className="p-6">
                {plotData && (
                  <Plot
                    data={plotData.data as Plotly.Data[]}
                    layout={{
                      ...plotData.layout,
                      autosize: true,
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { family: 'inherit' },
                    }}
                    config={{
                      responsive: true,
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                    }}
                    style={{ width: '100%', height: '600px' }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Floating Action Button */}
      <AIFloatingButton />
    </div>
  );
}
