import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, Layers, 
  Globe, Map, Navigation, Clock, Wifi, Settings,
  Maximize2, Minimize2, RefreshCw
} from 'lucide-react';

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

interface InteractiveVisualizationProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
}

interface BuoyData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  salinity: number;
  timestamp: string;
  status: 'active' | 'inactive' | 'maintenance';
  batteryLevel: number;
  lastUpdate: string;
}

interface TimeSliderState {
  currentTime: number;
  minTime: number;
  maxTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

const InteractiveVisualization: React.FC<InteractiveVisualizationProps> = ({ 
  data, 
  onLocationSelect 
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'dashboard'>('dashboard');
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [mapStyle, setMapStyle] = useState<string>('satellite');
  const [zoomLevel, setZoomLevel] = useState<number>(6);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLayers, setShowLayers] = useState<boolean>(true);
  const [realTimeMode, setRealTimeMode] = useState<boolean>(false);
  
  // Time slider state
  const [timeSlider, setTimeSlider] = useState<TimeSliderState>({
    currentTime: 0,
    minTime: 0,
    maxTime: 100,
    isPlaying: false,
    playbackSpeed: 1
  });

  // Simulated real-time buoy data
  const [buoyData, setBuoyData] = useState<BuoyData[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  // Generate simulated buoy data
  useEffect(() => {
    const generateBuoyData = (): BuoyData[] => {
      const buoys: BuoyData[] = [];
      const buoyNames = ['RAMA-1', 'PIRATA-2', 'TAO-3', 'ARGO-4', 'NDBC-5'];
      
      buoyNames.forEach((name, index) => {
        const baseLat = -10 + index * 5;
        const baseLon = 60 + index * 8;
        
        buoys.push({
          id: `buoy_${index}`,
          name,
          latitude: baseLat + (Math.random() - 0.5) * 2,
          longitude: baseLon + (Math.random() - 0.5) * 2,
          temperature: 25 + Math.random() * 6,
          salinity: 34 + Math.random() * 2,
          timestamp: new Date().toISOString(),
          status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'maintenance'),
          batteryLevel: 20 + Math.random() * 80,
          lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString()
        });
      });
      
      return buoys;
    };

    setBuoyData(generateBuoyData());
    setLastUpdateTime(new Date().toLocaleTimeString());
  }, []);

  // Real-time data updates
  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(() => {
        setBuoyData(prevBuoys => 
          prevBuoys.map(buoy => ({
            ...buoy,
            latitude: buoy.latitude + (Math.random() - 0.5) * 0.01,
            longitude: buoy.longitude + (Math.random() - 0.5) * 0.01,
            temperature: Math.max(20, Math.min(32, buoy.temperature + (Math.random() - 0.5) * 0.5)),
            salinity: Math.max(32, Math.min(38, buoy.salinity + (Math.random() - 0.5) * 0.1)),
            timestamp: new Date().toISOString(),
            batteryLevel: Math.max(0, buoy.batteryLevel - Math.random() * 0.1)
          }))
        );
        setLastUpdateTime(new Date().toLocaleTimeString());
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  // Time slider animation
  useEffect(() => {
    if (timeSlider.isPlaying) {
      const interval = setInterval(() => {
        setTimeSlider(prev => ({
          ...prev,
          currentTime: prev.currentTime >= prev.maxTime ? prev.minTime : prev.currentTime + prev.playbackSpeed
        }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [timeSlider.isPlaying, timeSlider.playbackSpeed]);

  // Calculate time range from data
  const timeRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 100 };
    
    const timestamps = data
      .map(d => d.timestamp ? new Date(d.timestamp).getTime() : Date.now())
      .filter(t => !isNaN(t));
    
    if (timestamps.length === 0) return { min: 0, max: 100 };
    
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);
    
    return { min, max };
  }, [data]);

  // Update time slider range when data changes
  useEffect(() => {
    setTimeSlider(prev => ({
      ...prev,
      minTime: timeRange.min,
      maxTime: timeRange.max,
      currentTime: timeRange.min
    }));
  }, [timeRange]);

  // Filter data based on current time
  const filteredDataByTime = useMemo(() => {
    if (timeSlider.maxTime === timeSlider.minTime) return data;
    
    const currentTimestamp = timeSlider.currentTime;
    const timeWindow = (timeSlider.maxTime - timeSlider.minTime) * 0.1; // 10% window
    
    return data.filter(d => {
      if (!d.timestamp) return true;
      const dataTime = new Date(d.timestamp).getTime();
      return Math.abs(dataTime - currentTimestamp) <= timeWindow;
    });
  }, [data, timeSlider.currentTime, timeSlider.minTime, timeSlider.maxTime]);

  const availableParameters = useMemo(() => {
    if (data.length === 0) return [];
    
    const params = ['temperature', 'salinity', 'chlorophyll', 'ssh', 'bathymetry', 'u_velocity', 'v_velocity'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Main Map View */}
      <div className="lg:col-span-2">
        <Card className="card-enhanced h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Map className="w-5 h-5 text-primary" />
                <span>Interactive GIS Map</span>
                {realTimeMode && (
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Wifi className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                  className="btn-enhanced"
                >
                  {viewMode === '3d' ? <Map className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="btn-enhanced"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[500px]">
            {viewMode === '3d' ? (
              <Globe3D 
                data={filteredDataByTime}
                buoyData={buoyData}
                parameter={selectedParameter}
                onLocationSelect={onLocationSelect}
              />
            ) : (
              <InteractiveMap 
                data={filteredDataByTime}
                buoyData={buoyData}
                parameter={selectedParameter}
                mapStyle={mapStyle}
                zoomLevel={zoomLevel}
                onLocationSelect={onLocationSelect}
                onZoomChange={setZoomLevel}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="space-y-6">
        {/* Real-time Buoy Status */}
        <Card className="card-enhanced">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-accent" />
                <span>Live Buoy Network</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={`btn-enhanced ${realTimeMode ? 'bg-green-500/20 text-green-400' : ''}`}
              >
                {realTimeMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Last update: {lastUpdateTime}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {buoyData.map(buoy => (
              <div key={buoy.id} className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{buoy.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      buoy.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      buoy.status === 'inactive' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}
                  >
                    {buoy.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Temp:</span>
                    <span className="text-foreground ml-1">{buoy.temperature.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sal:</span>
                    <span className="text-foreground ml-1">{buoy.salinity.toFixed(1)} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lat:</span>
                    <span className="text-foreground ml-1">{buoy.latitude.toFixed(3)}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lon:</span>
                    <span className="text-foreground ml-1">{buoy.longitude.toFixed(3)}°</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Battery</span>
                    <span className="text-foreground">{buoy.batteryLevel.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${
                        buoy.batteryLevel > 50 ? 'bg-green-500' :
                        buoy.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${buoy.batteryLevel}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mini Charts */}
        <Card className="card-enhanced">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Time Series</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniTimeSeriesChart 
              data={filteredDataByTime}
              parameter={selectedParameter}
              currentTime={timeSlider.currentTime}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Interactive Visualization Controls</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLayers(!showLayers)}
                className="btn-enhanced"
              >
                <Layers className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="btn-enhanced"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">View Mode</label>
              <Select value={viewMode} onValueChange={(value: '2d' | '3d' | 'dashboard') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="2d">2D Map</SelectItem>
                  <SelectItem value="3d">3D Globe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Parameter</label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableParameters.map(param => (
                    <SelectItem key={param} value={param}>
                      {param.charAt(0).toUpperCase() + param.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Map Style</label>
              <Select value={mapStyle} onValueChange={setMapStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Zoom Level: {zoomLevel}
              </label>
              <Slider
                value={[zoomLevel]}
                onValueChange={(value) => setZoomLevel(value[0])}
                min={1}
                max={15}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Time Slider Controls */}
          <div className="border-t border-border/30 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Temporal Navigation</h4>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeSlider(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                  className="btn-enhanced"
                >
                  {timeSlider.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeSlider(prev => ({ ...prev, currentTime: prev.minTime, isPlaying: false }))}
                  className="btn-enhanced"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Time: {new Date(timeSlider.currentTime).toLocaleString()}
                </label>
                <Slider
                  value={[timeSlider.currentTime]}
                  onValueChange={(value) => setTimeSlider(prev => ({ ...prev, currentTime: value[0] }))}
                  min={timeSlider.minTime}
                  max={timeSlider.maxTime}
                  step={(timeSlider.maxTime - timeSlider.minTime) / 100}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Playback Speed: {timeSlider.playbackSpeed}x
                  </label>
                  <Slider
                    value={[timeSlider.playbackSpeed]}
                    onValueChange={(value) => setTimeSlider(prev => ({ ...prev, playbackSpeed: value[0] }))}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRealTimeMode(!realTimeMode)}
                    className={`btn-enhanced w-full ${realTimeMode ? 'bg-green-500/20 text-green-400' : ''}`}
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    {realTimeMode ? 'Live Mode ON' : 'Live Mode OFF'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization Area */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
        {viewMode === 'dashboard' ? renderDashboard() : (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {viewMode === '3d' ? '3D Interactive Globe' : 'Zoomable GIS Map'} - {selectedParameter}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="btn-enhanced"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[600px]">
              {viewMode === '3d' ? (
                <Globe3D 
                  data={filteredDataByTime}
                  buoyData={buoyData}
                  parameter={selectedParameter}
                  onLocationSelect={onLocationSelect}
                />
              ) : (
                <InteractiveMap 
                  data={filteredDataByTime}
                  buoyData={buoyData}
                  parameter={selectedParameter}
                  mapStyle={mapStyle}
                  zoomLevel={zoomLevel}
                  onLocationSelect={onLocationSelect}
                  onZoomChange={setZoomLevel}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Layer Control Panel */}
      {showLayers && (
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>Layer Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LayerControlPanel 
              availableParameters={availableParameters}
              selectedParameter={selectedParameter}
              onParameterChange={setSelectedParameter}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Individual component implementations (simplified for demo)
const InteractiveMap: React.FC<{
  data: OceanData[];
  buoyData: BuoyData[];
  parameter: string;
  mapStyle: string;
  zoomLevel: number;
  onLocationSelect: (location: OceanData) => void;
  onZoomChange: (zoom: number) => void;
}> = ({ data, buoyData, parameter, mapStyle, zoomLevel, onLocationSelect, onZoomChange }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Map className="w-16 h-16 mx-auto text-primary mb-4" />
        <div className="text-lg font-semibold text-foreground mb-2">Interactive Leaflet Map</div>
        <div className="text-sm text-muted-foreground mb-4">
          Zoomable GIS visualization with {data.length} data points and {buoyData.length} live buoys
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-left">
            <p className="text-muted-foreground">Style: <span className="text-foreground">{mapStyle}</span></p>
            <p className="text-muted-foreground">Zoom: <span className="text-foreground">{zoomLevel}</span></p>
            <p className="text-muted-foreground">Parameter: <span className="text-foreground">{parameter}</span></p>
          </div>
          <div className="text-left">
            <p className="text-muted-foreground">Features:</p>
            <p className="text-xs text-foreground">• Pan & Zoom</p>
            <p className="text-xs text-foreground">• Layer Toggle</p>
            <p className="text-xs text-foreground">• Real-time Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Globe3D: React.FC<{
  data: OceanData[];
  buoyData: BuoyData[];
  parameter: string;
  onLocationSelect: (location: OceanData) => void;
}> = ({ data, buoyData, parameter, onLocationSelect }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Globe className="w-16 h-16 mx-auto text-primary mb-4" />
        <div className="text-lg font-semibold text-foreground mb-2">3D Interactive Globe</div>
        <div className="text-sm text-muted-foreground mb-4">
          CesiumJS-style 3D visualization with {data.length} data points and {buoyData.length} live buoys
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-left">
            <p className="text-muted-foreground">Parameter: <span className="text-foreground">{parameter}</span></p>
            <p className="text-muted-foreground">Projection: <span className="text-foreground">3D Sphere</span></p>
            <p className="text-muted-foreground">Rendering: <span className="text-foreground">WebGL</span></p>
          </div>
          <div className="text-left">
            <p className="text-muted-foreground">Features:</p>
            <p className="text-xs text-foreground">• 360° Rotation</p>
            <p className="text-xs text-foreground">• Altitude Layers</p>
            <p className="text-xs text-foreground">• Real-time Animation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniTimeSeriesChart: React.FC<{
  data: OceanData[];
  parameter: string;
  currentTime: number;
}> = ({ data, parameter, currentTime }) => {
  return (
    <div className="w-full h-32 bg-secondary/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Clock className="w-8 h-8 mx-auto text-accent mb-2" />
        <div className="text-sm font-semibold text-foreground">Time Series</div>
        <div className="text-xs text-muted-foreground">
          {parameter} over time ({data.length} points)
        </div>
      </div>
    </div>
  );
};

const LayerControlPanel: React.FC<{
  availableParameters: string[];
  selectedParameter: string;
  onParameterChange: (param: string) => void;
}> = ({ availableParameters, selectedParameter, onParameterChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {availableParameters.map(param => (
        <div key={param} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={param}
            checked={selectedParameter === param}
            onChange={() => onParameterChange(param)}
            className="rounded border-border"
          />
          <label htmlFor={param} className="text-sm text-foreground capitalize">
            {param.replace('_', ' ')}
          </label>
        </div>
      ))}
    </div>
  );
};

export default InteractiveVisualization;