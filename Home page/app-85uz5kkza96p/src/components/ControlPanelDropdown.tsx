import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ControlPanelDropdownProps {
  radius: number;
  onRadiusChange: (value: number) => void;
}

export default function ControlPanelDropdown({
  radius,
  onRadiusChange,
}: ControlPanelDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Controls
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="text-xs font-semibold text-muted-foreground border-b pb-2">
            Heatmap Controls
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="radius-slider" className="text-xs font-medium">
                Radius
              </Label>
              <span className="text-xs text-muted-foreground font-mono">{radius}px</span>
            </div>
            <Slider
              id="radius-slider"
              min={5}
              max={50}
              step={1}
              value={[radius]}
              onValueChange={(values) => {
                console.log('Radius changed to:', values[0]);
                onRadiusChange(values[0]);
              }}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">
              Controls the size of heat points
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
