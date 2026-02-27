import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

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

interface StatisticsPanelProps {
  data: OceanData[];
}

interface ParameterStats {
  name: string;
  unit: string;
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  trend: 'up' | 'down' | 'stable';
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ data }) => {
  const statistics = useMemo(() => {
    const parameters = ['temperature', 'salinity', 'chlorophyll', 'depth'];
    const stats: ParameterStats[] = [];

    parameters.forEach(param => {
      const values = data
        .filter(d => d[param] !== undefined && d[param] !== null)
        .map(d => d[param] as number)
        .filter(v => !isNaN(v));

      if (values.length === 0) return;

      const sorted = [...values].sort((a, b) => a - b);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);

      // Simple trend calculation (comparing first and last quartiles)
      const firstQuartile = sorted.slice(0, Math.floor(sorted.length * 0.25));
      const lastQuartile = sorted.slice(Math.floor(sorted.length * 0.75));
      const firstAvg = firstQuartile.reduce((sum, v) => sum + v, 0) / firstQuartile.length;
      const lastAvg = lastQuartile.reduce((sum, v) => sum + v, 0) / lastQuartile.length;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      const trendThreshold = std * 0.1;
      if (lastAvg - firstAvg > trendThreshold) trend = 'up';
      else if (firstAvg - lastAvg > trendThreshold) trend = 'down';

      const units: { [key: string]: string } = {
        temperature: '°C',
        salinity: 'PSU',
        chlorophyll: 'mg/m³',
        depth: 'm'
      };

      stats.push({
        name: param.charAt(0).toUpperCase() + param.slice(1),
        unit: units[param] || '',
        count: values.length,
        mean,
        median,
        min: Math.min(...values),
        max: Math.max(...values),
        std,
        trend
      });
    });

    return stats;
  }, [data]);

  const correlationMatrix = useMemo(() => {
    const parameters = ['temperature', 'salinity', 'chlorophyll'];
    const matrix: { [key: string]: { [key: string]: number } } = {};

    parameters.forEach(param1 => {
      matrix[param1] = {};
      parameters.forEach(param2 => {
        if (param1 === param2) {
          matrix[param1][param2] = 1;
          return;
        }

        const pairs = data
          .filter(d => 
            d[param1] !== undefined && d[param1] !== null &&
            d[param2] !== undefined && d[param2] !== null
          )
          .map(d => [d[param1] as number, d[param2] as number])
          .filter(([v1, v2]) => !isNaN(v1) && !isNaN(v2));

        if (pairs.length < 2) {
          matrix[param1][param2] = 0;
          return;
        }

        const mean1 = pairs.reduce((sum, [v1]) => sum + v1, 0) / pairs.length;
        const mean2 = pairs.reduce((sum, [, v2]) => sum + v2, 0) / pairs.length;

        const numerator = pairs.reduce((sum, [v1, v2]) => sum + (v1 - mean1) * (v2 - mean2), 0);
        const denominator1 = Math.sqrt(pairs.reduce((sum, [v1]) => sum + Math.pow(v1 - mean1, 2), 0));
        const denominator2 = Math.sqrt(pairs.reduce((sum, [, v2]) => sum + Math.pow(v2 - mean2, 2), 0));

        matrix[param1][param2] = denominator1 * denominator2 !== 0 
          ? numerator / (denominator1 * denominator2) 
          : 0;
      });
    });

    return matrix;
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className="ocean-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Data Available</h3>
            <p className="text-sm text-muted-foreground">Upload data to view statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statistics.map((stat, index) => (
          <Card key={index} className="ocean-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>{stat.name}</span>
                </span>
                <div className="flex items-center space-x-1">
                  {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {stat.trend === 'stable' && <Activity className="w-4 h-4 text-yellow-500" />}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mean</p>
                  <p className="text-lg font-semibold text-primary">
                    {stat.mean.toFixed(2)} {stat.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Median</p>
                  <p className="text-lg font-semibold">
                    {stat.median.toFixed(2)} {stat.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min</p>
                  <p className="text-lg font-semibold">
                    {stat.min.toFixed(2)} {stat.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max</p>
                  <p className="text-lg font-semibold">
                    {stat.max.toFixed(2)} {stat.unit}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Standard Deviation</span>
                  <span>{stat.std.toFixed(2)} {stat.unit}</span>
                </div>
                <Progress 
                  value={(stat.std / (stat.max - stat.min)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                {stat.count} data points
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Correlation Matrix */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle>Parameter Correlations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div></div>
            {Object.keys(correlationMatrix).map(param => (
              <div key={param} className="text-center font-medium text-muted-foreground">
                {param.charAt(0).toUpperCase() + param.slice(1)}
              </div>
            ))}
            
            {Object.entries(correlationMatrix).map(([param1, correlations]) => (
              <React.Fragment key={param1}>
                <div className="font-medium text-muted-foreground">
                  {param1.charAt(0).toUpperCase() + param1.slice(1)}
                </div>
                {Object.entries(correlations).map(([param2, correlation]) => (
                  <div
                    key={param2}
                    className={`text-center p-2 rounded text-sm font-medium ${
                      Math.abs(correlation) > 0.7
                        ? 'bg-primary/20 text-primary'
                        : Math.abs(correlation) > 0.4
                        ? 'bg-accent/20 text-accent'
                        : 'bg-secondary/30 text-muted-foreground'
                    }`}
                  >
                    {correlation.toFixed(2)}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Correlation values range from -1 to 1. Values closer to ±1 indicate stronger relationships.</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Summary */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle>Data Quality Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{data.length}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {statistics.reduce((sum, stat) => sum + stat.count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Valid Measurements</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {((statistics.reduce((sum, stat) => sum + stat.count, 0) / (data.length * statistics.length)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Data Completeness</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPanel;