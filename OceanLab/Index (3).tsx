import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ScientificPlotter } from "@/components/modules/ScientificPlotter";
import { OceanographicCalculator } from "@/components/calculators/OceanographicCalculator";
import { TimeSeriesAnalysis } from "@/components/modules/TimeSeriesAnalysis";

const moduleConfig: Record<string, { title: string; subtitle: string }> = {
  plotter: { 
    title: "Advanced Scientific Plotter", 
    subtitle: "Multi-layer overlays, animation timeline, contours, heatmaps & statistical analysis" 
  },
  calculator: { 
    title: "Ocean Calculator Suite", 
    subtitle: "Real-time 3D visualizations, comparison mode, profile analysis & batch processing" 
  },
  timeseries: {
    title: "Time Series Analysis",
    subtitle: "Trend detection, anomaly identification, and temporal analysis for oceanographic parameters"
  },
};

const Index = () => {
  const [activeModule, setActiveModule] = useState("plotter");
  
  const config = moduleConfig[activeModule] || moduleConfig.plotter;

  const renderModule = () => {
    switch (activeModule) {
      case "calculator":
        return <OceanographicCalculator />;
      case "timeseries":
        return <TimeSeriesAnalysis />;
      case "plotter":
      default:
        return <ScientificPlotter />;
    }
  };

  return (
    <div className="min-h-screen bg-background animated-gradient noise-overlay">
      {/* Cyberpunk background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/3 rounded-full blur-3xl" />
      </div>
      
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      
      <div className="ml-72 min-h-screen flex flex-col relative">
        <Header title={config.title} subtitle={config.subtitle} />
        
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;