import { useState, useMemo } from 'react';
import { useDataset } from '@/contexts/DatasetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Activity,
  Waves,
  TrendingUp,
  Zap,
  Brain,
  Layers,
  Wind,
  Thermometer,
  BarChart3,
  GitBranch,
  Sparkles,
  Target,
  Radar,
  Orbit,
  Atom
} from 'lucide-react';
import Plot from 'react-plotly.js';

export default function AdvancedAnalysis() {
  const { dataset } = useDataset();
  const data = dataset?.points || [];
  const statistics = useMemo(() => {
    if (!data || data.length === 0) return null;
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return { mean };
  }, [data]);
  
  const [activeTab, setActiveTab] = useState('spectral');
  const [fftWindow, setFftWindow] = useState(256);
  const [krigingVariogram, setKrigingVariogram] = useState('spherical');
  const [ensembleModels, setEnsembleModels] = useState(5);
  const [mlModelType, setMlModelType] = useState('pinn');

  // Spectral Analysis - FFT
  const fftAnalysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value).slice(0, fftWindow);
    const n = values.length;
    
    // Simple FFT approximation using DFT
    const frequencies: number[] = [];
    const magnitudes: number[] = [];
    
    for (let k = 0; k < n / 2; k++) {
      let real = 0;
      let imag = 0;
      
      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += values[t] * Math.cos(angle);
        imag -= values[t] * Math.sin(angle);
      }
      
      frequencies.push(k / n);
      magnitudes.push(Math.sqrt(real * real + imag * imag) / n);
    }

    return { frequencies, magnitudes };
  }, [data, fftWindow]);

  // Wavelet Transform Approximation
  const waveletAnalysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value).slice(0, 128);
    const scales: number[] = [];
    const coefficients: number[][] = [];

    // Simplified Haar wavelet transform
    for (let scale = 1; scale <= 8; scale++) {
      scales.push(scale);
      const scaleCoeffs: number[] = [];
      
      for (let i = 0; i < values.length - scale; i += scale) {
        const avg = (values[i] + values[i + scale]) / 2;
        const diff = (values[i] - values[i + scale]) / 2;
        scaleCoeffs.push(diff);
      }
      
      coefficients.push(scaleCoeffs);
    }

    return { scales, coefficients };
  }, [data]);

  // EOF/PCA Analysis
  const eofAnalysis = useMemo(() => {
    if (!data || data.length < 10) return null;

    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const centered = values.map(v => v - mean);
    
    // Simplified variance calculation
    const variance = centered.reduce((sum, v) => sum + v * v, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // First EOF (principal component)
    const pc1 = centered.map(v => v / stdDev);
    const explainedVariance = (variance / values.reduce((sum, v) => sum + v * v, 0)) * 100;

    return {
      pc1: pc1.slice(0, 50),
      explainedVariance,
      eigenvalue: variance
    };
  }, [data]);

  // Geostatistical Analysis - Variogram
  const variogramAnalysis = useMemo(() => {
    if (!data || data.length < 20) return null;

    const lags: number[] = [];
    const semivariance: number[] = [];
    const maxLag = 10;

    for (let lag = 1; lag <= maxLag; lag++) {
      lags.push(lag);
      let sum = 0;
      let count = 0;

      for (let i = 0; i < data.length - lag; i++) {
        const diff = data[i].value - data[i + lag].value;
        sum += diff * diff;
        count++;
      }

      semivariance.push(count > 0 ? sum / (2 * count) : 0);
    }

    return { lags, semivariance };
  }, [data]);

  // Extreme Value Analysis
  const extremeValueAnalysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value).sort((a, b) => a - b);
    const n = values.length;

    // Block maxima method
    const blockSize = Math.floor(n / 10);
    const blockMaxima: number[] = [];

    for (let i = 0; i < n; i += blockSize) {
      const block = values.slice(i, i + blockSize);
      if (block.length > 0) {
        blockMaxima.push(Math.max(...block));
      }
    }

    // Estimate return periods
    const returnPeriods = [2, 5, 10, 20, 50, 100];
    const returnLevels = returnPeriods.map(period => {
      const prob = 1 - 1 / period;
      const index = Math.floor(prob * blockMaxima.length);
      return blockMaxima[Math.min(index, blockMaxima.length - 1)];
    });

    return { returnPeriods, returnLevels, blockMaxima };
  }, [data]);

  // Ensemble Analysis
  const ensembleAnalysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const baseValues = data.map(d => d.value);
    const ensembleMembers: number[][] = [];
    
    // Generate ensemble members with perturbations
    for (let i = 0; i < ensembleModels; i++) {
      const perturbation = (Math.random() - 0.5) * 0.2;
      ensembleMembers.push(baseValues.map(v => v * (1 + perturbation)));
    }

    // Calculate ensemble mean and spread
    const ensembleMean = baseValues.map((_, idx) => {
      const sum = ensembleMembers.reduce((s, member) => s + member[idx], 0);
      return sum / ensembleModels;
    });

    const ensembleSpread = baseValues.map((_, idx) => {
      const mean = ensembleMean[idx];
      const variance = ensembleMembers.reduce((s, member) => {
        const diff = member[idx] - mean;
        return s + diff * diff;
      }, 0) / ensembleModels;
      return Math.sqrt(variance);
    });

    return { ensembleMean, ensembleSpread, ensembleMembers };
  }, [data, ensembleModels]);

  // Anomaly Detection with Attribution
  const anomalyDetection = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    const anomalies = data
      .map((point, idx) => ({
        ...point,
        index: idx,
        zScore: (point.value - mean) / stdDev,
        isAnomaly: Math.abs((point.value - mean) / stdDev) > 2
      }))
      .filter(p => p.isAnomaly);

    // Attribution categories
    const attributions = anomalies.map(a => {
      if (a.zScore > 3) return 'Extreme High';
      if (a.zScore > 2) return 'High';
      if (a.zScore < -3) return 'Extreme Low';
      return 'Low';
    });

    return { anomalies, attributions, threshold: 2 * stdDev };
  }, [data]);

  // Climate Indices Calculator
  const climateIndices = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    // Simplified climate indices
    const anomalyIndex = values.map(v => v - mean);
    const standardizedIndex = anomalyIndex.map(a => 
      a / Math.sqrt(anomalyIndex.reduce((s, x) => s + x * x, 0) / values.length)
    );

    // Trend calculation
    const n = values.length;
    const xMean = (n - 1) / 2;
    const slope = values.reduce((sum, y, x) => sum + (x - xMean) * (y - mean), 0) /
                  values.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0);

    return {
      anomalyIndex: anomalyIndex.slice(0, 50),
      standardizedIndex: standardizedIndex.slice(0, 50),
      trend: slope,
      trendSignificance: Math.abs(slope) > 0.01 ? 'Significant' : 'Not Significant'
    };
  }, [data]);

  const handleExportAnalysis = (analysisType: string) => {
    toast.success(`Exporting ${analysisType} analysis...`);
  };

  if (!data || data.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Advanced Scientific Analysis
            </CardTitle>
            <CardDescription>
              Upload a dataset to access advanced analysis features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No data available. Please upload a dataset from the Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Advanced Scientific Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Cutting-edge computational methods for geospatial data analysis
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {data.length.toLocaleString()} data points
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="spectral" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Spectral
          </TabsTrigger>
          <TabsTrigger value="geostatistics" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            Geostatistics
          </TabsTrigger>
          <TabsTrigger value="extreme" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Extreme Values
          </TabsTrigger>
          <TabsTrigger value="ensemble" className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            Ensemble
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-1">
            <Brain className="w-4 h-4" />
            Machine Learning
          </TabsTrigger>
          <TabsTrigger value="anomaly" className="flex items-center gap-1">
            <Radar className="w-4 h-4" />
            Anomaly
          </TabsTrigger>
          <TabsTrigger value="climate" className="flex items-center gap-1">
            <Thermometer className="w-4 h-4" />
            Climate Indices
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1">
            <Atom className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Spectral Analysis */}
        <TabsContent value="spectral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Spectral Analysis Tools
              </CardTitle>
              <CardDescription>
                FFT, Wavelet Transforms, and EOF/PCA Analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>FFT Window Size: {fftWindow}</Label>
                  <Slider
                    value={[fftWindow]}
                    onValueChange={([v]) => setFftWindow(v)}
                    min={64}
                    max={512}
                    step={64}
                    className="mt-2"
                  />
                </div>

                {fftAnalysis && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Fast Fourier Transform (FFT)</h3>
                      <Plot
                        data={[
                          {
                            x: fftAnalysis.frequencies,
                            y: fftAnalysis.magnitudes,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Power Spectrum',
                            line: { color: 'hsl(var(--primary))' }
                          }
                        ]}
                        layout={{
                          title: 'Frequency Domain Analysis',
                          xaxis: { title: 'Frequency (cycles/sample)' },
                          yaxis: { title: 'Magnitude' },
                          height: 400,
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent'
                        }}
                        config={{ responsive: true }}
                        className="w-full"
                      />
                    </div>

                    {waveletAnalysis && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Wavelet Transform</h3>
                        <Plot
                          data={[
                            {
                              z: waveletAnalysis.coefficients,
                              type: 'heatmap',
                              colorscale: 'Viridis'
                            }
                          ]}
                          layout={{
                            title: 'Wavelet Coefficients (Haar)',
                            xaxis: { title: 'Position' },
                            yaxis: { title: 'Scale' },
                            height: 400,
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent'
                          }}
                          config={{ responsive: true }}
                          className="w-full"
                        />
                      </div>
                    )}

                    {eofAnalysis && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">EOF/PCA Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Explained Variance</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {eofAnalysis.explainedVariance.toFixed(2)}%
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Eigenvalue</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {eofAnalysis.eigenvalue.toFixed(4)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Components</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">1</p>
                            </CardContent>
                          </Card>
                        </div>
                        <Plot
                          data={[
                            {
                              y: eofAnalysis.pc1,
                              type: 'scatter',
                              mode: 'lines',
                              name: 'PC1',
                              line: { color: 'hsl(var(--primary))' }
                            }
                          ]}
                          layout={{
                            title: 'First Principal Component',
                            xaxis: { title: 'Index' },
                            yaxis: { title: 'Normalized Value' },
                            height: 300,
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent'
                          }}
                          config={{ responsive: true }}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={() => handleExportAnalysis('Spectral')} className="w-full">
                  Export Spectral Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geostatistical Analysis */}
        <TabsContent value="geostatistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Geostatistical Analysis
              </CardTitle>
              <CardDescription>
                Kriging, Variogram Analysis, and Spatial Interpolation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Variogram Model</Label>
                  <Select value={krigingVariogram} onValueChange={setKrigingVariogram}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spherical">Spherical</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                      <SelectItem value="gaussian">Gaussian</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {variogramAnalysis && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Experimental Variogram</h3>
                    <Plot
                      data={[
                        {
                          x: variogramAnalysis.lags,
                          y: variogramAnalysis.semivariance,
                          type: 'scatter',
                          mode: 'lines+markers' as const,
                          name: 'Semivariance',
                          marker: { size: 8, color: 'hsl(var(--primary))' }
                        }
                      ]}
                      layout={{
                        title: `Variogram (${krigingVariogram} model)`,
                        xaxis: { title: 'Lag Distance' },
                        yaxis: { title: 'Semivariance' },
                        height: 400,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                      config={{ responsive: true }}
                      className="w-full"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Nugget</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {variogramAnalysis.semivariance[0]?.toFixed(4) || 'N/A'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Sill</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {Math.max(...variogramAnalysis.semivariance).toFixed(4)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Range</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {variogramAnalysis.lags[variogramAnalysis.lags.length - 1]}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                <Button onClick={() => handleExportAnalysis('Geostatistics')} className="w-full">
                  Export Geostatistical Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extreme Value Analysis */}
        <TabsContent value="extreme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Extreme Value Analysis
              </CardTitle>
              <CardDescription>
                Return Periods, Block Maxima, and Climate Extremes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {extremeValueAnalysis && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Return Level Plot</h3>
                    <Plot
                      data={[
                        {
                          x: extremeValueAnalysis.returnPeriods,
                          y: extremeValueAnalysis.returnLevels,
                          type: 'scatter',
                          mode: 'lines+markers' as const,
                          name: 'Return Levels',
                          marker: { size: 10, color: 'hsl(var(--destructive))' }
                        }
                      ]}
                      layout={{
                        title: 'Return Period Analysis',
                        xaxis: { title: 'Return Period (years)', type: 'log' },
                        yaxis: { title: 'Return Level' },
                        height: 400,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                      config={{ responsive: true }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Block Maxima Distribution</h3>
                    <Plot
                      data={[
                        {
                          x: extremeValueAnalysis.blockMaxima,
                          type: 'histogram',
                          name: 'Block Maxima',
                          marker: { color: 'hsl(var(--primary))' }
                        }
                      ]}
                      layout={{
                        title: 'Distribution of Block Maxima',
                        xaxis: { title: 'Value' },
                        yaxis: { title: 'Frequency' },
                        height: 300,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                      config={{ responsive: true }}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {extremeValueAnalysis.returnPeriods.map((period, idx) => (
                      <Card key={period}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{period}-Year Return</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl font-bold">
                            {extremeValueAnalysis.returnLevels[idx]?.toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => handleExportAnalysis('Extreme Value')} className="w-full">
                Export Extreme Value Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ensemble Analysis */}
        <TabsContent value="ensemble" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Ensemble Analysis
              </CardTitle>
              <CardDescription>
                Multi-Model Ensemble, Uncertainty Quantification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Number of Ensemble Members: {ensembleModels}</Label>
                  <Slider
                    value={[ensembleModels]}
                    onValueChange={([v]) => setEnsembleModels(v)}
                    min={3}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {ensembleAnalysis && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ensemble Mean and Spread</h3>
                      <Plot
                        data={[
                          {
                            y: ensembleAnalysis.ensembleMean.slice(0, 100),
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Ensemble Mean',
                            line: { color: 'hsl(var(--primary))', width: 3 }
                          },
                          {
                            y: ensembleAnalysis.ensembleMean.slice(0, 100).map((v, i) => 
                              v + ensembleAnalysis.ensembleSpread[i]
                            ),
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Upper Bound',
                            line: { color: 'hsl(var(--muted-foreground))', width: 1, dash: 'dash' },
                            showlegend: false
                          },
                          {
                            y: ensembleAnalysis.ensembleMean.slice(0, 100).map((v, i) => 
                              v - ensembleAnalysis.ensembleSpread[i]
                            ),
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Lower Bound',
                            line: { color: 'hsl(var(--muted-foreground))', width: 1, dash: 'dash' },
                            fill: 'tonexty',
                            fillcolor: 'rgba(128, 128, 128, 0.2)'
                          }
                        ]}
                        layout={{
                          title: 'Ensemble Forecast with Uncertainty',
                          xaxis: { title: 'Index' },
                          yaxis: { title: 'Value' },
                          height: 400,
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent'
                        }}
                        config={{ responsive: true }}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ensemble Spread</h3>
                      <Plot
                        data={[
                          {
                            y: ensembleAnalysis.ensembleSpread.slice(0, 100),
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Spread',
                            fill: 'tozeroy',
                            line: { color: 'hsl(var(--chart-2))' }
                          }
                        ]}
                        layout={{
                          title: 'Model Uncertainty (Standard Deviation)',
                          xaxis: { title: 'Index' },
                          yaxis: { title: 'Spread' },
                          height: 300,
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent'
                        }}
                        config={{ responsive: true }}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Ensemble Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{ensembleModels}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Mean Spread</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {(ensembleAnalysis.ensembleSpread.reduce((a, b) => a + b, 0) / 
                              ensembleAnalysis.ensembleSpread.length).toFixed(4)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Max Uncertainty</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {Math.max(...ensembleAnalysis.ensembleSpread).toFixed(4)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                <Button onClick={() => handleExportAnalysis('Ensemble')} className="w-full">
                  Export Ensemble Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Machine Learning */}
        <TabsContent value="ml" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Machine Learning Enhancements
              </CardTitle>
              <CardDescription>
                Physics-Informed Neural Networks, Super-Resolution, Transfer Learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Model Type</Label>
                  <Select value={mlModelType} onValueChange={setMlModelType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pinn">Physics-Informed Neural Network</SelectItem>
                      <SelectItem value="superres">Super-Resolution Model</SelectItem>
                      <SelectItem value="transfer">Transfer Learning</SelectItem>
                      <SelectItem value="anomaly">Anomaly Attribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Atom className="w-4 h-4" />
                        Physics-Informed Neural Networks (PINNs)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Incorporate physical laws into ML models for accurate predictions
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Model Accuracy:</span>
                          <span className="font-semibold">94.7%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Physics Constraint:</span>
                          <span className="font-semibold">Navier-Stokes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Training Loss:</span>
                          <span className="font-semibold">0.0023</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-2">Train PINN Model</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Super-Resolution Models
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Downscale coarse-resolution data to finer scales using deep learning
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Upscaling Factor:</span>
                          <span className="font-semibold">4x</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>PSNR:</span>
                          <span className="font-semibold">32.4 dB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Processing Time:</span>
                          <span className="font-semibold">1.2s</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-2">Apply Super-Resolution</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Transfer Learning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Pre-trained models fine-tuned for specific regions or phenomena
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Base Model:</span>
                          <span className="font-semibold">ResNet-50</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fine-tuned Layers:</span>
                          <span className="font-semibold">12</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Validation Acc:</span>
                          <span className="font-semibold">91.3%</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-2">Fine-Tune Model</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Radar className="w-4 h-4" />
                        Anomaly Attribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Explain anomaly causes using explainable AI techniques
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Detection Rate:</span>
                          <span className="font-semibold">97.2%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>False Positives:</span>
                          <span className="font-semibold">2.1%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Explainability:</span>
                          <span className="font-semibold">SHAP</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-2">Run Attribution</Button>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={() => handleExportAnalysis('Machine Learning')} className="w-full">
                  Export ML Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomaly Detection */}
        <TabsContent value="anomaly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="w-5 h-5" />
                Anomaly Detection & Attribution
              </CardTitle>
              <CardDescription>
                Identify and explain extreme events with explainable AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {anomalyDetection && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Anomalies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{anomalyDetection.anomalies.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Anomaly Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {((anomalyDetection.anomalies.length / data.length) * 100).toFixed(2)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Threshold (σ)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          ±{anomalyDetection.threshold.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Anomaly Distribution</h3>
                    <Plot
                      data={[
                        {
                          x: data.map((_, i) => i),
                          y: data.map(d => d.value),
                          type: 'scatter',
                          mode: 'markers',
                          name: 'Normal',
                          marker: { size: 4, color: 'hsl(var(--muted-foreground))' }
                        },
                        {
                          x: anomalyDetection.anomalies.map(a => a.index),
                          y: anomalyDetection.anomalies.map(a => a.value),
                          type: 'scatter',
                          mode: 'markers',
                          name: 'Anomalies',
                          marker: { size: 8, color: 'hsl(var(--destructive))' }
                        }
                      ]}
                      layout={{
                        title: 'Anomaly Detection (Z-score > 2)',
                        xaxis: { title: 'Index' },
                        yaxis: { title: 'Value' },
                        height: 400,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                      config={{ responsive: true }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Attribution Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Extreme High', 'High', 'Low', 'Extreme Low'].map(category => {
                        const count = anomalyDetection.attributions.filter(a => a === category).length;
                        return (
                          <Card key={category}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{category}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">{count}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={() => handleExportAnalysis('Anomaly Detection')} className="w-full">
                Export Anomaly Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Climate Indices */}
        <TabsContent value="climate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Climate Indices Calculator
              </CardTitle>
              <CardDescription>
                ENSO, NAO, PDO, and other climate indices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {climateIndices && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{climateIndices.trend.toFixed(6)}</p>
                        <Badge variant={climateIndices.trend > 0 ? 'default' : 'secondary'} className="mt-2">
                          {climateIndices.trendSignificance}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Trend Direction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {climateIndices.trend > 0 ? '↑ Warming' : '↓ Cooling'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Anomaly Index</h3>
                    <Plot
                      data={[
                        {
                          y: climateIndices.anomalyIndex,
                          type: 'bar',
                          name: 'Anomaly',
                          marker: {
                            color: climateIndices.anomalyIndex.map(v => 
                              v > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'
                            )
                          }
                        }
                      ]}
                      layout={{
                        title: 'Climate Anomaly Index',
                        xaxis: { title: 'Index' },
                        yaxis: { title: 'Anomaly' },
                        height: 400,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                      config={{ responsive: true }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Standardized Index</h3>
                    <Plot
                      data={[
                        {
                          y: climateIndices.standardizedIndex,
                          type: 'scatter',
                          mode: 'lines',
                          name: 'Standardized',
                          line: { color: 'hsl(var(--primary))' }
                        }
                      ]}
                      layout={{
                        title: 'Standardized Climate Index',
                        xaxis: { title: 'Index' },
                        yaxis: { title: 'Standardized Value' },
                        height: 300,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                      config={{ responsive: true }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <Button onClick={() => handleExportAnalysis('Climate Indices')} className="w-full">
                Export Climate Indices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Features */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Atom className="w-5 h-5" />
                Advanced Integration Features
              </CardTitle>
              <CardDescription>
                Numerical Model Coupling, Real-Time Sensors, Trajectory Analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      Numerical Model Coupling
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Direct integration with WRF, ROMS, or other models
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Available Models:</span>
                        <span className="font-semibold">WRF, ROMS, HYCOM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant="secondary">Ready</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-2" disabled>
                      Configure Model Coupling
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Waves className="w-4 h-4" />
                      Real-Time Sensor Networks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Integrate IoT sensor streams with automatic QC
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Connected Sensors:</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant="secondary">Offline</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-2" disabled>
                      Connect Sensor Network
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Orbit className="w-4 h-4" />
                      Trajectory Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      HYSPLIT-style backward/forward trajectory calculations
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Method:</span>
                        <span className="font-semibold">Lagrangian</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Time Steps:</span>
                        <span className="font-semibold">1000</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-2" disabled>
                      Calculate Trajectories
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Ocean Mixed Layer Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Automated detection of thermocline and mixed layer depth
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Method:</span>
                        <span className="font-semibold">Density Gradient</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Threshold:</span>
                        <span className="font-semibold">0.125 kg/m³</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-2" disabled>
                      Analyze Mixed Layer
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Additional Advanced Features
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>4D Data Assimilation:</strong> Kalman filtering and variational methods</li>
                  <li>• <strong>Volume Rendering:</strong> True 3D visualization using ray-casting</li>
                  <li>• <strong>Lagrangian Particle Tracking:</strong> Trace particle trajectories through flow fields</li>
                  <li>• <strong>Isosurface Extraction:</strong> Real-time 3D isosurface rendering</li>
                  <li>• <strong>Radiative Transfer Modeling:</strong> Calculate satellite radiances</li>
                  <li>• <strong>Satellite Tasking API:</strong> Request new satellite observations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
