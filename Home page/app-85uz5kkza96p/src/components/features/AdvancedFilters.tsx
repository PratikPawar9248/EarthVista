import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterSettings {
  valueMin: number;
  valueMax: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

interface AdvancedFiltersProps {
  filters: FilterSettings;
  bounds: {
    valueMin: number;
    valueMax: number;
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  onFiltersChange: (filters: FilterSettings) => void;
  onReset: () => void;
}

export function AdvancedFilters({ filters, bounds, onFiltersChange, onReset }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleValueRangeChange = (values: number[]) => {
    const newFilters = { ...localFilters, valueMin: values[0], valueMax: values[1] };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLatRangeChange = (values: number[]) => {
    const newFilters = { ...localFilters, latMin: values[0], latMax: values[1] };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLonRangeChange = (values: number[]) => {
    const newFilters = { ...localFilters, lonMin: values[0], lonMax: values[1] };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters(bounds);
    onReset();
  };

  const isFiltered =
    localFilters.valueMin !== bounds.valueMin ||
    localFilters.valueMax !== bounds.valueMax ||
    localFilters.latMin !== bounds.latMin ||
    localFilters.latMax !== bounds.latMax ||
    localFilters.lonMin !== bounds.lonMin ||
    localFilters.lonMax !== bounds.lonMax;

  return (
    <Card className="bg-card/95">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <CardDescription className="text-xs">Refine data range</CardDescription>
          </div>
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Value</Label>
            <span className="text-xs text-muted-foreground">
              {localFilters.valueMin.toFixed(1)} - {localFilters.valueMax.toFixed(1)}
            </span>
          </div>
          <Slider
            min={bounds.valueMin}
            max={bounds.valueMax}
            step={(bounds.valueMax - bounds.valueMin) / 100}
            value={[localFilters.valueMin, localFilters.valueMax]}
            onValueChange={handleValueRangeChange}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Latitude</Label>
            <span className="text-xs text-muted-foreground">
              {localFilters.latMin.toFixed(1)}° - {localFilters.latMax.toFixed(1)}°
            </span>
          </div>
          <Slider
            min={bounds.latMin}
            max={bounds.latMax}
            step={(bounds.latMax - bounds.latMin) / 100}
            value={[localFilters.latMin, localFilters.latMax]}
            onValueChange={handleLatRangeChange}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Longitude</Label>
            <span className="text-xs text-muted-foreground">
              {localFilters.lonMin.toFixed(1)}° - {localFilters.lonMax.toFixed(1)}°
            </span>
          </div>
          <Slider
            min={bounds.lonMin}
            max={bounds.lonMax}
            step={(bounds.lonMax - bounds.lonMin) / 100}
            value={[localFilters.lonMin, localFilters.lonMax]}
            onValueChange={handleLonRangeChange}
            className="w-full"
          />
        </div>

        {isFiltered && (
          <div className="pt-1 text-xs text-muted-foreground text-center">
            ⚠ Filters active
          </div>
        )}
      </CardContent>
    </Card>
  );
}
