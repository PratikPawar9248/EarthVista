import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Scatter } from 'recharts';

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

interface BoxPlotProps {
  data: OceanData[];
  parameter: string;
  onPointClick?: (data: OceanData) => void;
}

interface BoxPlotData {
  name: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  count: number;
  mean: number;
}

const BoxPlot: React.FC<BoxPlotProps> = ({ data, parameter, onPointClick }) => {
  const boxPlotData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter data that has the selected parameter
    const validData = data.filter(d => d[parameter] !== undefined && d[parameter] !== null);
    
    if (validData.length === 0) return [];

    // Group data by depth ranges for better visualization
    const depthRanges = [
      { name: 'Surface (0-50m)', min: 0, max: 50 },
      { name: 'Shallow (50-200m)', min: 50, max: 200 },
      { name: 'Mid (200-1000m)', min: 200, max: 1000 },
      { name: 'Deep (1000m+)', min: 1000, max: Infinity }
    ];

    const calculateBoxPlotStats = (values: number[]): Omit<BoxPlotData, 'name'> => {
      const sorted = [...values].sort((a, b) => a - b);
      const n = sorted.length;
      
      const q1Index = Math.floor(n * 0.25);
      const medianIndex = Math.floor(n * 0.5);
      const q3Index = Math.floor(n * 0.75);
      
      const q1 = sorted[q1Index];
      const median = n % 2 === 0 ? (sorted[medianIndex - 1] + sorted[medianIndex]) / 2 : sorted[medianIndex];
      const q3 = sorted[q3Index];
      
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      
      const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
      const nonOutliers = sorted.filter(v => v >= lowerFence && v <= upperFence);
      
      const min = nonOutliers.length > 0 ? Math.min(...nonOutliers) : sorted[0];
      const max = nonOutliers.length > 0 ? Math.max(...nonOutliers) : sorted[sorted.length - 1];
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      
      return {
        min,
        q1,
        median,
        q3,
        max,
        outliers,
        count: n,
        mean
      };
    };

    // If depth data is available, group by depth ranges
    if (validData.some(d => d.depth !== undefined)) {
      return depthRanges.map(range => {
        const rangeData = validData.filter(d => {
          const depth = d.depth || 0;
          return depth >= range.min && depth < range.max;
        });
        
        if (rangeData.length === 0) return null;
        
        const values = rangeData.map(d => d[parameter] as number);
        const stats = calculateBoxPlotStats(values);
        
        return {
          name: range.name,
          ...stats
        };
      }).filter(Boolean) as BoxPlotData[];
    } else {
      // If no depth data, create a single box plot for all data
      const values = validData.map(d => d[parameter] as number);
      const stats = calculateBoxPlotStats(values);
      
      return [{
        name: 'All Data',
        ...stats
      }];
    }
  }, [data, parameter]);

  const getParameterUnit = (param: string) => {
    switch (param) {
      case 'temperature': return '°C';
      case 'salinity': return 'PSU';
      case 'chlorophyll': return 'mg/m³';
      case 'depth': return 'm';
      default: return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Count: <span className="text-foreground font-medium">{data.count}</span></p>
            <p className="text-muted-foreground">Mean: <span className="text-primary font-medium">{data.mean?.toFixed(2)} {getParameterUnit(parameter)}</span></p>
            <p className="text-muted-foreground">Median: <span className="text-accent font-medium">{data.median?.toFixed(2)} {getParameterUnit(parameter)}</span></p>
            <p className="text-muted-foreground">Min: <span className="text-foreground font-medium">{data.min?.toFixed(2)} {getParameterUnit(parameter)}</span></p>
            <p className="text-muted-foreground">Max: <span className="text-foreground font-medium">{data.max?.toFixed(2)} {getParameterUnit(parameter)}</span></p>
            <p className="text-muted-foreground">Q1: <span className="text-foreground font-medium">{data.q1?.toFixed(2)} {getParameterUnit(parameter)}</span></p>
            <p className="text-muted-foreground">Q3: <span className="text-foreground font-medium">{data.q3?.toFixed(2)} {getParameterUnit(parameter)}</span></p>
            {data.outliers?.length > 0 && (
              <p className="text-muted-foreground">Outliers: <span className="text-destructive font-medium">{data.outliers.length}</span></p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom box plot renderer
  const BoxPlotBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const { min, q1, median, q3, max, outliers } = payload;
    
    // Calculate positions
    const boxHeight = height * 0.6;
    const boxY = y + (height - boxHeight) / 2;
    const centerX = x + width / 2;
    const boxWidth = width * 0.8;
    const boxX = x + (width - boxWidth) / 2;

    // Scale function for values
    const minVal = Math.min(min, ...outliers);
    const maxVal = Math.max(max, ...outliers);
    const range = maxVal - minVal;
    
    const scaleY = (value: number) => {
      return boxY + boxHeight - ((value - minVal) / range) * boxHeight;
    };

    return (
      <g>
        {/* Whiskers */}
        <line
          x1={centerX}
          y1={scaleY(min)}
          x2={centerX}
          y2={scaleY(q1)}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
        />
        <line
          x1={centerX}
          y1={scaleY(q3)}
          x2={centerX}
          y2={scaleY(max)}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
        />
        
        {/* Whisker caps */}
        <line
          x1={centerX - boxWidth * 0.2}
          y1={scaleY(min)}
          x2={centerX + boxWidth * 0.2}
          y2={scaleY(min)}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
        />
        <line
          x1={centerX - boxWidth * 0.2}
          y1={scaleY(max)}
          x2={centerX + boxWidth * 0.2}
          y2={scaleY(max)}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
        />

        {/* Box */}
        <rect
          x={boxX}
          y={scaleY(q3)}
          width={boxWidth}
          height={scaleY(q1) - scaleY(q3)}
          fill="hsl(var(--primary) / 0.3)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          rx={4}
        />

        {/* Median line */}
        <line
          x1={boxX}
          y1={scaleY(median)}
          x2={boxX + boxWidth}
          y2={scaleY(median)}
          stroke="hsl(var(--accent))"
          strokeWidth={3}
        />

        {/* Outliers */}
        {outliers.map((outlier: number, index: number) => (
          <circle
            key={index}
            cx={centerX + (Math.random() - 0.5) * boxWidth * 0.6}
            cy={scaleY(outlier)}
            r={3}
            fill="hsl(var(--destructive))"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth={1}
          />
        ))}
      </g>
    );
  };

  if (boxPlotData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">No valid {parameter} data found for box plot analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={boxPlotData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--foreground))"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            fontSize={12}
            label={{ 
              value: `${parameter.charAt(0).toUpperCase() + parameter.slice(1)} (${getParameterUnit(parameter)})`, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Custom box plot using Bar component as base */}
          <Bar
            dataKey="median"
            fill="transparent"
            shape={<BoxPlotBar />}
            name="Box Plot"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border/30">
        <h4 className="font-semibold text-foreground mb-2">Box Plot Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-primary/30 border border-primary rounded"></div>
              <span className="text-muted-foreground">Interquartile Range (Q1-Q3)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-accent rounded"></div>
              <span className="text-muted-foreground">Median</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-foreground rounded"></div>
              <span className="text-muted-foreground">Whiskers (Min/Max)</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <span className="text-muted-foreground">Outliers</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Box plots show data distribution, variability, and outliers.
              Outliers are values beyond 1.5 × IQR from quartiles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxPlot;