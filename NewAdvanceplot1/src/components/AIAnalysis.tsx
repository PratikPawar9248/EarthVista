import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, Zap, TrendingUp, AlertTriangle, Search, Lightbulb,
  BarChart3, LineChart, Cpu, Target, Sparkles, Bot,
  MessageSquare, FileText, Download, RefreshCw, Settings,
  Eye, Activity, Gauge, Radar, Network, Atom
} from 'lucide-react';

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

interface AIInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  parameters: string[];
  location?: { lat: number; lng: number };
  timestamp: string;
}

interface PredictionModel {
  id: string;
  name: string;
  type: 'neural_network' | 'random_forest' | 'svm' | 'lstm' | 'transformer';
  accuracy: number;
  parameters: string[];
  description: string;
}

interface AIAnalysisProps {
  data: OceanData[];
  onInsightSelect?: (insight: AIInsight) => void;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ data, onInsightSelect }) => {
  // AI State Management
  const [activeModel, setActiveModel] = useState<string>('neural_network');
  const [analysisMode, setAnalysisMode] = useState<string>('realtime');
  const [queryText, setQueryText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string, timestamp: string}>>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [selectedParameters, setSelectedParameters] = useState<string[]>(['temperature', 'salinity']);

  // AI Models Configuration
  const aiModels: PredictionModel[] = [
    {
      id: 'neural_network',
      name: 'Deep Neural Network',
      type: 'neural_network',
      accuracy: 94.2,
      parameters: ['temperature', 'salinity', 'chlorophyll', 'depth'],
      description: 'Multi-layer perceptron for complex pattern recognition'
    },
    {
      id: 'lstm_temporal',
      name: 'LSTM Time Series',
      type: 'lstm',
      accuracy: 91.8,
      parameters: ['temperature', 'salinity', 'ssh'],
      description: 'Long Short-Term Memory for temporal predictions'
    },
    {
      id: 'random_forest',
      name: 'Random Forest Ensemble',
      type: 'random_forest',
      accuracy: 89.5,
      parameters: ['all'],
      description: 'Ensemble method for robust predictions'
    },
    {
      id: 'transformer',
      name: 'Ocean Transformer',
      type: 'transformer',
      accuracy: 96.1,
      parameters: ['temperature', 'salinity', 'chlorophyll', 'currents'],
      description: 'Attention-based model for spatial-temporal analysis'
    },
    {
      id: 'svm_anomaly',
      name: 'SVM Anomaly Detector',
      type: 'svm',
      accuracy: 87.3,
      parameters: ['temperature', 'salinity'],
      description: 'Support Vector Machine for outlier detection'
    }
  ];

  // Generate AI Insights
  const generateAIInsights = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const insights: AIInsight[] = [
        {
          id: '1',
          type: 'anomaly',
          title: 'Temperature Anomaly Detected',
          description: 'Unusual temperature spike of +3.2°C detected in Arabian Sea region. This could indicate a marine heatwave event.',
          confidence: 92.5,
          severity: 'high',
          parameters: ['temperature'],
          location: { lat: 15.5, lng: 68.2 },
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'pattern',
          title: 'Chlorophyll Bloom Pattern',
          description: 'AI detected a developing phytoplankton bloom pattern. Chlorophyll levels increasing by 15% over 7 days.',
          confidence: 88.7,
          severity: 'medium',
          parameters: ['chlorophyll', 'temperature'],
          location: { lat: 12.3, lng: 75.8 },
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          type: 'prediction',
          title: 'Monsoon Current Prediction',
          description: 'ML model predicts strengthening of monsoon currents in next 5 days. Expected velocity increase: 0.3 m/s.',
          confidence: 85.2,
          severity: 'medium',
          parameters: ['u_velocity', 'v_velocity'],
          timestamp: new Date().toISOString()
        },
        {
          id: '4',
          type: 'recommendation',
          title: 'Data Collection Optimization',
          description: 'AI suggests deploying additional sensors in Bay of Bengal (13°N, 85°E) for improved model accuracy.',
          confidence: 79.8,
          severity: 'low',
          parameters: ['all'],
          location: { lat: 13.0, lng: 85.0 },
          timestamp: new Date().toISOString()
        },
        {
          id: '5',
          type: 'anomaly',
          title: 'Salinity Gradient Anomaly',
          description: 'Unusual salinity gradient detected. Possible freshwater intrusion or precipitation event.',
          confidence: 91.3,
          severity: 'high',
          parameters: ['salinity'],
          location: { lat: 8.7, lng: 76.5 },
          timestamp: new Date().toISOString()
        }
      ];
      
      setAiInsights(insights);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Generate Predictions
  const generatePredictions = () => {
    const currentModel = aiModels.find(m => m.id === activeModel);
    const predictions = [
      {
        parameter: 'temperature',
        current: 28.5,
        predicted_1h: 28.7,
        predicted_6h: 29.1,
        predicted_24h: 29.8,
        confidence: currentModel?.accuracy || 90,
        trend: 'increasing'
      },
      {
        parameter: 'salinity',
        current: 35.2,
        predicted_1h: 35.1,
        predicted_6h: 35.0,
        predicted_24h: 34.8,
        confidence: currentModel?.accuracy || 90,
        trend: 'decreasing'
      },
      {
        parameter: 'chlorophyll',
        current: 2.3,
        predicted_1h: 2.4,
        predicted_6h: 2.7,
        predicted_24h: 3.1,
        confidence: (currentModel?.accuracy || 90) - 5,
        trend: 'increasing'
      }
    ];
    
    setPredictions(predictions);
  };

  // AI Chat Interface
  const handleAIQuery = () => {
    if (!queryText.trim()) return;
    
    const userMessage = {
      role: 'user' as const,
      content: queryText,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      let aiResponse = '';
      
      if (queryText.toLowerCase().includes('temperature')) {
        aiResponse = `Based on the current data analysis, I observe that sea surface temperatures are showing a warming trend of +0.3°C over the past week. The neural network model indicates this is within normal seasonal variation, but there's a 15% probability of a marine heatwave developing in the next 10 days. I recommend monitoring stations in the Arabian Sea region more closely.`;
      } else if (queryText.toLowerCase().includes('salinity')) {
        aiResponse = `Salinity patterns show interesting variations. The LSTM model detected a freshwater intrusion event near the coast, likely due to recent precipitation. Current salinity levels are 2.1 PSU below the seasonal average. This could affect local marine ecosystems and should be monitored for the next 5-7 days.`;
      } else if (queryText.toLowerCase().includes('chlorophyll') || queryText.toLowerCase().includes('bloom')) {
        aiResponse = `Chlorophyll analysis reveals a developing phytoplankton bloom in the Bay of Bengal. The Random Forest model shows 87% confidence that this bloom will intensify over the next 3 days. This is typical for post-monsoon conditions and should support increased marine productivity.`;
      } else if (queryText.toLowerCase().includes('current')) {
        aiResponse = `Ocean current analysis using the Transformer model shows strengthening of the Southwest Monsoon Current. Velocity has increased by 0.2 m/s in the past 48 hours. This aligns with seasonal patterns and will likely continue for the next 2 weeks, affecting regional circulation patterns.`;
      } else {
        aiResponse = `I've analyzed your query using multiple AI models. Based on the current oceanographic data, I can provide insights on temperature patterns, salinity variations, chlorophyll distributions, and current dynamics. The ensemble models show high confidence (>85%) in current predictions. Would you like me to elaborate on any specific parameter or region?`;
      }
      
      const aiMessage = {
        role: 'ai' as const,
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1500);
    
    setQueryText('');
  };

  // Auto-generate insights on data change
  useEffect(() => {
    if (data.length > 0 && analysisMode === 'realtime') {
      generateAIInsights();
      generatePredictions();
    }
  }, [data, analysisMode]);

  // Filter insights by confidence
  const filteredInsights = aiInsights.filter(insight => insight.confidence >= confidenceThreshold);

  return (
    <div className="space-y-6">
      {/* AI Control Panel */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">AI-Powered Ocean Analysis</h2>
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                {filteredInsights.length} Active Insights
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIInsights}
                disabled={isAnalyzing}
                className="text-white border-purple-600 hover:bg-purple-800"
              >
                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">AI Model</label>
              <Select value={activeModel} onValueChange={setActiveModel}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  {aiModels.map(model => (
                    <SelectItem key={model.id} value={model.id} className="text-white">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4" />
                        <span>{model.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {model.accuracy}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Analysis Mode</label>
              <Select value={analysisMode} onValueChange={setAnalysisMode}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  <SelectItem value="realtime" className="text-white">Real-time</SelectItem>
                  <SelectItem value="batch" className="text-white">Batch Analysis</SelectItem>
                  <SelectItem value="predictive" className="text-white">Predictive</SelectItem>
                  <SelectItem value="anomaly" className="text-white">Anomaly Detection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Confidence: {confidenceThreshold}%
              </label>
              <Slider
                value={[confidenceThreshold]}
                onValueChange={(value) => setConfidenceThreshold(value[0])}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Parameters</label>
              <Select value={selectedParameters[0]} onValueChange={(value) => setSelectedParameters([value])}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  <SelectItem value="temperature" className="text-white">Temperature</SelectItem>
                  <SelectItem value="salinity" className="text-white">Salinity</SelectItem>
                  <SelectItem value="chlorophyll" className="text-white">Chlorophyll</SelectItem>
                  <SelectItem value="all" className="text-white">All Parameters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={generatePredictions}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                Predict
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800">
          <TabsTrigger value="insights" className="text-white">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions" className="text-white">Predictions</TabsTrigger>
          <TabsTrigger value="chat" className="text-white">AI Assistant</TabsTrigger>
          <TabsTrigger value="anomalies" className="text-white">Anomalies</TabsTrigger>
          <TabsTrigger value="patterns" className="text-white">Patterns</TabsTrigger>
          <TabsTrigger value="models" className="text-white">Models</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredInsights.map(insight => (
              <Card 
                key={insight.id} 
                className={`bg-slate-900 border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors ${
                  insight.severity === 'critical' ? 'border-red-500' :
                  insight.severity === 'high' ? 'border-orange-500' :
                  insight.severity === 'medium' ? 'border-yellow-500' : 'border-green-500'
                }`}
                onClick={() => onInsightSelect?.(insight)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center space-x-2">
                      {insight.type === 'anomaly' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      {insight.type === 'pattern' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                      {insight.type === 'prediction' && <Target className="w-5 h-5 text-green-400" />}
                      {insight.type === 'recommendation' && <Lightbulb className="w-5 h-5 text-yellow-400" />}
                      <span className="text-sm">{insight.title}</span>
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`${
                        insight.severity === 'critical' ? 'text-red-400 border-red-400' :
                        insight.severity === 'high' ? 'text-orange-400 border-orange-400' :
                        insight.severity === 'medium' ? 'text-yellow-400 border-yellow-400' : 
                        'text-green-400 border-green-400'
                      }`}
                    >
                      {insight.confidence.toFixed(1)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {insight.parameters.map(param => (
                        <Badge key={param} variant="secondary" className="text-xs">
                          {param}
                        </Badge>
                      ))}
                    </div>
                    {insight.location && (
                      <div className="text-xs text-gray-400">
                        {insight.location.lat.toFixed(2)}°, {insight.location.lng.toFixed(2)}°
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {predictions.map(pred => (
              <Card key={pred.parameter} className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <LineChart className="w-5 h-5 text-blue-400" />
                    <span>{pred.parameter.charAt(0).toUpperCase() + pred.parameter.slice(1)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Current</span>
                      <span className="text-white font-semibold">{pred.current}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">1 Hour</span>
                      <span className="text-blue-400">{pred.predicted_1h}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">6 Hours</span>
                      <span className="text-green-400">{pred.predicted_6h}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">24 Hours</span>
                      <span className="text-yellow-400">{pred.predicted_24h}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Confidence</span>
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                          {pred.confidence.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-400 text-sm">Trend</span>
                        <span className={`text-sm ${pred.trend === 'increasing' ? 'text-green-400' : 'text-red-400'}`}>
                          {pred.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Chat Assistant Tab */}
        <TabsContent value="chat" className="mt-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Bot className="w-5 h-5 text-green-400" />
                <span>AI Ocean Assistant</span>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="h-64 overflow-y-auto bg-slate-800 rounded-lg p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-gray-400 text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Ask me anything about the oceanographic data!</p>
                      <p className="text-sm mt-1">Try: "What's the temperature trend?" or "Analyze salinity patterns"</p>
                    </div>
                  )}
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Ask about ocean patterns, anomalies, predictions..."
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                  />
                  <Button onClick={handleAIQuery} className="bg-green-600 hover:bg-green-700">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="mt-4">
          <AnomalyDetectionPanel data={data} model={activeModel} />
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-4">
          <PatternAnalysisPanel data={data} />
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="mt-4">
          <AIModelsPanel models={aiModels} activeModel={activeModel} onModelSelect={setActiveModel} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Supporting Components
const AnomalyDetectionPanel: React.FC<{ data: OceanData[]; model: string }> = ({ data, model }) => {
  const anomalies = [
    { id: '1', parameter: 'temperature', value: 32.1, expected: 28.5, deviation: 3.6, severity: 'high', location: '15.2°N, 68.5°E' },
    { id: '2', parameter: 'salinity', value: 31.2, expected: 35.1, deviation: -3.9, severity: 'medium', location: '12.8°N, 75.2°E' },
    { id: '3', parameter: 'chlorophyll', value: 8.7, expected: 2.3, deviation: 6.4, severity: 'high', location: '10.5°N, 76.8°E' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Radar className="w-5 h-5 text-red-400" />
            <span>Detected Anomalies</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="bg-slate-800 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-medium">{anomaly.parameter.toUpperCase()}</h4>
                    <p className="text-gray-400 text-sm">{anomaly.location}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={anomaly.severity === 'high' ? 'text-red-400 border-red-400' : 'text-yellow-400 border-yellow-400'}
                  >
                    {anomaly.severity}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Observed</span>
                    <p className="text-white font-semibold">{anomaly.value}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected</span>
                    <p className="text-gray-300">{anomaly.expected}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Deviation</span>
                    <p className={`font-semibold ${anomaly.deviation > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                      {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Anomaly Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Total Anomalies</div>
                <div className="text-2xl font-bold text-red-400">23</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-gray-400 text-sm">High Severity</div>
                <div className="text-2xl font-bold text-orange-400">7</div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-2">Detection Accuracy</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <span className="text-green-400 font-semibold">94%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PatternAnalysisPanel: React.FC<{ data: OceanData[] }> = ({ data }) => {
  const patterns = [
    { id: '1', name: 'Seasonal Temperature Cycle', confidence: 96.2, description: 'Strong seasonal pattern detected in SST data' },
    { id: '2', name: 'Monsoon Current Pattern', confidence: 89.7, description: 'Bi-annual current reversal pattern identified' },
    { id: '3', name: 'Chlorophyll Bloom Cycle', confidence: 84.3, description: 'Post-monsoon phytoplankton bloom pattern' },
    { id: '4', name: 'Salinity Gradient', confidence: 91.8, description: 'Coastal-offshore salinity gradient pattern' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {patterns.map(pattern => (
        <Card key={pattern.id} className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-purple-400" />
                <span className="text-sm">{pattern.name}</span>
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                {pattern.confidence}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm mb-3">{pattern.description}</p>
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-2">Pattern Strength</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full" 
                    style={{ width: `${pattern.confidence}%` }}
                  ></div>
                </div>
                <span className="text-purple-400 font-semibold">{pattern.confidence}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AIModelsPanel: React.FC<{ 
  models: PredictionModel[]; 
  activeModel: string; 
  onModelSelect: (modelId: string) => void; 
}> = ({ models, activeModel, onModelSelect }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {models.map(model => (
        <Card 
          key={model.id} 
          className={`bg-slate-900 border-slate-700 cursor-pointer transition-colors ${
            model.id === activeModel ? 'border-blue-500 bg-slate-800' : 'hover:bg-slate-800'
          }`}
          onClick={() => onModelSelect(model.id)}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Atom className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">{model.name}</span>
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                {model.accuracy}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm mb-3">{model.description}</p>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Supported Parameters:</div>
              <div className="flex flex-wrap gap-1">
                {model.parameters.map(param => (
                  <Badge key={param} variant="secondary" className="text-xs">
                    {param}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIAnalysis;