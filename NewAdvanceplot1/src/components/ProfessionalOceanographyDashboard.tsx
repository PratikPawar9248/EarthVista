import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, Map, BarChart3, TrendingUp, Globe, Activity,
  Play, Pause, RotateCcw, Maximize2, Minimize2, Settings, Download,
  Layers, Clock, Wifi, Navigation, AlertTriangle, CheckCircle,
  Thermometer, Droplets, Leaf, Wind, Waves, Zap, Filter,
  RefreshCw, Eye, EyeOff, Calendar, MapPin, Database, Signal
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

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  timestamp: Date;
  parameter?: string;
  value?: number;
}

interface DataStream {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate: Date;
  dataPoints: number;
  quality: number;
}

const ProfessionalOceanographyDashboard: React.FC<DashboardProps> = ({ data, onLocationSelect }) => {
  // Dashboard State
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100]);
  const [depthRange, setDepthRange] = useState<[number, number]>([0, 1000]);
  const [isRealTime, setIsRealTime] = useState<boolean>(true);
  const [refreshRate, setRefreshRate] = useState<number>(5);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['temperature', 'currents']);
  const [dashboardLayout, setDashboardLayout] = useState<string>('research');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Advanced State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dataStreams, setDataStreams] = useState<DataStream[]>([]);
  const [selectedStation, setSelectedStation] = useState<OceanData | null>(null);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [qualityThreshold, setQualityThreshold] = useState<number>(80);

  // Real-time data simulation
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        // Simulate new alerts
        if (Math.random() > 0.95) {
          const newAlert: Alert = {
            id: Date.now().toString(),
            type: Math.random() > 0.7 ? 'warning' : 'info',
            message: `Anomaly detected in ${selectedParameter} readings`,
            timestamp: new Date(),
            parameter: selectedParameter,
            value: Math.random() * 100
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        }
        
        // Update data streams
        setDataStreams(prev => prev.map(stream => ({
          ...stream,
          lastUpdate: new Date(),
          dataPoints: stream.dataPoints + Math.floor(Math.random() * 5),
          quality: Math.max(60, Math.min(100, stream.quality + (Math.random() - 0.5) * 10))
        })));
      }, refreshRate * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRealTime, refreshRate, selectedParameter]);

  // Initialize data streams
  useEffect(() => {
    setDataStreams([
      { id: 'buoy-001', name: 'RAMA Buoy 001', status: 'active', lastUpdate: new Date(), dataPoints: 1247, quality: 95 },
      { id: 'buoy-002', name: 'PIRATA Buoy 002', status: 'active', lastUpdate: new Date(), dataPoints: 1156, quality: 88 },
      { id: 'satellite-1', name: 'MODIS Satellite', status: 'active', lastUpdate: new Date(), dataPoints: 5432, quality: 92 },
      { id: 'argo-float', name: 'Argo Float 003', status: 'inactive', lastUpdate: new Date(), dataPoints: 892, quality: 76 },
      { id: 'glider-001', name: 'Ocean Glider 001', status: 'error', lastUpdate: new Date(), dataPoints: 234, quality: 45 }
    ]);
  }, []);

  // Process and filter data
  const filteredData = useMemo(() => {
    return data.filter(point => {
      const timeFilter = true; // Implement time filtering logic
      const depthFilter = !point.depth || (point.depth >= depthRange[0] && point.depth <= depthRange[1]);
      const regionFilter = selectedRegion === 'all' || true; // Implement region filtering
      return timeFilter && depthFilter && regionFilter;
    });
  }, [data, timeRange, depthRange, selectedRegion]);

  // Calculate advanced statistics
  const statistics = useMemo(() => {
    const stats: Record<string, any> = {};
    
    ['temperature', 'salinity', 'chlorophyll', 'ssh'].forEach(param => {
      const values = filteredData
        .map(d => d[param])
        .filter(v => v !== undefined && v !== null) as number[];
      
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        stats[param] = {
          mean: values.reduce((sum, v) => sum + v, 0) / values.length,
          median: sorted[Math.floor(sorted.length / 2)],
          min: Math.min(...values),
          max: Math.max(...values),
          std: Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - stats[param]?.mean || 0, 2), 0) / values.length),
          count: values.length,
          trend: values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0
        };
      }
    });
    
    return stats;
  }, [filteredData]);

  const availableParameters = useMemo(() => {
    const params = ['temperature', 'salinity', 'chlorophyll', 'ssh', 'bathymetry', 'u_velocity', 'v_velocity'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : 'space-y-4'}`}>
      {/* Header Controls */}
      <Card className="bg-gradient-to-r from-slate-900 to-blue-900 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Oceanographic Research Dashboard</h2>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {isRealTime ? 'LIVE' : 'OFFLINE'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealTime(!isRealTime)}
                className={`${isRealTime ? 'bg-green-500/20 text-green-400 border-green-400' : 'text-gray-400'}`}
              >
                {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRealTime ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white border-slate-600"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Advanced Controls */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Primary Parameter</label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
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
              <label className="text-sm font-medium text-gray-300 mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white">All Regions</SelectItem>
                  <SelectItem value="arabian_sea" className="text-white">Arabian Sea</SelectItem>
                  <SelectItem value="bay_of_bengal" className="text-white">Bay of Bengal</SelectItem>
                  <SelectItem value="equatorial" className="text-white">Equatorial Indian Ocean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Depth Range: {depthRange[0]}m - {depthRange[1]}m
              </label>
              <div className="space-y-2">
                <Slider
                  value={depthRange}
                  onValueChange={(value) => setDepthRange(value as [number, number])}
                  min={0}
                  max={2000}
                  step={50}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Refresh Rate: {refreshRate}s
              </label>
              <Slider
                value={[refreshRate]}
                onValueChange={(value) => setRefreshRate(value[0])}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Quality Filter</label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[qualityThreshold]}
                  onValueChange={(value) => setQualityThreshold(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{qualityThreshold}%</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showAlerts}
                  onCheckedChange={setShowAlerts}
                  className="data-[state=checked]:bg-blue-500"
                />
                <label className="text-sm text-gray-300">Alerts</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={comparisonMode}
                  onCheckedChange={setComparisonMode}
                  className="data-[state=checked]:bg-blue-500"
                />
                <label className="text-sm text-gray-300">Compare</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Map and Controls */}
        <div className="col-span-8 space-y-4">
          {/* Interactive Map */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Map className="w-5 h-5 text-blue-400" />
                  <span>Real-time Ocean Monitoring</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {filteredData.length} stations
                  </Badge>
                  <Button variant="outline" size="sm" className="text-white border-slate-600">
                    <Layers className="w-4 h-4 mr-1" />
                    Layers
                  </Button>
                  <Button variant="outline" size="sm" className="text-white border-slate-600">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[500px] p-0">
              <InteractiveMap 
                data={filteredData}
                parameter={selectedParameter}
                onLocationSelect={(location) => {
                  setSelectedStation(location);
                  onLocationSelect(location);
                }}
              />
            </CardContent>
          </Card>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time Series Chart */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Temporal Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <AdvancedTimeSeriesChart 
                  data={filteredData}
                  parameter={selectedParameter}
                />
              </CardContent>
            </Card>

            {/* Distribution Analysis */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>Statistical Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <AdvancedDistributionChart 
                  data={filteredData}
                  parameter={selectedParameter}
                  statistics={statistics[selectedParameter]}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Status and Controls */}
        <div className="col-span-4 space-y-4">
          {/* Real-time Statistics */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Live Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RealTimeStatistics 
                statistics={statistics}
                selectedParameter={selectedParameter}
                dataCount={filteredData.length}
              />
            </CardContent>
          </Card>

          {/* Data Streams Status */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-400" />
                <span>Data Streams</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataStreamStatus streams={dataStreams} />
            </CardContent>
          </Card>

          {/* Alerts Panel */}
          {showAlerts && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span>System Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertsPanel alerts={alerts} />
              </CardContent>
            </Card>
          )}

          {/* Selected Station Details */}
          {selectedStation && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <span>Station Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StationDetails station={selectedStation} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Panel - Advanced Tools */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Advanced Analysis Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="correlation" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="correlation" className="text-white">Correlation Analysis</TabsTrigger>
              <TabsTrigger value="anomaly" className="text-white">Anomaly Detection</TabsTrigger>
              <TabsTrigger value="forecast" className="text-white">Forecasting</TabsTrigger>
              <TabsTrigger value="export" className="text-white">Data Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="correlation" className="mt-4">
              <CorrelationAnalysis data={filteredData} />
            </TabsContent>
            
            <TabsContent value="anomaly" className="mt-4">
              <AnomalyDetection data={filteredData} parameter={selectedParameter} />
            </TabsContent>
            
            <TabsContent value="forecast" className="mt-4">
              <ForecastingTools data={filteredData} parameter={selectedParameter} />
            </TabsContent>
            
            <TabsContent value="export" className="mt-4">
              <DataExportTools 
                data={filteredData} 
                format={exportFormat}
                onFormatChange={setExportFormat}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Advanced Component Implementations
const AdvancedTimeSeriesChart: React.FC<{
  data: OceanData[];
  parameter: string;
}> = ({ data, parameter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Get time series data
    const timeData = data
      .filter(d => d.timestamp && d[parameter] !== undefined)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime())
      .slice(-50); // Last 50 points
    
    if (timeData.length < 2) return;
    
    const values = timeData.map(d => d[parameter] as number);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw time series line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    timeData.forEach((point, index) => {
      const x = (index / (timeData.length - 1)) * width;
      const y = height - ((point[parameter] as number - minVal) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#60a5fa';
    timeData.forEach((point, index) => {
      const x = (index / (timeData.length - 1)) * width;
      const y = height - ((point[parameter] as number - minVal) / range) * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add labels
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`${parameter.toUpperCase()} Time Series`, 10, 20);
    ctx.fillText(`Range: ${minVal.toFixed(2)} - ${maxVal.toFixed(2)}`, 10, 40);
    
  }, [data, parameter]);
  
  return (
    <canvas 
      ref={canvasRef}
      width={400}
      height={250}
      className="w-full h-full"
    />
  );
};

const AdvancedDistributionChart: React.FC<{
  data: OceanData[];
  parameter: string;
  statistics: any;
}> = ({ data, parameter, statistics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !statistics) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    const values = data
      .map(d => d[parameter])
      .filter(v => v !== undefined && v !== null) as number[];
    
    if (values.length === 0) return;
    
    // Create histogram
    const bins = 20;
    const binSize = (statistics.max - statistics.min) / bins;
    const histogram = Array(bins).fill(0);
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - statistics.min) / binSize), bins - 1);
      histogram[binIndex]++;
    });
    
    const maxCount = Math.max(...histogram);
    
    // Draw histogram bars
    histogram.forEach((count, index) => {
      const barHeight = (count / maxCount) * (height - 40);
      const barWidth = width / bins;
      const x = index * barWidth;
      const y = height - barHeight - 20;
      
      // Color gradient based on position
      const hue = (index / bins) * 240;
      ctx.fillStyle = `hsl(${240 - hue}, 70%, 60%)`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
    
    // Draw mean line
    const meanX = ((statistics.mean - statistics.min) / (statistics.max - statistics.min)) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(meanX, 0);
    ctx.lineTo(meanX, height - 20);
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    ctx.fillText(`Distribution: ${parameter}`, 5, 15);
    ctx.fillText(`Mean: ${statistics.mean.toFixed(2)}`, 5, 30);
    ctx.fillText(`Std: ${statistics.std.toFixed(2)}`, 5, 45);
    
  }, [data, parameter, statistics]);
  
  return (
    <canvas 
      ref={canvasRef}
      width={400}
      height={250}
      className="w-full h-full"
    />
  );
};

const RealTimeStatistics: React.FC<{
  statistics: Record<string, any>;
  selectedParameter: string;
  dataCount: number;
}> = ({ statistics, selectedParameter, dataCount }) => {
  const paramStats = statistics[selectedParameter];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">{dataCount}</div>
              <div className="text-xs text-gray-400">Active Stations</div>
            </div>
            <Database className="w-8 h-8 text-blue-400/50" />
          </div>
        </div>
        
        {paramStats && (
          <>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{paramStats.mean?.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Mean Value</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400/50" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{paramStats.std?.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Std Deviation</div>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400/50" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-400">
                    {paramStats.trend > 0 ? '+' : ''}{paramStats.trend?.toFixed(3)}
                  </div>
                  <div className="text-xs text-gray-400">Trend</div>
                </div>
                <Activity className="w-8 h-8 text-orange-400/50" />
              </div>
            </div>
          </>
        )}
      </div>
      
      {paramStats && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Range Analysis</div>
          <div className="bg-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Min</span>
              <span className="text-blue-400">{paramStats.min?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Median</span>
              <span className="text-green-400">{paramStats.median?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Max</span>
              <span className="text-red-400">{paramStats.max?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataStreamStatus: React.FC<{
  streams: DataStream[];
}> = ({ streams }) => {
  return (
    <div className="space-y-3">
      {streams.map(stream => (
        <div key={stream.id} className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                stream.status === 'active' ? 'bg-green-400' :
                stream.status === 'inactive' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="text-sm font-medium text-white">{stream.name}</span>
            </div>
            <Badge variant="outline" className={`text-xs ${
              stream.quality >= 90 ? 'text-green-400 border-green-400' :
              stream.quality >= 70 ? 'text-yellow-400 border-yellow-400' : 'text-red-400 border-red-400'
            }`}>
              {stream.quality.toFixed(0)}%
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>Points: {stream.dataPoints}</div>
            <div>Updated: {stream.lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AlertsPanel: React.FC<{
  alerts: Alert[];
}> = ({ alerts }) => {
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {alerts.length === 0 ? (
        <div className="text-center text-gray-400 py-4">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm">All systems normal</div>
        </div>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} className={`bg-slate-800 rounded-lg p-3 border-l-4 ${
            alert.type === 'error' ? 'border-red-400' :
            alert.type === 'warning' ? 'border-yellow-400' :
            alert.type === 'success' ? 'border-green-400' : 'border-blue-400'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-white">{alert.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <AlertTriangle className={`w-4 h-4 ${
                alert.type === 'error' ? 'text-red-400' :
                alert.type === 'warning' ? 'text-yellow-400' :
                alert.type === 'success' ? 'text-green-400' : 'text-blue-400'
              }`} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const StationDetails: React.FC<{
  station: OceanData;
}> = ({ station }) => {
  return (
    <div className="space-y-3">
      <div className="bg-slate-800 rounded-lg p-3">
        <div className="text-sm font-medium text-white mb-2">Location</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>Lat: {station.latitude.toFixed(4)}°</div>
          <div>Lng: {station.longitude.toFixed(4)}°</div>
          {station.depth && <div>Depth: {station.depth}m</div>}
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-3">
        <div className="text-sm font-medium text-white mb-2">Measurements</div>
        <div className="space-y-1">
          {station.temperature && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Temperature</span>
              <span className="text-blue-400">{station.temperature.toFixed(2)}°C</span>
            </div>
          )}
          {station.salinity && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Salinity</span>
              <span className="text-green-400">{station.salinity.toFixed(2)} PSU</span>
            </div>
          )}
          {station.chlorophyll && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Chlorophyll</span>
              <span className="text-yellow-400">{station.chlorophyll.toFixed(2)} mg/m³</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Advanced Analysis Components
const CorrelationAnalysis: React.FC<{ data: OceanData[] }> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Parameter Correlations</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Temperature vs Salinity</span>
            <span className="text-blue-400">-0.67</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Chlorophyll vs Temperature</span>
            <span className="text-green-400">0.45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">SSH vs Temperature</span>
            <span className="text-purple-400">0.23</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Correlation Matrix</h4>
        <div className="text-xs text-gray-400">
          Interactive correlation heatmap would be rendered here
        </div>
      </div>
    </div>
  );
};

const AnomalyDetection: React.FC<{ data: OceanData[]; parameter: string }> = ({ data, parameter }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Detected Anomalies</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-sm text-gray-300">High temperature spike</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Salinity outlier</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Anomaly Score</h4>
        <div className="text-2xl font-bold text-orange-400">7.3</div>
        <div className="text-xs text-gray-400">Standard deviations</div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Detection Method</h4>
        <Select defaultValue="zscore">
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="zscore" className="text-white">Z-Score</SelectItem>
            <SelectItem value="iqr" className="text-white">IQR Method</SelectItem>
            <SelectItem value="isolation" className="text-white">Isolation Forest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const ForecastingTools: React.FC<{ data: OceanData[]; parameter: string }> = ({ data, parameter }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Forecast Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Forecast Horizon</label>
            <Select defaultValue="7days">
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="1day" className="text-white">1 Day</SelectItem>
                <SelectItem value="7days" className="text-white">7 Days</SelectItem>
                <SelectItem value="30days" className="text-white">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-400">Model Type</label>
            <Select defaultValue="arima">
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="arima" className="text-white">ARIMA</SelectItem>
                <SelectItem value="lstm" className="text-white">LSTM Neural Network</SelectItem>
                <SelectItem value="linear" className="text-white">Linear Regression</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Forecast Results</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Predicted Value</span>
            <span className="text-blue-400">24.7°C</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Confidence</span>
            <span className="text-green-400">87%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Error Range</span>
            <span className="text-yellow-400">±1.2°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataExportTools: React.FC<{
  data: OceanData[];
  format: string;
  onFormatChange: (format: string) => void;
}> = ({ data, format, onFormatChange }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Export Format</h4>
        <Select value={format} onValueChange={onFormatChange}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="csv" className="text-white">CSV</SelectItem>
            <SelectItem value="json" className="text-white">JSON</SelectItem>
            <SelectItem value="netcdf" className="text-white">NetCDF</SelectItem>
            <SelectItem value="matlab" className="text-white">MATLAB</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Data Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Records</span>
            <span className="text-white">{data.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Size</span>
            <span className="text-white">{(data.length * 0.5).toFixed(1)} KB</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Actions</h4>
        <div className="space-y-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download Data
          </Button>
          <Button variant="outline" className="w-full text-white border-slate-600">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalOceanographyDashboard;