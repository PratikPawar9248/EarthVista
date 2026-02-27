export interface DataPoint {
  lat: number;
  lon: number;
  value: number;
}

export interface Dataset {
  name: string;
  points: DataPoint[];
  valueRange: {
    min: number;
    max: number;
  };
  fields?: string[];
  selectedField?: string;
}

export interface HeatmapConfig {
  radius: number;
  blur: number;
  maxOpacity: number;
  minOpacity: number;
  intensity: number;
  gradient: Record<number, string>;
}

export interface FileUploadResult {
  success: boolean;
  data?: Dataset;
  error?: string;
}

export type SupportedFileType = 'csv' | 'json' | 'netcdf';
