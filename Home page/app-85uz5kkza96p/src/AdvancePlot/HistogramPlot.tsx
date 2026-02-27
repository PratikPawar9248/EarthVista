import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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

interface HistogramPlotProps {
  data: OceanData[];
  parameter: string;
  onPointClick: (location: OceanData) => void;
}

const HistogramPlot: React.FC<HistogramPlotProps> = ({ data, parameter, onPointClick }) => {
  const histogramData = useMemo(() => {
    const values = data
      .map(d => d[parameter])
      .filter(v => v !== undefined && v !== null && !isNaN(v))
      .sort((a, b) => a - b);

    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length))); // Optimal bin count
    const binWidth = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth,
      count: 0,
      percentage: 0,
      values: [] as number[]
    }));

    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
      bins[binIndex].count++;
      bins[binIndex].values.push(value);
    });

    // Calculate percentages
    bins.forEach(bin => {
      bin.percentage = (bin.count / values.length) * 100;
    });

    return bins.map(bin => ({
      range: `${bin.binStart.toFixed(2)}-${bin.binEnd.toFixed(2)}`,
      count: bin.count,
      percentage: bin.percentage,
      midpoint: (bin.binStart + bin.binEnd) / 2
    }));
  }, [data, parameter]);

  const statistics = useMemo(() => {
    const values = data
      .map(d => d[parameter])
      .filter(v => v !== undefined && v !== null && !isNaN(v));

    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    return {
      mean,
      median,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      q1,
      q3,
      count: values.length
    };
  }, [data, parameter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-primary">
            Range: {data.range}
          </p>
          <p className="text-sm text-muted-foreground">
            Count: {data.count} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (histogramData.length === 0) {
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
          <BarChart
            data={histogramData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="range"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference lines for statistics */}
            {statistics && (
              <>
                <ReferenceLine 
                  x={histogramData.find(d => d.midpoint >= statistics.mean)?.range} 
                  stroke="hsl(var(--accent))" 
                  strokeDasharray="5 5"
                  label={{ value: "Mean", position: 'top' }}
                />
                <ReferenceLine 
                  x={histogramData.find(d => d.midpoint >= statistics.median)?.range} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="2 2"
                  label={{ value: "Median", position: 'bottom' }}
                />
              </>
            )}
            
            <Bar 
              dataKey="count" 
              fill={getParameterColor()}
              opacity={0.8}
              className="cursor-pointer hover:opacity-100 transition-opacity"
            />
          </BarChart>
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
              {statistics.stdDev.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Std Dev</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-blue-500">
              {(statistics.max - statistics.min).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Range</div>
          </div>
        </div>
      )}

      {/* Distribution Analysis */}
      {statistics && (
        <div className="p-4 bg-secondary/30 rounded-lg">
          <h4 className="font-semibold mb-2">Distribution Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Quartiles:</strong></p>
              <p>Q1: {statistics.q1.toFixed(2)}</p>
              <p>Q3: {statistics.q3.toFixed(2)}</p>
              <p>IQR: {(statistics.q3 - statistics.q1).toFixed(2)}</p>
            </div>
            <div>
              <p><strong>Spread:</strong></p>
              <p>Min: {statistics.min.toFixed(2)}</p>
              <p>Max: {statistics.max.toFixed(2)}</p>
              <p>CV: {((statistics.stdDev / statistics.mean) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistogramPlot;