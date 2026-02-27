import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Thermometer, Droplets, Leaf, Waves } from 'lucide-react';

interface OceanData {
  id: string;
  latitude: number;
  longitude: number;
  depth?: number;
  temperature?: number;
  salinity?: number;
  chlorophyll?: number;
  timestamp?: string;
  [key: string]: any;
}

interface LocationProfileProps {
  location: OceanData;
}

const LocationProfile: React.FC<LocationProfileProps> = ({ location }) => {
  const formatCoordinate = (coord: number, type: 'lat' | 'lon') => {
    const abs = Math.abs(coord);
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${abs.toFixed(4)}° ${direction}`;
  };

  const getParameterColor = (param: string, value: number) => {
    switch (param) {
      case 'temperature':
        if (value < 15) return 'bg-blue-500/20 text-blue-400';
        if (value < 25) return 'bg-green-500/20 text-green-400';
        return 'bg-red-500/20 text-red-400';
      case 'salinity':
        if (value < 34) return 'bg-yellow-500/20 text-yellow-400';
        if (value < 36) return 'bg-green-500/20 text-green-400';
        return 'bg-red-500/20 text-red-400';
      case 'chlorophyll':
        if (value < 1) return 'bg-blue-500/20 text-blue-400';
        if (value < 3) return 'bg-green-500/20 text-green-400';
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  const getParameterIcon = (param: string) => {
    switch (param) {
      case 'temperature':
        return <Thermometer className="w-4 h-4" />;
      case 'salinity':
        return <Droplets className="w-4 h-4" />;
      case 'chlorophyll':
        return <Leaf className="w-4 h-4" />;
      case 'depth':
        return <Waves className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getParameterUnit = (param: string) => {
    switch (param) {
      case 'temperature':
        return '°C';
      case 'salinity':
        return 'PSU';
      case 'chlorophyll':
        return 'mg/m³';
      case 'depth':
        return 'm';
      default:
        return '';
    }
  };

  const getParameterDescription = (param: string, value: number) => {
    switch (param) {
      case 'temperature':
        if (value < 15) return 'Cold water';
        if (value < 25) return 'Moderate temperature';
        return 'Warm water';
      case 'salinity':
        if (value < 34) return 'Low salinity';
        if (value < 36) return 'Normal salinity';
        return 'High salinity';
      case 'chlorophyll':
        if (value < 1) return 'Low productivity';
        if (value < 3) return 'Moderate productivity';
        return 'High productivity';
      default:
        return '';
    }
  };

  return (
    <Card className="ocean-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Location Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coordinates */}
        <div className="p-3 bg-secondary/30 rounded-lg">
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Coordinates</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Latitude:</span> {formatCoordinate(location.latitude, 'lat')}
            </p>
            <p className="text-sm">
              <span className="font-medium">Longitude:</span> {formatCoordinate(location.longitude, 'lon')}
            </p>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Measurements</h4>
          
          {['temperature', 'salinity', 'chlorophyll', 'depth'].map(param => {
            const value = location[param];
            if (value === undefined || value === null) return null;

            return (
              <div key={param} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getParameterColor(param, value)}`}>
                    {getParameterIcon(param)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{param}</p>
                    <p className="text-xs text-muted-foreground">
                      {getParameterDescription(param, value)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getParameterUnit(param)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timestamp */}
        {location.timestamp && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Timestamp</h4>
            <p className="text-sm">
              {new Date(location.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Additional Data */}
        {Object.entries(location).some(([key, value]) => 
          !['id', 'latitude', 'longitude', 'temperature', 'salinity', 'chlorophyll', 'depth', 'timestamp'].includes(key) &&
          value !== undefined && value !== null
        ) && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Additional Data</h4>
            <div className="space-y-1">
              {Object.entries(location).map(([key, value]) => {
                if (['id', 'latitude', 'longitude', 'temperature', 'salinity', 'chlorophyll', 'depth', 'timestamp'].includes(key) ||
                    value === undefined || value === null) {
                  return null;
                }
                
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Quality Indicator */}
        <div className="flex flex-wrap gap-2">
          {location.temperature !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Temperature ✓
            </Badge>
          )}
          {location.salinity !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Salinity ✓
            </Badge>
          )}
          {location.chlorophyll !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Chlorophyll ✓
            </Badge>
          )}
          {location.depth !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Depth ✓
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationProfile;