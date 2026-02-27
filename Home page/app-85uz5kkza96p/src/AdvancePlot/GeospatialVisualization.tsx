import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Download, Settings } from 'lucide-react';

interface OceanData {
  id: string;
  latitude: number;
  longitude: number;
  depth?: number;
  temperature?: number;
  salinity?: number;
  chlorophyll?: number;
  timestamp?: string;
  u_velocity?: number; // East-west current velocity
  v_velocity?: number; // North-south current velocity
  ssh?: number; // Sea surface height
  bathymetry?: number; // Ocean depth (negative values)
  [key: string]: any;
}

interface GeospatialVisualizationProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
}

interface ContourLevel {
  value: number;
  color: string;
}

interface TrajectoryPoint {
  lat: number;
  lon: number;
  time: number;
  id: string;
}

interface Particle {
  id: string;
  lat: number;
  lon: number;
  u: number;
  v: number;
  age: number;
  active: boolean;
}

const GeospatialVisualization: React.FC<GeospatialVisualizationProps> = ({ 
  data, 
  onLocationSelect 
}) => {
  const [mapType, setMapType] = useState<string>('raster');
  const [projection, setProjection] = useState<string>('mercator');
  const [parameter, setParameter] = useState<string>('temperature');
  const [contourLevels, setContourLevels] = useState<number>(10);
  const [vectorScale, setVectorScale] = useState<number>(1);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Generate sample trajectory data for demonstration
  const trajectoryData = useMemo(() => {
    const trajectories: TrajectoryPoint[][] = [];
    const numTrajectories = 5;
    
    for (let i = 0; i < numTrajectories; i++) {
      const trajectory: TrajectoryPoint[] = [];
      let lat = -10 + Math.random() * 20; // Random start latitude
      let lon = 40 + Math.random() * 40; // Random start longitude
      
      for (let t = 0; t < 100; t++) {
        // Simulate drift with some randomness
        lat += (Math.random() - 0.5) * 0.1;
        lon += (Math.random() - 0.5) * 0.1;
        
        trajectory.push({
          lat,
          lon,
          time: t,
          id: `traj_${i}_${t}`
        });
      }
      trajectories.push(trajectory);
    }
    return trajectories;
  }, []);

  // Calculate contour levels for the selected parameter
  const contourData = useMemo(() => {
    if (!data.length) return [];
    
    const values = data
      .map(d => d[parameter])
      .filter(v => v !== undefined && v !== null) as number[];
    
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / contourLevels;
    
    const levels: ContourLevel[] = [];
    for (let i = 0; i <= contourLevels; i++) {
      const value = min + i * step;
      const intensity = i / contourLevels;
      levels.push({
        value,
        color: `hsl(${240 - intensity * 120}, 70%, ${50 + intensity * 30}%)`
      });
    }
    
    return levels;
  }, [data, parameter, contourLevels]);

  // Generate vector field data
  const vectorField = useMemo(() => {
    return data.filter(d => 
      d.u_velocity !== undefined && 
      d.v_velocity !== undefined &&
      d.latitude !== undefined &&
      d.longitude !== undefined
    ).map(d => ({
      lat: d.latitude,
      lon: d.longitude,
      u: d.u_velocity || 0,
      v: d.v_velocity || 0,
      magnitude: Math.sqrt((d.u_velocity || 0) ** 2 + (d.v_velocity || 0) ** 2)
    }));
  }, [data]);

  // Initialize particles for particle tracking
  useEffect(() => {
    if (vectorField.length > 0) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        const randomPoint = vectorField[Math.floor(Math.random() * vectorField.length)];
        newParticles.push({
          id: `particle_${i}`,
          lat: randomPoint.lat + (Math.random() - 0.5) * 2,
          lon: randomPoint.lon + (Math.random() - 0.5) * 2,
          u: 0,
          v: 0,
          age: 0,
          active: true
        });
      }
      setParticles(newParticles);
    }
  }, [vectorField]);

  // Animation loop for particle tracking
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setCurrentTime(prev => prev + animationSpeed);
        
        setParticles(prevParticles => 
          prevParticles.map(particle => {
            if (!particle.active || particle.age > 100) {
              // Reset particle
              const randomPoint = vectorField[Math.floor(Math.random() * vectorField.length)];
              return {
                ...particle,
                lat: randomPoint?.lat + (Math.random() - 0.5) * 2 || particle.lat,
                lon: randomPoint?.lon + (Math.random() - 0.5) * 2 || particle.lon,
                age: 0,
                active: true
              };
            }
            
            // Find nearest velocity data
            const nearestVelocity = vectorField.reduce((nearest, current) => {
              const currentDist = Math.sqrt(
                (current.lat - particle.lat) ** 2 + (current.lon - particle.lon) ** 2
              );
              const nearestDist = Math.sqrt(
                (nearest.lat - particle.lat) ** 2 + (nearest.lon - particle.lon) ** 2
              );
              return currentDist < nearestDist ? current : nearest;
            }, vectorField[0]);
            
            if (nearestVelocity) {
              return {
                ...particle,
                lat: particle.lat + nearestVelocity.v * 0.01 * animationSpeed,
                lon: particle.lon + nearestVelocity.u * 0.01 * animationSpeed,
                u: nearestVelocity.u,
                v: nearestVelocity.v,
                age: particle.age + 1
              };
            }
            
            return particle;
          })
        );
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed, vectorField]);

  // Render different map types
  const renderMapContent = () => {
    switch (mapType) {
      case 'raster':
        return <RasterMap data={data} parameter={parameter} projection={projection} />;
      case 'contour':
        return <ContourMap data={data} parameter={parameter} levels={contourData} projection={projection} />;
      case 'vector':
        return <VectorFieldMap vectorField={vectorField} scale={vectorScale} projection={projection} />;
      case 'streamlines':
        return <StreamlineMap vectorField={vectorField} projection={projection} />;
      case 'trajectory':
        return <TrajectoryMap trajectories={trajectoryData} projection={projection} />;
      case 'particles':
        return <ParticleMap particles={particles} projection={projection} isAnimating={isAnimating} />;
      default:
        return <RasterMap data={data} parameter={parameter} projection={projection} />;
    }
  };

  const availableParameters = useMemo(() => {
    if (data.length === 0) return [];
    
    const params = ['temperature', 'salinity', 'chlorophyll', 'ssh', 'bathymetry'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Geospatial Visualization Controls</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnimating(!isAnimating)}
                className="btn-enhanced"
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentTime(0);
                  setIsAnimating(false);
                }}
                className="btn-enhanced"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Map Type</label>
              <Select value={mapType} onValueChange={setMapType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raster">Raster Map</SelectItem>
                  <SelectItem value="contour">Contour Map</SelectItem>
                  <SelectItem value="vector">Vector Field</SelectItem>
                  <SelectItem value="streamlines">Streamlines</SelectItem>
                  <SelectItem value="trajectory">Trajectories</SelectItem>
                  <SelectItem value="particles">Particle Tracking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Projection</label>
              <Select value={projection} onValueChange={setProjection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mercator">Mercator</SelectItem>
                  <SelectItem value="plateCarree">Plate Carrée</SelectItem>
                  <SelectItem value="robinson">Robinson</SelectItem>
                  <SelectItem value="orthographic">Orthographic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(mapType === 'raster' || mapType === 'contour') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Parameter</label>
                <Select value={parameter} onValueChange={setParameter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParameters.map(param => (
                      <SelectItem key={param} value={param}>
                        {param.charAt(0).toUpperCase() + param.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {mapType === 'contour' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contour Levels: {contourLevels}
                </label>
                <Slider
                  value={[contourLevels]}
                  onValueChange={(value) => setContourLevels(value[0])}
                  min={5}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
            
            {mapType === 'vector' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Vector Scale: {vectorScale}x
                </label>
                <Slider
                  value={[vectorScale]}
                  onValueChange={(value) => setVectorScale(value[0])}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
            
            {mapType === 'particles' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Animation Speed: {animationSpeed}x
                </label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Visualization */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {mapType.charAt(0).toUpperCase() + mapType.slice(1)} Visualization
              {(mapType === 'raster' || mapType === 'contour') && 
                ` - ${parameter.charAt(0).toUpperCase() + parameter.slice(1)}`
              }
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Projection: {projection.charAt(0).toUpperCase() + projection.slice(1)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[600px] bg-secondary/20 rounded-lg overflow-hidden">
            {renderMapContent()}
            
            {/* Legend */}
            {(mapType === 'raster' || mapType === 'contour') && contourData.length > 0 && (
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  {parameter.charAt(0).toUpperCase() + parameter.slice(1)}
                </h4>
                <div className="space-y-1">
                  {contourData.slice(0, 5).map((level, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="text-muted-foreground">
                        {level.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {contourData.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ... and {contourData.length - 5} more levels
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Animation controls overlay */}
            {(mapType === 'particles' || mapType === 'trajectory') && (
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="btn-enhanced"
                  >
                    {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Time: {currentTime.toFixed(1)}s
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information Panel */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Visualization Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Current Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Map Type:</span>
                  <span className="text-foreground font-medium">{mapType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projection:</span>
                  <span className="text-foreground font-medium">{projection}</span>
                </div>
                {(mapType === 'raster' || mapType === 'contour') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parameter:</span>
                    <span className="text-foreground font-medium">{parameter}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Points:</span>
                  <span className="text-foreground font-medium">{data.length}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">Map Features</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {mapType === 'raster' && (
                  <p>• Satellite-like imagery representation</p>
                )}
                {mapType === 'contour' && (
                  <p>• Bathymetry and parameter contours</p>
                )}
                {mapType === 'vector' && (
                  <p>• Current and wind direction arrows</p>
                )}
                {mapType === 'streamlines' && (
                  <p>• Flow circulation patterns</p>
                )}
                {mapType === 'trajectory' && (
                  <p>• Buoy and drifter movement paths</p>
                )}
                {mapType === 'particles' && (
                  <p>• Simulated particle transport</p>
                )}
                <p>• Interactive data point selection</p>
                <p>• Multiple projection support</p>
                <p>• Real-time animation capabilities</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual map components (simplified implementations)
const RasterMap: React.FC<{ data: OceanData[], parameter: string, projection: string }> = ({ data, parameter, projection }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-blue-600/20">
      <div className="text-center">
        <div className="text-lg font-semibold text-foreground mb-2">Raster Map Visualization</div>
        <div className="text-sm text-muted-foreground">
          Showing {parameter} data as satellite-like imagery
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Projection: {projection} | Data points: {data.length}
        </div>
      </div>
    </div>
  );
};

const ContourMap: React.FC<{ data: OceanData[], parameter: string, levels: ContourLevel[], projection: string }> = ({ data, parameter, levels, projection }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-900/20 to-green-600/20">
      <div className="text-center">
        <div className="text-lg font-semibold text-foreground mb-2">Contour Map Visualization</div>
        <div className="text-sm text-muted-foreground">
          Bathymetry and {parameter} contours with {levels.length} levels
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Projection: {projection} | Data points: {data.length}
        </div>
      </div>
    </div>
  );
};

const VectorFieldMap: React.FC<{ vectorField: any[], scale: number, projection: string }> = ({ vectorField, scale, projection }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-purple-600/20">
      <div className="text-center">
        <div className="text-lg font-semibold text-foreground mb-2">Vector Field Visualization</div>
        <div className="text-sm text-muted-foreground">
          Current and wind vectors (Scale: {scale}x)
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Projection: {projection} | Vectors: {vectorField.length}
        </div>
      </div>
    </div>
  );
};

const StreamlineMap: React.FC<{ vectorField: any[], projection: string }> = ({ vectorField, projection }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-900/20 to-orange-600/20">
      <div className="text-center">
        <div className="text-lg font-semibold text-foreground mb-2">Streamline Visualization</div>
        <div className="text-sm text-muted-foreground">
          Flow circulation patterns and pathlines
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Projection: {projection} | Vector field: {vectorField.length} points
        </div>
      </div>
    </div>
  );
};

const TrajectoryMap: React.FC<{ trajectories: TrajectoryPoint[][], projection: string }> = ({ trajectories, projection }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/20 to-red-600/20">
      <div className="text-center">
        <div className="text-lg font-semibold text-foreground mb-2">Trajectory Visualization</div>
        <div className="text-sm text-muted-foreground">
          Buoy and drifter movement paths
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Projection: {projection} | Trajectories: {trajectories.length}
        </div>
      </div>
    </div>
  );
};

const ParticleMap: React.FC<{ particles: Particle[], projection: string, isAnimating: boolean }> = ({ particles, projection, isAnimating }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-900/20 to-cyan-600/20">
      <div className="text-center">
        <div className="text-lg font-semibold text-foreground mb-2">Particle Tracking</div>
        <div className="text-sm text-muted-foreground">
          Simulated transport animation {isAnimating ? '(Running)' : '(Paused)'}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Projection: {projection} | Particles: {particles.length}
        </div>
      </div>
    </div>
  );
};

export default GeospatialVisualization;