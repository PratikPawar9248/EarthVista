import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, BarChart3, Map, TrendingUp, Activity, Download, FileText } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

// Import components
import DataUpload from './DataUpload';
import VisualizationPanel from './VisualizationPanel';
import StatisticsPanel from './StatisticsPanel';
import LocationProfile from './LocationProfile';

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

function AdvancePlotContainer() {
  const [oceanData, setOceanData] = useState<OceanData[]>([]);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<OceanData | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const { toast } = useToast();

  const handleDataUpload = useCallback((data: OceanData[], info: DatasetInfo) => {
    setOceanData(data);
    setDatasetInfo(info);
    setActiveTab('visualize');
    toast({
      title: "Data Uploaded Successfully",
      description: `Loaded ${data.length} records from ${info.name}`,
    });
  }, [toast]);

  const handleLocationSelect = useCallback((location: OceanData) => {
    setSelectedLocation(location);
  }, []);

  const exportData = useCallback((format: 'csv' | 'json' | 'png') => {
    if (!oceanData.length) {
      toast({
        title: "No Data to Export",
        description: "Please upload data first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (format === 'csv') {
      const headers = Object.keys(oceanData[0]).join(',');
      const rows = oceanData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oceanography_data_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const json = JSON.stringify(oceanData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oceanography_data_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Export Successful",
      description: `Data exported as ${format.toUpperCase()}`,
      duration: 3000,
    });
  }, [oceanData, toast]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">EarthVista Intelligence</h1>
                <p className="text-sm text-muted-foreground">Advanced Satellite Data Analysis Panel</p>
              </div>
            </div>

            {datasetInfo && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('csv')}
                  className="border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('json')}
                  className="border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  JSON
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-secondary/50 p-1">
                <TabsTrigger value="upload" className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="visualize" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Visualize</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center space-x-2">
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Statistics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DataUpload onDataUpload={handleDataUpload} />
              </TabsContent>

              <TabsContent value="visualize" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <VisualizationPanel
                  data={oceanData}
                  onLocationSelect={handleLocationSelect}
                />
              </TabsContent>

              <TabsContent value="map" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <VisualizationPanel
                  data={oceanData}
                  onLocationSelect={handleLocationSelect}
                  defaultView="map"
                />
              </TabsContent>

              <TabsContent value="statistics" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StatisticsPanel data={oceanData} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dataset Info */}
            {datasetInfo && (
              <Card className="ocean-card border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Dataset Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                    <p className="font-semibold truncate">{datasetInfo.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Format</p>
                      <p className="font-semibold">{datasetInfo.format}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Records</p>
                      <p className="font-semibold">{datasetInfo.recordCount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Variables Identified</p>
                    <div className="flex flex-wrap gap-2">
                      {datasetInfo.parameters.map((param, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20"
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Profile */}
            {selectedLocation && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <LocationProfile location={selectedLocation} />
              </div>
            )}

            {/* Quick Stats */}
            {oceanData.length > 0 && (
              <Card className="ocean-card border-accent/20 bg-card/50 backdrop-blur-sm hover:border-accent/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span>AI Statistics Quick-View</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="stat-card group">
                    <div className="stat-value group-hover:scale-105 transition-transform">{oceanData.length}</div>
                    <div className="stat-label">Total Sensor Points</div>
                  </div>
                  {oceanData.some(d => d.temperature) && (
                    <div className="stat-card group">
                      <div className="stat-value text-primary group-hover:scale-105 transition-transform">
                        {(oceanData.filter(d => d.temperature).reduce((sum, d) => sum + (d.temperature || 0), 0) /
                          oceanData.filter(d => d.temperature).length).toFixed(1)}°C
                      </div>
                      <div className="stat-label">Avg Sea Surface Temp</div>
                    </div>
                  )}
                  {oceanData.some(d => d.salinity) && (
                    <div className="stat-card group">
                      <div className="stat-value text-accent group-hover:scale-105 transition-transform">
                        {(oceanData.filter(d => d.salinity).reduce((sum, d) => sum + (d.salinity || 0), 0) /
                          oceanData.filter(d => d.salinity).length).toFixed(2)}
                      </div>
                      <div className="stat-label">Mean Salinity (PSU)</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
}

export default AdvancePlotContainer;