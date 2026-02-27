import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, Map, Box, TrendingUp, BarChart2 } from 'lucide-react';

// Chart components
import ScatterPlot from './charts/ScatterPlot';
import LinePlot from './charts/LinePlot';
import MapVisualization from './charts/MapVisualization';
import VerticalProfile from './charts/VerticalProfile';
import Plot3D from './charts/Plot3D';
import BoxPlot from './charts/BoxPlot';

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

interface VisualizationPanelProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
  defaultView?: string;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ 
  data, 
  onLocationSelect, 
  defaultView = 'scatter' 
}) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [activeView, setActiveView] = useState(defaultView);

  const availableParameters = useMemo(() => {
    if (data.length === 0) return [];
    
    const params = ['temperature', 'salinity', 'chlorophyll', 'depth'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(d => 
      d.latitude !== undefined && 
      d.longitude !== undefined &&
      d[selectedParameter] !== undefined &&
      d[selectedParameter] !== null
    );
  }, [data, selectedParameter]);

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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Visualization Controls</span>
            <div className="flex items-center space-x-4">
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  {availableParameters.map(param => (
                    <SelectItem key={param} value={param}>
                      {param.charAt(0).toUpperCase() + param.slice(1)}
                      {param === 'temperature' && ' (°C)'}
                      {param === 'salinity' && ' (PSU)'}
                      {param === 'chlorophyll' && ' (mg/m³)'}
                      {param === 'depth' && ' (m)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Visualization Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-secondary/50">
          <TabsTrigger value="scatter" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Scatter</span>
          </TabsTrigger>
          <TabsTrigger value="line" className="flex items-center space-x-2">
            <LineChart className="w-4 h-4" />
            <span>Line Plot</span>
          </TabsTrigger>
          <TabsTrigger value="boxplot" className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4" />
            <span>Box Plot</span>
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

        <TabsContent value="scatter" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>Scatter Plot - {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}</CardTitle>
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
              <CardTitle>Time Series - {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}</CardTitle>
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

        <TabsContent value="boxplot" className="mt-6">
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle>Box Plot Analysis - {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Shows data distribution, variability, outliers, and statistical measures (median, quartiles)
              </p>
            </CardHeader>
            <CardContent>
              <BoxPlot 
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
              <CardTitle>Geographic Distribution - {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}</CardTitle>
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
              <CardTitle>Vertical Profile - {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}</CardTitle>
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
              <CardTitle>3D Visualization - {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}</CardTitle>
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

export default VisualizationPanel;