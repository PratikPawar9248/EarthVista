import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, Map, BarChart3, TrendingUp, Globe, 
  Play, Pause, RotateCcw, Maximize2, Minimize2, Settings,
  Layers, Clock, Wifi, Navigation, Activity
} from 'lucide-react';

// Import real interactive components
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

interface DashboardProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  components: {
    map: { span: number; height: string };
    charts: { span: number; height: string };
    stats: { span: number; height: string };
    timeline: { span: number; height: string };
  };
}

const OceanographyDashboard: React.FC<DashboardProps> = ({ data, onLocationSelect }) => {
  const [selectedLayout, setSelectedLayout] = useState<string>('research');
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100]);
  const [isRealTime, setIsRealTime] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dashboard layouts
  const dashboardLayouts: Record<string, DashboardLayout> = {
    research: {
      id: 'research',
      name: 'Research Dashboard',
      description: 'Comprehensive view for scientific analysis',
      components: {
        map: { span: 8, height: 'h-[400px]' },
        charts: { span: 4, height: 'h-[400px]' },
        stats: { span: 12, height: 'h-[200px]' },
        timeline: { span: 12, height: 'h-[150px]' }
      }
    },
    monitoring: {
      id: 'monitoring',
      name: 'Real-time Monitoring',
      description: 'Live data monitoring and alerts',
      components: {
        map: { span: 6, height: 'h-[350px]' },
        charts: { span: 6, height: 'h-[350px]' },
        stats: { span: 6, height: 'h-[250px]' },
        timeline: { span: 6, height: 'h-[250px]' }
      }
    },
    analysis: {
      id: 'analysis',
      name: 'Data Analysis',
      description: 'Statistical analysis and visualization',
      components: {
        map: { span: 4, height: 'h-[300px]' },
        charts: { span: 8, height: 'h-[300px]' },
        stats: { span: 12, height: 'h-[200px]' },
        timeline: { span: 12, height: 'h-[200px]' }
      }
    },
    presentation: {
      id: 'presentation',
      name: 'Presentation Mode',
      description: 'Clean layout for presentations',
      components: {
        map: { span: 12, height: 'h-[500px]' },
        charts: { span: 6, height: 'h-[300px]' },
        stats: { span: 6, height: 'h-[300px]' },
        timeline: { span: 12, height: 'h-[150px]' }
      }
    }
  };

  const currentLayout = dashboardLayouts[selectedLayout];

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && isRealTime) {
      const interval = setInterval(() => {
        // Simulate data refresh
        console.log('Refreshing data...');
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, isRealTime, refreshInterval]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (data.length === 0) return {};

    const stats: Record<string, any> = {};
    const parameters = ['temperature', 'salinity', 'chlorophyll', 'depth'];

    parameters.forEach(param => {
      const values = data
        .map(d => d[param])
        .filter(v => v !== undefined && v !== null) as number[];

      if (values.length > 0) {
        stats[param] = {
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          mean: values.reduce((sum, v) => sum + v, 0) / values.length,
          median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
        };
      }
    });

    return stats;
  }, [data]);

  // Filter data by time range
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    const timestamps = data
      .map(d => d.timestamp ? new Date(d.timestamp).getTime() : Date.now())
      .filter(t => !isNaN(t));

    if (timestamps.length === 0) return data;

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const range = maxTime - minTime;

    const startTime = minTime + (range * timeRange[0]) / 100;
    const endTime = minTime + (range * timeRange[1]) / 100;

    return data.filter(d => {
      if (!d.timestamp) return true;
      const time = new Date(d.timestamp).getTime();
      return time >= startTime && time <= endTime;
    });
  }, [data, timeRange]);

  const availableParameters = useMemo(() => {
    if (data.length === 0) return [];
    
    const params = ['temperature', 'salinity', 'chlorophyll', 'ssh', 'bathymetry', 'u_velocity', 'v_velocity'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  return (
    <div className={isFullscreen ? 'space-y-6 fixed inset-0 z-50 bg-background p-6 overflow-auto' : 'space-y-6'}>
      {/* Dashboard Controls */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span>Oceanography Dashboard</span>
              {isRealTime && (
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
                onClick={() => setIsRealTime(!isRealTime)}
                className={`btn-enhanced ${isRealTime ? 'bg-green-500/20 text-green-400' : ''}`}
              >
                {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Dashboard Layout</label>
              <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(dashboardLayouts).map(layout => (
                    <SelectItem key={layout.id} value={layout.id}>
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Primary Parameter</label>
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
              <label className="text-sm font-medium text-foreground mb-2 block">
                Time Range: {timeRange[0]}% - {timeRange[1]}%
              </label>
              <div className="space-y-2">
                <Slider
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as [number, number])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Auto Refresh: {refreshInterval}s
              </label>
              <div className="space-y-2">
                <Slider
                  value={[refreshInterval]}
                  onValueChange={(value) => setRefreshInterval(value[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`btn-enhanced w-full ${autoRefresh ? 'bg-blue-500/20 text-blue-400' : ''}`}
                >
                  {autoRefresh ? 'Auto ON' : 'Auto OFF'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Top Row - Map and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="card-enhanced">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Map className="w-5 h-5 text-primary" />
                    <span>Interactive Map</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {filteredData.length} points
                    </Badge>
                    <Button variant="outline" size="sm" className="btn-enhanced">
                      <Layers className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <DashboardMap 
                  data={filteredData}
                  parameter={selectedParameter}
                  onLocationSelect={onLocationSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Charts Panel */}
          <div className="lg:col-span-1">
            <Card className="card-enhanced">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <span>Data Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <DashboardChart 
                  data={filteredData}
                  parameter={selectedParameter}
                  type="histogram"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Middle Row - Statistics */}
        <div className="grid grid-cols-1">
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Real-time Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <DashboardStats 
                statistics={statistics}
                selectedParameter={selectedParameter}
                dataCount={filteredData.length}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Timeline */}
        <div className="grid grid-cols-1">
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-accent" />
                <span>Temporal Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[150px]">
              <DashboardTimeline 
                data={filteredData}
                parameter={selectedParameter}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard Info */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Dashboard Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Current Layout</h4>
              <p className="text-sm text-muted-foreground mb-1">{currentLayout.name}</p>
              <p className="text-xs text-muted-foreground">{currentLayout.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Data Summary</h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Total Points: <span className="text-foreground">{data.length}</span></p>
                <p className="text-muted-foreground">Filtered: <span className="text-foreground">{filteredData.length}</span></p>
                <p className="text-muted-foreground">Parameters: <span className="text-foreground">{availableParameters.length}</span></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">System Status</h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Real-time: <span className={isRealTime ? 'text-green-400' : 'text-red-400'}>{isRealTime ? 'Active' : 'Inactive'}</span></p>
                <p className="text-muted-foreground">Auto Refresh: <span className={autoRefresh ? 'text-blue-400' : 'text-muted-foreground'}>{autoRefresh ? 'Enabled' : 'Disabled'}</span></p>
                <p className="text-muted-foreground">Last Update: <span className="text-foreground">{new Date().toLocaleTimeString()}</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard component implementations
const DashboardMap: React.FC<{
  data: OceanData[];
  parameter: string;
  onLocationSelect: (location: OceanData) => void;
}> = ({ data, parameter, onLocationSelect }) => {
  return (
    <div className="w-full h-full">
      <InteractiveMap 
        data={data}
        parameter={parameter}
        onLocationSelect={onLocationSelect}
      />
    </div>
  );
};

const DashboardChart: React.FC<{
  data: OceanData[];
  parameter: string;
  type: 'histogram' | 'scatter' | 'line';
}> = ({ data, parameter, type }) => {
  const chartData = data.filter(d => d[parameter] !== undefined && d[parameter] !== null);
  const values = chartData.map(d => d[parameter] as number);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const mean = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg p-4">
      <div className="text-lg font-semibold text-foreground mb-4 text-center">
        {type.charAt(0).toUpperCase() + type.slice(1)} - {parameter.replace('_', ' ')}
      </div>
      
      {/* Simple SVG Chart */}
      <svg className="w-full h-3/4" viewBox="0 0 400 200">
        {/* Chart background */}
        <rect width="400" height="200" fill="rgba(0,0,0,0.1)" rx="8" />
        
        {/* Create histogram */}
        {(() => {
          const bins = 10;
          const binSize = (max - min) / bins;
          const histogram = Array(bins).fill(0);
          
          values.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
            histogram[binIndex]++;
          });

          const maxCount = Math.max(...histogram);

          return histogram.map((count, index) => {
            const barHeight = maxCount > 0 ? (count / maxCount) * 160 : 0;
            const barWidth = 35;
            const x = 20 + index * 36;
            const y = 180 - barHeight;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`hsl(${240 - (index / bins) * 240}, 70%, 60%)`}
                  opacity="0.8"
                />
                <text
                  x={x + barWidth / 2}
                  y={195}
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                >
                  {(min + index * binSize).toFixed(1)}
                </text>
              </g>
            );
          });
        })()}
        
        {/* Chart title */}
        <text x="200" y="15" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="bold">
          Distribution of {parameter.replace('_', ' ')}
        </text>
      </svg>
      
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div className="bg-secondary/30 rounded p-2 text-center">
          <div className="text-green-400 font-semibold">{min.toFixed(2)}</div>
          <div className="text-muted-foreground">Min</div>
        </div>
        <div className="bg-secondary/30 rounded p-2 text-center">
          <div className="text-primary font-semibold">{mean.toFixed(2)}</div>
          <div className="text-muted-foreground">Mean</div>
        </div>
        <div className="bg-secondary/30 rounded p-2 text-center">
          <div className="text-red-400 font-semibold">{max.toFixed(2)}</div>
          <div className="text-muted-foreground">Max</div>
        </div>
      </div>
    </div>
  );
};

const DashboardStats: React.FC<{
  statistics: Record<string, any>;
  selectedParameter: string;
  dataCount: number;
}> = ({ statistics, selectedParameter, dataCount }) => {
  const paramStats = statistics[selectedParameter];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
      <div className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex flex-col items-center justify-center">
        <div className="stat-value text-primary text-2xl font-bold">{dataCount}</div>
        <div className="stat-label text-xs text-muted-foreground uppercase tracking-wide">Data Points</div>
      </div>
      {paramStats ? (
        <>
          <div className="stat-card bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 flex flex-col items-center justify-center">
            <div className="stat-value text-green-400 text-2xl font-bold">{paramStats.mean?.toFixed(2)}</div>
            <div className="stat-label text-xs text-muted-foreground uppercase tracking-wide">Mean Value</div>
          </div>
          <div className="stat-card bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 flex flex-col items-center justify-center">
            <div className="stat-value text-blue-400 text-2xl font-bold">{paramStats.min?.toFixed(2)}</div>
            <div className="stat-label text-xs text-muted-foreground uppercase tracking-wide">Minimum</div>
          </div>
          <div className="stat-card bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 flex flex-col items-center justify-center">
            <div className="stat-value text-red-400 text-2xl font-bold">{paramStats.max?.toFixed(2)}</div>
            <div className="stat-label text-xs text-muted-foreground uppercase tracking-wide">Maximum</div>
          </div>
        </>
      ) : (
        <div className="col-span-3 flex items-center justify-center">
          <div className="text-center">
            <div className="text-muted-foreground">No statistics available</div>
            <div className="text-xs text-muted-foreground">Select a parameter with data</div>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardTimeline: React.FC<{
  data: OceanData[];
  parameter: string;
  timeRange: [number, number];
  onTimeRangeChange: (range: [number, number]) => void;
}> = ({ data, parameter, timeRange, onTimeRangeChange }) => {
  const timeData = data.filter(d => d.timestamp);
  const timestamps = timeData.map(d => new Date(d.timestamp!).getTime());
  const minTime = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
  const maxTime = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-900/20 to-orange-600/20 rounded-lg flex flex-col items-center justify-center p-4">
      <Clock className="w-12 h-12 mx-auto text-accent mb-3" />
      <div className="text-lg font-semibold text-foreground mb-2">Timeline Analysis</div>
      <div className="text-sm text-muted-foreground mb-4 text-center">
        {parameter.replace('_', ' ')} temporal patterns
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs w-full max-w-md">
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-accent font-semibold">{timeRange[0]}% - {timeRange[1]}%</div>
          <div className="text-muted-foreground">Time Range</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-primary font-semibold">{timeData.length}</div>
          <div className="text-muted-foreground">Temporal Points</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Time range: {new Date(minTime).toLocaleDateString()} - {new Date(maxTime).toLocaleDateString()}
      </div>
    </div>
  );
};

export default OceanographyDashboard;