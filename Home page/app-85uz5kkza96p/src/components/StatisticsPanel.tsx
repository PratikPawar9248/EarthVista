import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { Dataset } from '@/types/heatmap';

interface StatisticsPanelProps {
  dataset: Dataset | null;
  filteredCount?: number;
}

export default function StatisticsPanel({ dataset, filteredCount }: StatisticsPanelProps) {
  if (!dataset) return null;

  const values = dataset.points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const displayCount = filteredCount !== undefined ? filteredCount : dataset.points.length;

  const stats = [
    {
      label: 'Data Points',
      value: displayCount.toLocaleString(),
      icon: BarChart3,
      color: 'text-primary'
    },
    {
      label: 'Minimum',
      value: min.toFixed(2),
      icon: TrendingDown,
      color: 'text-blue-500'
    },
    {
      label: 'Maximum',
      value: max.toFixed(2),
      icon: TrendingUp,
      color: 'text-orange-500'
    },
    {
      label: 'Mean',
      value: mean.toFixed(2),
      icon: Activity,
      color: 'text-green-500'
    },
    {
      label: 'Median',
      value: median.toFixed(2),
      icon: Activity,
      color: 'text-purple-500'
    },
    {
      label: 'Std Dev',
      value: stdDev.toFixed(2),
      icon: Activity,
      color: 'text-yellow-500'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Statistical Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col gap-1 p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-1.5">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-lg font-semibold">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
