import { memo } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CoordinateDisplayProps {
  lat: number | null;
  lon: number | null;
  compact?: boolean;
}

function CoordinateDisplay({ lat, lon, compact = false }: CoordinateDisplayProps) {
  const formatCoordinate = (value: number | null, isLat: boolean): string => {
    if (value === null) return '---';
    
    const abs = Math.abs(value);
    const direction = isLat 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    
    return `${abs.toFixed(4)}° ${direction}`;
  };

  if (compact) {
    return (
      <Card className="px-2 py-1.5 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-primary" />
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="font-semibold text-foreground">
              {formatCoordinate(lat, true)}
            </span>
            <div className="w-px h-3 bg-border" />
            <span className="font-semibold text-foreground">
              {formatCoordinate(lon, false)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="px-3 py-2 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Lat:</span>
            <span className="font-semibold text-foreground min-w-[80px]">
              {formatCoordinate(lat, true)}
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Lon:</span>
            <span className="font-semibold text-foreground min-w-[80px]">
              {formatCoordinate(lon, false)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(CoordinateDisplay);
