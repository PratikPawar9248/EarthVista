import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Map as MapIcon, Play, Pause, SkipBack, SkipForward, RotateCcw, ZoomIn, ZoomOut,
  Layers, Settings, Download, Maximize2, Minimize2, Calendar, Clock,
  Thermometer, Droplets, Wind, Activity, MapPin, Globe, Satellite,
  Filter, Eye, EyeOff, Palette, BarChart3, Info, RefreshCw
} from 'lucide-react';

interface DataPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  [key: string]: any;
}

interface GeospatialMapProps {
  data: DataPoint[];
  onPointSelect?: (point: DataPoint) => void;
}

interface MapProjection {
  id: string;
  name: string;
  description: string;
}

interface ColorScale {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

const GeospatialMapVisualization: React.FC<GeospatialMapProps> = ({ data, onPointSelect }) => {
  // Map State
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [mapProjection, setMapProjection] = useState<string>('mercator');
  const [colorScale, setColorScale] = useState<string>('thermal');
  const [visualizationType, setVisualizationType] = useState<string>('heatmap');
  const [zoom, setZoom] = useState<number>(2);
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Time Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(500);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100]);
  const [showTimeControls, setShowTimeControls] = useState<boolean>(false);
  
  // Visualization Settings
  const [pointSize, setPointSize] = useState<number>(5);
  const [opacity, setOpacity] = useState<number>(80);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [heatmapIntensity, setHeatmapIntensity] = useState<number>(50);
  const [clusterPoints, setClusterPoints] = useState<boolean>(false);
  
  // Map Interaction
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Map Projections
  const projections: MapProjection[] = [
    { id: 'mercator', name: 'Mercator', description: 'Standard web map projection' },
    { id: 'equirectangular', name: 'Equirectangular', description: 'Simple lat/lng mapping' },
    { id: 'orthographic', name: 'Orthographic', description: 'Globe view projection' },
    { id: 'robinson', name: 'Robinson', description: 'Compromise projection' }
  ];

  // Color Scales
  const colorScales: ColorScale[] = [
    {
      id: 'thermal',
      name: 'Thermal',
      colors: ['#000080', '#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF8000', '#FF0000', '#800000'],
      description: 'Blue to red temperature scale'
    },
    {
      id: 'ocean',
      name: 'Ocean',
      colors: ['#000033', '#000066', '#0033CC', '#0066FF', '#33CCFF', '#66FFFF', '#99FFFF', '#CCFFFF'],
      description: 'Deep blue to light blue'
    },
    {
      id: 'viridis',
      name: 'Viridis',
      colors: ['#440154', '#482777', '#3F4A8A', '#31678E', '#26838F', '#1F9D8A', '#6CCE5A', '#B6DE2B', '#FEE825'],
      description: 'Perceptually uniform colormap'
    },
    {
      id: 'plasma',
      name: 'Plasma',
      colors: ['#0C0786', '#5B02A3', '#9A179B', '#CB4678', '#EB7852', '#FBB32F', '#F0F921'],
      description: 'Purple to yellow plasma scale'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      colors: ['#9400D3', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'],
      description: 'Classic rainbow spectrum'
    }
  ];

  // Detect geographical columns automatically
  const geographicalColumns = useMemo(() => {
    if (data.length === 0) return { lat: null, lng: null, time: null };
    
    const sampleRow = data[0];
    const columns = Object.keys(sampleRow);
    
    // Detect latitude column
    const latColumn = columns.find(col => 
      /^(lat|latitude|y|lat_deg|lat_decimal)$/i.test(col) ||
      (typeof sampleRow[col] === 'number' && Math.abs(sampleRow[col]) <= 90)
    );
    
    // Detect longitude column
    const lngColumn = columns.find(col => 
      /^(lng|lon|longitude|x|lng_deg|lon_decimal|long)$/i.test(col) ||
      (typeof sampleRow[col] === 'number' && Math.abs(sampleRow[col]) <= 180)
    );
    
    // Detect time column
    const timeColumn = columns.find(col => 
      /^(time|timestamp|date|datetime|t)$/i.test(col) ||
      (typeof sampleRow[col] === 'string' && !isNaN(Date.parse(sampleRow[col])))
    );
    
    return { lat: latColumn, lng: lngColumn, time: timeColumn };
  }, [data]);

  // Available parameters for visualization
  const availableParameters = useMemo(() => {
    if (data.length === 0) return [];
    
    const sampleRow = data[0];
    return Object.keys(sampleRow).filter(key => 
      key !== geographicalColumns.lat && 
      key !== geographicalColumns.lng && 
      key !== geographicalColumns.time &&
      key !== 'id' &&
      typeof sampleRow[key] === 'number'
    );
  }, [data, geographicalColumns]);

  // Process data for visualization
  const processedData = useMemo(() => {
    if (!geographicalColumns.lat || !geographicalColumns.lng) return [];
    
    return data.map((row, index) => ({
      id: row.id || `point_${index}`,
      latitude: row[geographicalColumns.lat],
      longitude: row[geographicalColumns.lng],
      timestamp: geographicalColumns.time ? row[geographicalColumns.time] : null,
      value: row[selectedParameter] || 0,
      ...row
    })).filter(point => 
      typeof point.latitude === 'number' && 
      typeof point.longitude === 'number' &&
      !isNaN(point.latitude) && 
      !isNaN(point.longitude) &&
      Math.abs(point.latitude) <= 90 &&
      Math.abs(point.longitude) <= 180
    );
  }, [data, geographicalColumns, selectedParameter]);

  // Time-based data processing
  const timeBasedData = useMemo(() => {
    if (!geographicalColumns.time) return [processedData];
    
    // Group data by time
    const timeGroups = new Map<string, DataPoint[]>();
    processedData.forEach(point => {
      if (point.timestamp) {
        const timeKey = new Date(point.timestamp).toISOString().split('T')[0]; // Group by date
        if (!timeGroups.has(timeKey)) {
          timeGroups.set(timeKey, []);
        }
        timeGroups.get(timeKey)!.push(point);
      }
    });
    
    const sortedTimes = Array.from(timeGroups.keys()).sort();
    setShowTimeControls(sortedTimes.length > 1);
    
    return sortedTimes.map(time => timeGroups.get(time)!);
  }, [processedData, geographicalColumns.time]);

  // Current data based on time selection
  const currentData = useMemo(() => {
    if (timeBasedData.length <= 1) return processedData;
    
    const timeIndex = Math.floor((currentTimeIndex / 100) * (timeBasedData.length - 1));
    return timeBasedData[timeIndex] || [];
  }, [timeBasedData, currentTimeIndex, processedData]);

  // Value range for color scaling
  const valueRange = useMemo(() => {
    if (currentData.length === 0) return { min: 0, max: 1 };
    
    const values = currentData.map(d => d.value).filter(v => typeof v === 'number' && !isNaN(v));
    if (values.length === 0) return { min: 0, max: 1 };
    
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [currentData]);

  // Map projection functions
  const projectPoint = useCallback((lat: number, lng: number, width: number, height: number) => {
    switch (mapProjection) {
      case 'mercator':
        const x = ((lng + 180) / 360) * width;
        const latRad = (lat * Math.PI) / 180;
        const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
        const y = height / 2 - (mercN * width) / (2 * Math.PI);
        return { x, y };
      
      case 'equirectangular':
        return {
          x: ((lng + 180) / 360) * width,
          y: ((90 - lat) / 180) * height
        };
      
      case 'orthographic':
        const centerLatRad = (center.lat * Math.PI) / 180;
        const centerLngRad = (center.lng * Math.PI) / 180;
        const latRad2 = (lat * Math.PI) / 180;
        const lngRad = (lng * Math.PI) / 180;
        
        const cosC = Math.sin(centerLatRad) * Math.sin(latRad2) + 
                     Math.cos(centerLatRad) * Math.cos(latRad2) * Math.cos(lngRad - centerLngRad);
        
        if (cosC < 0) return null; // Point is on the back of the globe
        
        const k = 1;
        const x2 = k * Math.cos(latRad2) * Math.sin(lngRad - centerLngRad);
        const y2 = k * (Math.cos(centerLatRad) * Math.sin(latRad2) - 
                       Math.sin(centerLatRad) * Math.cos(latRad2) * Math.cos(lngRad - centerLngRad));
        
        return {
          x: width / 2 + x2 * (width / 4),
          y: height / 2 - y2 * (height / 4)
        };
      
      default:
        return {
          x: ((lng + 180) / 360) * width,
          y: ((90 - lat) / 180) * height
        };
    }
  }, [mapProjection, center]);

  // Get color for value
  const getColorForValue = useCallback((value: number) => {
    const scale = colorScales.find(s => s.id === colorScale)!;
    const normalized = (value - valueRange.min) / (valueRange.max - valueRange.min);
    const clampedNormalized = Math.max(0, Math.min(1, normalized));
    
    const colorIndex = clampedNormalized * (scale.colors.length - 1);
    const lowerIndex = Math.floor(colorIndex);
    const upperIndex = Math.ceil(colorIndex);
    const t = colorIndex - lowerIndex;
    
    if (lowerIndex === upperIndex) {
      return scale.colors[lowerIndex];
    }
    
    // Interpolate between colors
    const lowerColor = scale.colors[lowerIndex];
    const upperColor = scale.colors[upperIndex];
    
    const r1 = parseInt(lowerColor.slice(1, 3), 16);
    const g1 = parseInt(lowerColor.slice(3, 5), 16);
    const b1 = parseInt(lowerColor.slice(5, 7), 16);
    
    const r2 = parseInt(upperColor.slice(1, 3), 16);
    const g2 = parseInt(upperColor.slice(3, 5), 16);
    const b2 = parseInt(upperColor.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return `rgb(${r}, ${g}, ${b})`;
  }, [colorScale, valueRange, colorScales]);

  // Draw map
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        for (let lng = -180; lng <= 180; lng += 5) {
          const point = projectPoint(lat, lng, width, height);
          if (point) {
            if (lng === -180) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
        }
        ctx.stroke();
      }
      
      // Longitude lines
      for (let lng = -180; lng <= 180; lng += 30) {
        ctx.beginPath();
        for (let lat = -80; lat <= 80; lat += 5) {
          const point = projectPoint(lat, lng, width, height);
          if (point) {
            if (lat === -80) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
        }
        ctx.stroke();
      }
    }
    
    // Draw coastlines (simplified)
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
    ctx.lineWidth = 2;
    
    // Simplified world coastlines
    const coastlines = [
      // North America
      [{ lat: 70, lng: -150 }, { lat: 60, lng: -140 }, { lat: 50, lng: -130 }, { lat: 40, lng: -120 }, { lat: 30, lng: -110 }],
      // South America
      [{ lat: 10, lng: -80 }, { lat: 0, lng: -70 }, { lat: -10, lng: -60 }, { lat: -20, lng: -50 }, { lat: -30, lng: -40 }],
      // Europe/Africa
      [{ lat: 60, lng: 10 }, { lat: 50, lng: 0 }, { lat: 40, lng: 10 }, { lat: 30, lng: 20 }, { lat: 0, lng: 30 }, { lat: -30, lng: 20 }],
      // Asia
      [{ lat: 70, lng: 100 }, { lat: 60, lng: 120 }, { lat: 40, lng: 140 }, { lat: 20, lng: 120 }, { lat: 0, lng: 110 }],
      // Australia
      [{ lat: -10, lng: 130 }, { lat: -20, lng: 140 }, { lat: -30, lng: 150 }, { lat: -40, lng: 140 }, { lat: -30, lng: 120 }]
    ];
    
    coastlines.forEach(coastline => {
      ctx.beginPath();
      coastline.forEach((point, index) => {
        const projected = projectPoint(point.lat, point.lng, width, height);
        if (projected) {
          if (index === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
      });
      ctx.stroke();
    });
    
    // Draw data points
    if (visualizationType === 'heatmap') {
      // Create heatmap
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      // Initialize with background
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;     // R
        data[i + 1] = 17; // G
        data[i + 2] = 34; // B
        data[i + 3] = 255; // A
      }
      
      // Add heat points
      currentData.forEach(point => {
        const projected = projectPoint(point.latitude, point.longitude, width, height);
        if (projected && projected.x >= 0 && projected.x < width && projected.y >= 0 && projected.y < height) {
          const intensity = heatmapIntensity / 10;
          const radius = pointSize * 3;
          
          for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= radius) {
                const x = Math.floor(projected.x + dx);
                const y = Math.floor(projected.y + dy);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                  const index = (y * width + x) * 4;
                  const falloff = 1 - (distance / radius);
                  const heat = falloff * intensity * (point.value - valueRange.min) / (valueRange.max - valueRange.min);
                  
                  const color = getColorForValue(point.value);
                  const rgb = color.match(/\d+/g);
                  if (rgb) {
                    data[index] = Math.min(255, data[index] + parseInt(rgb[0]) * heat);
                    data[index + 1] = Math.min(255, data[index + 1] + parseInt(rgb[1]) * heat);
                    data[index + 2] = Math.min(255, data[index + 2] + parseInt(rgb[2]) * heat);
                  }
                }
              }
            }
          }
        }
      });
      
      ctx.putImageData(imageData, 0, 0);
    } else {
      // Draw individual points
      currentData.forEach(point => {
        const projected = projectPoint(point.latitude, point.longitude, width, height);
        if (projected) {
          const color = getColorForValue(point.value);
          const isHovered = hoveredPoint?.id === point.id;
          const isSelected = selectedPoint?.id === point.id;
          
          ctx.fillStyle = color;
          ctx.globalAlpha = opacity / 100;
          
          const size = pointSize * (isHovered ? 1.5 : isSelected ? 2 : 1);
          
          if (visualizationType === 'circles') {
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            if (isSelected || isHovered) {
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.globalAlpha = 1;
              ctx.stroke();
            }
          } else if (visualizationType === 'squares') {
            ctx.fillRect(projected.x - size, projected.y - size, size * 2, size * 2);
            
            if (isSelected || isHovered) {
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.globalAlpha = 1;
              ctx.strokeRect(projected.x - size, projected.y - size, size * 2, size * 2);
            }
          }
          
          ctx.globalAlpha = 1;
        }
      });
    }
  }, [currentData, projectPoint, showGrid, visualizationType, pointSize, opacity, heatmapIntensity, 
      getColorForValue, hoveredPoint, selectedPoint, valueRange]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && timeBasedData.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrentTimeIndex(prev => {
          const next = prev + 1;
          return next > 100 ? 0 : next;
        });
      }, animationSpeed);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentTimeIndex, animationSpeed, timeBasedData.length]);

  // Draw map when data or settings change
  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Handle canvas interactions
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find closest point
    let closestPoint: DataPoint | null = null;
    let minDistance = Infinity;
    
    currentData.forEach(point => {
      const projected = projectPoint(point.latitude, point.longitude, canvas.width, canvas.height);
      if (projected) {
        const distance = Math.sqrt((x - projected.x) ** 2 + (y - projected.y) ** 2);
        if (distance < 20 && distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }
    });
    
    setHoveredPoint(closestPoint);
  }, [currentData, projectPoint]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredPoint) {
      setSelectedPoint(hoveredPoint);
      onPointSelect?.(hoveredPoint);
    }
  }, [hoveredPoint, onPointSelect]);

  // Time controls
  const playPause = () => setIsPlaying(!isPlaying);
  const skipToStart = () => setCurrentTimeIndex(0);
  const skipToEnd = () => setCurrentTimeIndex(100);
  const stepForward = () => setCurrentTimeIndex(prev => Math.min(100, prev + 5));
  const stepBackward = () => setCurrentTimeIndex(prev => Math.max(0, prev - 5));

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : 'space-y-4'}`}>
      {/* Map Controls Header */}
      <Card className="bg-gradient-to-r from-blue-900 to-teal-900 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Geospatial Map Visualization</h2>
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {currentData.length} points
              </Badge>
              {geographicalColumns.time && (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Time Series
                </Badge>
              )}
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
              <Button
                variant="outline"
                size="sm"
                className="text-white border-blue-600 hover:bg-blue-800"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Map Configuration Controls */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                        {param.includes('velocity') && <Wind className="w-4 h-4" />}
                        <span>{param.charAt(0).toUpperCase() + param.slice(1).replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Projection</label>
              <Select value={mapProjection} onValueChange={setMapProjection}>
                <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  {projections.map(proj => (
                    <SelectItem key={proj.id} value={proj.id} className="text-white">
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Color Scale</label>
              <Select value={colorScale} onValueChange={setColorScale}>
                <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  {colorScales.map(scale => (
                    <SelectItem key={scale.id} value={scale.id} className="text-white">
                      <div className="flex items-center space-x-2">
                        <Palette className="w-4 h-4" />
                        <span>{scale.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Visualization</label>
              <Select value={visualizationType} onValueChange={setVisualizationType}>
                <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  <SelectItem value="heatmap" className="text-white">Heatmap</SelectItem>
                  <SelectItem value="circles" className="text-white">Circles</SelectItem>
                  <SelectItem value="squares" className="text-white">Squares</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Point Size: {pointSize}
              </label>
              <Slider
                value={[pointSize]}
                onValueChange={(value) => setPointSize(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                  className="data-[state=checked]:bg-blue-500"
                />
                <label className="text-sm text-gray-300">Grid</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showLegend}
                  onCheckedChange={setShowLegend}
                  className="data-[state=checked]:bg-blue-500"
                />
                <label className="text-sm text-gray-300">Legend</label>
              </div>
            </div>
          </div>

          {/* Time Controls */}
          {showTimeControls && (
            <div className="bg-blue-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Time Animation Controls</span>
                </h3>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {timeBasedData.length} time steps
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipToStart}
                      className="text-white border-blue-600"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stepBackward}
                      className="text-white border-blue-600"
                    >
                      <SkipBack className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={playPause}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stepForward}
                      className="text-white border-blue-600"
                    >
                      <SkipForward className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipToEnd}
                      className="text-white border-blue-600"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Time Progress: {currentTimeIndex}%
                  </label>
                  <Slider
                    value={[currentTimeIndex]}
                    onValueChange={(value) => setCurrentTimeIndex(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Speed: {animationSpeed}ms
                  </label>
                  <Slider
                    value={[animationSpeed]}
                    onValueChange={(value) => setAnimationSpeed(value[0])}
                    min={100}
                    max={2000}
                    step={100}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Map Display */}
      <div className="grid grid-cols-12 gap-4">
        {/* Map Canvas */}
        <div className="col-span-9">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center space-x-2">
                  <MapIcon className="w-5 h-5 text-blue-400" />
                  <span>Interactive World Map - {projections.find(p => p.id === mapProjection)?.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {selectedParameter.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {colorScales.find(s => s.id === colorScale)?.name}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="w-full h-auto bg-slate-800 rounded-lg cursor-crosshair"
                  onMouseMove={handleCanvasMouseMove}
                  onClick={handleCanvasClick}
                />
                
                {/* Tooltip */}
                {hoveredPoint && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white pointer-events-none">
                    <div className="text-sm font-semibold mb-1">Data Point</div>
                    <div className="text-xs space-y-1">
                      <div>Lat: {hoveredPoint.latitude.toFixed(4)}°</div>
                      <div>Lng: {hoveredPoint.longitude.toFixed(4)}°</div>
                      <div>{selectedParameter}: {hoveredPoint.value?.toFixed(2)}</div>
                      {hoveredPoint.timestamp && (
                        <div>Time: {new Date(hoveredPoint.timestamp).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="col-span-3 space-y-4">
          {/* Color Legend */}
          {showLegend && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span>Color Scale</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-white">
                    {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1).replace('_', ' ')}
                  </div>
                  
                  <div className="relative h-32 bg-gradient-to-t rounded-lg overflow-hidden"
                       style={{
                         background: `linear-gradient(to top, ${colorScales.find(s => s.id === colorScale)?.colors.join(', ')})`
                       }}>
                    <div className="absolute inset-y-0 right-0 flex flex-col justify-between text-xs text-white p-2">
                      <span>{valueRange.max.toFixed(2)}</span>
                      <span>{((valueRange.max + valueRange.min) / 2).toFixed(2)}</span>
                      <span>{valueRange.min.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {colorScales.find(s => s.id === colorScale)?.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map Statistics */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span>Map Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Total Points</div>
                    <div className="text-lg font-bold text-blue-400">{processedData.length}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Visible</div>
                    <div className="text-lg font-bold text-green-400">{currentData.length}</div>
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-sm font-medium text-white mb-2">Value Range</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min</span>
                      <span className="text-white">{valueRange.min.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max</span>
                      <span className="text-white">{valueRange.max.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Range</span>
                      <span className="text-white">{(valueRange.max - valueRange.min).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {geographicalColumns.time && (
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-2">Time Series</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time Steps</span>
                        <span className="text-white">{timeBasedData.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Step</span>
                        <span className="text-white">{Math.floor((currentTimeIndex / 100) * (timeBasedData.length - 1)) + 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Animation</span>
                        <span className={`${isPlaying ? 'text-green-400' : 'text-red-400'}`}>
                          {isPlaying ? 'Playing' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Point Details */}
          {selectedPoint && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <span>Selected Point</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-2">Location</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Latitude</span>
                        <span className="text-white">{selectedPoint.latitude.toFixed(6)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Longitude</span>
                        <span className="text-white">{selectedPoint.longitude.toFixed(6)}°</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-2">Data Values</div>
                    <div className="space-y-1 text-xs">
                      {availableParameters.map(param => (
                        <div key={param} className="flex justify-between">
                          <span className="text-gray-400">{param}</span>
                          <span className="text-white">{selectedPoint[param]?.toFixed(2) || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedPoint.timestamp && (
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-sm font-medium text-white mb-2">Timestamp</div>
                      <div className="text-xs text-gray-300">
                        {new Date(selectedPoint.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map Controls */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Map Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Opacity: {opacity}%
                </label>
                <Slider
                  value={[opacity]}
                  onValueChange={(value) => setOpacity(value[0])}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
              
              {visualizationType === 'heatmap' && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Heatmap Intensity: {heatmapIntensity}
                  </label>
                  <Slider
                    value={[heatmapIntensity]}
                    onValueChange={(value) => setHeatmapIntensity(value[0])}
                    min={10}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button variant="outline" className="w-full text-white border-slate-600">
                  <Satellite className="w-4 h-4 mr-2" />
                  Satellite View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeospatialMapVisualization;