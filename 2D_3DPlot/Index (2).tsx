import React from 'react';
import { FileUpload } from '@/components/FileUpload';
import { VisualizationView } from '@/components/VisualizationView';
import { useOceanData } from '@/hooks/useOceanData';
import { Loader2, Waves, Database, Cpu } from 'lucide-react';

// Advanced loading screen component
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 hex-grid-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center space-y-8">
        {/* Logo with glow */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
          <div className="relative p-6 glass-panel-glow rounded-3xl">
            <Waves className="w-16 h-16 text-primary neon-text" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-gradient-ocean">
            Initializing OceanViz
          </h2>
          <p className="text-muted-foreground">Preparing visualization engine...</p>
        </div>
        
        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="status-processing" />
            <span className="text-muted-foreground">Loading data</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-muted-foreground">Processing</span>
          </div>
        </div>
        
        {/* Animated loading bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary animate-pulse"
              style={{ 
                width: '60%',
                animation: 'loading-progress 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading-progress {
          0%, 100% { width: 30%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
        }
      `}</style>
    </div>
  );
}

const Index = () => {
  const {
    dataset,
    settings,
    isLoading,
    loadSampleData,
    loadNetCDFFile,
    updateSettings,
  } = useOceanData();

  const handleReset = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Upload view
  if (!dataset) {
    return (
      <div className="min-h-screen bg-background">
        <FileUpload
          onFileSelect={loadNetCDFFile}
          onLoadSample={loadSampleData}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Visualization view
  return (
    <VisualizationView
      dataset={dataset}
      settings={settings}
      onSettingsChange={updateSettings}
      onReset={handleReset}
    />
  );
};

export default Index;