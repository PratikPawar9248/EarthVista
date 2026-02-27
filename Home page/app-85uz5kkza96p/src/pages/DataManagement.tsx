import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DatasetLibrary } from '@/components/features/DatasetLibrary';
import { StatisticsPanel } from '@/components/features/StatisticsPanel';
import { ExportControls } from '@/components/features/ExportControls';
import { ColorSchemeSelector } from '@/components/features/ColorSchemeSelector';
import { AdvancedFilters, FilterSettings } from '@/components/features/AdvancedFilters';
import { storageManager, SavedDataset, DatasetMetadata } from '@/utils/storage';
import {
  calculateStatistics,
  calculateSpatialStatistics,
  assessDataQuality,
  filterByValueRange,
  filterByBoundingBox,
} from '@/utils/statistics';
import { useDataset } from '@/contexts/DatasetContext';
import { Database, Save, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataPoint } from '@/types/heatmap';

export default function DataManagement() {
  const navigate = useNavigate();
  const { dataset } = useDataset();
  const [selectedColorScheme, setSelectedColorScheme] = useState('viridis');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<FilterSettings>({
    valueMin: 0,
    valueMax: 100,
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180,
  });

  const [bounds, setBounds] = useState<FilterSettings>({
    valueMin: 0,
    valueMax: 100,
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180,
  });

  useEffect(() => {
    if (dataset?.points && dataset.points.length > 0) {
      const values = dataset.points.map(p => p.value);
      const lats = dataset.points.map(p => p.lat);
      const lons = dataset.points.map(p => p.lon);

      const newBounds = {
        valueMin: Math.min(...values),
        valueMax: Math.max(...values),
        latMin: Math.min(...lats),
        latMax: Math.max(...lats),
        lonMin: Math.min(...lons),
        lonMax: Math.max(...lons),
      };

      setBounds(newBounds);
      setFilters(newBounds);
    }
  }, [dataset]);

  const filteredData = useMemo(() => {
    if (!dataset?.points) return [];

    let filtered = dataset.points;

    filtered = filterByValueRange(filtered, filters.valueMin, filters.valueMax);

    filtered = filterByBoundingBox(filtered, {
      minLat: filters.latMin,
      maxLat: filters.latMax,
      minLon: filters.lonMin,
      maxLon: filters.lonMax,
    });

    return filtered;
  }, [dataset, filters]);

  const statistics = useMemo(() => {
    if (filteredData.length === 0) return null;
    const values = filteredData.map(p => p.value);
    return calculateStatistics(values);
  }, [filteredData]);

  const spatialStats = useMemo(() => {
    if (filteredData.length === 0) return null;
    return calculateSpatialStatistics(filteredData);
  }, [filteredData]);

  const dataQuality = useMemo(() => {
    if (!dataset?.points || dataset.points.length === 0) return null;
    return assessDataQuality(dataset.points);
  }, [dataset]);

  const handleSaveDataset = async () => {
    if (!dataset?.points || dataset.points.length === 0) {
      toast.error('No data to save');
      return;
    }

    if (!datasetName.trim()) {
      toast.error('Please enter a dataset name');
      return;
    }

    try {
      setSaving(true);

      const metadata: DatasetMetadata = {
        id: `dataset_${Date.now()}`,
        name: datasetName.trim(),
        description: datasetDescription.trim(),
        uploadDate: new Date().toISOString(),
        fileType: 'json',
        fileSize: JSON.stringify(dataset.points).length,
        pointCount: dataset.points.length,
        bounds: {
          minLat: bounds.latMin,
          maxLat: bounds.latMax,
          minLon: bounds.lonMin,
          maxLon: bounds.lonMax,
          minValue: bounds.valueMin,
          maxValue: bounds.valueMax,
        },
      };

      const savedDataset: SavedDataset = {
        metadata,
        data: dataset.points,
      };

      await storageManager.saveDataset(savedDataset);

      toast.success('Dataset saved successfully');
      setSaveDialogOpen(false);
      setDatasetName('');
      setDatasetDescription('');
    } catch (error) {
      console.error('Failed to save dataset:', error);
      toast.error('Failed to save dataset');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadDataset = async (id: string) => {
    try {
      const savedDataset = await storageManager.getDataset(id);
      if (!savedDataset) {
        toast.error('Dataset not found');
        return;
      }

      toast.success(`Loaded dataset: ${savedDataset.metadata.name}`);
      navigate('/');
    } catch (error) {
      console.error('Failed to load dataset:', error);
      toast.error('Failed to load dataset');
    }
  };

  const handleResetFilters = () => {
    setFilters(bounds);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Database className="h-8 w-8" />
                Data Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage datasets, analyze statistics, and export data
              </p>
            </div>
          </div>

          {dataset?.points && dataset.points.length > 0 && (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Dataset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Dataset</DialogTitle>
                  <DialogDescription>
                    Save the current dataset to your library for later use
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataset-name">Dataset Name *</Label>
                    <Input
                      id="dataset-name"
                      placeholder="e.g., Ocean Temperature 2024"
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataset-description">Description</Label>
                    <Textarea
                      id="dataset-description"
                      placeholder="Optional description..."
                      value={datasetDescription}
                      onChange={(e) => setDatasetDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dataset.points.length.toLocaleString()} data points
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDataset} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <DatasetLibrary onLoadDataset={handleLoadDataset} />
              <ColorSchemeSelector
                selectedScheme={selectedColorScheme}
                onSchemeChange={setSelectedColorScheme}
              />
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <StatisticsPanel
                statistics={statistics}
                spatialStats={spatialStats}
                dataQuality={dataQuality}
              />
              {filteredData.length > 0 && (
                <div className="bg-card/95 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">Filtered Data Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Points:</span>
                      <span className="font-medium">{dataset?.points.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filtered Points:</span>
                      <span className="font-medium">{filteredData.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Percentage:</span>
                      <span className="font-medium">
                        {((filteredData.length / (dataset?.points.length || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="filters" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1">
                <AdvancedFilters
                  filters={filters}
                  bounds={bounds}
                  onFiltersChange={setFilters}
                  onReset={handleResetFilters}
                />
              </div>
              {filteredData.length > 0 && (
                <div className="xl:col-span-2 bg-card/95 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">Filter Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Total Points:</span>
                        <span className="font-medium">{dataset?.points.length.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Filtered Points:</span>
                        <span className="font-medium">{filteredData.length.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Percentage:</span>
                        <span className="font-medium">
                          {((filteredData.length / (dataset?.points.length || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Value Range:</span>
                        <span className="font-medium text-sm">
                          {filters.valueMin.toFixed(1)} - {filters.valueMax.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Lat Range:</span>
                        <span className="font-medium text-sm">
                          {filters.latMin.toFixed(1)}° - {filters.latMax.toFixed(1)}°
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Lon Range:</span>
                        <span className="font-medium text-sm">
                          {filters.lonMin.toFixed(1)}° - {filters.lonMax.toFixed(1)}°
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ExportControls
                data={filteredData}
                statistics={statistics}
                spatialStats={spatialStats}
                dataQuality={dataQuality}
                datasetName={datasetName || 'dataset'}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
