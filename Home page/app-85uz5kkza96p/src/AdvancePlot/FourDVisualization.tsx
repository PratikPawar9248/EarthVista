import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

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

interface FourDVisualizationProps {
  data: OceanData[];
  parameter: string;
  timeStep: number;
  onLocationSelect: (location: OceanData) => void;
}

const FourDVisualization: React.FC<FourDVisualizationProps> = ({ 
  data, 
  parameter, 
  timeStep, 
  onLocationSelect 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Create 3D grid of data points with time evolution
  const gridData = useMemo(() => {
    if (data.length === 0) return [];

    // Create a 3D grid: lat, lng, depth, time
    const grid = [];
    const timeSlices = 10; // Number of time slices
    
    for (let t = 0; t < timeSlices; t++) {
      const timeProgress = t / (timeSlices - 1);
      
      data.forEach((point, index) => {
        if (point[parameter] !== undefined && point[parameter] !== null) {
          // Simulate temporal evolution
          const baseValue = point[parameter] as number;
          const timeVariation = Math.sin(timeProgress * Math.PI * 2 + index * 0.1) * 0.2;
          const currentValue = baseValue * (1 + timeVariation);
          
          grid.push({
            x: point.longitude,
            y: point.latitude,
            z: -(point.depth || 0) / 100, // Negative depth for visualization
            t: timeProgress,
            value: currentValue,
            originalPoint: point
          });
        }
      });
    }
    
    return grid;
  }, [data, parameter]);

  // Filter data based on current time step
  const currentTimeData = useMemo(() => {
    const targetTime = timeStep / 100;
    const tolerance = 0.15;
    
    return gridData.filter(point => 
      Math.abs(point.t - targetTime) < tolerance
    );
  }, [gridData, timeStep]);

  // 3D to 2D projection
  const project3D = (x: number, y: number, z: number, width: number, height: number) => {
    // Apply rotation
    const cosX = Math.cos(rotation.x * Math.PI / 180);
    const sinX = Math.sin(rotation.x * Math.PI / 180);
    const cosY = Math.cos(rotation.y * Math.PI / 180);
    const sinY = Math.sin(rotation.y * Math.PI / 180);

    // Rotate around Y axis
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotate around X axis
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective projection
    const distance = 5;
    const scale = 200 / (distance + z2);
    
    return {
      x: width / 2 + x1 * scale,
      y: height / 2 - y1 * scale,
      scale: scale
    };
  };

  // Get color based on parameter value
  const getColor = (value: number) => {
    let normalized = 0;
    switch (parameter) {
      case 'temperature':
        normalized = Math.max(0, Math.min(1, (value - 20) / 15));
        break;
      case 'salinity':
        normalized = Math.max(0, Math.min(1, (value - 30) / 10));
        break;
      case 'chlorophyll':
        normalized = Math.max(0, Math.min(1, value / 5));
        break;
      default:
        normalized = 0.5;
    }
    
    const hue = 240 - normalized * 240; // Blue to red
    return `hsl(${hue}, 70%, ${50 + normalized * 30}%)`;
  };

  // Render the 4D visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 20, 40, 1)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw 3D grid
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const p1 = project3D(i, j, -2, width, height);
        const p2 = project3D(i, j, 2, width, height);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // Sort points by depth for proper rendering
    const sortedData = [...currentTimeData].sort((a, b) => b.z - a.z);

    // Draw data points
    sortedData.forEach((point) => {
      const projected = project3D(
        (point.x - 75) / 10, // Normalize longitude
        (point.y - 10) / 10, // Normalize latitude
        point.z,
        width,
        height
      );

      if (projected.x < 0 || projected.x > width || projected.y < 0 || projected.y > height) return;

      const color = getColor(point.value);
      const size = Math.max(2, projected.scale * 0.5);
      
      // Draw point with glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw connecting lines for temporal continuity
      if (point.t > 0) {
        const prevTimeData = gridData.find(p => 
          p.originalPoint.id === point.originalPoint.id && 
          Math.abs(p.t - (point.t - 0.1)) < 0.05
        );
        
        if (prevTimeData) {
          const prevProjected = project3D(
            (prevTimeData.x - 75) / 10,
            (prevTimeData.y - 10) / 10,
            prevTimeData.z,
            width,
            height
          );
          
          ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(prevProjected.x, prevProjected.y);
          ctx.lineTo(projected.x, projected.y);
          ctx.stroke();
        }
      }
    });

    // Draw time indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px monospace';
    ctx.fillText(`Time: ${timeStep}%`, 20, 30);
    ctx.fillText(`Parameter: ${parameter}`, 20, 50);
    ctx.fillText(`Points: ${currentTimeData.length}`, 20, 70);
    
    // Draw rotation info
    ctx.fillText(`Rotation: ${rotation.x.toFixed(0)}°, ${rotation.y.toFixed(0)}°`, 20, height - 20);

  }, [currentTimeData, rotation, parameter, timeStep]);

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 to-blue-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-sm font-semibold mb-2">4D Controls</div>
        <div className="text-xs space-y-1">
          <div>Drag to rotate</div>
          <div>Time: {timeStep}%</div>
          <div>Points: {currentTimeData.length}</div>
        </div>
      </div>

      {/* Parameter legend */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-sm font-semibold mb-2">{parameter.toUpperCase()}</div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span>Low</span>
          <div className="w-8 h-2 bg-gradient-to-r from-blue-400 to-red-400 rounded"></div>
          <span>High</span>
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
        </div>
      </div>
    </div>
  );
};

export default FourDVisualization;