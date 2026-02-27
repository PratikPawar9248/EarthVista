import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Database, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface DatasetInfo {
  name: string;
  format: string;
  size: number;
  parameters: string[];
  recordCount: number;
}

interface DataUploadProps {
  onDataUpload: (data: OceanData[], info: DatasetInfo) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processCSV = (content: string, filename: string): { data: OceanData[], info: DatasetInfo } => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data: OceanData[] = [];
    const parameters: string[] = [];
    
    // Map common header variations
    const headerMap: { [key: string]: string } = {
      'lat': 'latitude',
      'latitude': 'latitude',
      'lon': 'longitude',
      'lng': 'longitude',
      'longitude': 'longitude',
      'temp': 'temperature',
      'temperature': 'temperature',
      'sst': 'temperature',
      'sal': 'salinity',
      'salinity': 'salinity',
      'chl': 'chlorophyll',
      'chlorophyll': 'chlorophyll',
      'depth': 'depth',
      'time': 'timestamp',
      'timestamp': 'timestamp',
      'date': 'timestamp'
    };

    // Identify parameters
    headers.forEach(header => {
      const mapped = headerMap[header] || header;
      if (['temperature', 'salinity', 'chlorophyll', 'depth'].includes(mapped)) {
        parameters.push(mapped);
      }
    });

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const record: OceanData = {
        id: `point_${i}`,
        latitude: 0,
        longitude: 0
      };

      headers.forEach((header, index) => {
        const mapped = headerMap[header] || header;
        const value = values[index];
        
        if (mapped === 'latitude' || mapped === 'longitude') {
          record[mapped] = parseFloat(value) || 0;
        } else if (['temperature', 'salinity', 'chlorophyll', 'depth'].includes(mapped)) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            record[mapped] = numValue;
          }
        } else {
          record[header] = value;
        }
      });

      if (record.latitude !== 0 || record.longitude !== 0) {
        data.push(record);
      }
    }

    return {
      data,
      info: {
        name: filename,
        format: 'CSV',
        size: content.length,
        parameters,
        recordCount: data.length
      }
    };
  };

  const processJSON = (content: string, filename: string): { data: OceanData[], info: DatasetInfo } => {
    const jsonData = JSON.parse(content);
    let data: OceanData[] = [];
    const parameters: string[] = [];

    if (Array.isArray(jsonData)) {
      data = jsonData.map((item, index) => ({
        id: item.id || `point_${index}`,
        latitude: item.latitude || item.lat || 0,
        longitude: item.longitude || item.lon || item.lng || 0,
        temperature: item.temperature || item.temp || item.sst,
        salinity: item.salinity || item.sal,
        chlorophyll: item.chlorophyll || item.chl,
        depth: item.depth,
        timestamp: item.timestamp || item.time || item.date,
        ...item
      }));
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      data = jsonData.data.map((item: any, index: number) => ({
        id: item.id || `point_${index}`,
        latitude: item.latitude || item.lat || 0,
        longitude: item.longitude || item.lon || item.lng || 0,
        temperature: item.temperature || item.temp || item.sst,
        salinity: item.salinity || item.sal,
        chlorophyll: item.chlorophyll || item.chl,
        depth: item.depth,
        timestamp: item.timestamp || item.time || item.date,
        ...item
      }));
    }

    // Identify parameters
    if (data.length > 0) {
      const sample = data[0];
      ['temperature', 'salinity', 'chlorophyll', 'depth'].forEach(param => {
        if (sample[param] !== undefined) {
          parameters.push(param);
        }
      });
    }

    return {
      data,
      info: {
        name: filename,
        format: 'JSON',
        size: content.length,
        parameters,
        recordCount: data.length
      }
    };
  };

  const generateSampleData = (): { data: OceanData[], info: DatasetInfo } => {
    const data: OceanData[] = [];
    const parameters = ['temperature', 'salinity', 'chlorophyll'];
    
    // Generate sample oceanographic data for Indian Ocean region
    for (let i = 0; i < 100; i++) {
      const lat = -10 + Math.random() * 20; // -10 to 10 degrees
      const lon = 60 + Math.random() * 30;  // 60 to 90 degrees (Indian Ocean)
      
      data.push({
        id: `sample_${i}`,
        latitude: lat,
        longitude: lon,
        temperature: 25 + Math.random() * 10, // 25-35°C
        salinity: 34 + Math.random() * 2,     // 34-36 PSU
        chlorophyll: Math.random() * 5,       // 0-5 mg/m³
        depth: Math.random() * 1000,          // 0-1000m
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return {
      data,
      info: {
        name: 'Sample Indian Ocean Data',
        format: 'Generated',
        size: 0,
        parameters,
        recordCount: data.length
      }
    };
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const content = await file.text();
      let result: { data: OceanData[], info: DatasetInfo };

      if (file.name.toLowerCase().endsWith('.csv')) {
        result = processCSV(content, file.name);
      } else if (file.name.toLowerCase().endsWith('.json')) {
        result = processJSON(content, file.name);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON files.');
      }

      if (result.data.length === 0) {
        throw new Error('No valid oceanographic data found in the file.');
      }

      onDataUpload(result.data, result.info);
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onDataUpload, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const loadSampleData = useCallback(() => {
    const result = generateSampleData();
    onDataUpload(result.data, result.info);
    toast({
      title: "Sample Data Loaded",
      description: "Generated 100 sample oceanographic data points",
    });
  }, [onDataUpload, toast]);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Oceanographic Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Drop your data files here</h3>
                <p className="text-muted-foreground">
                  Support for NetCDF, CSV, and JSON formats
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isProcessing}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.json,.nc"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  onClick={loadSampleData}
                  className="border-accent/20 hover:bg-accent/10"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Load Sample Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format Information */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Supported Data Formats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-semibold text-primary">CSV Format</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Comma-separated values with headers: latitude, longitude, temperature, salinity, chlorophyll
              </p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-semibold text-primary">JSON Format</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Array of objects or nested data structure with oceanographic parameters
              </p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-semibold text-primary">NetCDF (Coming Soon)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Scientific data format commonly used in oceanography and climate science
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <h4 className="font-semibold text-accent mb-2">Expected Parameters:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <span>• Sea Surface Temperature (SST)</span>
              <span>• Salinity (PSU)</span>
              <span>• Chlorophyll Concentration</span>
              <span>• Latitude/Longitude</span>
              <span>• Depth (optional)</span>
              <span>• Timestamp (optional)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;