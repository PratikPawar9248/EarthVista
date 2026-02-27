import { useState, useMemo, useCallback, useEffect } from 'react';
import { Download, Info, Grid3x3, BarChart3, LineChart, Sparkles, Database, Globe, Box, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDataset } from '@/contexts/DatasetContext';
import HeatmapViewer from '@/components/HeatmapViewer';
import FileUpload from '@/components/FileUpload';
import ControlPanelDropdown from '@/components/ControlPanelDropdown';
import ColorLegend from '@/components/ColorLegend';
import CoordinateDisplay from '@/components/CoordinateDisplay';
import StatisticsPanel from '@/components/StatisticsPanel';
import ExportMenu from '@/components/ExportMenu';
import MeasurementTools, { type MeasurementMode } from '@/components/MeasurementTools';
import AIInsights from '@/components/ai/AIInsights';
import AIFloatingButton from '@/components/ai/AIFloatingButton';
import ParameterSelector from '@/components/ParameterSelector';
import type { Dataset, HeatmapConfig, DataPoint } from '@/types/heatmap';
import {
  optimizeDataset,
  DEFAULT_OPTIMIZATION_CONFIG,
  type OptimizationConfig,
  getPerformanceRecommendation,
  estimateMemoryUsage,
} from '@/utils/dataOptimization';
import { switchDatasetField } from '@/utils/fieldSwitcher';

export default function Dashboard() {
  const { dataset, setDataset: setGlobalDataset } = useDataset();
  const navigate = useNavigate();
  const [localDataset, setLocalDataset] = useState<Dataset | null>(dataset);
  const [radius, setRadius] = useState(30);
  const [opacity, setOpacity] = useState(1.0);
  const [intensity, setIntensity] = useState(3.5);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null
  });
  const [showGrid, setShowGrid] = useState(false);
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(null);
  const [currentMeasurement, setCurrentMeasurement] = useState<{ distance?: number; area?: number } | null>(null);
  const [optimizationConfig, setOptimizationConfig] = useState<OptimizationConfig>(DEFAULT_OPTIMIZATION_CONFIG);
  const [optimizedDataSize, setOptimizedDataSize] = useState<number | undefined>(undefined);

  // Sync local dataset with global context
  useEffect(() => {
    if (localDataset) {
      setGlobalDataset(localDataset);
    }
  }, [localDataset, setGlobalDataset]);

  const heatmapConfig: HeatmapConfig = useMemo(() => {
    const config = {
      radius,
      blur: 15,
      maxOpacity: opacity,
      minOpacity: 0.5,
      intensity,
      gradient: {
        0.0: 'rgb(0, 0, 255)',
        0.2: 'rgb(0, 255, 255)',
        0.4: 'rgb(0, 255, 0)',
        0.6: 'rgb(255, 255, 0)',
        0.8: 'rgb(255, 165, 0)',
        1.0: 'rgb(255, 0, 0)'
      }
    };
    console.log('Heatmap config updated:', config);
    return config;
  }, [radius, opacity, intensity]);

  const normalizedData: DataPoint[] = useMemo(() => {
    if (!localDataset) return [];

    const { min, max } = localDataset.valueRange;
    const range = max - min;

    console.log('Normalizing data with intensity:', intensity);

    // Normalize values
    let normalized = localDataset.points.map(point => ({
      ...point,
      value: range > 0 ? ((point.value - min) / range) * intensity : 0.5
    }));

    // Apply optimization for large datasets
    if (normalized.length > optimizationConfig.maxPoints) {
      const { optimized, stats } = optimizeDataset(normalized, optimizationConfig);
      setOptimizedDataSize(optimized.length);

      console.log('Dataset optimized:', {
        original: normalized.length,
        optimized: optimized.length,
        reduction: stats.reductionPercent.toFixed(1) + '%',
        method: stats.method,
        time: stats.processingTime.toFixed(2) + 'ms'
      });

      return optimized;
    }

    setOptimizedDataSize(undefined);
    return normalized;
  }, [localDataset, intensity, optimizationConfig]);

  const handleDataLoaded = (newDataset: Dataset) => {
    console.log('Dataset loaded:', newDataset);
    console.log('Number of points:', newDataset.points.length);
    console.log('Value range:', newDataset.valueRange);

    setLocalDataset(newDataset);
    setUploadDialogOpen(false);

    // Show performance recommendation
    const recommendation = getPerformanceRecommendation(newDataset.points.length);
    const memory = estimateMemoryUsage(newDataset.points.length);

    if (recommendation.shouldOptimize) {
      toast.warning(
        `Large dataset loaded: ${newDataset.points.length.toLocaleString()} points (${memory.readable})`,
        {
          description: recommendation.message,
          duration: 5000,
        }
      );
    } else {
      toast.success(
        `Loaded ${newDataset.points.length.toLocaleString()} data points from ${newDataset.name}`,
        {
          description: `Memory usage: ${memory.readable}`,
        }
      );
    }
  };

  const handleCoordinateChange = useCallback((lat: number, lon: number) => {
    setCoordinates({ lat, lon });
  }, []);

  const handleMeasurementModeChange = useCallback((mode: MeasurementMode) => {
    setMeasurementMode(mode);
    if (!mode) {
      setCurrentMeasurement(null);
    }
  }, []);

  const handleMeasurementComplete = useCallback((measurement: { distance?: number; area?: number }) => {
    setCurrentMeasurement(measurement);
  }, []);

  const handleMeasurementClear = useCallback(() => {
    setCurrentMeasurement(null);
    setMeasurementMode(null);
    // Call the global clear function
    if ((window as any).__clearMeasurements) {
      (window as any).__clearMeasurements();
    }
  }, []);

  const handleFieldChange = useCallback(async (newField: string) => {
    if (!localDataset || localDataset.selectedField === newField) return;

    try {
      toast.loading(`Switching to ${newField}...`);
      const updatedDataset = await switchDatasetField(localDataset, newField);
      setLocalDataset(updatedDataset);
      toast.success(`Now displaying: ${newField}`);
    } catch (error) {
      console.error('Error switching field:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to switch parameter'
      );
    }
  }, [localDataset]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      <header className="relative bg-card/95 backdrop-blur-sm border-b-2 border-primary/30 px-6 py-4 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-4 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-glow"></div>
            <img
              src="/images/EarthLogo_3.png"
              alt="ISRO Logo"
              className="h-14 w-auto object-contain relative z-10 hover-scale"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              EarthVista Intelligence
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Advanced Satellite Data Visualization Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 animate-slide-in-right">
          {localDataset && (
            <>
              <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-lg glass-morphism text-xs border-2 border-primary/20 hover-scale">
                <Info className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-medium text-primary">{localDataset.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{localDataset.points.length.toLocaleString()} pts</span>
              </div>

              {/* Statistics Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hover-scale hover-glow border-2">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Statistics
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[400px] p-0 glass-morphism border-2 border-primary/20">
                  <StatisticsPanel dataset={localDataset} />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* AI Insights */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gradient-primary text-white hover-scale border-0">
                    <Sparkles className="w-4 h-4 mr-2 animate-float" />
                    AI Insights
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[450px] p-0 glass-morphism border-2 border-primary/20">
                  <AIInsights />
                </DropdownMenuContent>
              </DropdownMenu>

              <ControlPanelDropdown
                radius={radius}
                onRadiusChange={setRadius}
              />

              {/* Data Management Button */}
              <Button variant="outline" size="sm" onClick={() => navigate('/data')} className="hover-scale hover-glow border-2">
                <Database className="w-4 h-4 mr-2" />
                Data Management
              </Button>

              {/* Advanced Plots Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://new-advance-plot1.vercel.app/', '_blank')}
                className="hover-scale hover-glow border-2"
              >
                <LineChart className="w-4 h-4 mr-2" />
                Advanced Plots
              </Button>

              {/* Live Earth Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://www.mosdac.gov.in/live/index_one.php?url_name=india', '_blank')}
                className="hover-scale hover-glow border-2 border-primary/50 bg-primary/10 hover:bg-primary/20"
              >
                <Globe className="w-4 h-4 mr-2" />
                Live Earth
              </Button>

              {/* Smart Dashboard Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://isro-smart-dashboard.lovable.app', '_blank')}
                className="hover-scale hover-glow border-2 border-secondary/50 bg-secondary/10 hover:bg-secondary/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Smart Dashboard
              </Button>
            </>
          )}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-secondary hover-scale border-0">
                <Download className="w-4 h-4 mr-2" />
                Upload Dataset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg glass-morphism border-2 border-primary/20 animate-bounce-in">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Upload Dataset
                </DialogTitle>
                <DialogDescription>
                  Upload a CSV, JSON, or NetCDF file containing geospatial data with latitude, longitude, and value fields.
                </DialogDescription>
              </DialogHeader>
              <FileUpload onDataLoaded={handleDataLoaded} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {localDataset ? (
          <>
            <div className="absolute inset-0" id="map-container">
              <HeatmapViewer
                data={normalizedData}
                config={heatmapConfig}
                showGrid={showGrid}
                measurementMode={measurementMode}
                onCoordinateChange={handleCoordinateChange}
                onMeasurementComplete={handleMeasurementComplete}
                onMeasurementClear={handleMeasurementClear}
              />
            </div>

            {/* Top-left: Compact Value Range Legend and Parameter Selector */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none max-w-[320px]">
              <div className="pointer-events-auto space-y-2">
                <ColorLegend dataset={localDataset} compact />

                {/* Parameter Selector - show only if multiple fields available */}
                {localDataset.fields && localDataset.fields.length > 1 && (
                  <ParameterSelector
                    fields={localDataset.fields}
                    selectedField={localDataset.selectedField || localDataset.fields[0]}
                    onFieldChange={handleFieldChange}
                    compact
                  />
                )}
              </div>
            </div>

            {/* Top-right: Compact Measurement Tools and Grid Toggle */}
            <div className="absolute top-4 right-4 z-[1000] pointer-events-none max-w-[240px]">
              <div className="pointer-events-auto space-y-2">
                {/* Compact Measurement Tools */}
                <MeasurementTools
                  mode={measurementMode}
                  onModeChange={handleMeasurementModeChange}
                  onClear={handleMeasurementClear}
                  currentMeasurement={currentMeasurement}
                  compact
                />

                {/* Compact Grid Toggle and Export */}
                <div className="control-panel-glass rounded-lg p-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="grid-toggle" className="text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap">
                      <Grid3x3 className="w-3 h-3" />
                      Grid
                    </Label>
                    <Switch
                      id="grid-toggle"
                      checked={showGrid}
                      onCheckedChange={setShowGrid}
                    />
                  </div>

                  <ExportMenu dataset={localDataset} mapContainerId="map-container" compact />
                </div>
              </div>
            </div>

            {/* Bottom-right: Compact Coordinates */}
            <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none">
              <div className="pointer-events-auto">
                <CoordinateDisplay lat={coordinates.lat} lon={coordinates.lon} compact />
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center space-background relative overflow-hidden">
            {/* Nebula effect layer */}
            <div className="nebula-effect"></div>

            <div className="max-w-2xl w-full px-6 relative z-10">
              <div className="text-center mb-8 animate-fade-in-up">
                <div className="inline-block mb-6">
                  <div className="relative">
                    <img
                      src="/images/EarthLogo_3.png"
                      alt="EarthVista Logo"
                      className="h-32 w-auto object-contain relative z-10 hover-scale animate-float"
                    />
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Welcome to EarthVista Intelligence
                </h2>
                <p className="text-lg text-white/90 font-medium drop-shadow-lg">
                  Upload your Satellite Data to get started with AI-powered analysis
                </p>
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: '0.3s' }}>
                <FileUpload onDataLoaded={handleDataLoaded} />
              </div>

              {/* Live Earth Button on Welcome Screen */}
              <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open('https://www.mosdac.gov.in/live/index_one.php?url_name=india', '_blank')}
                    className="hover-scale hover-glow border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    View Live Earth
                  </Button>

                  {/* JNEXA AI Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open('https://veda-wise-mind.lovable.app/', '_blank')}
                    className="hover-scale hover-glow border-2 border-secondary/50 bg-secondary/10 hover:bg-secondary/20 backdrop-blur-sm"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    JNEXA AI
                  </Button>

                  {/* 2D/3D Plots Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open('https://ocean-explorer-pro.lovable.app/', '_blank')}
                    className="hover-scale hover-glow border-2 border-accent/50 bg-accent/10 hover:bg-accent/20 backdrop-blur-sm"
                  >
                    <Box className="w-5 h-5 mr-2" />
                    2D/3D Plots
                  </Button>

                  {/* OCEANLAB Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open('https://sea-plotter-pro.lovable.app/', '_blank')}
                    className="hover-scale hover-glow border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm"
                  >
                    <Beaker className="w-5 h-5 mr-2" />
                    OCEANLAB
                  </Button>
                </div>
                <p className="text-sm text-white/70 mt-2 drop-shadow">
                  Explore real-time satellite imagery from MOSDAC or chat with JNEXA AI
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Floating Action Button */}
      <AIFloatingButton />
    </div>
  );
}
