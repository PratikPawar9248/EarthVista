import React, { useEffect, useRef, useMemo } from 'react';

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

interface MapVisualizationProps {
  data: OceanData[];
  parameter: string;
  onLocationSelect: (location: OceanData) => void;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ data, parameter, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const processedData = useMemo(() => {
    const values = data.map(d => d[parameter]).filter(v => v !== undefined && v !== null);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    return data.map(point => ({
      ...point,
      normalizedValue: values.length > 1 ? (point[parameter] - minValue) / (maxValue - minValue) : 0.5,
      minValue,
      maxValue
    }));
  }, [data, parameter]);

  const getColor = (normalizedValue: number) => {
    // Ocean color palette based on parameter
    if (parameter === 'temperature') {
      // Blue to red gradient
      const r = Math.floor(normalizedValue * 255);
      const b = Math.floor((1 - normalizedValue) * 255);
      return `rgb(${r}, 100, ${b})`;
    } else if (parameter === 'salinity') {
      // Blue to yellow gradient
      const r = Math.floor(normalizedValue * 255);
      const g = Math.floor(normalizedValue * 255);
      const b = Math.floor((1 - normalizedValue) * 255);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (parameter === 'chlorophyll') {
      // Blue to green gradient
      const g = Math.floor(normalizedValue * 255);
      const b = Math.floor((1 - normalizedValue) * 255);
      return `rgb(0, ${g}, ${b})`;
    } else {
      // Default blue gradient
      const intensity = Math.floor(100 + normalizedValue * 155);
      return `rgb(0, ${intensity}, 255)`;
    }
  };

  const getRadius = (normalizedValue: number) => {
    return 5 + normalizedValue * 10; // 5-15px radius
  };

  useEffect(() => {
    if (!mapRef.current || processedData.length === 0) return;

    // Simple canvas-based map implementation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = mapRef.current;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 400;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'pointer';

    // Clear existing content
    container.innerHTML = '';
    container.appendChild(canvas);

    // Calculate bounds
    const lats = processedData.map(d => d.latitude);
    const lons = processedData.map(d => d.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lonPadding = (maxLon - minLon) * 0.1;

    const bounds = {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLon: minLon - lonPadding,
      maxLon: maxLon + lonPadding
    };

    // Projection functions
    const projectX = (lon: number) => 
      ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * canvas.width;
    const projectY = (lat: number) => 
      canvas.height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * canvas.height;

    // Draw background
    ctx.fillStyle = 'hsl(220, 13%, 10%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'hsl(220, 13%, 20%)';
    ctx.lineWidth = 1;
    
    // Latitude lines
    for (let lat = Math.ceil(bounds.minLat); lat <= bounds.maxLat; lat += 5) {
      const y = projectY(lat);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Longitude lines
    for (let lon = Math.ceil(bounds.minLon); lon <= bounds.maxLon; lon += 5) {
      const x = projectX(lon);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw data points
    const pointsData: Array<{x: number, y: number, data: any}> = [];
    
    processedData.forEach(point => {
      const x = projectX(point.longitude);
      const y = projectY(point.latitude);
      const radius = getRadius(point.normalizedValue);
      const color = getColor(point.normalizedValue);

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Store for click detection
      pointsData.push({ x, y, data: point });
    });

    // Handle clicks
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Find closest point
      let closestPoint = null;
      let minDistance = Infinity;

      pointsData.forEach(({ x, y, data }) => {
        const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
        if (distance < 20 && distance < minDistance) { // 20px click tolerance
          minDistance = distance;
          closestPoint = data;
        }
      });

      if (closestPoint) {
        onLocationSelect(closestPoint);
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [processedData, parameter, onLocationSelect]);

  if (processedData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-lg">
        <p>No geographic data available for {parameter}</p>
      </div>
    );
  }

  const minValue = processedData[0]?.minValue || 0;
  const maxValue = processedData[0]?.maxValue || 1;

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="h-96 w-full bg-secondary/20 rounded-lg border border-border overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Legend */}
      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {parameter.charAt(0).toUpperCase() + parameter.slice(1)}
          </span>
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getColor(0) }}
            />
            <span className="text-xs text-muted-foreground">
              {minValue.toFixed(2)}
            </span>
          </div>
          <div className="w-20 h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500" />
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {maxValue.toFixed(2)}
            </span>
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getColor(1) }}
            />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {processedData.length} data points • Click points to view details
        </div>
      </div>

      {/* Coordinate Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-primary">
            {Math.min(...processedData.map(d => d.latitude)).toFixed(2)}°
          </div>
          <div className="text-sm text-muted-foreground">Min Latitude</div>
        </div>
        
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-primary">
            {Math.max(...processedData.map(d => d.latitude)).toFixed(2)}°
          </div>
          <div className="text-sm text-muted-foreground">Max Latitude</div>
        </div>
        
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-accent">
            {Math.min(...processedData.map(d => d.longitude)).toFixed(2)}°
          </div>
          <div className="text-sm text-muted-foreground">Min Longitude</div>
        </div>
        
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-accent">
            {Math.max(...processedData.map(d => d.longitude)).toFixed(2)}°
          </div>
          <div className="text-sm text-muted-foreground">Max Longitude</div>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;