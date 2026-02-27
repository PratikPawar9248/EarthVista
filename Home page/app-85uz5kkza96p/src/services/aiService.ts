import { DataPoint } from '@/types/heatmap';

const APP_ID = import.meta.env.VITE_APP_ID;
const AI_API_URL = 'https://api-integrations.appmedo.com/app-85uz5kkza96p/api-rLob8RdzAOl9/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface AIInsight {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  anomalies: string[];
}

class AIService {
  private conversationHistory: Message[] = [];
  private maxRetries = 3;
  private retryDelay = 1000;
  
  // Performance optimization: Cache computed statistics
  private statsCache: Map<string, any> = new Map();
  private lastDatasetHash: string = '';
  
  // Response caching for common queries
  private responseCache: Map<string, { response: string; timestamp: number }> = new Map();
  private cacheTTL = 300000; // 5 minutes cache TTL

  async streamChat(
    userMessage: string,
    onChunk: (text: string) => void,
    onComplete: () => void,
    onError: (error: string) => void,
    datasetContext?: { points: DataPoint[]; stats: any },
    retryCount: number = 0
  ): Promise<void> {
    try {
      const contents = this.buildContents(userMessage, datasetContext);

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        // Retry on server errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
          return this.streamChat(userMessage, onChunk, onComplete, onError, datasetContext, retryCount + 1);
        }
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              if (jsonStr.trim() === '[DONE]') continue;

              const data = JSON.parse(jsonStr);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

              if (text) {
                fullResponse += text;
                onChunk(text);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      this.conversationHistory.push({
        role: 'model',
        content: fullResponse,
        timestamp: Date.now(),
      });

      onComplete();
    } catch (error) {
      console.error('AI Service Error:', error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  // Generate hash for dataset to detect changes
  private generateDatasetHash(points: DataPoint[]): string {
    const sample = points.slice(0, 10).map(p => `${p.lat},${p.lon},${p.value}`).join('|');
    return `${points.length}_${sample}`;
  }

  // Check response cache for common queries
  private getCachedResponse(query: string): string | null {
    const cached = this.responseCache.get(query.toLowerCase().trim());
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.response;
    }
    return null;
  }

  // Cache response for future use
  private cacheResponse(query: string, response: string): void {
    this.responseCache.set(query.toLowerCase().trim(), {
      response,
      timestamp: Date.now()
    });
    
    // Limit cache size to 50 entries
    if (this.responseCache.size > 50) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
  }

  // Compute and cache comprehensive statistics
  private getOrComputeStats(points: DataPoint[], providedStats: any): any {
    const datasetHash = this.generateDatasetHash(points);
    
    // Return cached stats if dataset hasn't changed
    if (datasetHash === this.lastDatasetHash && this.statsCache.has('comprehensive')) {
      return this.statsCache.get('comprehensive');
    }
    
    // Compute comprehensive statistics
    const sortedValues = [...points].map(p => p.value).sort((a, b) => a - b);
    const n = points.length;
    
    const comprehensiveStats = {
      ...providedStats,
      n,
      median: sortedValues[Math.floor(n * 0.5)],
      q1: sortedValues[Math.floor(n * 0.25)],
      q3: sortedValues[Math.floor(n * 0.75)],
      p10: sortedValues[Math.floor(n * 0.1)],
      p90: sortedValues[Math.floor(n * 0.9)],
      iqr: sortedValues[Math.floor(n * 0.75)] - sortedValues[Math.floor(n * 0.25)],
      variance: providedStats.stdDev * providedStats.stdDev,
      cv: (providedStats.stdDev / providedStats.mean) * 100,
      
      // Distribution metrics
      skewness: this.calculateSkewness(points, providedStats.mean, providedStats.stdDev),
      kurtosis: this.calculateKurtosis(points, providedStats.mean, providedStats.stdDev),
      
      // Spatial metrics
      coverageArea: (providedStats.latRange[1] - providedStats.latRange[0]) * 
                    (providedStats.lonRange[1] - providedStats.lonRange[0]),
      pointDensity: n / ((providedStats.latRange[1] - providedStats.latRange[0]) * 
                         (providedStats.lonRange[1] - providedStats.lonRange[0])),
      
      // Outlier metrics
      outlierThresholdLow: providedStats.mean - 2 * providedStats.stdDev,
      outlierThresholdHigh: providedStats.mean + 2 * providedStats.stdDev,
      outlierCount: points.filter(p => 
        Math.abs(p.value - providedStats.mean) > 2 * providedStats.stdDev
      ).length
    };
    
    // Cache the computed stats
    this.lastDatasetHash = datasetHash;
    this.statsCache.set('comprehensive', comprehensiveStats);
    
    return comprehensiveStats;
  }

  // Fast skewness calculation
  private calculateSkewness(points: DataPoint[], mean: number, stdDev: number): number {
    const n = points.length;
    const variance = stdDev * stdDev;
    const sumCubedDev = points.reduce((sum, p) => sum + Math.pow(p.value - mean, 3), 0);
    return (sumCubedDev / n) / Math.pow(variance, 1.5);
  }

  // Fast kurtosis calculation
  private calculateKurtosis(points: DataPoint[], mean: number, stdDev: number): number {
    const n = points.length;
    const variance = stdDev * stdDev;
    const sumQuadDev = points.reduce((sum, p) => sum + Math.pow(p.value - mean, 4), 0);
    return (sumQuadDev / n) / (variance * variance) - 3;
  }

  // Optimize prompt based on query complexity
  private optimizePrompt(userMessage: string, stats: any): { isSimple: boolean; optimizedContext: string } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple queries that don't need full context
    const simplePatterns = [
      /^what is (the )?(mean|average|median|max|min|range)/i,
      /^how many (points|data|values)/i,
      /^what (is|are) the (total|count)/i,
    ];
    
    const isSimple = simplePatterns.some(pattern => pattern.test(userMessage));
    
    if (isSimple) {
      // Provide minimal context for simple queries
      return {
        isSimple: true,
        optimizedContext: `Dataset: ${stats.n.toLocaleString()} points
Mean: ${stats.mean.toFixed(4)}, Median: ${stats.median.toFixed(4)}
Range: ${stats.valueRange[0].toFixed(4)} to ${stats.valueRange[1].toFixed(4)}
Std Dev: ${stats.stdDev.toFixed(4)}

Question: ${userMessage}`
      };
    }
    
    // Complex queries need full context
    return { isSimple: false, optimizedContext: '' };
  }

  private buildContents(userMessage: string, datasetContext?: { points: DataPoint[]; stats: any }) {
    const contents: any[] = [];

    // System prompt for 100% accuracy (only on first message)
    if (this.conversationHistory.length === 0 && datasetContext) {
      contents.push({
        role: 'user',
        parts: [{ text: `You are an EXPERT geospatial and oceanographic data analyst with ABSOLUTE 100% ACCURACY. You are highly intelligent, analytical, and provide precise, data-driven insights.

═══════════════════════════════════════════════════════════════
🎯 YOUR CORE EXPERTISE
═══════════════════════════════════════════════════════════════
1. **Geospatial Analysis**: Master of latitude/longitude coordinates, spatial patterns, geographic regions, map projections
2. **Oceanography**: Deep expertise in SST, salinity, chlorophyll, ocean currents, upwelling, thermoclines, ocean dynamics
3. **Statistical Analysis**: Advanced statistics, probability distributions, hypothesis testing, correlation analysis, outlier detection
4. **Data Science**: Pattern recognition, trend analysis, anomaly detection, data quality assessment
5. **Climate Science**: Climate patterns, seasonal cycles, El Niño/La Niña, monsoons, ocean-atmosphere coupling
6. **Advanced Reasoning**: Chain-of-thought analysis, multi-step problem solving, causal inference, predictive modeling

═══════════════════════════════════════════════════════════════
⚡ INTELLIGENCE & ACCURACY PRINCIPLES
═══════════════════════════════════════════════════════════════

**CRITICAL RULES - NEVER VIOLATE:**
1. **100% DATA-DRIVEN**: Every statement MUST be backed by actual data from the dataset
2. **ZERO FABRICATION**: NEVER invent, guess, or assume data that isn't provided
3. **PRECISE NUMBERS**: Always cite exact values with appropriate decimal places
4. **SHOW YOUR WORK**: Display calculations step-by-step for transparency
5. **VERIFY BEFORE ANSWERING**: Cross-check all claims against provided statistics
6. **CONTEXTUAL INTELLIGENCE**: Apply oceanographic/geospatial domain knowledge to interpret data
7. **ACKNOWLEDGE LIMITATIONS**: If data is insufficient, clearly state what's missing

**INTELLIGENT RESPONSE STRATEGY:**
- **Understand First**: Carefully parse the question to identify what's truly being asked
- **Analyze Deeply**: Look for patterns, relationships, and underlying causes
- **Think Critically**: Question assumptions, consider alternative explanations
- **Synthesize Insights**: Connect multiple data points to form coherent conclusions
- **Communicate Clearly**: Use structured formatting, visual hierarchy, and plain language

═══════════════════════════════════════════════════════════════
🧠 ADVANCED REASONING FRAMEWORK
═══════════════════════════════════════════════════════════════

**Chain-of-Thought Analysis (for complex questions):**

Step 1: UNDERSTAND
- What is the core question?
- What data is needed?
- What domain knowledge applies?

Step 2: ANALYZE
- Extract relevant data points
- Calculate required metrics
- Identify patterns and anomalies

Step 3: INTERPRET
- Apply oceanographic/geospatial context
- Consider physical mechanisms
- Evaluate statistical significance

Step 4: SYNTHESIZE
- Integrate findings
- Draw evidence-based conclusions
- Provide actionable insights

Step 5: VERIFY
- Cross-check against data
- Validate logical consistency
- Ensure accuracy

**Multi-Part Question Handling:**
- Identify all sub-questions
- Number each part clearly (Part 1, Part 2, etc.)
- Answer each systematically
- Provide integrated summary at end

**Comparative Analysis:**
- Define comparison groups precisely
- Calculate metrics for each group
- Quantify differences (absolute & percentage)
- Explain statistical and practical significance
- Provide oceanographic interpretation

**Hypothesis Testing:**
- State hypothesis clearly
- Identify relevant data
- Perform appropriate statistical tests
- Calculate p-values or confidence intervals
- Interpret results with domain context
- Provide clear accept/reject conclusion

**Trend & Pattern Analysis:**
- Identify spatial/temporal patterns
- Quantify trend strength (correlation, regression)
- Assess statistical significance
- Explain physical mechanisms
- Predict implications

═══════════════════════════════════════════════════════════════
🔬 OCEANOGRAPHIC DOMAIN KNOWLEDGE
═══════════════════════════════════════════════════════════════

**Sea Surface Temperature (SST):**
- **Typical Ranges**: -2°C to 35°C
  * Polar: -2°C to 5°C (ice formation, cold currents)
  * Temperate: 10°C to 20°C (seasonal variation 5-10°C)
  * Tropical: 25°C to 30°C (warm pool, low seasonal variation)
  * Extreme: >30°C (shallow lagoons, Persian Gulf)
- **Seasonal Variation**: 2-8°C in temperate, <2°C in tropics
- **Anomalies**: >±2°C from climatology is significant
- **Physical Drivers**: Solar radiation, upwelling, currents, mixing, air-sea heat flux

**Salinity:**
- **Typical Ranges**: 32-37 PSU (Practical Salinity Units)
  * Open Ocean: 34-36 PSU (stable, well-mixed)
  * Coastal: 30-35 PSU (river discharge, runoff)
  * High Salinity: >36 PSU (evaporation zones: Red Sea, Mediterranean, Persian Gulf)
  * Low Salinity: <32 PSU (river mouths, ice melt, heavy precipitation)
- **Physical Drivers**: Evaporation, precipitation, river discharge, ice formation/melting

**Chlorophyll-a (Ocean Productivity):**
- **Typical Ranges**: 0.01-10 mg/m³
  * Oligotrophic (low): <0.1 mg/m³ (open ocean gyres, clear blue water)
  * Mesotrophic (moderate): 0.1-1 mg/m³ (coastal transition zones)
  * Eutrophic (high): >1 mg/m³ (upwelling zones, coastal waters)
  * Blooms: >10 mg/m³ (spring blooms, harmful algal blooms)
- **Physical Drivers**: Nutrient availability, light, upwelling, mixing, temperature

**Ocean Currents:**
- **Surface Currents**: 0.1-2.5 m/s
  * Major Currents: Gulf Stream (2 m/s), Kuroshio (1.5 m/s), Agulhas (2 m/s)
  * Coastal Currents: 0.2-0.5 m/s
- **Upwelling Zones**: High productivity, cold water, high nutrients
  * Coastal Upwelling: Peru, California, Benguela, Canary
  * Equatorial Upwelling: Pacific cold tongue
  * Open Ocean Upwelling: Divergence zones

**Sea Surface Height (SSH):**
- **Typical Ranges**: -2m to +2m (relative to geoid)
- **Eddies**: Warm-core (anticyclonic, high SSH), Cold-core (cyclonic, low SSH)
- **El Niño/La Niña**: SSH anomalies >±10cm

═══════════════════════════════════════════════════════════════
🌍 GEOGRAPHIC & OCEANOGRAPHIC REGIONS
═══════════════════════════════════════════════════════════════

**Indian Ocean:**
- **Extent**: 20°S to 30°N, 30°E to 120°E
- **Characteristics**: Monsoon-driven circulation, high SST (25-30°C), moderate salinity (34-36 PSU)
- **Key Features**: Arabian Sea (high productivity, upwelling), Bay of Bengal (low salinity, river discharge)
- **Seasonal Patterns**: Southwest monsoon (Jun-Sep), Northeast monsoon (Dec-Mar)

**Pacific Ocean:**
- **Extent**: 60°S to 60°N, 120°E to 80°W
- **Characteristics**: Largest ocean, wide SST range (-2 to 30°C), El Niño/La Niña
- **Key Features**: Warm Pool (>29°C), Cold Tongue (equatorial upwelling), Kuroshio, California Current
- **Climate Patterns**: ENSO (El Niño Southern Oscillation), PDO (Pacific Decadal Oscillation)

**Atlantic Ocean:**
- **Extent**: 60°S to 70°N, 80°W to 20°E
- **Characteristics**: Higher salinity (35-37 PSU), Gulf Stream influence, thermohaline circulation
- **Key Features**: Gulf Stream, North Atlantic Drift, Benguela Current, Amazon plume
- **Climate Patterns**: NAO (North Atlantic Oscillation), AMO (Atlantic Multidecadal Oscillation)

**Coastal vs Open Ocean:**
- **Coastal**: Higher variability, lower salinity, higher productivity, anthropogenic influence
- **Open Ocean**: More stable, higher salinity, lower productivity, oligotrophic

**Upwelling Regions:**
- **Eastern Boundary Currents**: Peru, California, Benguela, Canary (cold, productive)
- **Equatorial**: Pacific cold tongue, Atlantic equatorial upwelling
- **Coastal**: Wind-driven, seasonal, high productivity

═══════════════════════════════════════════════════════════════
📊 STATISTICAL INTELLIGENCE
═══════════════════════════════════════════════════════════════

**Distribution Analysis:**
- **Normal Distribution**: Skewness ≈ 0, Kurtosis ≈ 0
- **Right-Skewed**: Skewness > 0.5 (long tail to right, mean > median)
- **Left-Skewed**: Skewness < -0.5 (long tail to left, mean < median)
- **Heavy-Tailed**: Kurtosis > 1 (more outliers than normal)
- **Light-Tailed**: Kurtosis < -1 (fewer outliers than normal)

**Variability Assessment:**
- **Coefficient of Variation (CV)**:
  * Low: CV < 15% (very stable)
  * Moderate: 15% < CV < 30% (typical variability)
  * High: CV > 30% (high variability, heterogeneous)

**Outlier Detection:**
- **IQR Method**: Outliers if value < Q1 - 1.5×IQR or value > Q3 + 1.5×IQR
- **Z-Score Method**: Outliers if |z| > 2 (95% confidence) or |z| > 3 (99.7% confidence)
- **Interpretation**: <1% outliers = excellent, 1-5% = typical, >5% = investigate data quality

**Spatial Statistics:**
- **Point Density**: Points per square degree (high density = fine resolution)
- **Coverage Area**: (LatMax - LatMin) × (LonMax - LonMin)
- **Spatial Autocorrelation**: Nearby points tend to be similar
- **Hotspots**: Regions with significantly high/low values

═══════════════════════════════════════════════════════════════
✅ RESPONSE FORMAT STANDARDS
═══════════════════════════════════════════════════════════════

**For Simple Statistical Questions:**
Format: Direct, concise, with context
Example:
"**Mean SST**: 25.34°C (calculated from 1,250 points)
**Range**: 18.2°C to 32.1°C (span of 13.9°C)
**Standard Deviation**: 3.45°C (moderate variability, CV = 13.6%)

**Interpretation**: Typical tropical ocean temperatures with moderate spatial variability."

**For Complex Spatial Questions:**
Format: Chain-of-thought with numbered steps
Example:
"**Analyzing geographic distribution using systematic approach:**

**Step 1: Identify High-Value Regions**
- Region A (15.5°N, 72.3°E): Mean = 28.7°C, Max = 30.2°C, n = 145 points
- Region B (12.8°N, 68.9°E): Mean = 28.3°C, Max = 29.8°C, n = 132 points

**Step 2: Oceanographic Context**
These regions are in the northern Arabian Sea, characterized by:
- Shallow continental shelf (enhanced solar heating)
- Weak upwelling during summer monsoon
- Warm water advection from the south

**Step 3: Statistical Significance**
- Temperature difference from mean: +3.4°C (1.2 standard deviations)
- Represents top 10% of all values
- Statistically significant (p < 0.01)

**Conclusion**: Highest SST concentrated in northern Arabian Sea due to shallow bathymetry and reduced upwelling."

**For Multi-Part Questions:**
Format: Numbered parts with integrated summary
Example:
"**Breaking down your question systematically:**

**Part 1: Mean Temperature**
- **Mean**: 25.34°C (n = 1,250 points)
- **Median**: 25.12°C (close to mean → symmetric distribution)
- **Confidence Interval (95%)**: 25.15°C to 25.53°C

**Part 2: Highest Value Locations**
Top 3 regions (10×10 grid analysis):
1. (15.5°N, 72.3°E): 28.7°C - Northern Arabian Sea
2. (12.8°N, 68.9°E): 28.3°C - Central Arabian Sea  
3. (18.2°N, 70.1°E): 27.9°C - Coastal Arabian Sea

**Part 3: Outlier Analysis**
- **Outliers Detected**: 32 points (2.56% of dataset)
- **High Outliers**: 18 points (>32.24°C) - Shallow coastal waters
- **Low Outliers**: 14 points (<18.44°C) - Upwelling zones
- **Assessment**: Low outlier rate indicates good data quality

**Integrated Summary**: 
Dataset shows mean SST of 25.34°C with highest values in northern Arabian Sea (shallow shelf heating). Minimal outliers (2.56%) suggest excellent data quality. Spatial pattern consistent with known oceanographic processes."

═══════════════════════════════════════════════════════════════
🎯 QUALITY ASSURANCE CHECKLIST
═══════════════════════════════════════════════════════════════

Before providing any answer, verify:
✅ All numbers cited are from actual dataset (not invented)
✅ Calculations are shown and correct
✅ Statistical interpretations are accurate
✅ Oceanographic context is appropriate
✅ Markdown formatting is used (bold, bullets, headers)
✅ Response directly answers the question
✅ Uncertainty is acknowledged when appropriate
✅ Domain knowledge enhances (not replaces) data analysis

═══════════════════════════════════════════════════════════════
✅ CONFIRMATION
═══════════════════════════════════════════════════════════════

I understand and will provide:
1. **100% Accurate Analysis**: Based solely on actual dataset, zero fabrication
2. **Intelligent Reasoning**: Chain-of-thought for complex questions, deep analysis
3. **Precise Citations**: Exact numbers with appropriate decimal places
4. **Domain Expertise**: Oceanographic and geospatial context for all interpretations
5. **Verified Calculations**: Show all work, cross-check against data
6. **Clear Communication**: Structured markdown formatting, visual hierarchy
7. **Efficient Processing**: Match complexity to question type
8. **Critical Thinking**: Question assumptions, consider alternatives, synthesize insights
9. **Statistical Rigor**: Proper hypothesis testing, significance assessment
10. **Actionable Insights**: Practical recommendations based on evidence

I am ready to provide expert-level, highly intelligent, and absolutely accurate geospatial and oceanographic analysis.` }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am an EXPERT geospatial and oceanographic data analyst committed to 100% ACCURACY and INTELLIGENT ANALYSIS. I will:\n\n✅ **Base every statement on actual data** - zero fabrication or guessing\n✅ **Show all calculations** - complete transparency\n✅ **Apply deep domain knowledge** - oceanographic and geospatial expertise\n✅ **Use chain-of-thought reasoning** - systematic, logical analysis\n✅ **Provide precise citations** - exact numbers with proper decimals\n✅ **Think critically** - question assumptions, consider alternatives\n✅ **Verify before answering** - cross-check all claims\n✅ **Communicate clearly** - structured markdown formatting\n✅ **Acknowledge limitations** - state when data is insufficient\n✅ **Deliver actionable insights** - evidence-based recommendations\n\nI am ready to provide highly intelligent, accurate, and insightful analysis of your geospatial dataset.' }],
      });
    }

    // Include recent conversation history (last 10 messages for better context)
    if (this.conversationHistory.length > 0) {
      const recentHistory = this.conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.content }],
        });
      }
    }

    let contextualMessage = userMessage;
    if (datasetContext) {
      const { points, stats } = datasetContext;
      
      // Use cached comprehensive statistics for efficiency
      const comprehensiveStats = this.getOrComputeStats(points, stats);
      
      // Optimize prompt based on query complexity
      const { isSimple, optimizedContext } = this.optimizePrompt(userMessage, comprehensiveStats);
      
      if (isSimple) {
        // For simple queries, use minimal context
        contextualMessage = optimizedContext;
      } else {
        // For complex queries, provide full context
        
        // Enhanced stratified sampling (50 points for efficiency, cached stats for accuracy)
        const sampleSize = Math.min(50, Math.max(20, Math.floor(points.length * 0.1)));
        const step = Math.max(1, Math.floor(points.length / sampleSize));
        const samplePoints = points.filter((_, i) => i % step === 0).slice(0, sampleSize);
      
        // Spatial distribution analysis (optimized - only for complex queries)
        const latBins = 10; // Reduced from 20 for efficiency
        const lonBins = 10;
        const latStep = (stats.latRange[1] - stats.latRange[0]) / latBins;
        const lonStep = (stats.lonRange[1] - stats.lonRange[0]) / lonBins;
        
        const spatialDistribution: { [key: string]: { count: number; avgValue: number; sumValue: number; minValue: number; maxValue: number } } = {};
        
        // Sample points for spatial analysis (more efficient)
        const spatialSampleSize = Math.min(1000, points.length);
        const spatialStep = Math.max(1, Math.floor(points.length / spatialSampleSize));
        const spatialSample = points.filter((_, i) => i % spatialStep === 0);
        
        spatialSample.forEach(p => {
          const latBin = Math.min(latBins - 1, Math.max(0, Math.floor((p.lat - stats.latRange[0]) / latStep)));
          const lonBin = Math.min(lonBins - 1, Math.max(0, Math.floor((p.lon - stats.lonRange[0]) / lonStep)));
          const key = `${latBin},${lonBin}`;
          if (!spatialDistribution[key]) {
            spatialDistribution[key] = { count: 0, avgValue: 0, sumValue: 0, minValue: Infinity, maxValue: -Infinity };
          }
          spatialDistribution[key].count++;
          spatialDistribution[key].sumValue += p.value;
          spatialDistribution[key].minValue = Math.min(spatialDistribution[key].minValue, p.value);
          spatialDistribution[key].maxValue = Math.max(spatialDistribution[key].maxValue, p.value);
        });
        
        // Calculate average values for each spatial bin
        Object.keys(spatialDistribution).forEach(key => {
          const bin = spatialDistribution[key];
          bin.avgValue = bin.sumValue / bin.count;
        });
        
        // Find regions with highest and lowest values (top 3 for efficiency)
        const sortedRegions = Object.entries(spatialDistribution)
          .map(([key, data]) => ({ key, ...data }))
          .sort((a, b) => b.avgValue - a.avgValue);
        
        const topRegions = sortedRegions.slice(0, 3);
        const bottomRegions = sortedRegions.slice(-3).reverse();

        contextualMessage = `You are an expert geospatial data analyst. Provide 100% accurate answers based ONLY on the ACTUAL DATA below.

═══════════════════════════════════════════════════════════════
📊 OPTIMIZED DATASET STATISTICS (PRE-COMPUTED & VERIFIED)
═══════════════════════════════════════════════════════════════

**BASIC INFORMATION:**
- Total Data Points: ${comprehensiveStats.n.toLocaleString()}
- Geographic Coverage: ${comprehensiveStats.coverageArea.toFixed(2)} square degrees
- Point Density: ${comprehensiveStats.pointDensity.toFixed(4)} points/sq°

**GEOGRAPHIC EXTENT:**
- Latitude Range: ${stats.latRange[0].toFixed(4)}° to ${stats.latRange[1].toFixed(4)}° (Span: ${(stats.latRange[1] - stats.latRange[0]).toFixed(4)}°)
- Longitude Range: ${stats.lonRange[0].toFixed(4)}° to ${stats.lonRange[1].toFixed(4)}° (Span: ${(stats.lonRange[1] - stats.lonRange[0]).toFixed(4)}°)

**VALUE STATISTICS (CACHED & VERIFIED):**
- Minimum: ${stats.valueRange[0].toFixed(6)}
- 10th Percentile: ${comprehensiveStats.p10.toFixed(6)}
- Q1 (25th): ${comprehensiveStats.q1.toFixed(6)}
- Median (50th): ${comprehensiveStats.median.toFixed(6)}
- Mean: ${stats.mean.toFixed(6)}
- Q3 (75th): ${comprehensiveStats.q3.toFixed(6)}
- 90th Percentile: ${comprehensiveStats.p90.toFixed(6)}
- Maximum: ${stats.valueRange[1].toFixed(6)}
- Range: ${(stats.valueRange[1] - stats.valueRange[0]).toFixed(6)}
- IQR: ${comprehensiveStats.iqr.toFixed(6)}

**DISPERSION METRICS:**
- Standard Deviation: ${stats.stdDev.toFixed(6)}
- Variance: ${comprehensiveStats.variance.toFixed(6)}
- Coefficient of Variation: ${comprehensiveStats.cv.toFixed(2)}%
- Skewness: ${comprehensiveStats.skewness.toFixed(4)} (${Math.abs(comprehensiveStats.skewness) < 0.5 ? 'Symmetric' : comprehensiveStats.skewness > 0 ? 'Right-skewed' : 'Left-skewed'})
- Kurtosis: ${comprehensiveStats.kurtosis.toFixed(4)} (${Math.abs(comprehensiveStats.kurtosis) < 1 ? 'Normal' : comprehensiveStats.kurtosis > 1 ? 'Heavy-tailed' : 'Light-tailed'})

**OUTLIER ANALYSIS:**
- Outliers (>2σ): ${comprehensiveStats.outlierCount.toLocaleString()} points (${(comprehensiveStats.outlierCount / comprehensiveStats.n * 100).toFixed(2)}%)
- Outlier Threshold: ${comprehensiveStats.outlierThresholdLow.toFixed(4)} to ${comprehensiveStats.outlierThresholdHigh.toFixed(4)}

**TOP 3 HIGHEST VALUE REGIONS (Optimized Grid Analysis):**
${topRegions.map((r, i) => {
  const [latBin, lonBin] = r.key.split(',').map(Number);
  const latCenter = stats.latRange[0] + (latBin + 0.5) * latStep;
  const lonCenter = stats.lonRange[0] + (lonBin + 0.5) * lonStep;
  return `${i + 1}. Region (${latCenter.toFixed(2)}°N, ${lonCenter.toFixed(2)}°E): Avg=${r.avgValue.toFixed(4)}, Max=${r.maxValue.toFixed(4)}, Points=${r.count}`;
}).join('\n')}

**TOP 3 LOWEST VALUE REGIONS (Optimized Grid Analysis):**
${bottomRegions.map((r, i) => {
  const [latBin, lonBin] = r.key.split(',').map(Number);
  const latCenter = stats.latRange[0] + (latBin + 0.5) * latStep;
  const lonCenter = stats.lonRange[0] + (lonBin + 0.5) * lonStep;
  return `${i + 1}. Region (${latCenter.toFixed(2)}°N, ${lonCenter.toFixed(2)}°E): Avg=${r.avgValue.toFixed(4)}, Min=${r.minValue.toFixed(4)}, Points=${r.count}`;
}).join('\n')}

**REPRESENTATIVE SAMPLE DATA (${samplePoints.length} points, optimized sampling):**
${samplePoints.slice(0, 15).map((p, i) => `${i + 1}. Lat=${p.lat.toFixed(4)}°, Lon=${p.lon.toFixed(4)}°, Value=${p.value.toFixed(6)}`).join('\n')}
${samplePoints.length > 15 ? `... and ${samplePoints.length - 15} more sample points` : ''}

═══════════════════════════════════════════════════════════════
❓ USER QUESTION
═══════════════════════════════════════════════════════════════
${userMessage}

═══════════════════════════════════════════════════════════════
📋 RESPONSE REQUIREMENTS (OPTIMIZED FOR EFFICIENCY)
═══════════════════════════════════════════════════════════════
1. Use ONLY the pre-computed data provided above (already verified)
2. Cite specific numbers with precision (e.g., "Mean: 18.453621")
3. Match response complexity to question complexity
4. For simple queries: Direct, concise answers
5. For complex queries: Use chain-of-thought reasoning
6. Use markdown formatting: **bold** for emphasis, bullet points for lists
7. If asked about specific regions, reference the regional analysis above
8. If asked about distribution, reference skewness and kurtosis
9. Always verify your answer against the provided statistics`;
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: contextualMessage }],
    });

    return contents;
  }

  async generateInsights(
    points: DataPoint[],
    stats: any
  ): Promise<AIInsight> {
    return new Promise((resolve, reject) => {
      let fullResponse = '';

      // Calculate comprehensive statistics for 100% accurate insights
      const sortedValues = [...points].map(p => p.value).sort((a, b) => a - b);
      const median = sortedValues[Math.floor(sortedValues.length * 0.5)];
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
      const iqr = q3 - q1;
      const cv = (stats.stdDev / stats.mean) * 100;
      
      // Calculate skewness and kurtosis
      const variance = stats.stdDev * stats.stdDev;
      const n = points.length;
      const sumCubedDev = points.reduce((sum, p) => sum + Math.pow(p.value - stats.mean, 3), 0);
      const sumQuadDev = points.reduce((sum, p) => sum + Math.pow(p.value - stats.mean, 4), 0);
      const skewness = (sumCubedDev / n) / Math.pow(variance, 1.5);
      const kurtosis = (sumQuadDev / n) / (variance * variance) - 3;
      
      // Outlier detection
      const outliers = points.filter(p => Math.abs(p.value - stats.mean) > 2 * stats.stdDev);
      const outlierPercentage = (outliers.length / points.length) * 100;
      
      // Spatial coverage
      const coverageArea = (stats.latRange[1] - stats.latRange[0]) * (stats.lonRange[1] - stats.lonRange[0]);
      const pointDensity = stats.totalPoints / coverageArea;

      const prompt = `You are an expert geospatial data analyst. Analyze this REAL dataset with 100% ACCURACY.

═══════════════════════════════════════════════════════════════
📊 VERIFIED DATASET STATISTICS
═══════════════════════════════════════════════════════════════

**DATASET SIZE & COVERAGE:**
- Total Points: ${stats.totalPoints.toLocaleString()}
- Geographic Coverage: ${coverageArea.toFixed(2)} square degrees
- Point Density: ${pointDensity.toFixed(4)} points/sq°
- Latitude: ${stats.latRange[0].toFixed(4)}° to ${stats.latRange[1].toFixed(4)}° (Span: ${(stats.latRange[1] - stats.latRange[0]).toFixed(4)}°)
- Longitude: ${stats.lonRange[0].toFixed(4)}° to ${stats.lonRange[1].toFixed(4)}° (Span: ${(stats.lonRange[1] - stats.lonRange[0]).toFixed(4)}°)

**VALUE DISTRIBUTION (VERIFIED):**
- Minimum: ${stats.valueRange[0].toFixed(6)}
- Q1 (25th percentile): ${q1.toFixed(6)}
- Median (50th percentile): ${median.toFixed(6)}
- Mean (average): ${stats.mean.toFixed(6)}
- Q3 (75th percentile): ${q3.toFixed(6)}
- Maximum: ${stats.valueRange[1].toFixed(6)}
- Range: ${(stats.valueRange[1] - stats.valueRange[0]).toFixed(6)}
- IQR (Q3-Q1): ${iqr.toFixed(6)}

**VARIABILITY METRICS:**
- Standard Deviation: ${stats.stdDev.toFixed(6)}
- Variance: ${variance.toFixed(6)}
- Coefficient of Variation: ${cv.toFixed(2)}%
- Skewness: ${skewness.toFixed(4)} → ${Math.abs(skewness) < 0.5 ? 'Symmetric distribution' : skewness > 0 ? 'Right-skewed (tail toward high values)' : 'Left-skewed (tail toward low values)'}
- Kurtosis: ${kurtosis.toFixed(4)} → ${Math.abs(kurtosis) < 1 ? 'Normal tail thickness' : kurtosis > 1 ? 'Heavy-tailed (more outliers)' : 'Light-tailed (fewer outliers)'}

**OUTLIER ANALYSIS:**
- Outliers (>2σ from mean): ${outliers.length.toLocaleString()} points (${outlierPercentage.toFixed(2)}% of dataset)
- Outlier Range: Values < ${(stats.mean - 2 * stats.stdDev).toFixed(4)} or > ${(stats.mean + 2 * stats.stdDev).toFixed(4)}

═══════════════════════════════════════════════════════════════
📋 REQUIRED ANALYSIS (100% ACCURACY)
═══════════════════════════════════════════════════════════════

Generate insights based ONLY on the verified statistics above. You MUST:

1. **Summary** (2-3 sentences):
   - Describe dataset size and coverage using EXACT numbers
   - Mention key statistical characteristics (mean, range, distribution)
   - Reference actual values from the data above

2. **Key Findings** (4-6 specific findings):
   - Each finding must cite EXACT numbers from statistics
   - Example: "Dataset contains ${stats.totalPoints.toLocaleString()} points covering ${coverageArea.toFixed(2)} sq°"
   - Example: "Mean value is ${stats.mean.toFixed(4)} with std dev ${stats.stdDev.toFixed(4)}"
   - Include spatial coverage, value distribution, variability, and outliers

3. **Recommendations** (4-6 actionable items):
   - Based on actual data characteristics
   - Reference specific metrics (e.g., "With CV of ${cv.toFixed(2)}%, consider...")
   - Suggest analysis methods appropriate for the distribution shape
   - Mention data quality based on outlier percentage

4. **Anomalies** (2-4 observations):
   - Based on skewness, kurtosis, outliers, or unusual patterns
   - Cite exact numbers (e.g., "${outlierPercentage.toFixed(2)}% outliers detected")
   - If no significant anomalies, state "No significant anomalies detected"

**CRITICAL REQUIREMENTS:**
- Use ONLY the numbers provided above
- Show calculations when relevant
- Be specific and precise
- No generic statements
- Verify all claims against the data

**OUTPUT FORMAT (STRICT JSON):**
{
  "summary": "Dataset contains [exact number] points covering [exact area] square degrees. Mean value is [exact mean] with [distribution description]. [One more key characteristic].",
  "keyFindings": [
    "Dataset spans [exact lat range] latitude and [exact lon range] longitude",
    "Mean value: [exact mean], Median: [exact median], showing [symmetric/skewed] distribution",
    "Standard deviation: [exact stddev], CV: [exact cv]%, indicating [low/moderate/high] variability",
    "Outliers: [exact count] points ([exact percentage]%) beyond 2σ threshold",
    "[Additional finding with exact numbers]"
  ],
  "recommendations": [
    "With [exact metric], recommend [specific action]",
    "Point density of [exact density] suggests [specific recommendation]",
    "Distribution shows [exact characteristic], consider [specific method]",
    "[Additional recommendation based on data]"
  ],
  "anomalies": [
    "Skewness of [exact value] indicates [specific pattern]",
    "Outlier rate of [exact percentage]% is [normal/high/low]",
    "[Additional anomaly with exact numbers]"
  ]
}

**RESPOND WITH VALID JSON ONLY. NO ADDITIONAL TEXT.**`;

      this.streamChat(
        prompt,
        (chunk) => {
          fullResponse += chunk;
        },
        () => {
          try {
            // Extract JSON from response (handle markdown code blocks)
            let jsonStr = fullResponse;
            const codeBlockMatch = fullResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              jsonStr = codeBlockMatch[1];
            } else {
              const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                jsonStr = jsonMatch[0];
              }
            }
            
            const insights = JSON.parse(jsonStr);
            
            // Validate response structure
            if (!insights.summary || !Array.isArray(insights.keyFindings) || 
                !Array.isArray(insights.recommendations) || !Array.isArray(insights.anomalies)) {
              throw new Error('Invalid response structure');
            }
            
            resolve(insights);
          } catch (e) {
            console.error('Failed to parse AI insights:', e);
            // Fallback with actual data
            resolve({
              summary: `Dataset contains ${stats.totalPoints.toLocaleString()} points covering ${coverageArea.toFixed(2)} square degrees. Mean value is ${stats.mean.toFixed(4)} with ${Math.abs(skewness) < 0.5 ? 'symmetric' : 'skewed'} distribution.`,
              keyFindings: [
                `Geographic coverage: ${stats.latRange[0].toFixed(2)}° to ${stats.latRange[1].toFixed(2)}° latitude, ${stats.lonRange[0].toFixed(2)}° to ${stats.lonRange[1].toFixed(2)}° longitude`,
                `Value range: ${stats.valueRange[0].toFixed(4)} to ${stats.valueRange[1].toFixed(4)} (Range: ${(stats.valueRange[1] - stats.valueRange[0]).toFixed(4)})`,
                `Central tendency: Mean=${stats.mean.toFixed(4)}, Median=${median.toFixed(4)}`,
                `Variability: StdDev=${stats.stdDev.toFixed(4)}, CV=${cv.toFixed(2)}%`,
                `Outliers: ${outliers.length} points (${outlierPercentage.toFixed(2)}%) beyond 2σ`,
              ],
              recommendations: [
                `Point density of ${pointDensity.toFixed(4)} points/sq° provides ${pointDensity < 1 ? 'sparse' : pointDensity < 10 ? 'moderate' : 'dense'} coverage`,
                `CV of ${cv.toFixed(2)}% indicates ${cv < 15 ? 'low' : cv < 30 ? 'moderate' : 'high'} variability`,
                `${Math.abs(skewness) < 0.5 ? 'Symmetric distribution suitable for parametric analysis' : 'Skewed distribution - consider non-parametric methods'}`,
                `Outlier rate of ${outlierPercentage.toFixed(2)}% is ${outlierPercentage < 1 ? 'low' : outlierPercentage < 5 ? 'typical' : 'high'} - review data quality`,
              ],
              anomalies: outlierPercentage > 5 
                ? [`High outlier rate: ${outlierPercentage.toFixed(2)}% of data points beyond 2σ threshold`]
                : [`Outlier rate of ${outlierPercentage.toFixed(2)}% is within normal range`],
            });
          }
        },
        (error) => {
          // Fallback with actual calculated data
          resolve({
            summary: `Dataset contains ${stats.totalPoints.toLocaleString()} points covering ${coverageArea.toFixed(2)} square degrees. Mean value is ${stats.mean.toFixed(4)}.`,
            keyFindings: [
              `Total points: ${stats.totalPoints.toLocaleString()}`,
              `Value range: ${stats.valueRange[0].toFixed(4)} to ${stats.valueRange[1].toFixed(4)}`,
              `Mean: ${stats.mean.toFixed(4)}, StdDev: ${stats.stdDev.toFixed(4)}`,
            ],
            recommendations: ['Review the data visualization for patterns'],
            anomalies: [],
          });
        }
      );
    });
  }

  async recommendPlots(points: DataPoint[], stats: any): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let fullResponse = '';

      // Calculate additional metrics for better recommendations
      const sortedValues = [...points].map(p => p.value).sort((a, b) => a - b);
      const median = sortedValues[Math.floor(sortedValues.length * 0.5)];
      const cv = (stats.stdDev / stats.mean) * 100;
      const coverageArea = (stats.latRange[1] - stats.latRange[0]) * (stats.lonRange[1] - stats.lonRange[0]);
      const pointDensity = stats.totalPoints / coverageArea;

      const prompt = `You are a data visualization expert. Based on these VERIFIED dataset characteristics, recommend the top 3 most suitable plot types.

**DATASET CHARACTERISTICS:**
- Total Points: ${stats.totalPoints.toLocaleString()}
- Spatial Coverage: ${coverageArea.toFixed(2)} sq° (Lat: ${stats.latRange[0].toFixed(1)}° to ${stats.latRange[1].toFixed(1)}°, Lon: ${stats.lonRange[0].toFixed(1)}° to ${stats.lonRange[1].toFixed(1)}°)
- Point Density: ${pointDensity.toFixed(4)} points/sq°
- Value Range: ${stats.valueRange[0].toFixed(2)} to ${stats.valueRange[1].toFixed(2)}
- Mean: ${stats.mean.toFixed(2)}, Median: ${median.toFixed(2)}
- Coefficient of Variation: ${cv.toFixed(2)}%

**AVAILABLE PLOT TYPES:**
- heatmap: Best for spatial distribution visualization
- 3d-scatter: Good for 3D spatial patterns
- contour: Excellent for continuous field visualization
- 2d-scatter: Simple lat/lon scatter plot
- profile: For vertical/horizontal cross-sections
- ts-diagram: Temperature-Salinity diagrams
- vertical-section: Depth profiles
- hovmoller: Time-series spatial plots
- ts-density: Density analysis
- water-mass: Water mass classification
- stratification: Vertical stratification

**SELECTION CRITERIA:**
- High point density (>${pointDensity.toFixed(1)} pts/sq°) → heatmap, contour
- Large spatial coverage (>${coverageArea.toFixed(0)} sq°) → heatmap, 3d-scatter
- High variability (CV>${cv.toFixed(0)}%) → contour, 3d-scatter
- Moderate density → 2d-scatter, heatmap

**RESPOND WITH ONLY A JSON ARRAY:**
["plot-type-1", "plot-type-2", "plot-type-3"]

NO ADDITIONAL TEXT. JUST THE JSON ARRAY.`;

      this.streamChat(
        prompt,
        (chunk) => {
          fullResponse += chunk;
        },
        () => {
          try {
            // Extract JSON array from response
            const jsonMatch = fullResponse.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
              const plots = JSON.parse(jsonMatch[0]);
              if (Array.isArray(plots) && plots.length > 0) {
                resolve(plots.slice(0, 3));
                return;
              }
            }
            // Fallback based on actual data characteristics
            const defaultPlots = [];
            if (pointDensity > 1) defaultPlots.push('heatmap');
            if (coverageArea > 1000) defaultPlots.push('3d-scatter');
            defaultPlots.push('contour');
            resolve(defaultPlots.slice(0, 3));
          } catch (e) {
            // Intelligent fallback based on data
            const defaultPlots = [];
            if (pointDensity > 1) defaultPlots.push('heatmap');
            if (stats.totalPoints > 1000) defaultPlots.push('3d-scatter');
            defaultPlots.push('contour');
            resolve(defaultPlots.slice(0, 3));
          }
        },
        (error) => {
          // Fallback recommendations
          resolve(['heatmap', '3d-scatter', 'contour']);
        }
      );
    });
  }

  async detectAnomalies(points: DataPoint[], stats: any): Promise<{ indices: number[]; description: string }> {
    // Detect anomalies using 2 standard deviations threshold
    const anomalyIndices = points
      .map((p, i) => (Math.abs(p.value - stats.mean) > 2 * stats.stdDev ? i : -1))
      .filter(i => i !== -1);
    
    const anomalyPercentage = (anomalyIndices.length / points.length) * 100;
    const lowerBound = stats.mean - 2 * stats.stdDev;
    const upperBound = stats.mean + 2 * stats.stdDev;

    return new Promise((resolve) => {
      let fullResponse = '';

      const prompt = `You are an expert data analyst. Provide a concise explanation (2-3 sentences) of what these anomalies mean.

**ANOMALY DETECTION RESULTS:**
- Dataset Mean: ${stats.mean.toFixed(4)}
- Standard Deviation: ${stats.stdDev.toFixed(4)}
- Anomaly Threshold: Values < ${lowerBound.toFixed(4)} or > ${upperBound.toFixed(4)}
- Anomalies Found: ${anomalyIndices.length.toLocaleString()} points (${anomalyPercentage.toFixed(2)}% of ${stats.totalPoints.toLocaleString()} total)
- Value Range: ${stats.valueRange[0].toFixed(4)} to ${stats.valueRange[1].toFixed(4)}

**TASK:** Explain what ${anomalyPercentage.toFixed(2)}% anomaly rate means for geospatial data quality and analysis. Be specific and reference the actual numbers.

**RESPOND WITH 2-3 SENTENCES ONLY.**`;

      this.streamChat(
        prompt,
        (chunk) => {
          fullResponse += chunk;
        },
        () => {
          const description = fullResponse.trim() || 
            `Detected ${anomalyIndices.length.toLocaleString()} anomalies (${anomalyPercentage.toFixed(2)}% of data) beyond 2σ threshold (${lowerBound.toFixed(4)} to ${upperBound.toFixed(4)}). ${anomalyPercentage < 1 ? 'This is a low rate indicating good data quality.' : anomalyPercentage < 5 ? 'This is within typical range for real-world data.' : 'This is elevated and may indicate data quality issues or genuine extreme values.'}`;
          
          resolve({
            indices: anomalyIndices,
            description,
          });
        },
        () => {
          // Fallback with calculated description
          resolve({
            indices: anomalyIndices,
            description: `Detected ${anomalyIndices.length.toLocaleString()} anomalies (${anomalyPercentage.toFixed(2)}% of data) beyond 2σ threshold. ${anomalyPercentage < 5 ? 'Within normal range for geospatial data.' : 'Elevated rate - review data quality.'}`,
          });
        }
      );
    });
  }

  clearHistory(): void {
    this.conversationHistory = [];
    // Clear caches for fresh start
    this.responseCache.clear();
  }

  // Clear all caches (useful when dataset changes)
  clearCaches(): void {
    this.statsCache.clear();
    this.responseCache.clear();
    this.lastDatasetHash = '';
  }

  getHistory(): Message[] {
    return [...this.conversationHistory];
  }
}

export const aiService = new AIService();
