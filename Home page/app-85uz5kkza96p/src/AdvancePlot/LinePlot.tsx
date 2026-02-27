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

interface LinePlotProps {
  data: OceanData[];
  parameter: string;
  onPointClick: (location: OceanData) => void;
}

const LinePlot: React.FC<LinePlotProps> = ({ data, parameter, onPointClick }) => {
  const chartData = useMemo(() => {
    // Sort data by timestamp if available, otherwise by index
    const sortedData = [...data].sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return 0;
    });

    return sortedData.map((point, index) => ({
      index,
      value: point[parameter],
      timestamp: point.timestamp ? new Date(point.timestamp).toLocaleDateString() : `Point ${index + 1}`,
      originalData: point
    }));
  }, [data, parameter]);

  const statistics = useMemo(() => {
    const values = chartData.map(d => d.value).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return null;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return { mean, median };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-primary">
            {parameter.charAt(0).toUpperCase() + parameter.slice(1)}: {data.value?.toFixed(2)}
            {parameter === 'temperature' && '°C'}
            {parameter === 'salinity' && ' PSU'}
            {parameter === 'chlorophyll' && ' mg/m³'}
            {parameter === 'depth' && ' m'}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.timestamp}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to view profile
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
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        <p>No data available for {parameter}</p>
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
      case 'depth':
        return '#8b5cf6'; // purple
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
              dataKey="index"
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${value + 1}`}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference lines for mean and median */}
            {statistics && (
              <>
                <ReferenceLine 
                  y={statistics.mean} 
                  stroke="hsl(var(--accent))" 
                  strokeDasharray="5 5"
                  label={{ value: `Mean: ${statistics.mean.toFixed(2)}`, position: 'topRight' }}
                />
                <ReferenceLine 
                  y={statistics.median} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="2 2"
                  label={{ value: `Median: ${statistics.median.toFixed(2)}`, position: 'bottomRight' }}
                />
              </>
            )}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getParameterColor()}
              strokeWidth={2}
              dot={{ 
                fill: getParameterColor(), 
                strokeWidth: 2, 
                r: 4,
                className: 'cursor-pointer hover:r-6 transition-all'
              }}
              activeDot={{ 
                r: 6, 
                fill: getParameterColor(),
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
              onClick={handlePointClick}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Summary */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-primary">
              {statistics.mean.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Mean</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-accent">
              {statistics.median.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Median</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-green-500">
              {Math.min(...chartData.map(d => d.value)).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Minimum</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-red-500">
              {Math.max(...chartData.map(d => d.value)).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Maximum</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinePlot;