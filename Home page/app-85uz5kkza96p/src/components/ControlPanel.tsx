import { Settings, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Dataset } from '@/types/heatmap';

interface ControlPanelProps {
  dataset: Dataset | null;
  radius: number;
  opacity: number;
  intensity: number;
  onRadiusChange: (value: number) => void;
  onOpacityChange: (value: number) => void;
  onIntensityChange: (value: number) => void;
}

export default function ControlPanel({
  dataset,
  radius,
  opacity,
  intensity,
  onRadiusChange,
  onOpacityChange,
  onIntensityChange
}: ControlPanelProps) {
  return (
    <Card className="control-panel-glass shadow-xl">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Controls</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {dataset && (
          <>
            <div className="p-2 rounded-lg bg-muted/50 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Info className="w-3 h-3 text-primary" />
                Dataset
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div className="truncate">{dataset.name}</div>
                <div>{dataset.points.length.toLocaleString()} pts</div>
                <div>
                  {dataset.valueRange.min.toFixed(1)} - {dataset.valueRange.max.toFixed(1)}
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="radius-slider" className="text-xs font-medium">
                Radius
              </Label>
              <span className="text-xs text-muted-foreground">{radius}px</span>
            </div>
            <Slider
              id="radius-slider"
              min={5}
              max={50}
              step={1}
              value={[radius]}
              onValueChange={(values) => onRadiusChange(values[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="opacity-slider" className="text-xs font-medium">
                Opacity
              </Label>
              <span className="text-xs text-muted-foreground">{Math.round(opacity * 100)}%</span>
            </div>
            <Slider
              id="opacity-slider"
              min={0.1}
              max={1}
              step={0.05}
              value={[opacity]}
              onValueChange={(values) => onOpacityChange(values[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="intensity-slider" className="text-xs font-medium">
                Intensity
              </Label>
              <span className="text-xs text-muted-foreground">{intensity.toFixed(1)}x</span>
            </div>
            <Slider
              id="intensity-slider"
              min={0.5}
              max={3}
              step={0.1}
              value={[intensity]}
              onValueChange={(values) => onIntensityChange(values[0])}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
