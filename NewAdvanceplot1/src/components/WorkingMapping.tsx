import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Map, Layers, ZoomIn, ZoomOut, RotateCcw, Download, Settings,
  Thermometer, Droplets, Leaf, Wind, Waves, Navigation, MapPin,
  Eye, EyeOff, Filter, Maximize2, Minimize2, RefreshCw
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

interface WorkingMappingProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
}

const WorkingMapping: React.FC<WorkingMappingProps> = ({ data, onLocationSelect }) => {
  // Map State
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState({ lat: 10, lng: 75 });
  const [selectedPoint, setSelectedPoint] = useState<OceanData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLayers, setShowLayers] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const mapRef = useRef<HTMLDivElement>(null);

  // Available parameters
  const availableParameters = useMemo(() => {
    const params = ['temperature', 'salinity', 'chlorophyll', 'ssh', 'bathymetry', 'u_velocity', 'v_velocity'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
    // Simple mercator projection
    const x = ((lng - center.lng) * zoom * 8) + mapWidth / 2;
    const y = ((center.lat - lat) * zoom * 8) + mapHeight / 2;
    return { x, y };
  };

  // Get color for parameter value
  const getParameterColor = (value: number | undefined, param: string) => {
    if (value === undefined || value === null) return '#666';
    
    let normalized = 0;
    switch (param) {
      case 'temperature':
        normalized = Math.max(0, Math.min(1, (value - 20) / 15)); // 20-35°C range
        return `hsl(${240 - normalized * 240}, 70%, ${50 + normalized * 30}%)`; // Blue to red
      case 'salinity':
        normalized = Math.max(0, Math.min(1, (value - 30) / 10)); // 30-40 PSU range
        return `hsl(${120 - normalized * 120}, 70%, ${50 + normalized * 30}%)`; // Green to red
      case 'chlorophyll':
        normalized = Math.max(0, Math.min(1, value / 5)); // 0-5 mg/m³ range
        return `hsl(${60 + normalized * 60}, 70%, ${50 + normalized * 30}%)`; // Yellow to green
      default:
        return '#3b82f6';
    }
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setCenter(prev => ({
      lat: prev.lat + deltaY / (zoom * 8),
      lng: prev.lng - deltaX / (zoom * 8)
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    setZoom(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : 'space-y-4'}`}>
      {/* Map Controls */}
      <Card className="bg-gradient-to-r from-blue-900 to-cyan-900 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Map className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Ocean Data Map</h2>
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                {data.length} stations
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
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Parameter</label>
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
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Zoom: {zoom.toFixed(1)}x
              </label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(10, zoom + 1))}
                  className="text-white border-blue-600"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(1, zoom - 1))}
                  className="text-white border-blue-600"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(4)}
                  className="text-white border-blue-600"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Center</label>
              <div className="text-xs text-gray-300">
                <div>Lat: {center.lat.toFixed(2)}°</div>
                <div>Lng: {center.lng.toFixed(2)}°</div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showLayers}
                  onCheckedChange={setShowLayers}
                  className="data-[state=checked]:bg-cyan-500"
                />
                <label className="text-sm text-gray-300">Show Layers</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Map Display */}
      <div className="grid grid-cols-12 gap-4">
        {/* Map */}
        <div className="col-span-9">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-cyan-400" />
                  <span>Interactive Ocean Map</span>
                </div>
                <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                  {selectedParameter.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Actual Map Canvas */}
              <div 
                ref={mapRef}
                className="w-full h-[600px] bg-gradient-to-br from-blue-900 to-blue-700 relative cursor-grab active:cursor-grabbing overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                {/* Ocean Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700"></div>
                
                {/* Grid Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <defs>
                    <pattern id="oceanGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#oceanGrid)" />
                </svg>

                {/* Coastline Simulation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 100 200 Q 200 180 300 200 Q 400 220 500 200 Q 600 180 700 200 L 700 400 Q 600 420 500 400 Q 400 380 300 400 Q 200 420 100 400 Z"
                    fill="rgba(139, 69, 19, 0.4)"
                    stroke="rgba(139, 69, 19, 0.8)"
                    strokeWidth="2"
                  />
                  <path
                    d="M 150 150 Q 250 130 350 150 Q 450 170 550 150"
                    fill="none"
                    stroke="rgba(139, 69, 19, 0.6)"
                    strokeWidth="3"
                  />
                </svg>

                {/* Data Points */}
                {data.map((point) => {
                  const mapRect = mapRef.current?.getBoundingClientRect();
                  const mapWidth = mapRect?.width || 800;
                  const mapHeight = mapRect?.height || 600;
                  
                  const { x, y } = latLngToPixel(point.latitude, point.longitude, mapWidth, mapHeight);
                  const color = getParameterColor(point[selectedParameter], selectedParameter);
                  const isSelected = selectedPoint?.id === point.id;
                  
                  // Only render points that are visible
                  if (x < -20 || x > mapWidth + 20 || y < -20 || y > mapHeight + 20) return null;
                  
                  return (
                    <div
                      key={point.id}
                      className={`absolute w-4 h-4 rounded-full cursor-pointer transition-all duration-200 border-2 border-white/50 ${
                        isSelected ? 'scale-150 ring-4 ring-white/50 z-10' : 'hover:scale-125 hover:ring-2 hover:ring-white/30'
                      }`}
                      style={{
                        left: x - 8,
                        top: y - 8,
                        backgroundColor: color,
                        boxShadow: `0 0 15px ${color}50`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint(point);
                        onLocationSelect(point);
                      }}
                      title={`${selectedParameter}: ${point[selectedParameter]?.toFixed(2) || 'N/A'}`}
                    />
                  );
                })}

                {/* Current Vectors (if velocity data) */}
                {selectedParameter === 'u_velocity' && data.map((point) => {
                  if (!point.u_velocity || !point.v_velocity) return null;
                  
                  const mapRect = mapRef.current?.getBoundingClientRect();
                  const mapWidth = mapRect?.width || 800;
                  const mapHeight = mapRect?.height || 600;
                  
                  const { x, y } = latLngToPixel(point.latitude, point.longitude, mapWidth, mapHeight);
                  if (x < -50 || x > mapWidth + 50 || y < -50 || y > mapHeight + 50) return null;
                  
                  const scale = 30;
                  const endX = x + (point.u_velocity * scale);
                  const endY = y - (point.v_velocity * scale);
                  
                  return (
                    <svg
                      key={`vector-${point.id}`}
                      className="absolute pointer-events-none"
                      style={{ left: x - 30, top: y - 30, width: 60, height: 60 }}
                    >
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
                        </marker>
                      </defs>
                      <line
                        x1="30"
                        y1="30"
                        x2={30 + (point.u_velocity * scale)}
                        y2={30 - (point.v_velocity * scale)}
                        stroke="#fbbf24"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                  );
                })}

                {/* Map Info Overlay */}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                  <div className="text-sm font-semibold mb-2">Map Info</div>
                  <div className="text-xs space-y-1">
                    <div>Zoom: {zoom.toFixed(1)}x</div>
                    <div>Center: {center.lat.toFixed(2)}°, {center.lng.toFixed(2)}°</div>
                    <div>Points: {data.length}</div>
                    <div>Parameter: {selectedParameter}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="col-span-3 space-y-4">
          {/* Parameter Legend */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Legend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm font-medium text-white mb-2">
                  {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1).replace('_', ' ')}
                </div>
                
                {selectedParameter === 'temperature' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                      <span className="text-xs text-gray-300">Cold (20°C)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-400"></div>
                      <span className="text-xs text-gray-300">Moderate (27°C)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-400"></div>
                      <span className="text-xs text-gray-300">Warm (35°C)</span>
                    </div>
                  </div>
                )}
                
                {selectedParameter === 'salinity' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-400"></div>
                      <span className="text-xs text-gray-300">Fresh (30 PSU)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                      <span className="text-xs text-gray-300">Moderate (35 PSU)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-400"></div>
                      <span className="text-xs text-gray-300">Saline (40 PSU)</span>
                    </div>
                  </div>
                )}
                
                {selectedParameter === 'chlorophyll' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                      <span className="text-xs text-gray-300">Low (0 mg/m³)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-400"></div>
                      <span className="text-xs text-gray-300">High (5 mg/m³)</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Point Info */}
          {selectedPoint && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <span>Station Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-2">Location</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>Lat: {selectedPoint.latitude.toFixed(4)}°</div>
                      <div>Lng: {selectedPoint.longitude.toFixed(4)}°</div>
                      {selectedPoint.depth && <div>Depth: {selectedPoint.depth}m</div>}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-2">Measurements</div>
                    <div className="space-y-1">
                      {selectedPoint.temperature && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Temperature</span>
                          <span className="text-blue-400">{selectedPoint.temperature.toFixed(2)}°C</span>
                        </div>
                      )}
                      {selectedPoint.salinity && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Salinity</span>
                          <span className="text-green-400">{selectedPoint.salinity.toFixed(2)} PSU</span>
                        </div>
                      )}
                      {selectedPoint.chlorophyll && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Chlorophyll</span>
                          <span className="text-yellow-400">{selectedPoint.chlorophyll.toFixed(2)} mg/m³</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Map
              </Button>
              <Button variant="outline" className="w-full text-white border-slate-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" className="w-full text-white border-slate-600">
                <Filter className="w-4 h-4 mr-2" />
                Filter Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkingMapping;