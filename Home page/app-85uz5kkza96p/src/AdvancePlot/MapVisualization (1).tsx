import React from 'react';
import InteractiveMap from '../InteractiveMap';

interface OceanData {
  id: string;
  latitude: number;
  longitude: number;
  depth?: number;
  temperature?: number;
  salinity?: number;
  chlorophyll?: number;
  timestamp?: string;
  u_velocity?: number;
  v_velocity?: number;
  ssh?: number;
  bathymetry?: number;
  [key: string]: any;
}

interface MapVisualizationProps {
  data: OceanData[];
  parameter: string;
  onLocationSelect: (location: OceanData) => void;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ data, parameter, onLocationSelect }) => {
  return (
    <InteractiveMap 
      data={data}
      parameter={parameter}
      onLocationSelect={onLocationSelect}
    />
  );
};

export default MapVisualization;