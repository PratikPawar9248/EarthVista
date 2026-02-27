import { Card, CardContent } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import type { Dataset } from '@/types/heatmap';

interface ColorLegendProps {
  dataset: Dataset | null;
  compact?: boolean;
}

export default function ColorLegend({ dataset, compact = false }: ColorLegendProps) {
  if (!dataset) return null;

  const { min, max } = dataset.valueRange;
  const range = max - min;
  const steps = compact ? 3 : 5;
  const labels = Array.from({ length: steps }, (_, i) => {
    const value = min + (range * i) / (steps - 1);
    return value.toFixed(2);
  });

  if (compact) {
    return (
      <Card className="control-panel-glass shadow-lg border-border/50 transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Thermometer className="w-3 h-3 text-primary" />
              <span>Value Range</span>
            </div>
            <div className="relative">
              <div 
                className="h-4 rounded shadow-inner relative overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, rgb(0, 0, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 165, 0), rgb(255, 0, 0))'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              {labels.map((label, index) => (
                <span 
                  key={index} 
                  className="text-center font-semibold text-foreground/80"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="control-panel-glass shadow-xl border-border/50 transition-all duration-300 hover:shadow-2xl">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <Thermometer className="w-4 h-4 text-primary" />
            <span>Value Range</span>
            {dataset.selectedField && (
              <span className="text-xs text-muted-foreground font-normal">
                ({dataset.selectedField})
              </span>
            )}
          </div>
          <div className="relative">
            <div 
              className="h-8 rounded-lg shadow-inner relative overflow-hidden"
              style={{
                background: 'linear-gradient(to right, rgb(0, 0, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 165, 0), rgb(255, 0, 0))'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            <div className="absolute -top-1 -bottom-1 left-0 right-0 flex justify-between pointer-events-none">
              {labels.map((_, index) => (
                <div key={index} className="w-px h-full bg-foreground/20" />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs font-mono">
            {labels.map((label, index) => (
              <span 
                key={index} 
                className="text-center font-semibold text-foreground/80"
                style={{ width: `${100 / steps}%` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
