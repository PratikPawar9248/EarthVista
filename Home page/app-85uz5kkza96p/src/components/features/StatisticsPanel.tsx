import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Statistics, SpatialStatistics, DataQuality } from '@/utils/statistics';
import { BarChart3, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';

interface StatisticsPanelProps {
  statistics: Statistics | null;
  spatialStats: SpatialStatistics | null;
  dataQuality: DataQuality | null;
}

export function StatisticsPanel({ statistics, spatialStats, dataQuality }: StatisticsPanelProps) {
  if (!statistics || !spatialStats || !dataQuality) {
    return (
      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistics
          </CardTitle>
          <CardDescription>Upload data to view statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Data Analytics
        </CardTitle>
        <CardDescription>Comprehensive statistical analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="descriptive" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="descriptive">Descriptive</TabsTrigger>
            <TabsTrigger value="spatial">Spatial</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="descriptive" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="Count" value={statistics.count.toLocaleString()} />
              <StatItem label="Mean" value={statistics.mean.toFixed(4)} />
              <StatItem label="Median" value={statistics.median.toFixed(4)} />
              <StatItem label="Std Dev" value={statistics.stdDev.toFixed(4)} />
              <StatItem label="Min" value={statistics.min.toFixed(4)} />
              <StatItem label="Max" value={statistics.max.toFixed(4)} />
              <StatItem label="Range" value={statistics.range.toFixed(4)} />
              <StatItem label="Variance" value={statistics.variance.toFixed(4)} />
            </div>

            <div className="pt-3 border-t border-border">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Distribution Metrics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <StatItem label="Q1 (25%)" value={statistics.q1.toFixed(4)} />
                <StatItem label="Q3 (75%)" value={statistics.q3.toFixed(4)} />
                <StatItem label="IQR" value={statistics.iqr.toFixed(4)} />
                <StatItem label="Skewness" value={statistics.skewness.toFixed(4)} />
                <StatItem label="Kurtosis" value={statistics.kurtosis.toFixed(4)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spatial" className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4" />
              <h4 className="text-sm font-medium">Geographic Coverage</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <StatItem
                label="Coverage Area"
                value={`${spatialStats.coverageArea.toFixed(2)} sq°`}
              />
              <StatItem
                label="Point Density"
                value={`${spatialStats.pointDensity.toFixed(2)} pts/sq°`}
              />
              <StatItem
                label="Latitude Range"
                value={`${spatialStats.latRange[0].toFixed(2)}° to ${spatialStats.latRange[1].toFixed(2)}°`}
              />
              <StatItem
                label="Longitude Range"
                value={`${spatialStats.lonRange[0].toFixed(2)}° to ${spatialStats.lonRange[1].toFixed(2)}°`}
              />
              <StatItem
                label="Centroid"
                value={`(${spatialStats.centroid.lat.toFixed(4)}°, ${spatialStats.centroid.lon.toFixed(4)}°)`}
              />
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4" />
              <h4 className="text-sm font-medium">Data Quality Assessment</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quality Score</span>
                <Badge variant={getQualityBadgeVariant(dataQuality.qualityScore)}>
                  {dataQuality.qualityScore.toFixed(1)}%
                </Badge>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${dataQuality.qualityScore}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <StatItem label="Total Points" value={dataQuality.totalPoints.toLocaleString()} />
                <StatItem
                  label="Valid Points"
                  value={dataQuality.validPoints.toLocaleString()}
                  valueClassName="text-green-500"
                />
                <StatItem
                  label="Invalid Points"
                  value={dataQuality.invalidPoints.toLocaleString()}
                  valueClassName={dataQuality.invalidPoints > 0 ? 'text-red-500' : ''}
                />
                <StatItem
                  label="Missing Values"
                  value={dataQuality.missingValues.toLocaleString()}
                  valueClassName={dataQuality.missingValues > 0 ? 'text-yellow-500' : ''}
                />
                <StatItem
                  label="Outliers"
                  value={dataQuality.outliers.toLocaleString()}
                  valueClassName={dataQuality.outliers > 0 ? 'text-orange-500' : ''}
                />
                <StatItem
                  label="Completeness"
                  value={`${dataQuality.completeness.toFixed(1)}%`}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StatItem({
  label,
  value,
  valueClassName = '',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-md">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

function getQualityBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 90) return 'default';
  if (score >= 70) return 'secondary';
  return 'destructive';
}
