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
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}>
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
      <div className="grid grid-cols-12 gap-6">
        {/* Interactive Map */}
        <div className={`col-span-${currentLayout.components.map.span}`}>
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
            <CardContent className={currentLayout.components.map.height}>
              <DashboardMap 
                data={filteredData}
                parameter={selectedParameter}
                onLocationSelect={onLocationSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Panel */}
        <div className={`col-span-${currentLayout.components.charts.span}`}>
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span>Data Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={currentLayout.components.charts.height}>
              <Tabs defaultValue="distribution" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                  <TabsTrigger value="correlation">Correlation</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                </TabsList>
                <TabsContent value="distribution" className="mt-4">
                  <DashboardChart 
                    data={filteredData}
                    parameter={selectedParameter}
                    type="histogram"
                  />
                </TabsContent>
                <TabsContent value="correlation" className="mt-4">
                  <DashboardChart 
                    data={filteredData}
                    parameter={selectedParameter}
                    type="scatter"
                  />
                </TabsContent>
                <TabsContent value="trends" className="mt-4">
                  <DashboardChart 
                    data={filteredData}
                    parameter={selectedParameter}
                    type="line"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Panel */}
        <div className={`col-span-${currentLayout.components.stats.span}`}>
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Real-time Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={currentLayout.components.stats.height}>
              <DashboardStats 
                statistics={statistics}
                selectedParameter={selectedParameter}
                dataCount={filteredData.length}
              />
            </CardContent>
          </Card>
        </div>

        {/* Timeline Panel */}
        <div className={`col-span-${currentLayout.components.timeline.span}`}>
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-accent" />
                <span>Temporal Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={currentLayout.components.timeline.height}>
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
    <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Map className="w-12 h-12 mx-auto text-primary mb-3" />
        <div className="text-lg font-semibold text-foreground mb-2">Interactive Dashboard Map</div>
        <div className="text-sm text-muted-foreground">
          {data.length} data points • {parameter} visualization
        </div>
      </div>
    </div>
  );
};

const DashboardChart: React.FC<{
  data: OceanData[];
  parameter: string;
  type: 'histogram' | 'scatter' | 'line';
}> = ({ data, parameter, type }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 mx-auto text-accent mb-3" />
        <div className="text-lg font-semibold text-foreground mb-2">{type.charAt(0).toUpperCase() + type.slice(1)} Chart</div>
        <div className="text-sm text-muted-foreground">
          {parameter} analysis • {data.length} points
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
      <div className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="stat-value text-primary">{dataCount}</div>
        <div className="stat-label">Data Points</div>
      </div>
      {paramStats && (
        <>
          <div className="stat-card bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="stat-value text-green-400">{paramStats.mean?.toFixed(2)}</div>
            <div className="stat-label">Mean Value</div>
          </div>
          <div className="stat-card bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="stat-value text-blue-400">{paramStats.min?.toFixed(2)}</div>
            <div className="stat-label">Minimum</div>
          </div>
          <div className="stat-card bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
            <div className="stat-value text-red-400">{paramStats.max?.toFixed(2)}</div>
            <div className="stat-label">Maximum</div>
          </div>
        </>
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
  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-900/20 to-orange-600/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Clock className="w-12 h-12 mx-auto text-accent mb-3" />
        <div className="text-lg font-semibold text-foreground mb-2">Timeline Analysis</div>
        <div className="text-sm text-muted-foreground">
          {parameter} over time • Range: {timeRange[0]}% - {timeRange[1]}%
        </div>
      </div>
    </div>
  );
};

export default OceanographyDashboard;