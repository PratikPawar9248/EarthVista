import type { DataPoint } from '@/types/heatmap';

/**
 * Performance optimization utilities for handling large datasets
 */

export interface OptimizationConfig {
  maxPoints: number;
  samplingMethod: 'uniform' | 'random' | 'grid';
  clusteringEnabled: boolean;
  clusterRadius: number;
}

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  maxPoints: 50000, // Maximum points to render
  samplingMethod: 'uniform',
  clusteringEnabled: true,
  clusterRadius: 0.5, // degrees
};

/**
 * Determine if dataset needs optimization
 */
export function needsOptimization(dataSize: number, maxPoints: number = 50000): boolean {
  return dataSize > maxPoints;
}

/**
 * Uniform sampling - take every nth point
 */
export function uniformSample(data: DataPoint[], targetSize: number): DataPoint[] {
  if (data.length <= targetSize) return data;
  
  const step = Math.ceil(data.length / targetSize);
  const sampled: DataPoint[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }
  
  return sampled;
}

/**
 * Random sampling - randomly select points
 */
export function randomSample(data: DataPoint[], targetSize: number): DataPoint[] {
  if (data.length <= targetSize) return data;
  
  const sampled: DataPoint[] = [];
  const indices = new Set<number>();
  
  while (indices.size < targetSize) {
    const randomIndex = Math.floor(Math.random() * data.length);
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      sampled.push(data[randomIndex]);
    }
  }
  
  return sampled;
}

/**
 * Grid-based sampling - divide into grid cells and take representative points
 */
export function gridSample(data: DataPoint[], targetSize: number): DataPoint[] {
  if (data.length <= targetSize) return data;
  
  // Calculate grid dimensions
  const gridSize = Math.ceil(Math.sqrt(targetSize));
  const latStep = 180 / gridSize;
  const lonStep = 360 / gridSize;
  
  // Create grid cells
  const grid = new Map<string, DataPoint[]>();
  
  // Assign points to grid cells
  for (const point of data) {
    const latCell = Math.floor((point.lat + 90) / latStep);
    const lonCell = Math.floor((point.lon + 180) / lonStep);
    const key = `${latCell},${lonCell}`;
    
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(point);
  }
  
  // Take average point from each cell
  const sampled: DataPoint[] = [];
  for (const points of grid.values()) {
    if (points.length === 0) continue;
    
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLon = points.reduce((sum, p) => sum + p.lon, 0) / points.length;
    const avgValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    
    sampled.push({ lat: avgLat, lon: avgLon, value: avgValue });
  }
  
  return sampled;
}

/**
 * Apply sampling based on configuration
 */
export function sampleData(
  data: DataPoint[],
  config: OptimizationConfig
): DataPoint[] {
  if (data.length <= config.maxPoints) return data;
  
  console.log(`Optimizing dataset: ${data.length} points → ${config.maxPoints} points`);
  
  switch (config.samplingMethod) {
    case 'random':
      return randomSample(data, config.maxPoints);
    case 'grid':
      return gridSample(data, config.maxPoints);
    case 'uniform':
    default:
      return uniformSample(data, config.maxPoints);
  }
}

/**
 * Cluster nearby points to reduce rendering load
 */
export function clusterPoints(
  data: DataPoint[],
  radiusDegrees: number = 0.5
): DataPoint[] {
  if (data.length === 0) return data;
  
  const clusters: DataPoint[] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < data.length; i++) {
    if (processed.has(i)) continue;
    
    const point = data[i];
    const cluster: DataPoint[] = [point];
    processed.add(i);
    
    // Find nearby points
    for (let j = i + 1; j < data.length; j++) {
      if (processed.has(j)) continue;
      
      const other = data[j];
      const distance = Math.sqrt(
        Math.pow(point.lat - other.lat, 2) + Math.pow(point.lon - other.lon, 2)
      );
      
      if (distance <= radiusDegrees) {
        cluster.push(other);
        processed.add(j);
      }
    }
    
    // Calculate cluster center
    const avgLat = cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length;
    const avgLon = cluster.reduce((sum, p) => sum + p.lon, 0) / cluster.length;
    const maxValue = Math.max(...cluster.map(p => p.value));
    
    clusters.push({ lat: avgLat, lon: avgLon, value: maxValue });
  }
  
  console.log(`Clustered ${data.length} points into ${clusters.length} clusters`);
  return clusters;
}

/**
 * Process large dataset with optimizations
 */
export function optimizeDataset(
  data: DataPoint[],
  config: OptimizationConfig = DEFAULT_OPTIMIZATION_CONFIG
): { optimized: DataPoint[]; stats: OptimizationStats } {
  const startTime = performance.now();
  const originalSize = data.length;
  
  let optimized = data;
  
  // Apply sampling if needed
  if (needsOptimization(data.length, config.maxPoints)) {
    optimized = sampleData(data, config);
  }
  
  // Apply clustering if enabled
  if (config.clusteringEnabled && optimized.length > 1000) {
    optimized = clusterPoints(optimized, config.clusterRadius);
  }
  
  const endTime = performance.now();
  
  const stats: OptimizationStats = {
    originalSize,
    optimizedSize: optimized.length,
    reductionPercent: ((originalSize - optimized.length) / originalSize) * 100,
    processingTime: endTime - startTime,
    method: config.samplingMethod,
    clustered: config.clusteringEnabled,
  };
  
  return { optimized, stats };
}

export interface OptimizationStats {
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
  processingTime: number;
  method: string;
  clustered: boolean;
}

/**
 * Calculate optimal heatmap radius based on data density
 */
export function calculateOptimalRadius(dataSize: number, zoomLevel: number = 2): number {
  // Base radius
  let radius = 25;
  
  // Adjust based on data size
  if (dataSize > 100000) {
    radius = 15;
  } else if (dataSize > 50000) {
    radius = 20;
  } else if (dataSize > 10000) {
    radius = 25;
  } else {
    radius = 30;
  }
  
  // Adjust based on zoom level
  radius = radius * (zoomLevel / 2);
  
  return Math.max(10, Math.min(50, radius));
}

/**
 * Chunk large array processing to avoid blocking UI
 */
export async function processInChunks<T, R>(
  data: T[],
  processor: (chunk: T[]) => R[],
  chunkSize: number = 10000,
  onProgress?: (progress: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const totalChunks = Math.ceil(data.length / chunkSize);
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const chunkResults = processor(chunk);
    results.push(...chunkResults);
    
    if (onProgress) {
      const progress = Math.min(100, ((i + chunkSize) / data.length) * 100);
      onProgress(progress);
    }
    
    // Yield to browser to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
}

/**
 * Estimate memory usage of dataset
 */
export function estimateMemoryUsage(dataSize: number): {
  bytes: number;
  megabytes: number;
  readable: string;
} {
  // Each DataPoint has 3 numbers (lat, lon, value) = 24 bytes (8 bytes per number)
  const bytes = dataSize * 24;
  const megabytes = bytes / (1024 * 1024);
  
  let readable: string;
  if (megabytes < 1) {
    readable = `${(bytes / 1024).toFixed(2)} KB`;
  } else if (megabytes < 1024) {
    readable = `${megabytes.toFixed(2)} MB`;
  } else {
    readable = `${(megabytes / 1024).toFixed(2)} GB`;
  }
  
  return { bytes, megabytes, readable };
}

/**
 * Get performance recommendation based on dataset size
 */
export function getPerformanceRecommendation(dataSize: number): {
  level: 'excellent' | 'good' | 'moderate' | 'poor';
  message: string;
  shouldOptimize: boolean;
} {
  if (dataSize <= 10000) {
    return {
      level: 'excellent',
      message: 'Dataset size is optimal for smooth performance',
      shouldOptimize: false,
    };
  } else if (dataSize <= 50000) {
    return {
      level: 'good',
      message: 'Dataset size is manageable, performance should be good',
      shouldOptimize: false,
    };
  } else if (dataSize <= 100000) {
    return {
      level: 'moderate',
      message: 'Large dataset detected. Optimization recommended for better performance',
      shouldOptimize: true,
    };
  } else {
    return {
      level: 'poor',
      message: 'Very large dataset detected. Optimization strongly recommended',
      shouldOptimize: true,
    };
  }
}
