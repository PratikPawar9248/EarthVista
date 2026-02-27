import React from 'react';

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

interface ContourPlotProps {
  data: OceanData[];
  parameter: string;
  onPointClick: (location: OceanData) => void;
}

const ContourPlot: React.FC<ContourPlotProps> = ({ data, parameter, onPointClick }) => {
  return (
    <div className="h-96 flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-lg">
      <div className="text-center">
        <p className="text-lg">Contour Plot</p>
        <p className="text-sm mt-2">Advanced contour visualization for {parameter}</p>
        <p className="text-xs mt-2 text-accent">Coming in next update</p>
      </div>
    </div>
  );
};

export default ContourPlot;