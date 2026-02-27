import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

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

interface InteractiveMapProps {
  data: OceanData[];
  parameter: string;
  onLocationSelect: (location: OceanData) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ data, parameter, onLocationSelect }) => {
  const [zoom, setZoom] = useState(4);
  const [center, setCenter] = useState({ lat: 10, lng: 75 });
  const [selectedPoint, setSelectedPoint] = useState<OceanData | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate data bounds
  const bounds = useMemo(() => {
    if (data.length === 0) return { minLat: 0, maxLat: 20, minLng: 60, maxLng: 90 };
    
    const lats = data.map(d => d.latitude);
    const lngs = data.map(d => d.longitude);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  }, [data]);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number) => {
    const mapWidth = 800;
    const mapHeight = 600;
    
    // Mercator projection approximation
    const x = ((lng - center.lng) * zoom * 10) + mapWidth / 2;
    const y = ((center.lat - lat) * zoom * 10) + mapHeight / 2;
    
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

  // Handle mouse events for pan and zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setCenter(prev => ({
      lat: prev.lat + deltaY / (zoom * 10),
      lng: prev.lng - deltaX / (zoom * 10)
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
    <div className="w-full h-full relative bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <div className="text-white text-xs mb-2">Zoom: {zoom.toFixed(1)}</div>
          <div className="flex flex-col space-y-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(prev => Math.min(10, prev + 0.5))}
              className="w-8 h-8 p-0 text-white border-white/30"
            >
              +
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
              className="w-8 h-8 p-0 text-white border-white/30"
            >
              -
            </Button>
          </div>
        </div>
      </div>

      {/* Parameter Legend */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <div className="text-white text-xs font-semibold mb-2">{parameter.toUpperCase()}</div>
          <div className="flex flex-col space-y-1">
            {parameter === 'temperature' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-white text-xs">Cold (20°C)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-white text-xs">Warm (35°C)</span>
                </div>
              </>
            )}
            {parameter === 'salinity' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-white text-xs">Fresh (30 PSU)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-white text-xs">Saline (40 PSU)</span>
                </div>
              </>
            )}
            {parameter === 'chlorophyll' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-white text-xs">Low (0 mg/m³)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-white text-xs">High (5 mg/m³)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Coastline approximation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 100 200 Q 200 180 300 200 Q 400 220 500 200 Q 600 180 700 200 L 700 400 Q 600 420 500 400 Q 400 380 300 400 Q 200 420 100 400 Z"
            fill="rgba(139, 69, 19, 0.3)"
            stroke="rgba(139, 69, 19, 0.6)"
            strokeWidth="2"
          />
        </svg>

        {/* Data Points */}
        {data.map((point) => {
          const { x, y } = latLngToPixel(point.latitude, point.longitude);
          const color = getParameterColor(point[parameter], parameter);
          const isSelected = selectedPoint?.id === point.id;
          
          if (x < -50 || x > 850 || y < -50 || y > 650) return null;
          
          return (
            <div
              key={point.id}
              className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-150 ring-2 ring-white' : 'hover:scale-125'
              }`}
              style={{
                left: x - 6,
                top: y - 6,
                backgroundColor: color,
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
              }}
              onClick={() => {
                setSelectedPoint(point);
                onLocationSelect(point);
              }}
              title={`${parameter}: ${point[parameter]?.toFixed(2) || 'N/A'}`}
            />
          );
        })}

        {/* Current Vectors (if velocity data available) */}
        {parameter === 'u_velocity' && data.map((point) => {
          if (!point.u_velocity || !point.v_velocity) return null;
          
          const { x, y } = latLngToPixel(point.latitude, point.longitude);
          if (x < -50 || x > 850 || y < -50 || y > 650) return null;
          
          const scale = 20;
          const endX = x + (point.u_velocity * scale);
          const endY = y - (point.v_velocity * scale);
          
          return (
            <svg
              key={`vector-${point.id}`}
              className="absolute pointer-events-none"
              style={{ left: x - 25, top: y - 25, width: 50, height: 50 }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="yellow" />
                </marker>
              </defs>
              <line
                x1="25"
                y1="25"
                x2={25 + (point.u_velocity * scale)}
                y2={25 - (point.v_velocity * scale)}
                stroke="yellow"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          );
        })}
      </div>

      {/* Selected Point Info */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="text-sm font-semibold mb-2">Data Point Info</div>
            <div className="text-xs space-y-1">
              <div>Lat: {selectedPoint.latitude.toFixed(3)}°</div>
              <div>Lng: {selectedPoint.longitude.toFixed(3)}°</div>
              {selectedPoint.depth && <div>Depth: {selectedPoint.depth}m</div>}
              <div>{parameter}: {selectedPoint[parameter]?.toFixed(2) || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Map Info */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
          <div>Center: {center.lat.toFixed(2)}°, {center.lng.toFixed(2)}°</div>
          <div>Points: {data.length}</div>
          <div>Zoom: {zoom.toFixed(1)}x</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;