import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, Layers, ZoomIn, ZoomOut, RotateCcw, Download, Settings,
  Thermometer, Droplets, Leaf, Wind, Waves, Navigation, MapPin,
  Eye, EyeOff, Filter, Maximize2, Minimize2, RefreshCw, Share,
  Grid3X3, Compass, Ruler, Search, Bookmark, Info, Play
} from 'lucide-react';

// Import the base interactive map
import InteractiveMap from './InteractiveMap';

interface OceanData {
  id: string;
  latitude: number;
  longitude: number;
  depth?: number;
  temperature?: number;
  salinity?: number;
  chlorophyll?: number;
  timestamp?: string;
  u_velocity?: number;
  v_velocity?: number;
  ssh?: number;
  bathymetry?: number;
  [key: string]: any;
}

interface ComprehensiveMappingProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
}

interface MapLayer {
  id: string;
  name: string;
  parameter: string;
  visible: boolean;
  opacity: number;
  color: string;
  icon: React.ReactNode;
}

interface MapStyle {
  id: string;
  name: string;
  description: string;
  background: string;
}

const ComprehensiveMapping: React.FC<ComprehensiveMappingProps> = ({ data, onLocationSelect }) => {
  // Map State
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [mapStyle, setMapStyle] = useState<string>('ocean');
  const [zoom, setZoom] = useState<number>(4);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showScale, setShowScale] = useState<boolean>(true);
  const [showCompass, setShowCompass] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [depthFilter, setDepthFilter] = useState<[number, number]>([0, 1000]);
  const [qualityFilter, setQualityFilter] = useState<number>(70);
  
  // Layer Management
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    {
      id: 'temperature',
      name: 'Sea Surface Temperature',
      parameter: 'temperature',
      visible: true,
      opacity: 80,
      color: '#ef4444',
      icon: <Thermometer className="w-4 h-4" />
    },
    {
      id: 'salinity',
      name: 'Salinity',
      parameter: 'salinity',
      visible: false,
      opacity: 70,
      color: '#3b82f6',
      icon: <Droplets className="w-4 h-4" />
    },
    {
      id: 'chlorophyll',
      name: 'Chlorophyll Concentration',
      parameter: 'chlorophyll',
      visible: false,
      opacity: 75,
      color: '#22c55e',
      icon: <Leaf className="w-4 h-4" />
    },
    {
      id: 'currents',
      name: 'Ocean Currents',
      parameter: 'u_velocity',
      visible: false,
      opacity: 85,
      color: '#f59e0b',
      icon: <Wind className="w-4 h-4" />
    },
    {
      id: 'bathymetry',
      name: 'Bathymetry',
      parameter: 'bathymetry',
      visible: false,
      opacity: 60,
      color: '#8b5cf6',
      icon: <Waves className="w-4 h-4" />
    }
  ]);

  // Map Styles
  const mapStyles: MapStyle[] = [
    {
      id: 'ocean',
      name: 'Ocean Blue',
      description: 'Classic ocean visualization',
      background: 'from-blue-900 to-blue-700'
    },
    {
      id: 'satellite',
      name: 'Satellite',
      description: 'Satellite imagery style',
      background: 'from-green-900 to-blue-900'
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      description: 'High contrast dark theme',
      background: 'from-gray-900 to-black'
    },
    {
      id: 'terrain',
      name: 'Terrain',
      description: 'Topographic style',
      background: 'from-amber-900 to-green-900'
    }
  ];

  // Filter and process data
  const filteredData = useMemo(() => {
    return data.filter(point => {
      // Depth filter
      const depthOk = !point.depth || (point.depth >= depthFilter[0] && point.depth <= depthFilter[1]);
      
      // Region filter
      let regionOk = true;
      if (selectedRegion !== 'all') {
        switch (selectedRegion) {
          case 'arabian_sea':
            regionOk = point.longitude < 75 && point.latitude > 10;
            break;
          case 'bay_of_bengal':
            regionOk = point.longitude > 80 && point.latitude > 10;
            break;
          case 'equatorial':
            regionOk = point.latitude >= -5 && point.latitude <= 5;
            break;
        }
      }
      
      // Quality filter (simulated)
      const quality = Math.random() * 100;
      const qualityOk = quality >= qualityFilter;
      
      return depthOk && regionOk && qualityOk;
    });
  }, [data, depthFilter, selectedRegion, qualityFilter]);

  // Available parameters
  const availableParameters = useMemo(() => {
    const params = ['temperature', 'salinity', 'chlorophyll', 'ssh', 'bathymetry', 'u_velocity', 'v_velocity'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Update layer opacity
  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  // Get current map style
  const currentStyle = mapStyles.find(style => style.id === mapStyle) || mapStyles[0];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : 'space-y-4'}`}>
      {/* Map Controls Header */}
      <Card className="bg-gradient-to-r from-blue-900 to-cyan-900 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Map className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Interactive Ocean Mapping</h2>
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                {filteredData.length} stations
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white border-blue-600 hover:bg-blue-800"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-blue-600 hover:bg-blue-800"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-blue-600 hover:bg-blue-800"
              >
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Advanced Map Controls */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Primary Layer</label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  {availableParameters.map(param => (
                    <SelectItem key={param} value={param} className="text-white">
                      <div className="flex items-center space-x-2">
                        {param === 'temperature' && <Thermometer className="w-4 h-4" />}
                        {param === 'salinity' && <Droplets className="w-4 h-4" />}
                        {param === 'chlorophyll' && <Leaf className="w-4 h-4" />}
                        {param.includes('velocity') && <Wind className="w-4 h-4" />}
                        <span>{param.charAt(0).toUpperCase() + param.slice(1).replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Map Style</label>
              <Select value={mapStyle} onValueChange={setMapStyle}>
                <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  {mapStyles.map(style => (
                    <SelectItem key={style.id} value={style.id} className="text-white">
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  <SelectItem value="all" className="text-white">All Regions</SelectItem>
                  <SelectItem value="arabian_sea" className="text-white">Arabian Sea</SelectItem>
                  <SelectItem value="bay_of_bengal" className="text-white">Bay of Bengal</SelectItem>
                  <SelectItem value="equatorial" className="text-white">Equatorial Region</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Depth: {depthFilter[0]}m - {depthFilter[1]}m
              </label>
              <Slider
                value={depthFilter}
                onValueChange={(value) => setDepthFilter(value as [number, number])}
                min={0}
                max={2000}
                step={50}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Quality: {qualityFilter}%
              </label>
              <Slider
                value={[qualityFilter]}
                onValueChange={(value) => setQualityFilter(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                  className="data-[state=checked]:bg-cyan-500"
                />
                <label className="text-sm text-gray-300">Grid</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showScale}
                  onCheckedChange={setShowScale}
                  className="data-[state=checked]:bg-cyan-500"
                />
                <label className="text-sm text-gray-300">Scale</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Mapping Interface */}
      <div className="grid grid-cols-12 gap-4">
        {/* Map Display */}
        <div className="col-span-9">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-cyan-400" />
                  <span>Ocean Data Map - {currentStyle.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                    Zoom: {zoom}x
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(10, zoom + 1))}
                    className="text-white border-slate-600"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(1, zoom - 1))}
                    className="text-white border-slate-600"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(4)}
                    className="text-white border-slate-600"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[600px] p-0 relative">
              {/* Enhanced Interactive Map */}
              <div className={`w-full h-full bg-gradient-to-br ${currentStyle.background} relative overflow-hidden rounded-lg`}>
                <InteractiveMap 
                  data={filteredData}
                  parameter={selectedParameter}
                  onLocationSelect={onLocationSelect}
                />
                
                {/* Map Overlays */}
                {showCompass && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                )}
                
                {showScale && (
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex items-center space-x-2 text-white text-xs">
                      <Ruler className="w-4 h-4" />
                      <span>0</span>
                      <div className="w-16 h-1 bg-white"></div>
                      <span>500km</span>
                    </div>
                  </div>
                )}
                
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layer Control Panel */}
        <div className="col-span-3 space-y-4">
          {/* Layer Management */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Map Layers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mapLayers.map(layer => (
                <div key={layer.id} className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div style={{ color: layer.color }}>
                        {layer.icon}
                      </div>
                      <span className="text-sm font-medium text-white">{layer.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLayer(layer.id)}
                      className="p-1"
                    >
                      {layer.visible ? 
                        <Eye className="w-4 h-4 text-cyan-400" /> : 
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      }
                    </Button>
                  </div>
                  
                  {layer.visible && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Opacity</span>
                        <span>{layer.opacity}%</span>
                      </div>
                      <Slider
                        value={[layer.opacity]}
                        onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Map Statistics */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Info className="w-5 h-5 text-green-400" />
                <span>Map Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapStatistics 
                data={filteredData}
                selectedParameter={selectedParameter}
                visibleLayers={mapLayers.filter(l => l.visible)}
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="w-4 h-4 mr-2" />
                Find Location
              </Button>
              <Button variant="outline" className="w-full text-white border-slate-600">
                <Bookmark className="w-4 h-4 mr-2" />
                Save View
              </Button>
              <Button variant="outline" className="w-full text-white border-slate-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" className="w-full text-white border-slate-600">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Map Tools */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5 text-yellow-400" />
            <span>Advanced Mapping Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="analysis" className="text-white">Spatial Analysis</TabsTrigger>
              <TabsTrigger value="comparison" className="text-white">Layer Comparison</TabsTrigger>
              <TabsTrigger value="animation" className="text-white">Time Animation</TabsTrigger>
              <TabsTrigger value="export" className="text-white">Export Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="mt-4">
              <SpatialAnalysisTools data={filteredData} />
            </TabsContent>
            
            <TabsContent value="comparison" className="mt-4">
              <LayerComparisonTools layers={mapLayers} data={filteredData} />
            </TabsContent>
            
            <TabsContent value="animation" className="mt-4">
              <TimeAnimationTools data={filteredData} />
            </TabsContent>
            
            <TabsContent value="export" className="mt-4">
              <MapExportTools data={filteredData} mapStyle={mapStyle} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Supporting Components
const MapStatistics: React.FC<{
  data: OceanData[];
  selectedParameter: string;
  visibleLayers: MapLayer[];
}> = ({ data, selectedParameter, visibleLayers }) => {
  const stats = useMemo(() => {
    const values = data
      .map(d => d[selectedParameter])
      .filter(v => v !== undefined && v !== null) as number[];
    
    if (values.length === 0) return null;
    
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((sum, v) => sum + v, 0) / values.length,
      coverage: ((values.length / data.length) * 100).toFixed(1)
    };
  }, [data, selectedParameter]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-xs text-gray-400">Total Points</div>
          <div className="text-lg font-bold text-cyan-400">{data.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-xs text-gray-400">Active Layers</div>
          <div className="text-lg font-bold text-green-400">{visibleLayers.length}</div>
        </div>
      </div>
      
      {stats && (
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-sm font-medium text-white mb-2">
            {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)} Statistics
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Range</span>
              <span className="text-white">{stats.min.toFixed(2)} - {stats.max.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mean</span>
              <span className="text-white">{stats.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Coverage</span>
              <span className="text-white">{stats.coverage}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SpatialAnalysisTools: React.FC<{ data: OceanData[] }> = ({ data }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Hotspot Analysis</h4>
        <div className="space-y-2">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm">
            Find Temperature Hotspots
          </Button>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
            Identify Cold Spots
          </Button>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Gradient Analysis</h4>
        <div className="space-y-2">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm">
            Calculate Gradients
          </Button>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
            Find Boundaries
          </Button>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Clustering</h4>
        <div className="space-y-2">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm">
            K-Means Clustering
          </Button>
          <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm">
            Density Clustering
          </Button>
        </div>
      </div>
    </div>
  );
};

const LayerComparisonTools: React.FC<{ layers: MapLayer[]; data: OceanData[] }> = ({ layers, data }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Layer Correlation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Temperature vs Salinity</span>
            <span className="text-blue-400">-0.67</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Chlorophyll vs Temperature</span>
            <span className="text-green-400">0.45</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Comparison Tools</h4>
        <div className="space-y-2">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
            Side-by-Side View
          </Button>
          <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm">
            Difference Map
          </Button>
        </div>
      </div>
    </div>
  );
};

const TimeAnimationTools: React.FC<{ data: OceanData[] }> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Animation Controls</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Animation Speed</label>
            <Slider
              defaultValue={[50]}
              min={10}
              max={100}
              step={10}
              className="w-full mt-1"
            />
          </div>
          <div className="flex space-x-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm">
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
            <Button variant="outline" className="flex-1 text-white border-slate-600 text-sm">
              Stop
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Time Range</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Start Date</span>
            <span className="text-white">2024-01-01</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">End Date</span>
            <span className="text-white">2024-12-31</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Frames</span>
            <span className="text-white">365</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapExportTools: React.FC<{ data: OceanData[]; mapStyle: string }> = ({ data, mapStyle }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Image Export</h4>
        <div className="space-y-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
            PNG (High Res)
          </Button>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
            SVG (Vector)
          </Button>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Data Export</h4>
        <div className="space-y-2">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm">
            GeoJSON
          </Button>
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm">
            Shapefile
          </Button>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Share Options</h4>
        <div className="space-y-2">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
            Generate Link
          </Button>
          <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm">
            Embed Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveMapping;