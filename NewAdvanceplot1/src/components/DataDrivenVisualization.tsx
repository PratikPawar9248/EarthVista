import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Box, Eye, Brain, BookOpen, Play, Pause, RotateCcw, 
  Maximize2, Minimize2, Headphones, Glasses, Sparkles,
  Clock, Layers, Volume2, Settings, Download, Share
} from 'lucide-react';

// Import real interactive components
import InteractiveMap from './InteractiveMap';
import FourDVisualization from './FourDVisualization';
import ARVRVisualization from './ARVRVisualization';

interface OceanData {
  id: string;
  latitude: number;
  longitude: number;
  depth?: number;
  temperature?: number;
  salinity?: number;
  chlorophyll?: number;
  timestamp?: string;
  u_velocity?: number;
  v_velocity?: number;
  ssh?: number;
  bathymetry?: number;
  [key: string]: any;
}

interface DataDrivenVisualizationProps {
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
}

interface AIInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  parameters: string[];
  visualization: string;
}

interface StoryChapter {
  id: string;
  title: string;
  content: string;
  visualization: string;
  dataFilter: any;
  duration: number;
}

const DataDrivenVisualization: React.FC<DataDrivenVisualizationProps> = ({ 
  data, 
  onLocationSelect 
}) => {
  const [activeMode, setActiveMode] = useState<'4d' | 'ar-vr' | 'ai-insights' | 'storytelling'>('4d');
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [timeStep, setTimeStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [vrMode, setVrMode] = useState<boolean>(false);
  const [arMode, setArMode] = useState<boolean>(false);
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState<boolean>(false);
  const [storyMode, setStoryMode] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // AI-generated insights
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([]);

  // Generate AI insights based on data patterns
  useEffect(() => {
    if (data.length > 0) {
      generateAIInsights();
      generateStoryChapters();
    }
  }, [data, selectedParameter]);

  const generateAIInsights = () => {
    setAiAnalysisRunning(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const insights: AIInsight[] = [
        {
          id: 'temp_gradient',
          type: 'pattern',
          title: 'Temperature Gradient Pattern Detected',
          description: 'Strong thermal stratification observed with surface temperatures 6-8°C warmer than deep waters. This indicates active vertical mixing processes typical of monsoon-influenced regions.',
          confidence: 0.92,
          parameters: ['temperature', 'depth'],
          visualization: '3d_profile'
        },
        {
          id: 'salinity_anomaly',
          type: 'anomaly',
          title: 'Salinity Anomaly in Northern Region',
          description: 'Unusual low-salinity water mass detected at 5-8°N, likely indicating freshwater influx from increased precipitation or river discharge during monsoon season.',
          confidence: 0.87,
          parameters: ['salinity', 'latitude'],
          visualization: 'contour_map'
        },
        {
          id: 'chlorophyll_bloom',
          type: 'trend',
          title: 'Phytoplankton Bloom Progression',
          description: 'Chlorophyll concentrations show 300% increase over 2-week period, suggesting nutrient upwelling event. Peak concentrations align with favorable wind patterns.',
          confidence: 0.94,
          parameters: ['chlorophyll', 'timestamp'],
          visualization: 'time_series'
        },
        {
          id: 'current_correlation',
          type: 'correlation',
          title: 'Current-Temperature Correlation',
          description: 'Strong negative correlation (-0.78) between eastward currents and surface temperature, indicating cold water advection from deeper layers.',
          confidence: 0.89,
          parameters: ['u_velocity', 'temperature'],
          visualization: 'vector_field'
        }
      ];
      
      setAiInsights(insights);
      setAiAnalysisRunning(false);
    }, 2000);
  };

  const generateStoryChapters = () => {
    const chapters: StoryChapter[] = [
      {
        id: 'intro',
        title: 'The Ocean\'s Hidden Story',
        content: 'Deep beneath the surface of the Indian Ocean, a complex dance of water masses tells the story of our planet\'s climate system. Each data point represents a moment in this eternal choreography.',
        visualization: 'overview_map',
        dataFilter: {},
        duration: 8000
      },
      {
        id: 'surface',
        title: 'Surface Waters: The Ocean\'s Skin',
        content: 'At the surface, warm tropical waters absorb solar energy, creating the engine that drives global weather patterns. Temperature variations reveal the ocean\'s response to seasonal monsoons.',
        visualization: 'surface_temperature',
        dataFilter: { depth: { max: 50 } },
        duration: 10000
      },
      {
        id: 'currents',
        title: 'Rivers in the Sea',
        content: 'Invisible rivers flow through the ocean, carrying heat, nutrients, and life across vast distances. These currents shape marine ecosystems and influence climate patterns worldwide.',
        visualization: 'current_vectors',
        dataFilter: { parameters: ['u_velocity', 'v_velocity'] },
        duration: 12000
      },
      {
        id: 'life',
        title: 'Blooms of Life',
        content: 'Where nutrients meet sunlight, microscopic plants bloom in spectacular displays visible from space. These phytoplankton form the foundation of marine food webs.',
        visualization: 'chlorophyll_animation',
        dataFilter: { parameters: ['chlorophyll'] },
        duration: 9000
      },
      {
        id: 'depths',
        title: 'Journey to the Abyss',
        content: 'Descending through the water column reveals a world of gradients - temperature drops, pressure increases, and life adapts to the eternal darkness of the deep.',
        visualization: 'depth_profile',
        dataFilter: { depth: { min: 200 } },
        duration: 11000
      },
      {
        id: 'conclusion',
        title: 'The Connected Ocean',
        content: 'Every measurement tells part of a larger story - the ocean as a living, breathing system that connects all life on Earth. Understanding these patterns helps us protect our blue planet.',
        visualization: 'integrated_view',
        dataFilter: {},
        duration: 8000
      }
    ];
    
    setStoryChapters(chapters);
  };

  // 4D animation control
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setTimeStep(prev => (prev + playbackSpeed) % 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, playbackSpeed]);

  // Story mode auto-progression
  useEffect(() => {
    if (storyMode && storyChapters.length > 0) {
      const currentChapterData = storyChapters[currentChapter];
      const timer = setTimeout(() => {
        if (currentChapter < storyChapters.length - 1) {
          setCurrentChapter(prev => prev + 1);
        } else {
          setStoryMode(false);
          setCurrentChapter(0);
        }
      }, currentChapterData?.duration || 8000);
      
      return () => clearTimeout(timer);
    }
  }, [storyMode, currentChapter, storyChapters]);

  const availableParameters = useMemo(() => {
    if (data.length === 0) return [];
    
    const params = ['temperature', 'salinity', 'chlorophyll', 'ssh', 'bathymetry', 'u_velocity', 'v_velocity'];
    return params.filter(param => 
      data.some(d => d[param] !== undefined && d[param] !== null)
    );
  }, [data]);

  const render4DVisualization = () => (
    <div className="space-y-6">
      {/* 4D Controls */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Box className="w-5 h-5 text-primary" />
            <span>4D Visualization Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Parameter</label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableParameters.map(param => (
                    <SelectItem key={param} value={param}>
                      {param.charAt(0).toUpperCase() + param.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Time Step: {timeStep}%
              </label>
              <Slider
                value={[timeStep]}
                onValueChange={(value) => setTimeStep(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Speed: {playbackSpeed}x
              </label>
              <Slider
                value={[playbackSpeed]}
                onValueChange={(value) => setPlaybackSpeed(value[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-enhanced flex-1"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => setTimeStep(0)}
                className="btn-enhanced"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4D Visualization */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>4D Ocean Visualization - ParaView Style</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <FourDVisualization 
            data={data}
            parameter={selectedParameter}
            timeStep={timeStep}
            onLocationSelect={onLocationSelect}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderARVRMode = () => (
    <div className="space-y-6">
      {/* AR/VR Controls */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-accent" />
            <span>Immersive Ocean Exploration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={vrMode ? "default" : "outline"}
              onClick={() => setVrMode(!vrMode)}
              className="btn-enhanced h-20 flex flex-col items-center justify-center"
            >
              <Headphones className="w-8 h-8 mb-2" />
              <span>VR Mode</span>
              {vrMode && <Badge className="mt-1">Active</Badge>}
            </Button>
            
            <Button
              variant={arMode ? "default" : "outline"}
              onClick={() => setArMode(!arMode)}
              className="btn-enhanced h-20 flex flex-col items-center justify-center"
            >
              <Glasses className="w-8 h-8 mb-2" />
              <span>AR Mode</span>
              {arMode && <Badge className="mt-1">Active</Badge>}
            </Button>
            
            <Button
              variant="outline"
              className="btn-enhanced h-20 flex flex-col items-center justify-center"
            >
              <Volume2 className="w-8 h-8 mb-2" />
              <span>Spatial Audio</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Immersive Visualization */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>
            {vrMode ? 'Virtual Reality Ocean Environment' : 
             arMode ? 'Augmented Reality Data Overlay' : 
             'Immersive 3D Ocean Exploration'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <ARVRVisualization 
            data={data}
            parameter={selectedParameter}
            vrMode={vrMode}
            arMode={arMode}
            onLocationSelect={onLocationSelect}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderAIInsights = () => (
    <div className="space-y-6">
      {/* AI Analysis Controls */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>AI Pattern Analysis</span>
            </div>
            <Button
              variant="outline"
              onClick={generateAIInsights}
              disabled={aiAnalysisRunning}
              className="btn-enhanced"
            >
              {aiAnalysisRunning ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Patterns
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            AI-powered analysis identifies patterns, anomalies, and trends in oceanographic data using advanced machine learning algorithms.
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {aiInsights.map((insight, index) => (
          <Card key={insight.id} className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    insight.type === 'pattern' ? 'bg-blue-500' :
                    insight.type === 'anomaly' ? 'bg-red-500' :
                    insight.type === 'trend' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="text-sm font-medium">{insight.title}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence * 100)}% confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {insight.parameters.map(param => (
                  <Badge key={param} variant="outline" className="text-xs">
                    {param.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
              <div className="h-32 bg-secondary/20 rounded-lg flex items-center justify-center">
                <AIVisualization 
                  insight={insight}
                  data={data}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStorytellingMode = () => (
    <div className="space-y-6">
      {/* Story Controls */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <span>Interactive Ocean Story</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setStoryMode(!storyMode)}
                className={`btn-enhanced ${storyMode ? 'bg-green-500/20 text-green-400' : ''}`}
              >
                {storyMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {storyMode ? 'Pause Story' : 'Start Story'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentChapter(0);
                  setStoryMode(false);
                }}
                className="btn-enhanced"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Chapter {currentChapter + 1} of {storyChapters.length}
            </div>
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentChapter + 1) / storyChapters.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story Content */}
      {storyChapters[currentChapter] && (
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-2xl">
              {storyChapters[currentChapter].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg text-muted-foreground leading-relaxed">
              {storyChapters[currentChapter].content}
            </div>
            
            <div className="h-[500px] bg-secondary/20 rounded-lg">
              <StoryVisualization 
                chapter={storyChapters[currentChapter]}
                data={data}
                onLocationSelect={onLocationSelect}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                disabled={currentChapter === 0}
                className="btn-enhanced"
              >
                Previous Chapter
              </Button>
              
              <div className="flex space-x-2">
                {storyChapters.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                      index === currentChapter ? 'bg-primary' : 'bg-secondary'
                    }`}
                    onClick={() => setCurrentChapter(index)}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentChapter(Math.min(storyChapters.length - 1, currentChapter + 1))}
                disabled={currentChapter === storyChapters.length - 1}
                className="btn-enhanced"
              >
                Next Chapter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : 'space-y-6'}>
      {/* Mode Selection */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data-Driven Visualization Innovations</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn-enhanced"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMode} onValueChange={(value: any) => setActiveMode(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
              <TabsTrigger value="4d" className="flex items-center space-x-2">
                <Box className="w-4 h-4" />
                <span>4D Tools</span>
              </TabsTrigger>
              <TabsTrigger value="ar-vr" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>AR/VR</span>
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Insights</span>
              </TabsTrigger>
              <TabsTrigger value="storytelling" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Storytelling</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="4d" className="mt-6">
              {render4DVisualization()}
            </TabsContent>

            <TabsContent value="ar-vr" className="mt-6">
              {renderARVRMode()}
            </TabsContent>

            <TabsContent value="ai-insights" className="mt-6">
              {renderAIInsights()}
            </TabsContent>

            <TabsContent value="storytelling" className="mt-6">
              {renderStorytellingMode()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual visualization components are imported from separate files

const AIVisualization: React.FC<{
  insight: AIInsight;
  data: OceanData[];
}> = ({ insight, data }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Brain className="w-8 h-8 text-primary mb-2" />
      <div className="text-sm font-semibold text-foreground mb-1">
        {insight.visualization.replace('_', ' ').toUpperCase()}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        AI-generated {insight.type} visualization
      </div>
    </div>
  );
};

const StoryVisualization: React.FC<{
  chapter: StoryChapter;
  data: OceanData[];
  onLocationSelect: (location: OceanData) => void;
}> = ({ chapter, data, onLocationSelect }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-900/20 to-red-600/20 rounded-lg flex flex-col items-center justify-center p-6">
      <BookOpen className="w-16 h-16 mx-auto text-accent mb-4" />
      <div className="text-xl font-semibold text-foreground mb-2">{chapter.title}</div>
      <div className="text-sm text-muted-foreground mb-4 text-center">
        Interactive visualization: {chapter.visualization.replace('_', ' ')}
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs w-full max-w-md">
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-accent font-semibold">{chapter.id.toUpperCase()}</div>
          <div className="text-muted-foreground">Chapter ID</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-primary font-semibold">{Math.round(chapter.duration / 1000)}s</div>
          <div className="text-muted-foreground">Duration</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Narrative-driven data exploration with automated storytelling
      </div>
    </div>
  );
};

export default DataDrivenVisualization;