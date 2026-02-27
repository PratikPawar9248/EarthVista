import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

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

interface TimeSeriesPlotProps {
  data: OceanData[];
  parameter: string;
  onPointClick: (location: OceanData) => void;
}

const TimeSeriesPlot: React.FC<TimeSeriesPlotProps> = ({ data, parameter, onPointClick }) => {
  const timeSeriesData = useMemo(() => {
    // Filter data with timestamps and the selected parameter
    const timeData = data.filter(d => 
      d.timestamp && 
      d[parameter] !== undefined && 
      d[parameter] !== null
    );

    if (timeData.length === 0) return [];

    // Sort by timestamp
    const sortedData = timeData.sort((a, b) => 
      new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
    );

    return sortedData.map((point, index) => ({
      timestamp: new Date(point.timestamp!).getTime(),
      dateString: new Date(point.timestamp!).toLocaleDateString(),
      value: point[parameter],
      originalData: point,
      index
    }));
  }, [data, parameter]);

  const trendAnalysis = useMemo(() => {
    if (timeSeriesData.length < 2) return null;

    const values = timeSeriesData.map(d => d.value);
    const n = values.length;
    
    // Simple linear regression for trend
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, v) => sum + v, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    values.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += (x - xMean) ** 2;
    });
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;
    
    // Calculate R-squared
    const yPred = values.map((_, x) => slope * x + intercept);
    const ssRes = values.reduce((sum, y, x) => sum + (y - yPred[x]) ** 2, 0);
    const ssTot = values.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
    const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
    
    return {
      slope,
      intercept,
      rSquared,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      trendLine: timeSeriesData.map((d, index) => ({
        ...d,
        trendValue: slope * index + intercept
      }))
    };
  }, [timeSeriesData]);

  const seasonalAnalysis = useMemo(() => {
    if (timeSeriesData.length < 12) return null;

    const monthlyData: { [key: number]: number[] } = {};
    
    timeSeriesData.forEach(d => {
      const month = new Date(d.timestamp).getMonth();
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(d.value);
    });

    const monthlyAverages = Object.entries(monthlyData).map(([month, values]) => ({
      month: parseInt(month),
      monthName: new Date(2000, parseInt(month), 1).toLocaleDateString('en', { month: 'short' }),
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
      count: values.length
    }));

    return monthlyAverages.sort((a, b) => a.month - b.month);
  }, [timeSeriesData]);

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
            {data.dateString}
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

  if (timeSeriesData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-96 flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-lg">
          <div className="text-center">
            <p className="text-lg">No time series data available</p>
            <p className="text-sm mt-2">Time series plots require timestamp information</p>
          </div>
        </div>
        
        {data.some(d => d[parameter] !== undefined) && (
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <h4 className="font-semibold text-accent mb-2">Available Data</h4>
            <p className="text-sm text-muted-foreground">
              {data.filter(d => d[parameter] !== undefined).length} measurements available for {parameter}, 
              but no timestamp information for time series analysis.
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
      case 'depth':
        return '#8b5cf6'; // purple
      default:
        return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Time Series Plot */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendAnalysis?.trendLine || timeSeriesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Trend line */}
            {trendAnalysis && (
              <Line 
                type="monotone" 
                dataKey="trendValue" 
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Trend"
              />
            )}
            
            {/* Data line */}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getParameterColor()}
              strokeWidth={2}
              dot={{ 
                fill: getParameterColor(), 
                strokeWidth: 2, 
                r: 3,
                className: 'cursor-pointer hover:r-5 transition-all'
              }}
              activeDot={{ 
                r: 5, 
                fill: getParameterColor(),
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
              onClick={handlePointClick}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      {trendAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className={`text-lg font-bold ${
              trendAnalysis.trend === 'increasing' ? 'text-green-500' :
              trendAnalysis.trend === 'decreasing' ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {trendAnalysis.trend.charAt(0).toUpperCase() + trendAnalysis.trend.slice(1)}
            </div>
            <div className="text-sm text-muted-foreground">Trend</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-primary">
              {trendAnalysis.slope.toFixed(4)}
            </div>
            <div className="text-sm text-muted-foreground">Slope</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className="text-lg font-bold text-accent">
              {(trendAnalysis.rSquared * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">R²</div>
          </div>
        </div>
      )}

      {/* Seasonal Analysis */}
      {seasonalAnalysis && (
        <div className="space-y-4">
          <h4 className="font-semibold">Seasonal Pattern</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonalAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="monthName"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  formatter={(value: any) => [value.toFixed(2), 'Monthly Average']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="average" 
                  stroke={getParameterColor()}
                  fill={getParameterColor()}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Time Series Summary */}
      <div className="p-4 bg-secondary/30 rounded-lg">
        <h4 className="font-semibold mb-2">Time Series Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Data Period:</strong></p>
            <p>From: {new Date(timeSeriesData[0].timestamp).toLocaleDateString()}</p>
            <p>To: {new Date(timeSeriesData[timeSeriesData.length - 1].timestamp).toLocaleDateString()}</p>
            <p>Duration: {Math.ceil((timeSeriesData[timeSeriesData.length - 1].timestamp - timeSeriesData[0].timestamp) / (1000 * 60 * 60 * 24))} days</p>
          </div>
          <div>
            <p><strong>Data Quality:</strong></p>
            <p>Total Points: {timeSeriesData.length}</p>
            <p>Temporal Resolution: Variable</p>
            {trendAnalysis && (
              <p>Trend Confidence: {(trendAnalysis.rSquared * 100).toFixed(1)}%</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesPlot;