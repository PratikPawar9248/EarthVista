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

interface ARVRVisualizationProps {
  data: OceanData[];
  parameter: string;
  vrMode: boolean;
  arMode: boolean;
  onLocationSelect: (location: OceanData) => void;
}

const ARVRVisualization: React.FC<ARVRVisualizationProps> = ({ 
  data, 
  parameter, 
  vrMode, 
  arMode, 
  onLocationSelect 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 5 });
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Create underwater environment
  const environmentData = useMemo(() => {
    const particles = [];
    const bubbles = [];
    const fish = [];
    
    // Generate floating particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
        size: Math.random() * 0.1 + 0.05,
        speed: Math.random() * 0.02 + 0.01
      });
    }
    
    // Generate bubbles
    for (let i = 0; i < 50; i++) {
      bubbles.push({
        x: (Math.random() - 0.5) * 15,
        y: Math.random() * -10 - 5,
        z: (Math.random() - 0.5) * 15,
        size: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.05 + 0.02
      });
    }
    
    // Generate fish
    for (let i = 0; i < 20; i++) {
      fish.push({
        x: (Math.random() - 0.5) * 25,
        y: (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 25,
        size: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.03 + 0.01,
        direction: Math.random() * Math.PI * 2
      });
    }
    
    return { particles, bubbles, fish };
  }, []);

  // 3D projection with VR/AR perspective
  const project3D = (x: number, y: number, z: number, width: number, height: number) => {
    // Apply camera transformations
    const dx = x - cameraPosition.x;
    const dy = y - cameraPosition.y;
    const dz = z - cameraPosition.z;
    
    // Apply camera rotation
    const cosX = Math.cos(cameraRotation.x);
    const sinX = Math.sin(cameraRotation.x);
    const cosY = Math.cos(cameraRotation.y);
    const sinY = Math.sin(cameraRotation.y);
    
    // Rotate around Y axis
    const x1 = dx * cosY - dz * sinY;
    const z1 = dx * sinY + dz * cosY;
    
    // Rotate around X axis
    const y1 = dy * cosX - z1 * sinX;
    const z2 = dy * sinX + z1 * cosX;
    
    // VR/AR perspective projection
    const fov = vrMode ? 110 : arMode ? 90 : 60; // Wider FOV for VR
    const distance = 3;
    const scale = (width / 2) / Math.tan((fov * Math.PI / 180) / 2) / (distance + z2);
    
    return {
      x: width / 2 + x1 * scale,
      y: height / 2 - y1 * scale,
      scale: Math.max(0, scale),
      depth: z2
    };
  };

  // Get immersive color based on mode and parameter
  const getImmersiveColor = (value: number, depth: number) => {
    let baseColor = '';
    let normalized = 0;
    
    switch (parameter) {
      case 'temperature':
        normalized = Math.max(0, Math.min(1, (value - 20) / 15));
        baseColor = `hsl(${240 - normalized * 240}, 70%, ${50 + normalized * 30}%)`;
        break;
      case 'salinity':
        normalized = Math.max(0, Math.min(1, (value - 30) / 10));
        baseColor = `hsl(${120 - normalized * 120}, 70%, ${50 + normalized * 30}%)`;
        break;
      case 'chlorophyll':
        normalized = Math.max(0, Math.min(1, value / 5));
        baseColor = `hsl(${60 + normalized * 60}, 70%, ${50 + normalized * 30}%)`;
        break;
      default:
        baseColor = '#3b82f6';
    }
    
    // Adjust for depth and immersion mode
    if (vrMode) {
      // More vibrant colors in VR
      return baseColor.replace('70%', '90%');
    } else if (arMode) {
      // Semi-transparent for AR overlay
      return baseColor.replace(')', ', 0.7)').replace('hsl', 'hsla');
    }
    
    return baseColor;
  };

  // Render the immersive visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with immersive background
    if (vrMode) {
      // Deep ocean VR background
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
      gradient.addColorStop(0, 'rgba(0, 50, 100, 1)');
      gradient.addColorStop(0.5, 'rgba(0, 30, 80, 1)');
      gradient.addColorStop(1, 'rgba(0, 10, 40, 1)');
      ctx.fillStyle = gradient;
    } else if (arMode) {
      // Transparent AR background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    } else {
      // Standard 3D background
      ctx.fillStyle = 'rgba(0, 20, 60, 1)';
    }
    ctx.fillRect(0, 0, width, height);

    // Render underwater environment
    if (vrMode) {
      // Render bubbles
      environmentData.bubbles.forEach((bubble, index) => {
        const animatedY = bubble.y + (time * bubble.speed * 10) % 20;
        const projected = project3D(bubble.x, animatedY, bubble.z, width, height);
        
        if (projected.scale > 0) {
          const size = bubble.size * projected.scale * 20;
          ctx.fillStyle = `rgba(173, 216, 230, ${0.3 + Math.sin(time + index) * 0.2})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render floating particles
      environmentData.particles.forEach((particle, index) => {
        const animatedX = particle.x + Math.sin(time * particle.speed + index) * 2;
        const animatedY = particle.y + Math.cos(time * particle.speed + index) * 1;
        const projected = project3D(animatedX, animatedY, particle.z, width, height);
        
        if (projected.scale > 0) {
          const size = particle.size * projected.scale * 30;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * projected.scale})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render fish
      environmentData.fish.forEach((fish, index) => {
        const animatedX = fish.x + Math.sin(time * fish.speed + fish.direction) * 3;
        const animatedZ = fish.z + Math.cos(time * fish.speed + fish.direction) * 3;
        const projected = project3D(animatedX, fish.y, animatedZ, width, height);
        
        if (projected.scale > 0) {
          const size = fish.size * projected.scale * 15;
          ctx.fillStyle = `rgba(255, 165, 0, ${0.8 * projected.scale})`;
          ctx.beginPath();
          ctx.ellipse(projected.x, projected.y, size, size * 0.6, fish.direction, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Render oceanographic data points
    const sortedData = [...data]
      .filter(point => point[parameter] !== undefined && point[parameter] !== null)
      .map(point => {
        const projected = project3D(
          (point.longitude - 75) / 5,
          (point.latitude - 10) / 5,
          -(point.depth || 0) / 200,
          width,
          height
        );
        return { ...point, projected };
      })
      .filter(point => point.projected.scale > 0)
      .sort((a, b) => b.projected.depth - a.projected.depth);

    // Render data points with immersive effects
    sortedData.forEach((point) => {
      const { projected } = point;
      const color = getImmersiveColor(point[parameter] as number, projected.depth);
      const size = Math.max(3, projected.scale * 8);
      
      // Glow effect for VR/AR
      if (vrMode || arMode) {
        ctx.shadowColor = color;
        ctx.shadowBlur = vrMode ? 20 : 10;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add pulsing effect
      if (vrMode) {
        const pulseSize = size + Math.sin(time * 3) * 2;
        ctx.fillStyle = color.replace(')', ', 0.3)').replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
    });

    // Render UI overlays
    ctx.fillStyle = vrMode ? 'rgba(255, 255, 255, 0.9)' : 
                    arMode ? 'rgba(0, 255, 0, 0.8)' : 
                    'rgba(255, 255, 255, 0.8)';
    ctx.font = vrMode ? '18px monospace' : '14px monospace';
    
    const yOffset = vrMode ? 40 : 30;
    ctx.fillText(`Mode: ${vrMode ? 'VR' : arMode ? 'AR' : '3D'}`, 20, yOffset);
    ctx.fillText(`Parameter: ${parameter}`, 20, yOffset + 25);
    ctx.fillText(`Camera: ${cameraPosition.x.toFixed(1)}, ${cameraPosition.y.toFixed(1)}, ${cameraPosition.z.toFixed(1)}`, 20, yOffset + 50);
    
    if (vrMode) {
      ctx.fillText('🥽 VR Mode Active - Immersive Ocean Environment', 20, height - 30);
    } else if (arMode) {
      ctx.fillText('👓 AR Mode Active - Data Overlay', 20, height - 30);
    }

  }, [data, parameter, vrMode, arMode, cameraPosition, cameraRotation, time, environmentData]);

  // Handle immersive navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    if (vrMode || arMode) {
      // More sensitive controls for immersive modes
      setCameraRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01,
        z: prev.z
      }));
    } else {
      setCameraRotation(prev => ({
        x: prev.x + deltaY * 0.005,
        y: prev.y + deltaX * 0.005,
        z: prev.z
      }));
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.5 : -0.5;
    setCameraPosition(prev => ({
      ...prev,
      z: Math.max(1, Math.min(20, prev.z + delta))
    }));
  };

  return (
    <div className={`w-full h-full relative rounded-lg overflow-hidden ${
      vrMode ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-black' :
      arMode ? 'bg-gradient-to-br from-green-900/20 to-blue-900/20' :
      'bg-gradient-to-br from-slate-900 to-blue-900'
    }`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={`w-full h-full ${
          vrMode ? 'cursor-crosshair' :
          arMode ? 'cursor-pointer' :
          'cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Immersive mode indicators */}
      {vrMode && (
        <div className="absolute top-4 left-4 bg-purple-900/80 backdrop-blur-sm rounded-lg p-3 text-white border border-purple-400">
          <div className="text-lg font-bold mb-2">🥽 VR Ocean Environment</div>
          <div className="text-sm space-y-1">
            <div>• Immersive underwater experience</div>
            <div>• 360° exploration</div>
            <div>• Enhanced depth perception</div>
            <div>• Animated marine life</div>
          </div>
        </div>
      )}
      
      {arMode && (
        <div className="absolute top-4 left-4 bg-green-900/80 backdrop-blur-sm rounded-lg p-3 text-white border border-green-400">
          <div className="text-lg font-bold mb-2">👓 AR Data Overlay</div>
          <div className="text-sm space-y-1">
            <div>• Real-world integration</div>
            <div>• Transparent data layers</div>
            <div>• Contextual information</div>
            <div>• Interactive markers</div>
          </div>
        </div>
      )}
      
      {/* Navigation help */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-sm font-semibold mb-2">Navigation</div>
        <div className="text-xs space-y-1">
          <div>Drag: Rotate view</div>
          <div>Scroll: Zoom in/out</div>
          <div>Points: {data.length}</div>
        </div>
      </div>
    </div>
  );
};

export default ARVRVisualization;