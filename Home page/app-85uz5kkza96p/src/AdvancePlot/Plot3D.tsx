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

interface Plot3DProps {
  data: OceanData[];
  parameter: string;
  onPointClick: (location: OceanData) => void;
}

const Plot3D: React.FC<Plot3DProps> = ({ data, parameter, onPointClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotationRef = useRef({ x: 0.3, y: 0.5 });

  const processedData = useMemo(() => {
    const values = data.map(d => d[parameter]).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return [];

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Normalize coordinates
    const lats = data.map(d => d.latitude);
    const lons = data.map(d => d.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    return data
      .filter(point => point[parameter] !== undefined && point[parameter] !== null)
      .map(point => ({
        x: ((point.longitude - minLon) / (maxLon - minLon) - 0.5) * 2, // -1 to 1
        y: ((point.latitude - minLat) / (maxLat - minLat) - 0.5) * 2,   // -1 to 1
        z: point.depth ? -point.depth / 1000 : 0, // Depth in km, negative for ocean
        value: point[parameter],
        normalizedValue: (point[parameter] - minValue) / (maxValue - minValue),
        originalData: point,
        minValue,
        maxValue
      }));
  }, [data, parameter]);

  const getColor = (normalizedValue: number) => {
    if (parameter === 'temperature') {
      const r = Math.floor(normalizedValue * 255);
      const b = Math.floor((1 - normalizedValue) * 255);
      return `rgb(${r}, 100, ${b})`;
    } else if (parameter === 'salinity') {
      const r = Math.floor(normalizedValue * 255);
      const g = Math.floor(normalizedValue * 255);
      const b = Math.floor((1 - normalizedValue) * 255);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (parameter === 'chlorophyll') {
      const g = Math.floor(normalizedValue * 255);
      const b = Math.floor((1 - normalizedValue) * 255);
      return `rgb(0, ${g}, ${b})`;
    } else {
      const intensity = Math.floor(100 + normalizedValue * 155);
      return `rgb(0, ${intensity}, 255)`;
    }
  };

  // 3D projection functions
  const project3D = (x: number, y: number, z: number, canvas: HTMLCanvasElement) => {
    const { x: rotX, y: rotY } = rotationRef.current;
    
    // Rotate around Y axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    
    // Rotate around X axis
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    
    // Perspective projection
    const distance = 3;
    const scale = distance / (distance + z2);
    
    return {
      x: (x1 * scale * 200) + canvas.width / 2,
      y: (y1 * scale * 200) + canvas.height / 2,
      scale: scale
    };
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(220, 13%, 8%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'hsl(220, 13%, 20%)';
    ctx.lineWidth = 1;
    
    // Grid lines
    for (let i = -1; i <= 1; i += 0.5) {
      // Horizontal lines
      const start = project3D(-1, i, 0, canvas);
      const end = project3D(1, i, 0, canvas);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      
      // Vertical lines
      const vStart = project3D(i, -1, 0, canvas);
      const vEnd = project3D(i, 1, 0, canvas);
      ctx.beginPath();
      ctx.moveTo(vStart.x, vStart.y);
      ctx.lineTo(vEnd.x, vEnd.y);
      ctx.stroke();
    }

    // Sort points by z-depth for proper rendering
    const sortedPoints = [...processedData].sort((a, b) => {
      const projA = project3D(a.x, a.y, a.z, canvas);
      const projB = project3D(b.x, b.y, b.z, canvas);
      return projB.scale - projA.scale; // Far to near
    });

    // Draw data points
    sortedPoints.forEach(point => {
      const projected = project3D(point.x, point.y, point.z, canvas);
      const radius = 3 + point.normalizedValue * 8; // 3-11px radius
      const scaledRadius = radius * projected.scale;
      
      if (scaledRadius > 0.5) { // Only draw visible points
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, scaledRadius, 0, 2 * Math.PI);
        ctx.fillStyle = getColor(point.normalizedValue);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = getColor(point.normalizedValue);
        ctx.shadowBlur = scaledRadius;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Add outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw axes labels
    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.font = '12px Inter';
    
    const xAxis = project3D(1.2, 0, 0, canvas);
    const yAxis = project3D(0, 1.2, 0, canvas);
    const zAxis = project3D(0, 0, -1.2, canvas);
    
    ctx.fillText('Longitude', xAxis.x, xAxis.y);
    ctx.fillText('Latitude', yAxis.x, yAxis.y);
    ctx.fillText('Depth', zAxis.x, zAxis.y);
  };

  const animate = () => {
    drawScene();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDown) return;
      
      const deltaX = e.clientX - mouseRef.current.x;
      const deltaY = e.clientY - mouseRef.current.y;
      
      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;
      
      // Clamp rotation
      rotationRef.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationRef.current.x));
      
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Find closest point
      let closestPoint = null;
      let minDistance = Infinity;

      processedData.forEach(point => {
        const projected = project3D(point.x, point.y, point.z, canvas);
        const distance = Math.sqrt((clickX - projected.x) ** 2 + (clickY - projected.y) ** 2);
        const radius = (3 + point.normalizedValue * 8) * projected.scale;
        
        if (distance < radius + 10 && distance < minDistance) {
          minDistance = distance;
          closestPoint = point.originalData;
        }
      });

      if (closestPoint) {
        onPointClick(closestPoint);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.style.cursor = 'grab';

    // Start animation
    animate();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [processedData, parameter, onPointClick]);

  if (processedData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-lg">
        <p>No 3D data available for {parameter}</p>
      </div>
    );
  }

  const minValue = processedData[0]?.minValue || 0;
  const maxValue = processedData[0]?.maxValue || 1;

  return (
    <div className="space-y-4">
      <canvas 
        ref={canvasRef}
        className="w-full h-96 bg-secondary/20 rounded-lg border border-border cursor-grab active:cursor-grabbing"
        style={{ minHeight: '400px' }}
      />
      
      {/* Controls and Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legend */}
        <div className="p-4 bg-secondary/30 rounded-lg">
          <h4 className="font-semibold mb-3">3D Visualization Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Parameter:</span>
              <span className="font-medium">{parameter.charAt(0).toUpperCase() + parameter.slice(1)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getColor(0) }}
              />
              <span className="text-xs">{minValue.toFixed(2)}</span>
              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500" />
              <span className="text-xs">{maxValue.toFixed(2)}</span>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getColor(1) }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-secondary/30 rounded-lg">
          <h4 className="font-semibold mb-3">Controls</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Drag to rotate the 3D view</p>
            <p>• Click on points to view details</p>
            <p>• Size indicates parameter value</p>
            <p>• Z-axis represents depth (if available)</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-primary">
            {processedData.length}
          </div>
          <div className="text-sm text-muted-foreground">Data Points</div>
        </div>
        
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-accent">
            {processedData.filter(d => d.z < 0).length}
          </div>
          <div className="text-sm text-muted-foreground">With Depth</div>
        </div>
        
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-green-500">
            {((maxValue - minValue) / maxValue * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Value Range</div>
        </div>
      </div>
    </div>
  );
};

export default Plot3D;