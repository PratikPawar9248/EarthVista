import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, LineChart, Map, Box, TrendingUp, Activity, 
  Waves, Wind, Thermometer, Droplets, Leaf, Globe,
  Satellite, Clock, BarChart2, ScatterChart
} from 'lucide-react';

// Enhanced chart components
import ScatterPlot from './charts/ScatterPlot';
import LinePlot from './charts/LinePlot';
import MapVisualization from './charts/MapVisualization';
import VerticalProfile from './charts/VerticalProfile';
import Plot3D from './charts/Plot3D';
import TimeSeriesPlot from './charts/TimeSeriesPlot';
import ContourPlot from './charts/ContourPlot';
import VectorPlot from './charts/VectorPlot';
import HistogramPlot from './charts/HistogramPlot';

interface OceanData {
  id: string;
  latitude: number;
  longitude: number;
  depth?: number;
  temperature?: number;
  salinity?: number;
  chlorophyll?: number;
  timestamp?: string;
  [key: string]: any;
}

interface EnhancedVisualizationPanelProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
  defaultView?: string;
}

const EnhancedVisualizationPanel: React.FC<EnhancedVisualizationPanelProps> = ({ 
  data, 
  onLocationSelect, 
  defaultView = 'scatter' 
}) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [selectedParameter2, setSelectedParameter2] = useState<string>('salinity');
  const [activeView, setActiveView] = useState(defaultView);
  const [plotCategory, setPlotCategory] = useState<string>('basic');

  const availableParameters = useMemo(() => {
    if (data.length === 0) return [];
    
    const sample = data[0];
    return Object.keys(sample).filter(key => 
      !['id', 'latitude', 'longitude', 'timestamp'].includes(key) &&
      data.some(d => d[key] !== undefined && d[key] !== null && typeof d[key] === 'number')
    );
  }, [data]);

  const getParameterInfo = (param: string) => {
    const paramInfo: { [key: string]: { unit: string, icon: any, category: string, description: string } } = {
      // Physical Oceanography
      temperature: { unit: '°C', icon: Thermometer, category: 'Physical', description: 'Sea Surface Temperature' },
      salinity: { unit: 'PSU', icon: Droplets, category: 'Physical', description: 'Practical Salinity Units' },
      wind_speed: { unit: 'm/s', icon: Wind, category: 'Physical', description: 'Wind Speed' },
      wind_direction: { unit: '°', icon: Wind, category: 'Physical', description: 'Wind Direction' },
      wave_height: { unit: 'm', icon: Waves, category: 'Physical', description: 'Significant Wave Height' },
      sea_level: { unit: 'm', icon: Activity, category: 'Physical', description: 'Sea Surface Height' },
      current_speed: { unit: 'm/s', icon: Activity, category: 'Physical', description: 'Current Velocity' },
      current_direction: { unit: '°', icon: Activity, category: 'Physical', description: 'Current Direction' },
      density: { unit: 'kg/m³', icon: Activity, category: 'Physical', description: 'Water Density' },
      
      // Chemical Oceanography
      dissolved_oxygen: { unit: 'mg/L', icon: Activity, category: 'Chemical', description: 'Dissolved Oxygen' },
      ph: { unit: '', icon: Activity, category: 'Chemical', description: 'pH Value' },
      alkalinity: { unit: 'μmol/kg', icon: Activity, category: 'Chemical', description: 'Total Alkalinity' },
      nitrate: { unit: 'μmol/L', icon: Activity, category: 'Chemical', description: 'Nitrate Concentration' },
      phosphate: { unit: 'μmol/L', icon: Activity, category: 'Chemical', description: 'Phosphate Concentration' },
      silicate: { unit: 'μmol/L', icon: Activity, category: 'Chemical', description: 'Silicate Concentration' },
      
      // Biological Oceanography
      chlorophyll: { unit: 'mg/m³', icon: Leaf, category: 'Biological', description: 'Chlorophyll-a Concentration' },
      primary_productivity: { unit: 'mg C/m²/day', icon: Leaf, category: 'Biological', description: 'Primary Productivity' },
      
      // Geological
      depth: { unit: 'm', icon: Activity, category: 'Geological', description: 'Water Depth' },
      bathymetry: { unit: 'm', icon: Activity, category: 'Geological', description: 'Seafloor Depth' },
      
      // Default
      default: { unit: '', icon: Activity, category: 'Other', description: 'Parameter' }
    };
    
    return paramInfo[param] || paramInfo.default;
  };

  const filteredData = useMemo(() => {
    return data.filter(d => 
      d.latitude !== undefined && 
      d.longitude !== undefined &&
      d[selectedParameter] !== undefined &&
      d[selectedParameter] !== null
    );
  }, [data, selectedParameter]);

  const plotCategories = {
    basic: {
      name: '1D & 2D Plots',
      icon: BarChart2,
      plots: ['histogram', 'scatter', 'line']
    },
    spatial: {
      name: '3D & Spatial',
      icon: Box,
      plots: ['3d', 'map', 'contour']
    },
    temporal: {
      name: 'Time Series',
      icon: Clock,
      plots: ['timeseries', 'profile']
    },
    specialized: {
      name: 'Oceanographic',
      icon: Waves,
      plots: ['vector', 'profile', 'contour']
    },
    remote_sensing: {
      name: 'Remote Sensing',
      icon: Satellite,
      plots: ['map', 'contour', 'timeseries']
    },
    interactive: {
      name: 'Interactive',
      icon: Activity,
      plots: ['3d', 'map', 'scatter']
    }
  };

  if (data.length === 0) {
    return (
      <Card className="ocean-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Data Available</h3>
            <p className="text-sm text-muted-foreground">Upload oceanographic data to start visualizing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const paramInfo = getParameterInfo(selectedParameter);
  const IconComponent = paramInfo.icon;

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconComponent className="w-5 h-5 text-primary" />
              <span>Advanced Visualization Controls</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredData.length} data points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plot Category */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Plot Category
              </label>
              <Select value={plotCategory} onValueChange={setPlotCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(plotCategories).map(([key, category]) => {
                    const CategoryIcon = category.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="w-4 h-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Primary Parameter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Primary Parameter
              </label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  {availableParameters.map(param => {
                    const info = getParameterInfo(param);
                    return (
                      <SelectItem key={param} value={param}>
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">{param.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {info.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Parameter (for correlation plots) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Secondary Parameter
              </label>
              <Select value={selectedParameter2} onValueChange={setSelectedParameter2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  {availableParameters.filter(p => p !== selectedParameter).map(param => {
                    const info = getParameterInfo(param);
                    return (
                      <SelectItem key={param} value={param}>
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">{param.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {info.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parameter Info */}
          <div className="p-3 bg-secondary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <IconComponent className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-semibold">{paramInfo.description}</h4>
                <p className="text-sm text-muted-foreground">
                  Category: {paramInfo.category} • Unit: {paramInfo.unit || 'Dimensionless'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Visualization Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-secondary/50">
          <TabsTrigger value="histogram" className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4" />
            <span>Histogram</span>
          </TabsTrigger>
          <TabsTrigger value="scatter" className="flex items-center space-x-2">
            <ScatterChart className="w-4 h-4" />
            <span>Scatter</span>
          </TabsTrigger>
          <TabsTrigger value="line" className="flex items-center space-x-2">
            <LineChart className="w-4 h-4" />
            <span>Line Plot</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map className="w-4 h-4" />
            <span>Map</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="3d" className="flex items-center space-x-2">
            <Box className="w-4 h-4" />
            <span>3D Plot</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="histogram" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>Distribution Analysis - {paramInfo.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramPlot 
                data={filteredData} 
                parameter={selectedParameter}
                onPointClick={onLocationSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>Scatter Plot - {paramInfo.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScatterPlot 
                data={filteredData} 
                parameter={selectedParameter}
                onPointClick={onLocationSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>Line Plot - {paramInfo.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <LinePlot 
                data={filteredData} 
                parameter={selectedParameter}
                onPointClick={onLocationSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>Geographic Distribution - {paramInfo.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <MapVisualization 
                data={filteredData} 
                parameter={selectedParameter}
                onLocationSelect={onLocationSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>Vertical Profile - {paramInfo.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <VerticalProfile 
                data={filteredData} 
                parameter={selectedParameter}
                onPointClick={onLocationSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3d" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>3D Visualization - {paramInfo.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <Plot3D 
                data={filteredData} 
                parameter={selectedParameter}
                onPointClick={onLocationSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedVisualizationPanel;