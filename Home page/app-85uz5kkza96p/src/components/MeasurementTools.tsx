import { Ruler, Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export type MeasurementMode = 'distance' | 'area' | null;

interface MeasurementToolsProps {
  mode: MeasurementMode;
  onModeChange: (mode: MeasurementMode) => void;
  onClear: () => void;
  currentMeasurement: {
    distance?: number;
    area?: number;
  } | null;
  compact?: boolean;
}

export default function MeasurementTools({ 
  mode, 
  onModeChange, 
  onClear,
  currentMeasurement,
  compact = false
}: MeasurementToolsProps) {
  
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(2)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatArea = (squareMeters: number): string => {
    if (squareMeters < 1000000) {
      return `${squareMeters.toFixed(2)} m²`;
    }
    return `${(squareMeters / 1000000).toFixed(2)} km²`;
  };

  if (compact) {
    return (
      <Card className="w-full control-panel-glass">
        <CardContent className="p-2 space-y-2">
          <Label className="text-xs font-medium">Measure</Label>
          
          <div className="flex gap-1">
            <Button
              variant={mode === 'distance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange(mode === 'distance' ? null : 'distance')}
              className="flex-1 h-7 text-xs px-2"
              title="Measure Distance"
            >
              <Ruler className="w-3 h-3" />
            </Button>
            
            <Button
              variant={mode === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange(mode === 'area' ? null : 'area')}
              className="flex-1 h-7 text-xs px-2"
              title="Measure Area"
            >
              <Square className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={!currentMeasurement}
              className="h-7 px-2"
              title="Clear Measurement"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {currentMeasurement && (
            <div className="text-xs font-mono bg-muted/50 p-1.5 rounded text-center">
              {currentMeasurement.distance && formatDistance(currentMeasurement.distance)}
              {currentMeasurement.area && formatArea(currentMeasurement.area)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <Label className="text-xs font-medium">Measurement Tools</Label>
        
        <div className="flex gap-2">
          <Button
            variant={mode === 'distance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange(mode === 'distance' ? null : 'distance')}
            className="flex-1"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Distance
          </Button>
          
          <Button
            variant={mode === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange(mode === 'area' ? null : 'area')}
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            Area
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={!currentMeasurement}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {mode && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {mode === 'distance' 
              ? 'Click on the map to add points. Double-click to finish.'
              : 'Click on the map to add vertices. Double-click to close polygon.'}
          </div>
        )}

        {currentMeasurement && (
          <div className="bg-primary/10 p-3 rounded-md">
            {currentMeasurement.distance !== undefined && (
              <div className="text-sm">
                <span className="text-muted-foreground">Distance: </span>
                <span className="font-semibold text-primary">
                  {formatDistance(currentMeasurement.distance)}
                </span>
              </div>
            )}
            {currentMeasurement.area !== undefined && (
              <div className="text-sm">
                <span className="text-muted-foreground">Area: </span>
                <span className="font-semibold text-primary">
                  {formatArea(currentMeasurement.area)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
