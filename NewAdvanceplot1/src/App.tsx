import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, BarChart3, Map, TrendingUp, Activity, Download, FileText, LayoutDashboard, Brain } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

// Import components
import DataUpload from '@/components/DataUpload';
import EnhancedVisualizationPanel from '@/components/EnhancedVisualizationPanel';
import StatisticsPanel from '@/components/StatisticsPanel';
import LocationProfile from '@/components/LocationProfile';
import OceanographyDashboard from '@/components/OceanographyDashboard';
import ProfessionalOceanographyDashboard from '@/components/ProfessionalOceanographyDashboard';
import ComprehensiveMapping from '@/components/ComprehensiveMapping';
import WorkingMapping from '@/components/WorkingMapping';
import GeospatialMapVisualization from '@/components/GeospatialMapVisualization';
// AI analysis component removed
// import AIAnalysis from '@/components/AIAnalysis';
// import ProfessionalAIAnalysis from '@/components/ProfessionalAIAnalysis';
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

function App() {
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
    });
  }, [oceanData, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="border-b border-border/70 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-xl shadow-2xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-transparent rounded-xl flex items-center justify-center p-2">
                <img 
                  src="\images\EarthLogo_3.png" 
                  alt="ISRO Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  EarthVista Intelligence
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Advanced Satellite  Data Visualization Tool</p>
              </div>
            </div>
            
            {datasetInfo && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('csv')}
                  className="btn-enhanced border-primary/40 hover:bg-primary/15 text-foreground hover:text-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('json')}
                  className="btn-enhanced border-accent/40 hover:bg-accent/15 text-foreground hover:text-accent"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-secondary/70 backdrop-blur-md border border-border/50 rounded-xl p-1">
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300 rounded-lg font-medium"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Data</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300 rounded-lg font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="visualize" 
                  className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300 rounded-lg font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Visualize</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="statistics" 
                  className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300 rounded-lg font-medium"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <DataUpload onDataUpload={handleDataUpload} />
              </TabsContent>

              <TabsContent value="dashboard" className="mt-6">
                <ProfessionalOceanographyDashboard 
                  data={oceanData} 
                  onLocationSelect={handleLocationSelect}
                />
              </TabsContent>

              <TabsContent value="visualize" className="mt-6">
                <EnhancedVisualizationPanel 
                  data={oceanData} 
                  onLocationSelect={handleLocationSelect}
                />
              </TabsContent>

              <TabsContent value="statistics" className="mt-6">
                <StatisticsPanel data={oceanData} />
              </TabsContent>

            </Tabs>
            </div>
          </div>

          {/* Enhanced Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Premium Dataset Info */}
            {datasetInfo && (
              <Card className="card-enhanced">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground font-semibold flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
                    <span>Dataset Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Dataset Name</p>
                    <p className="font-semibold text-foreground mt-1">{datasetInfo.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Format</p>
                      <p className="font-semibold text-accent mt-1">{datasetInfo.format}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Records</p>
                      <p className="font-semibold text-primary mt-1">{datasetInfo.recordCount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Parameters</p>
                    <div className="flex flex-wrap gap-2">
                      {datasetInfo.parameters.map((param, index) => (
                        <span
                          key={index}
                          className="badge-enhanced"
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
              <LocationProfile location={selectedLocation} />
            )}

            {/* Enhanced Quick Stats */}
            {oceanData.length > 0 && (
              <Card className="card-enhanced">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground font-semibold flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow"></div>
                    <span>Quick Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="stat-value text-primary">{oceanData.length}</div>
                    <div className="stat-label">Total Data Points</div>
                  </div>
                  {oceanData.some(d => d.temperature) && (
                    <div className="stat-card bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                      <div className="stat-value text-red-400">
                        {(oceanData.filter(d => d.temperature).reduce((sum, d) => sum + (d.temperature || 0), 0) / 
                          oceanData.filter(d => d.temperature).length).toFixed(1)}°C
                      </div>
                      <div className="stat-label">Avg Temperature</div>
                    </div>
                  )}
                  {oceanData.some(d => d.salinity) && (
                    <div className="stat-card bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                      <div className="stat-value text-blue-400">
                        {(oceanData.filter(d => d.salinity).reduce((sum, d) => sum + (d.salinity || 0), 0) / 
                          oceanData.filter(d => d.salinity).length).toFixed(2)} PSU
                      </div>
                      <div className="stat-label">Avg Salinity</div>
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

export default App;