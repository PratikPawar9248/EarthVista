import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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

interface VerticalProfileProps {
  data: OceanData[];
  parameter: string;
  onPointClick: (location: OceanData) => void;
}

const VerticalProfile: React.FC<VerticalProfileProps> = ({ data, parameter, onPointClick }) => {
  const chartData = useMemo(() => {
    // Filter data that has both depth and the selected parameter
    const depthData = data.filter(point => 
      point.depth !== undefined && 
      point.depth !== null && 
      point[parameter] !== undefined && 
      point[parameter] !== null
    );

    // Sort by depth (shallow to deep)
    return depthData
      .sort((a, b) => (a.depth || 0) - (b.depth || 0))
      .map(point => ({
        depth: -(point.depth || 0), // Negative for oceanographic convention (surface = 0, deeper = negative)
        value: point[parameter],
        originalData: point
      }));
  }, [data, parameter]);

  const statistics = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map(d => d.value);
    const depths = chartData.map(d => Math.abs(d.depth));
    
    const meanValue = values.reduce((sum, v) => sum + v, 0) / values.length;
    const maxDepth = Math.max(...depths);
    const surfaceValue = chartData.find(d => Math.abs(d.depth) < 10)?.value;
    const deepValue = chartData.find(d => Math.abs(d.depth) > maxDepth * 0.8)?.value;

    return {
      meanValue,
      maxDepth,
      surfaceValue,
      deepValue,
      gradient: surfaceValue && deepValue ? deepValue - surfaceValue : null
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-primary">
            Depth: {Math.abs(data.depth).toFixed(1)} m
          </p>
          <p className="font-semibold text-accent">
            {parameter.charAt(0).toUpperCase() + parameter.slice(1)}: {data.value?.toFixed(2)}
            {parameter === 'temperature' && '°C'}
            {parameter === 'salinity' && ' PSU'}
            {parameter === 'chlorophyll' && ' mg/m³'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to view full profile
          </p>
        </div>
      );
    }
    return null;
  };

  const handlePointClick = (data: any) => {
    if (data && data.originalData) {
      onPointClick(data.originalData);
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-96 flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-lg">
          <div className="text-center">
            <p className="text-lg">No depth data available</p>
            <p className="text-sm mt-2">Vertical profiles require depth measurements</p>
          </div>
        </div>
        
        {/* Show available data without depth */}
        {data.some(d => d[parameter] !== undefined) && (
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <h4 className="font-semibold text-accent mb-2">Available Surface Data</h4>
            <p className="text-sm text-muted-foreground">
              {data.filter(d => d[parameter] !== undefined).length} measurements available for {parameter}, 
              but no depth information for vertical profiling.
            </p>
          </div>
        )}
      </div>
    );
  }

  const getParameterColor = () => {
    switch (parameter) {
      case 'temperature':
        return '#ef4444'; // red
      case 'salinity':
        return '#3b82f6'; // blue
      case 'chlorophyll':
        return '#10b981'; // green
      default:
        return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="value"
              type="number"
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ 
                value: `${parameter.charAt(0).toUpperCase() + parameter.slice(1)} ${
                  parameter === 'temperature' ? '(°C)' :
                  parameter === 'salinity' ? '(PSU)' :
                  parameter === 'chlorophyll' ? '(mg/m³)' : ''
                }`, 
                position: 'insideBottom', 
                offset: -10 
              }}
            />
            <YAxis 
              dataKey="depth"
              type="number"
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for surface (0m) */}
            <ReferenceLine 
              y={0} 
              stroke="hsl(var(--accent))" 
              strokeDasharray="5 5"
              label={{ value: "Surface", position: 'top' }}
            />
            
            {/* Mean value reference line */}
            {statistics && (
              <ReferenceLine 
                x={statistics.meanValue} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="2 2"
                label={{ value: `Mean: ${statistics.meanValue.toFixed(2)}`, position: 'top' }}
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getParameterColor()}
              strokeWidth={3}
              dot={{ 
                fill: getParameterColor(), 
                strokeWidth: 2, 
                r: 5,
                className: 'cursor-pointer hover:r-7 transition-all'
              }}
              activeDot={{ 
                r: 7, 
                fill: getParameterColor(),
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
              onClick={handlePointClick}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Profile Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-primary">
              {statistics.maxDepth.toFixed(1)}m
            </div>
            <div className="text-sm text-muted-foreground">Max Depth</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-accent">
              {statistics.meanValue.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Mean Value</div>
          </div>
          
          {statistics.surfaceValue && (
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="text-lg font-bold text-blue-500">
                {statistics.surfaceValue.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Surface Value</div>
            </div>
          )}
          
          {statistics.gradient !== null && (
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className={`text-lg font-bold ${statistics.gradient > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {statistics.gradient > 0 ? '+' : ''}{statistics.gradient.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Gradient</div>
            </div>
          )}
        </div>
      )}

      {/* Profile Description */}
      <div className="p-4 bg-secondary/30 rounded-lg">
        <h4 className="font-semibold mb-2">Profile Analysis</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {chartData.length} depth measurements from {Math.abs(chartData[0].depth).toFixed(1)}m to {statistics?.maxDepth.toFixed(1)}m</p>
          {statistics?.gradient !== null && (
            <p>• {statistics.gradient > 0 ? 'Increasing' : 'Decreasing'} trend with depth 
               ({Math.abs(statistics.gradient).toFixed(2)} units change)</p>
          )}
          <p>• Click on any point to view detailed location profile</p>
        </div>
      </div>
    </div>
  );
};

export default VerticalProfile;