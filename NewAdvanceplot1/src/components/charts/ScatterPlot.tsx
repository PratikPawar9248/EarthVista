import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

interface ScatterPlotProps {
  data: OceanData[];
  parameter: string;
  onPointClick: (location: OceanData) => void;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, parameter, onPointClick }) => {
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      x: point.longitude,
      y: point.latitude,
      value: point[parameter],
      originalData: point,
      index
    }));
  }, [data, parameter]);

  const getColor = (value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min);
    
    // Ocean color palette based on parameter
    if (parameter === 'temperature') {
      // Blue to red gradient
      const r = Math.floor(normalized * 255);
      const b = Math.floor((1 - normalized) * 255);
      return `rgb(${r}, 100, ${b})`;
    } else if (parameter === 'salinity') {
      // Blue to yellow gradient
      const r = Math.floor(normalized * 255);
      const g = Math.floor(normalized * 255);
      const b = Math.floor((1 - normalized) * 255);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (parameter === 'chlorophyll') {
      // Blue to green gradient
      const g = Math.floor(normalized * 255);
      const b = Math.floor((1 - normalized) * 255);
      return `rgb(0, ${g}, ${b})`;
    } else {
      // Default blue gradient
      const intensity = Math.floor(100 + normalized * 155);
      return `rgb(0, ${intensity}, 255)`;
    }
  };

  const minValue = Math.min(...chartData.map(d => d.value));
  const maxValue = Math.max(...chartData.map(d => d.value));

  const CustomTooltip = ({ active, payload }: any) => {
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
            Lat: {data.y?.toFixed(4)}°, Lon: {data.x?.toFixed(4)}°
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

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Longitude"
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fill: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Latitude"
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fill: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            dataKey="value" 
            fill="hsl(var(--primary))"
            onClick={handlePointClick}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColor(entry.value, minValue, maxValue)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Color Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: getColor(minValue, minValue, maxValue) }}
          />
          <span className="text-xs text-muted-foreground">
            {minValue.toFixed(2)}
          </span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500 mx-4" />
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {maxValue.toFixed(2)}
          </span>
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: getColor(maxValue, minValue, maxValue) }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScatterPlot;