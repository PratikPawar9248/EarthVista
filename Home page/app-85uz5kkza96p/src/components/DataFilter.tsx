import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { Dataset } from '@/types/heatmap';

interface DataFilterProps {
  dataset: Dataset | null;
  onFilterChange: (min: number, max: number) => void;
}

export default function DataFilter({ dataset, onFilterChange }: DataFilterProps) {
  const [range, setRange] = useState<[number, number]>([0, 100]);
  const [actualRange, setActualRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    if (dataset) {
      const values = dataset.points.map(p => p.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      setActualRange([min, max]);
      setRange([min, max]);
    }
  }, [dataset]);

  const handleRangeChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setRange(newRange);
  };

  const handleApply = () => {
    onFilterChange(range[0], range[1]);
  };

  const handleReset = () => {
    setRange(actualRange);
    onFilterChange(actualRange[0], actualRange[1]);
  };

  if (!dataset) return null;

  const isFiltered = range[0] !== actualRange[0] || range[1] !== actualRange[1];

  return (
    <div className="space-y-3">
      <Label className="text-xs flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5" />
        Value Range Filter
      </Label>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {range[0].toFixed(2)}</span>
          <span>Max: {range[1].toFixed(2)}</span>
        </div>
        
        <Slider
          min={actualRange[0]}
          max={actualRange[1]}
          step={(actualRange[1] - actualRange[0]) / 100}
          value={range}
          onValueChange={handleRangeChange}
          className="w-full"
        />
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleApply}
            disabled={!isFiltered}
            className="flex-1 h-8 text-xs"
          >
            Apply Filter
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={!isFiltered}
            className="flex-1 h-8 text-xs"
          >
            Reset
          </Button>
        </div>
      </div>
      
      {isFiltered && (
        <p className="text-xs text-primary">
          Filter active: {range[0].toFixed(2)} - {range[1].toFixed(2)}
        </p>
      )}
    </div>
  );
}
