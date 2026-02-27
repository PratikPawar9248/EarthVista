/**
 * Statistical Analysis Utilities for Ocean Data Visualization
 */

import { DataPoint } from '@/types/heatmap';

export interface Statistics {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  variance: number;
  range: number;
  skewness: number;
  kurtosis: number;
}

export interface SpatialStatistics {
  coverageArea: number; // in square degrees
  pointDensity: number; // points per square degree
  latRange: [number, number];
  lonRange: [number, number];
  centroid: { lat: number; lon: number };
}

export interface DataQuality {
  totalPoints: number;
  validPoints: number;
  invalidPoints: number;
  missingValues: number;
  outliers: number;
  completeness: number; // percentage
  qualityScore: number; // 0-100
}

export function calculateStatistics(values: number[]): Statistics {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Basic stats
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  // Median
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  // Variance and standard deviation
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(variance);

  // Skewness
  const cubedDiffs = values.map(v => Math.pow((v - mean) / stdDev, 3));
  const skewness = cubedDiffs.reduce((a, b) => a + b, 0) / n;

  // Kurtosis
  const fourthDiffs = values.map(v => Math.pow((v - mean) / stdDev, 4));
  const kurtosis = fourthDiffs.reduce((a, b) => a + b, 0) / n - 3;

  return {
    count: n,
    mean,
    median,
    stdDev,
    min,
    max,
    q1,
    q3,
    iqr,
    variance,
    range,
    skewness,
    kurtosis,
  };
}

export function calculateSpatialStatistics(points: DataPoint[]): SpatialStatistics {
  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  // Calculate coverage area (approximate, in square degrees)
  const latSpan = maxLat - minLat;
  const lonSpan = maxLon - minLon;
  const coverageArea = latSpan * lonSpan;

  // Point density
  const pointDensity = coverageArea > 0 ? points.length / coverageArea : 0;

  // Centroid
  const centroidLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const centroidLon = lons.reduce((a, b) => a + b, 0) / lons.length;

  return {
    coverageArea,
    pointDensity,
    latRange: [minLat, maxLat],
    lonRange: [minLon, maxLon],
    centroid: { lat: centroidLat, lon: centroidLon },
  };
}

export function detectOutliers(values: number[], method: 'iqr' | 'zscore' = 'iqr'): number[] {
  if (method === 'iqr') {
    const stats = calculateStatistics(values);
    const lowerBound = stats.q1 - 1.5 * stats.iqr;
    const upperBound = stats.q3 + 1.5 * stats.iqr;
    return values.map((v, i) => (v < lowerBound || v > upperBound) ? i : -1).filter(i => i >= 0);
  } else {
    // Z-score method
    const stats = calculateStatistics(values);
    const threshold = 3;
    return values.map((v, i) => {
      const zScore = Math.abs((v - stats.mean) / stats.stdDev);
      return zScore > threshold ? i : -1;
    }).filter(i => i >= 0);
  }
}

export function assessDataQuality(points: DataPoint[]): DataQuality {
  const totalPoints = points.length;
  let validPoints = 0;
  let invalidPoints = 0;
  let missingValues = 0;

  const values: number[] = [];

  points.forEach(p => {
    if (p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180) {
      if (!Number.isNaN(p.value) && Number.isFinite(p.value)) {
        validPoints++;
        values.push(p.value);
      } else {
        missingValues++;
      }
    } else {
      invalidPoints++;
    }
  });

  const outliers = detectOutliers(values).length;
  const completeness = totalPoints > 0 ? (validPoints / totalPoints) * 100 : 0;

  // Quality score calculation
  const completenessScore = completeness;
  const outlierPenalty = totalPoints > 0 ? (outliers / totalPoints) * 100 : 0;
  const invalidPenalty = totalPoints > 0 ? (invalidPoints / totalPoints) * 100 : 0;
  const qualityScore = Math.max(0, completenessScore - outlierPenalty - invalidPenalty);

  return {
    totalPoints,
    validPoints,
    invalidPoints,
    missingValues,
    outliers,
    completeness,
    qualityScore,
  };
}

export function createHistogram(values: number[], bins: number = 20): { bins: number[]; counts: number[] } {
  const stats = calculateStatistics(values);
  const binWidth = stats.range / bins;
  const binEdges: number[] = [];
  const counts: number[] = new Array(bins).fill(0);

  for (let i = 0; i <= bins; i++) {
    binEdges.push(stats.min + i * binWidth);
  }

  values.forEach(v => {
    const binIndex = Math.min(Math.floor((v - stats.min) / binWidth), bins - 1);
    if (binIndex >= 0 && binIndex < bins) {
      counts[binIndex]++;
    }
  });

  return { bins: binEdges.slice(0, -1), counts };
}

export function filterByValueRange(points: DataPoint[], min: number, max: number): DataPoint[] {
  return points.filter(p => p.value >= min && p.value <= max);
}

export function filterByBoundingBox(
  points: DataPoint[],
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }
): DataPoint[] {
  return points.filter(
    p =>
      p.lat >= bounds.minLat &&
      p.lat <= bounds.maxLat &&
      p.lon >= bounds.minLon &&
      p.lon <= bounds.maxLon
  );
}

export function downsampleData(points: DataPoint[], targetCount: number): DataPoint[] {
  if (points.length <= targetCount) return points;

  const step = Math.floor(points.length / targetCount);
  const downsampled: DataPoint[] = [];

  for (let i = 0; i < points.length; i += step) {
    if (downsampled.length < targetCount) {
      downsampled.push(points[i]);
    }
  }

  return downsampled;
}
