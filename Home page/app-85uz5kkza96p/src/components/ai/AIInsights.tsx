import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';
import { aiService, AIInsight } from '@/services/aiService';
import { useDataset } from '@/contexts/DatasetContext';
import { useToast } from '@/hooks/use-toast';

export default function AIInsights() {
  const { dataset } = useDataset();
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    if (!dataset) {
      toast({
        title: 'No Dataset',
        description: 'Please upload a dataset first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const stats = {
        totalPoints: dataset.points.length,
        latRange: [
          Math.min(...dataset.points.map(p => p.lat)),
          Math.max(...dataset.points.map(p => p.lat)),
        ],
        lonRange: [
          Math.min(...dataset.points.map(p => p.lon)),
          Math.max(...dataset.points.map(p => p.lon)),
        ],
        valueRange: [
          Math.min(...dataset.points.map(p => p.value)),
          Math.max(...dataset.points.map(p => p.value)),
        ],
        mean: dataset.points.reduce((sum, p) => sum + p.value, 0) / dataset.points.length,
        stdDev: Math.sqrt(
          dataset.points.reduce(
            (sum, p) =>
              sum +
              Math.pow(
                p.value - dataset.points.reduce((s, pt) => s + pt.value, 0) / dataset.points.length,
                2
              ),
            0
          ) / dataset.points.length
        ),
      };

      const result = await aiService.generateInsights(dataset.points, stats);
      setInsights(result);

      toast({
        title: 'Insights Generated',
        description: 'AI analysis complete',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dataset && !insights) {
      generateInsights();
    }
  }, [dataset]);

  if (!dataset) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <CardDescription>Upload a dataset to get AI-powered insights</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <CardDescription>AI-powered analysis of your dataset</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading && !insights && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Analyzing your data...</p>
          </div>
        )}

        {insights && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground">{insights.summary}</p>
            </div>

            {insights.keyFindings && insights.keyFindings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Key Findings</h3>
                </div>
                <ul className="space-y-2">
                  {insights.keyFindings.map((finding, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-muted-foreground">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary">→</span>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.anomalies && insights.anomalies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h3 className="font-semibold">Anomalies Detected</h3>
                </div>
                <ul className="space-y-2">
                  {insights.anomalies.map((anomaly, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <Badge variant="destructive" className="mt-0.5">
                        !
                      </Badge>
                      <span className="text-muted-foreground">{anomaly}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
