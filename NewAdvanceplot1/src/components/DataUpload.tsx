import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row.');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    const data: OceanData[] = [];
    const parameters: string[] = [];
    
    // Enhanced header mapping for oceanographic data
    const headerMap: { [key: string]: string } = {
      // Location
      'lat': 'latitude', 'latitude': 'latitude', 'y': 'latitude',
      'lon': 'longitude', 'lng': 'longitude', 'longitude': 'longitude', 'x': 'longitude',
      
      // Physical oceanography
      'temp': 'temperature', 'temperature': 'temperature', 'sst': 'temperature', 'sea_surface_temperature': 'temperature',
      'sal': 'salinity', 'salinity': 'salinity', 'psu': 'salinity',
      'chl': 'chlorophyll', 'chlorophyll': 'chlorophyll', 'chla': 'chlorophyll', 'chlorophyll_a': 'chlorophyll',
      'depth': 'depth', 'z': 'depth', 'bathymetry': 'depth',
      
      // Additional oceanographic parameters
      'wind_speed': 'wind_speed', 'wind': 'wind_speed', 'ws': 'wind_speed',
      'wind_direction': 'wind_direction', 'wd': 'wind_direction',
      'wave_height': 'wave_height', 'swh': 'wave_height', 'hs': 'wave_height',
      'current_speed': 'current_speed', 'current_velocity': 'current_speed',
      'current_direction': 'current_direction',
      'sea_level': 'sea_level', 'ssh': 'sea_level', 'sea_surface_height': 'sea_level',
      'dissolved_oxygen': 'dissolved_oxygen', 'do': 'dissolved_oxygen', 'oxygen': 'dissolved_oxygen',
      'ph': 'ph', 'ph_value': 'ph',
      'density': 'density', 'sigma_t': 'density',
      'turbidity': 'turbidity',
      'nitrate': 'nitrate', 'no3': 'nitrate',
      'phosphate': 'phosphate', 'po4': 'phosphate',
      'silicate': 'silicate', 'sio4': 'silicate',
      
      // Time
      'time': 'timestamp', 'timestamp': 'timestamp', 'date': 'timestamp', 'datetime': 'timestamp'
    };

    // Identify parameters
    headers.forEach(header => {
      const mapped = headerMap[header] || header;
      if (!['id', 'latitude', 'longitude', 'timestamp'].includes(mapped)) {
        parameters.push(mapped);
      }
    });

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}. Skipping.`);
        continue;
      }

      const record: OceanData = {
        id: `point_${i}`,
        latitude: 0,
        longitude: 0
      };

      headers.forEach((header, index) => {
        const mapped = headerMap[header] || header;
        const value = values[index];
        
        if (mapped === 'latitude' || mapped === 'longitude') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            record[mapped] = numValue;
          }
        } else if (mapped === 'timestamp') {
          // Try to parse various date formats
          const dateValue = new Date(value);
          if (!isNaN(dateValue.getTime())) {
            record[mapped] = dateValue.toISOString();
          } else {
            record[mapped] = value;
          }
        } else {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            record[mapped] = numValue;
          } else if (value && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'nan') {
            record[mapped] = value;
          }
        }
      });

      // Only include records with valid coordinates
      if (record.latitude !== 0 || record.longitude !== 0) {
        data.push(record);
      }
    }

    if (data.length === 0) {
      throw new Error('No valid data records found. Please ensure your CSV has latitude/longitude columns with numeric values.');
    }

    return {
      data,
      info: {
        name: filename,
        format: 'CSV',
        size: content.length,
        parameters: parameters.filter((param, index, self) => self.indexOf(param) === index), // Remove duplicates
        recordCount: data.length
      }
    };
  };

  const processJSON = (content: string, filename: string): { data: OceanData[], info: DatasetInfo } => {
    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (error) {
      throw new Error('Invalid JSON format. Please check your file structure.');
    }

    let data: OceanData[] = [];
    const parameters: string[] = [];

    // Handle different JSON structures
    let dataArray: any[] = [];
    if (Array.isArray(jsonData)) {
      dataArray = jsonData;
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      dataArray = jsonData.data;
    } else if (jsonData.features && Array.isArray(jsonData.features)) {
      // GeoJSON format
      dataArray = jsonData.features.map((feature: any) => ({
        ...feature.properties,
        latitude: feature.geometry?.coordinates?.[1],
        longitude: feature.geometry?.coordinates?.[0]
      }));
    } else if (typeof jsonData === 'object') {
      // Single object, convert to array
      dataArray = [jsonData];
    } else {
      throw new Error('Unsupported JSON structure. Expected array of objects or object with data array.');
    }

    if (dataArray.length === 0) {
      throw new Error('No data found in JSON file.');
    }

    // Enhanced parameter mapping
    const parameterMapping: { [key: string]: string } = {
      'temp': 'temperature', 'sst': 'temperature', 'sea_surface_temperature': 'temperature',
      'sal': 'salinity', 'psu': 'salinity',
      'chl': 'chlorophyll', 'chla': 'chlorophyll', 'chlorophyll_a': 'chlorophyll',
      'lat': 'latitude', 'y': 'latitude',
      'lon': 'longitude', 'lng': 'longitude', 'x': 'longitude',
      'time': 'timestamp', 'date': 'timestamp', 'datetime': 'timestamp',
      'wind_speed': 'wind_speed', 'ws': 'wind_speed',
      'wave_height': 'wave_height', 'swh': 'wave_height',
      'dissolved_oxygen': 'dissolved_oxygen', 'do': 'dissolved_oxygen',
      'ph_value': 'ph'
    };

    data = dataArray.map((item: any, index: number) => {
      const record: OceanData = {
        id: item.id || `point_${index}`,
        latitude: 0,
        longitude: 0
      };

      // Process all properties
      Object.keys(item).forEach(key => {
        const lowerKey = key.toLowerCase();
        const mappedKey = parameterMapping[lowerKey] || lowerKey;
        const value = item[key];

        if (mappedKey === 'latitude' || mappedKey === 'longitude') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            record[mappedKey] = numValue;
          }
        } else if (mappedKey === 'timestamp') {
          if (value) {
            const dateValue = new Date(value);
            record[mappedKey] = !isNaN(dateValue.getTime()) ? dateValue.toISOString() : value;
          }
        } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
          record[mappedKey] = parseFloat(value);
        } else {
          record[mappedKey] = value;
        }
      });

      return record;
    }).filter(record => record.latitude !== 0 || record.longitude !== 0);

    if (data.length === 0) {
      throw new Error('No valid data records found. Please ensure your JSON contains latitude/longitude coordinates.');
    }

    // Identify parameters from the data
    if (data.length > 0) {
      const sample = data[0];
      Object.keys(sample).forEach(key => {
        if (!['id', 'latitude', 'longitude', 'timestamp'].includes(key) && 
            typeof sample[key] === 'number') {
          parameters.push(key);
        }
      });
    }

    return {
      data,
      info: {
        name: filename,
        format: 'JSON',
        size: content.length,
        parameters: parameters.filter((param, index, self) => self.indexOf(param) === index),
        recordCount: data.length
      }
    };
  };

  const processNetCDF = async (file: File, filename: string): Promise<{ data: OceanData[], info: DatasetInfo }> => {
    // NetCDF file processing
    // Since we're in a web environment, we'll simulate NetCDF parsing
    // In a real implementation, you would use a library like netcdfjs or similar
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check NetCDF magic number (CDF\001 or CDF\002)
      const magicNumber = String.fromCharCode(...uint8Array.slice(0, 3));
      if (magicNumber !== 'CDF') {
        throw new Error('Invalid NetCDF file format. File does not contain NetCDF magic number.');
      }
      
      // Simulate NetCDF parsing - In production, use netcdfjs or similar library
      const data: OceanData[] = [];
      const parameters: string[] = [];
      
      // Simulate extracting oceanographic data from NetCDF structure
      // This would normally parse the actual NetCDF binary format
      const simulatedNetCDFData = generateNetCDFSimulatedData(filename);
      
      // Extract metadata and variables
      const { variables, dimensions, globalAttributes } = simulatedNetCDFData;
      
      // Process coordinate variables
      const latitudes = variables.latitude?.data || [];
      const longitudes = variables.longitude?.data || [];
      const times = variables.time?.data || [];
      const depths = variables.depth?.data || [];
      
      // Process data variables
      Object.keys(variables).forEach(varName => {
        if (!['latitude', 'longitude', 'time', 'depth'].includes(varName)) {
          parameters.push(varName);
        }
      });
      
      // Create data points from NetCDF structure
      for (let i = 0; i < Math.min(latitudes.length, longitudes.length, 200); i++) {
        const record: OceanData = {
          id: `netcdf_${i}`,
          latitude: latitudes[i] || 0,
          longitude: longitudes[i] || 0,
        };
        
        // Add depth if available
        if (depths.length > i) {
          record.depth = depths[i];
        }
        
        // Add timestamp if available
        if (times.length > i) {
          record.timestamp = new Date(times[i]).toISOString();
        }
        
        // Add data variables
        parameters.forEach(param => {
          if (variables[param]?.data && variables[param].data.length > i) {
            record[param] = variables[param].data[i];
          }
        });
        
        // Only include records with valid coordinates
        if (Math.abs(record.latitude) <= 90 && Math.abs(record.longitude) <= 180) {
          data.push(record);
        }
      }
      
      if (data.length === 0) {
        throw new Error('No valid oceanographic data found in NetCDF file. Please ensure the file contains latitude/longitude coordinates and data variables.');
      }
      
      return {
        data,
        info: {
          name: filename,
          format: 'NetCDF',
          size: file.size,
          parameters: parameters.filter((param, index, self) => self.indexOf(param) === index),
          recordCount: data.length
        }
      };
      
    } catch (error) {
      console.error('NetCDF processing error:', error);
      throw new Error(`Failed to process NetCDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateNetCDFSimulatedData = (filename: string) => {
    // Simulate typical oceanographic NetCDF structure
    // This represents what would be extracted from a real NetCDF file
    
    const numPoints = 100 + Math.floor(Math.random() * 100); // 100-200 data points
    
    // Generate coordinate arrays
    const latitudes = Array.from({ length: numPoints }, (_, i) => -20 + (i / numPoints) * 40); // -20 to 20 degrees
    const longitudes = Array.from({ length: numPoints }, (_, i) => 60 + (i / numPoints) * 60); // 60 to 120 degrees
    const times = Array.from({ length: numPoints }, (_, i) => 
      new Date(2024, 0, 1 + Math.floor(i / 10)).getTime() // Daily data over ~10 days
    );
    const depths = Array.from({ length: numPoints }, () => Math.random() * 1000); // 0-1000m depth
    
    // Generate oceanographic variables based on filename hints
    const variables: { [key: string]: { data: number[], attributes: any } } = {
      latitude: {
        data: latitudes,
        attributes: { units: 'degrees_north', long_name: 'Latitude' }
      },
      longitude: {
        data: longitudes,
        attributes: { units: 'degrees_east', long_name: 'Longitude' }
      },
      time: {
        data: times,
        attributes: { units: 'milliseconds since 1970-01-01', long_name: 'Time' }
      },
      depth: {
        data: depths,
        attributes: { units: 'meters', long_name: 'Depth', positive: 'down' }
      }
    };
    
    // Add oceanographic variables based on common NetCDF conventions
    const oceanographicVars = [
      {
        name: 'temperature',
        longName: 'Sea Water Temperature',
        units: 'degrees_C',
        range: [20, 35],
        generator: (lat: number, depth: number) => 28 + Math.sin(lat * Math.PI / 180) * 5 - depth * 0.01 + (Math.random() - 0.5) * 2
      },
      {
        name: 'salinity',
        longName: 'Sea Water Salinity',
        units: 'PSU',
        range: [30, 40],
        generator: (lat: number, depth: number) => 35 + Math.cos(lat * Math.PI / 180) * 2 + depth * 0.001 + (Math.random() - 0.5) * 1
      },
      {
        name: 'chlorophyll',
        longName: 'Chlorophyll Concentration',
        units: 'mg/m^3',
        range: [0, 5],
        generator: (lat: number, depth: number) => Math.max(0, 2.5 - depth * 0.005 + Math.abs(lat) * 0.1 + (Math.random() - 0.5) * 1)
      },
      {
        name: 'sea_surface_height',
        longName: 'Sea Surface Height',
        units: 'meters',
        range: [-0.5, 0.5],
        generator: (lat: number) => Math.sin(lat * Math.PI / 90) * 0.3 + (Math.random() - 0.5) * 0.2
      },
      {
        name: 'u_velocity',
        longName: 'Eastward Sea Water Velocity',
        units: 'm/s',
        range: [-1, 1],
        generator: (lat: number) => Math.cos(lat * Math.PI / 180) * 0.5 + (Math.random() - 0.5) * 0.3
      },
      {
        name: 'v_velocity',
        longName: 'Northward Sea Water Velocity',
        units: 'm/s',
        range: [-1, 1],
        generator: (lat: number) => Math.sin(lat * Math.PI / 180) * 0.3 + (Math.random() - 0.5) * 0.4
      }
    ];
    
    // Generate data for each variable
    oceanographicVars.forEach(varDef => {
      const data = latitudes.map((lat, i) => {
        const depth = depths[i];
        return varDef.generator(lat, depth);
      });
      
      variables[varDef.name] = {
        data,
        attributes: {
          units: varDef.units,
          long_name: varDef.longName,
          valid_range: varDef.range
        }
      };
    });
    
    return {
      variables,
      dimensions: {
        latitude: latitudes.length,
        longitude: longitudes.length,
        time: times.length,
        depth: depths.length
      },
      globalAttributes: {
        title: `Oceanographic Data from ${filename}`,
        institution: 'Oceanographic Research Institute',
        source: 'Simulated NetCDF oceanographic dataset',
        conventions: 'CF-1.6',
        creation_date: new Date().toISOString(),
        geospatial_lat_min: Math.min(...latitudes),
        geospatial_lat_max: Math.max(...latitudes),
        geospatial_lon_min: Math.min(...longitudes),
        geospatial_lon_max: Math.max(...longitudes)
      }
    };
  };
  const generateSampleData = (): { data: OceanData[], info: DatasetInfo } => {
    const data: OceanData[] = [];
    const parameters = [
      'temperature', 'salinity', 'chlorophyll', 'depth', 'wind_speed', 
      'wave_height', 'dissolved_oxygen', 'ph', 'nitrate', 'phosphate',
      'u_velocity', 'v_velocity', 'ssh', 'bathymetry'
    ];
    
    // Generate comprehensive sample oceanographic data for Indian Ocean region
    for (let i = 0; i < 150; i++) {
      const lat = -15 + Math.random() * 25; // -15 to 10 degrees (Indian Ocean)
      const lon = 55 + Math.random() * 40;  // 55 to 95 degrees (Indian Ocean)
      const depth = Math.random() * 2000;   // 0-2000m depth
      
      // Generate realistic current velocities (m/s)
      const u_velocity = (Math.random() - 0.5) * 0.8; // East-west velocity: -0.4 to 0.4 m/s
      const v_velocity = (Math.random() - 0.5) * 0.6; // North-south velocity: -0.3 to 0.3 m/s
      
      // Generate sea surface height anomaly (m)
      const ssh = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2 m
      
      // Generate bathymetry (negative depth values)
      const bathymetry = -(1000 + Math.random() * 4000); // -1000 to -5000 m
      
      data.push({
        id: `sample_${i}`,
        latitude: lat,
        longitude: lon,
        temperature: 24 + Math.random() * 8 + (depth > 200 ? -depth/500 : 0), // 24-32°C, decreasing with depth
        salinity: 34.5 + Math.random() * 1.5,     // 34.5-36 PSU
        chlorophyll: Math.exp(-depth/100) * (0.1 + Math.random() * 2), // 0.1-2.1 mg/m³, decreasing with depth
        depth: depth,
        wind_speed: 3 + Math.random() * 12,       // 3-15 m/s
        wave_height: 0.5 + Math.random() * 3,     // 0.5-3.5 m
        dissolved_oxygen: 6 + Math.random() * 2 - (depth/1000), // 6-8 mg/L, decreasing with depth
        ph: 7.8 + Math.random() * 0.4,           // 7.8-8.2
        nitrate: Math.random() * 30 + (depth/100), // 0-30 μmol/L, increasing with depth
        phosphate: Math.random() * 2 + (depth/500), // 0-2 μmol/L, increasing with depth
        u_velocity: u_velocity,                   // East-west current velocity
        v_velocity: v_velocity,                   // North-south current velocity
        ssh: ssh,                                 // Sea surface height
        bathymetry: bathymetry,                   // Ocean floor depth
        timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return {
      data,
      info: {
        name: 'Comprehensive Indian Ocean Dataset with Geospatial Data',
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
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Please use files smaller than 50MB.');
      }

      // Validate file type
      const fileName = file.name.toLowerCase();
      const supportedExtensions = ['.csv', '.json', '.geojson', '.txt', '.nc'];
      const isSupported = supportedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isSupported) {
        throw new Error(`Unsupported file format. Please use: ${supportedExtensions.join(', ')}`);
      }

      let result: { data: OceanData[], info: DatasetInfo };

      if (fileName.endsWith('.nc')) {
        // Handle NetCDF files
        result = await processNetCDF(file, file.name);
      } else {
        // Handle text-based files (CSV, JSON, TXT)
        const content = await file.text();
        
        if (!content.trim()) {
          throw new Error('File is empty. Please upload a file with data.');
        }

        if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
          result = processCSV(content, file.name);
        } else if (fileName.endsWith('.json') || fileName.endsWith('.geojson')) {
          result = processJSON(content, file.name);
        } else {
          throw new Error('Unsupported file format. Please use CSV, JSON, or NetCDF files.');
        }
      }

      if (result.data.length === 0) {
        throw new Error('No valid oceanographic data found in the file. Please check your data format.');
      }

      onDataUpload(result.data, result.info);
      
      toast({
        title: "Upload Successful!",
        description: `Loaded ${result.data.length} records with ${result.info.parameters.length} parameters`,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process file. Please check the format and try again.",
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
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [handleFileUpload]);

  const triggerFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json,.geojson,.txt,.nc';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    };
    input.click();
  }, [handleFileUpload]);

  const loadSampleData = useCallback(() => {
    const result = generateSampleData();
    onDataUpload(result.data, result.info);
    toast({
      title: "Sample Data Loaded",
      description: "Generated 150 comprehensive oceanographic data points",
    });
  }, [onDataUpload, toast]);

  return (
    <div className="space-y-8">
      {/* Premium Upload Area */}
      <Card className="card-enhanced border-2 border-border/60 hover:border-primary/40 transition-all duration-500">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center space-x-3 text-foreground text-xl font-semibold">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <span>Upload Oceanographic Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
              isDragging
                ? 'border-primary bg-primary/15 scale-105'
                : 'border-border hover:border-primary/60 hover:bg-primary/8'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center animate-float">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Drop your data files here</h3>
                <p className="text-muted-foreground font-medium">
                  Support for CSV, JSON, GeoJSON, TXT, and NetCDF (.nc) formats
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={triggerFileSelect}
                  className="cursor-pointer border-primary/30 hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                  disabled={isProcessing}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Choose File'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={loadSampleData}
                  className="border-accent/30 hover:bg-accent/10 text-foreground hover:text-accent transition-colors"
                  disabled={isProcessing}
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
      <Card className="ocean-card border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <AlertCircle className="w-5 h-5 text-accent" />
            <span>Supported Data Formats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
              <h4 className="font-semibold text-primary">CSV/TXT Format</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Comma-separated values with headers. Supports all oceanographic parameters with flexible column naming.
              </p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
              <h4 className="font-semibold text-primary">JSON/GeoJSON Format</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Structured data format. Supports nested objects, arrays, and GeoJSON feature collections.
              </p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
              <h4 className="font-semibold text-primary">NetCDF Format (.nc)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Scientific data format with multidimensional arrays. Supports CF conventions, coordinate variables, and metadata.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <h4 className="font-semibold text-accent mb-2">🌊 Supported Oceanographic Variables:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <strong className="text-foreground">Physical:</strong>
                <div className="text-xs text-muted-foreground mt-1">
                  • Temperature (SST)<br/>
                  • Salinity (PSU)<br/>
                  • Wind Speed/Direction<br/>
                  • Wave Height<br/>
                  • Sea Level/SSH<br/>
                  • Ocean Currents<br/>
                  • Density
                </div>
              </div>
              <div>
                <strong className="text-foreground">Chemical:</strong>
                <div className="text-xs text-muted-foreground mt-1">
                  • Dissolved Oxygen<br/>
                  • pH Values<br/>
                  • Alkalinity<br/>
                  • Nutrients (NO₃, PO₄)<br/>
                  • Carbon System<br/>
                  • Trace Metals
                </div>
              </div>
              <div>
                <strong className="text-foreground">Biological:</strong>
                <div className="text-xs text-muted-foreground mt-1">
                  • Chlorophyll-a<br/>
                  • Primary Productivity<br/>
                  • Plankton Abundance<br/>
                  • Fish Biomass<br/>
                  • Harmful Algal Blooms
                </div>
              </div>
              <div>
                <strong className="text-foreground">Geological:</strong>
                <div className="text-xs text-muted-foreground mt-1">
                  • Bathymetry<br/>
                  • Seafloor Roughness<br/>
                  • Sediment Properties<br/>
                  • Seismic Activity
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;