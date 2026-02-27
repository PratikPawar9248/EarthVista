import { Settings, Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OptimizationConfig } from '@/utils/dataOptimization';

interface PerformanceSettingsProps {
  config: OptimizationConfig;
  onConfigChange: (config: OptimizationConfig) => void;
  dataSize: number;
  optimizedSize?: number;
}

export default function PerformanceSettings({
  config,
  onConfigChange,
  dataSize,
  optimizedSize,
}: PerformanceSettingsProps) {
  const isOptimized = optimizedSize !== undefined && optimizedSize < dataSize;
  const reductionPercent = isOptimized
    ? ((dataSize - optimizedSize) / dataSize) * 100
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <CardTitle className="text-sm">Performance Settings</CardTitle>
          </div>
          {isOptimized && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Optimized
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Optimize rendering for large datasets
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dataset Info */}
        <div className="bg-muted/50 p-3 rounded-md space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Original Points:</span>
            <span className="font-medium">{dataSize.toLocaleString()}</span>
          </div>
          {isOptimized && (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Rendered Points:</span>
                <span className="font-medium text-primary">
                  {optimizedSize.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Reduction:</span>
                <span className="font-medium text-green-600">
                  {reductionPercent.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Max Points */}
        <div className="space-y-2">
          <Label htmlFor="max-points" className="text-xs">
            Maximum Render Points
          </Label>
          <Select
            value={config.maxPoints.toString()}
            onValueChange={(value) =>
              onConfigChange({ ...config, maxPoints: parseInt(value) })
            }
          >
            <SelectTrigger id="max-points" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10000">10,000 (Fastest)</SelectItem>
              <SelectItem value="25000">25,000 (Fast)</SelectItem>
              <SelectItem value="50000">50,000 (Balanced)</SelectItem>
              <SelectItem value="100000">100,000 (Quality)</SelectItem>
              <SelectItem value="200000">200,000 (Best Quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sampling Method */}
        <div className="space-y-2">
          <Label htmlFor="sampling-method" className="text-xs">
            Sampling Method
          </Label>
          <Select
            value={config.samplingMethod}
            onValueChange={(value: 'uniform' | 'random' | 'grid') =>
              onConfigChange({ ...config, samplingMethod: value })
            }
          >
            <SelectTrigger id="sampling-method" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uniform">Uniform (Fastest)</SelectItem>
              <SelectItem value="random">Random (Balanced)</SelectItem>
              <SelectItem value="grid">Grid (Best Quality)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {config.samplingMethod === 'uniform' &&
              'Takes every nth point for consistent coverage'}
            {config.samplingMethod === 'random' &&
              'Randomly selects points for unbiased sampling'}
            {config.samplingMethod === 'grid' &&
              'Divides into grid cells and averages points'}
          </p>
        </div>

        {/* Clustering */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="clustering" className="text-xs">
              Point Clustering
            </Label>
            <Switch
              id="clustering"
              checked={config.clusteringEnabled}
              onCheckedChange={(checked) =>
                onConfigChange({ ...config, clusteringEnabled: checked })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Groups nearby points to reduce rendering load
          </p>
        </div>

        {/* Cluster Radius */}
        {config.clusteringEnabled && (
          <div className="space-y-2">
            <Label htmlFor="cluster-radius" className="text-xs">
              Cluster Radius
            </Label>
            <Select
              value={config.clusterRadius.toString()}
              onValueChange={(value) =>
                onConfigChange({ ...config, clusterRadius: parseFloat(value) })
              }
            >
              <SelectTrigger id="cluster-radius" className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.1">0.1° (Tight)</SelectItem>
                <SelectItem value="0.5">0.5° (Balanced)</SelectItem>
                <SelectItem value="1.0">1.0° (Loose)</SelectItem>
                <SelectItem value="2.0">2.0° (Very Loose)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Performance Tip */}
        {dataSize > 50000 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md">
            <div className="flex gap-2">
              <Zap className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                  Performance Tip
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  {dataSize > 100000
                    ? 'Very large dataset detected. Consider reducing max points or enabling clustering for optimal performance.'
                    : 'Large dataset detected. Current settings should provide good performance.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
