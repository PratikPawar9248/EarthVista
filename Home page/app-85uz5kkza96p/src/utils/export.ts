/**
 * Data Export Utilities
 * Support for CSV, PNG, GeoTIFF, and PDF exports
 */

import { DataPoint } from '@/types/heatmap';
import { Statistics, SpatialStatistics } from './statistics';

// Re-export enhanced PDF function
export { exportToEnhancedPDF } from './exportEnhanced';

export function exportToCSV(points: DataPoint[], filename: string = 'data.csv'): void {
  const headers = ['latitude', 'longitude', 'value'];
  const rows = points.map(p => [p.lat, p.lon, p.value].join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function exportToJSON(data: any, filename: string = 'data.json'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function exportMapAsPNG(elementId: string, filename: string = 'map.png'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  // Use html2canvas for capturing
  import('html2canvas').then(({ default: html2canvas }) => {
    html2canvas(element, {
      backgroundColor: '#0a1128',
      scale: 2, // Higher quality
      logging: false,
    }).then(canvas => {
      canvas.toBlob(blob => {
        if (blob) {
          downloadBlob(blob, filename);
        }
      }, 'image/png');
    });
  }).catch(err => {
    console.error('Failed to export PNG:', err);
  });
}

export function exportStatisticsReport(
  stats: Statistics,
  spatialStats: SpatialStatistics,
  filename: string = 'statistics.txt'
): void {
  const report = `
GEOSPATIAL DATA STATISTICS REPORT
Generated: ${new Date().toISOString()}

=== VALUE STATISTICS ===
Count:              ${stats.count}
Mean:               ${stats.mean.toFixed(4)}
Median:             ${stats.median.toFixed(4)}
Std Deviation:      ${stats.stdDev.toFixed(4)}
Variance:           ${stats.variance.toFixed(4)}
Min:                ${stats.min.toFixed(4)}
Max:                ${stats.max.toFixed(4)}
Range:              ${stats.range.toFixed(4)}
Q1 (25th percentile): ${stats.q1.toFixed(4)}
Q3 (75th percentile): ${stats.q3.toFixed(4)}
IQR:                ${stats.iqr.toFixed(4)}
Skewness:           ${stats.skewness.toFixed(4)}
Kurtosis:           ${stats.kurtosis.toFixed(4)}

=== SPATIAL STATISTICS ===
Coverage Area:      ${spatialStats.coverageArea.toFixed(2)} sq degrees
Point Density:      ${spatialStats.pointDensity.toFixed(2)} points/sq degree
Latitude Range:     ${spatialStats.latRange[0].toFixed(4)} to ${spatialStats.latRange[1].toFixed(4)}
Longitude Range:    ${spatialStats.lonRange[0].toFixed(4)} to ${spatialStats.lonRange[1].toFixed(4)}
Centroid:           (${spatialStats.centroid.lat.toFixed(4)}, ${spatialStats.centroid.lon.toFixed(4)})
`;

  const blob = new Blob([report], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

export async function exportToPDF(
  datasetName: string,
  stats: Statistics,
  spatialStats: SpatialStatistics,
  dataQuality?: any,
  dataPoints?: DataPoint[],
  mapImageUrl?: string,
  filename: string = 'report.pdf'
): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    let currentPage = 1;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const marginBottom = 20;
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Color palette (RGB)
    const colors = {
      primary: [41, 128, 185],      // Professional blue
      secondary: [52, 152, 219],    // Light blue
      success: [39, 174, 96],       // Green
      warning: [243, 156, 18],      // Orange
      danger: [231, 76, 60],        // Red
      dark: [44, 62, 80],           // Dark blue-gray
      light: [236, 240, 241],       // Light gray
      accent: [155, 89, 182],       // Purple
      text: [52, 73, 94],           // Dark text
      textLight: [127, 140, 141],   // Light text
    };

    // Helper function to draw colored box
    const drawBox = (x: number, y: number, width: number, height: number, color: number[], opacity: number = 0.1) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.rect(x, y, width, height, 'FD');
    };

    // Helper function to draw section header with colored bar
    const drawSectionHeader = (title: string, y: number, color: number[]): number => {
      // Draw colored bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(marginLeft, y, 5, 8, 'F');
      
      // Draw title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, marginLeft + 8, y + 6);
      
      // Draw underline
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.5);
      doc.line(marginLeft, y + 10, pageWidth - marginRight, y + 10);
      
      // Reset colors
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setLineWidth(0.2);
      
      return y + 15;
    };

    // Helper function to check if we need a new page
    const checkPageBreak = (currentY: number, spaceNeeded: number = 20): number => {
      if (currentY + spaceNeeded > pageHeight - marginBottom) {
        doc.addPage();
        currentPage++;
        return 25; // Reset to top of new page with margin
      }
      return currentY;
    };

    // Helper function to draw key-value pair with optional color
    const drawKeyValue = (key: string, value: string, y: number, color?: number[]): number => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(key, marginLeft + 5, y);
      
      doc.setFont('helvetica', 'normal');
      if (color) {
        doc.setTextColor(color[0], color[1], color[2]);
      }
      doc.text(value, marginLeft + 80, y);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      
      return y + 6;
    };

    // ===== COVER PAGE =====
    // Background gradient effect (simulated with rectangles)
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(0, 80, pageWidth, 40, 'F');

    // Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GEOSPATIAL DATA', 105, 40, { align: 'center' });
    doc.text('ANALYSIS REPORT', 105, 55, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprehensive Statistical & Spatial Analysis', 105, 70, { align: 'center' });
    
    // Platform name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Geospatial Heatmap Visualization Platform', 105, 100, { align: 'center' });

    // Reset text color
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    // Dataset Information Box
    let y = 130;
    drawBox(marginLeft, y, contentWidth, 50, colors.primary, 0.05);
    
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('Dataset Information', marginLeft + 5, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    y += 10;
    y = drawKeyValue('Dataset Name:', datasetName, y);
    y = drawKeyValue('Report Generated:', new Date().toLocaleString(), y);
    y = drawKeyValue('Total Data Points:', stats.count.toLocaleString(), y);
    
    if (dataPoints && dataPoints.length > 0) {
      y = drawKeyValue('Sample Size:', dataPoints.length.toLocaleString(), y);
    }

    // Executive Summary Box
    y = checkPageBreak(y, 70);
    y += 10;
    drawBox(marginLeft, y, contentWidth, 60, colors.accent, 0.05);
    
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text('Executive Summary', marginLeft + 5, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const summaryText = `This comprehensive report provides detailed statistical and spatial analysis of the ${datasetName} dataset. The analysis includes ${stats.count.toLocaleString()} data points covering a geographic area of ${spatialStats.coverageArea.toFixed(2)} square degrees. `;
    const summaryLines = doc.splitTextToSize(summaryText, contentWidth - 10);
    doc.text(summaryLines, marginLeft + 5, y);
    y += summaryLines.length * 5;
    
    y += 5;
    const qualityText = dataQuality 
      ? `Data quality assessment shows ${dataQuality.completeness.toFixed(1)}% completeness with a quality score of ${dataQuality.qualityScore.toFixed(1)}/100. The dataset demonstrates ${Math.abs(stats.skewness) < 0.5 ? 'symmetric' : stats.skewness > 0 ? 'right-skewed' : 'left-skewed'} distribution characteristics.`
      : 'Statistical analysis reveals comprehensive insights into data distribution and spatial patterns.';
    const qualityLines = doc.splitTextToSize(qualityText, contentWidth - 10);
    doc.text(qualityLines, marginLeft + 5, y);

    // Table of Contents
    y = checkPageBreak(y + 30, 80);
    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('Table of Contents', marginLeft, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tocItems = [
      '1. Descriptive Statistics Analysis',
      '2. Spatial Distribution Analysis',
      '3. Data Quality Assessment',
      '4. Data Sample & Verification',
      '5. Statistical Interpretation & Insights',
      '6. Distribution Analysis',
      '7. Spatial Visualization',
    ];
    
    tocItems.forEach(item => {
      doc.text(item, marginLeft + 5, y);
      y += 7;
    });

    // ===== SECTION 1: DESCRIPTIVE STATISTICS =====
    doc.addPage();
    currentPage++;
    y = 25;
    y = drawSectionHeader('1. Descriptive Statistics Analysis', y, colors.primary);
    
    // Introduction text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const statsIntro = `Descriptive statistics provide a comprehensive summary of the dataset's central tendency, dispersion, and shape. These metrics help understand the overall characteristics and distribution patterns of the ${stats.count.toLocaleString()} data points.`;
    const statsIntroLines = doc.splitTextToSize(statsIntro, contentWidth);
    doc.text(statsIntroLines, marginLeft, y);
    y += statsIntroLines.length * 5 + 5;

    // Central Tendency Measures
    y = checkPageBreak(y, 50);
    drawBox(marginLeft, y, contentWidth, 45, colors.success, 0.05);
    y += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.text('Central Tendency Measures', marginLeft + 5, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    y = drawKeyValue('Mean (Average):', stats.mean.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('The arithmetic average of all values, representing the central point of the dataset.', marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    doc.setFontSize(9);
    y = drawKeyValue('Median (Q2):', stats.median.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('The middle value when data is sorted, less affected by outliers than the mean.', marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    // Dispersion Measures
    y = checkPageBreak(y, 60);
    y += 5;
    drawBox(marginLeft, y, contentWidth, 55, colors.warning, 0.05);
    y += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    doc.text('Dispersion & Variability Measures', marginLeft + 5, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    y += 8;
    
    doc.setFontSize(9);
    y = drawKeyValue('Standard Deviation:', stats.stdDev.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('Measures the average distance of data points from the mean. Lower values indicate', marginLeft + 10, y);
    y += 4;
    doc.text('data clustered near the mean; higher values indicate more spread.', marginLeft + 10, y);
    y += 6;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    doc.setFontSize(9);
    y = drawKeyValue('Variance:', stats.variance.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('Square of standard deviation, representing the average squared deviation from mean.', marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    doc.setFontSize(9);
    y = drawKeyValue('Coefficient of Variation:', `${((stats.stdDev / stats.mean) * 100).toFixed(2)}%`, y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('Relative measure of dispersion, useful for comparing variability across datasets.', marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    // Range & Extremes
    y = checkPageBreak(y, 50);
    y += 5;
    drawBox(marginLeft, y, contentWidth, 45, colors.danger, 0.05);
    y += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.text('Range & Extreme Values', marginLeft + 5, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    y += 8;
    
    doc.setFontSize(9);
    y = drawKeyValue('Minimum Value:', stats.min.toFixed(6), y, colors.primary);
    y = drawKeyValue('Maximum Value:', stats.max.toFixed(6), y, colors.primary);
    y = drawKeyValue('Range:', stats.range.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('The range represents the span between minimum and maximum values, indicating', marginLeft + 10, y);
    y += 4;
    doc.text('the total spread of the dataset.', marginLeft + 10, y);
    y += 6;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    // Quartiles & IQR
    y = checkPageBreak(y, 55);
    y += 5;
    drawBox(marginLeft, y, contentWidth, 50, colors.accent, 0.05);
    y += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text('Quartiles & Interquartile Range', marginLeft + 5, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    y += 8;
    
    doc.setFontSize(9);
    y = drawKeyValue('Q1 (25th Percentile):', stats.q1.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('25% of data points fall below this value.', marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    doc.setFontSize(9);
    y = drawKeyValue('Q3 (75th Percentile):', stats.q3.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('75% of data points fall below this value.', marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    doc.setFontSize(9);
    y = drawKeyValue('IQR (Q3 - Q1):', stats.iqr.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('Contains the middle 50% of data, robust measure of spread resistant to outliers.', marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    // Distribution Shape
    y = checkPageBreak(y, 50);
    y += 5;
    drawBox(marginLeft, y, contentWidth, 45, colors.secondary, 0.05);
    y += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text('Distribution Shape Characteristics', marginLeft + 5, y);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    y += 8;
    
    doc.setFontSize(9);
    y = drawKeyValue('Skewness:', stats.skewness.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    const skewInterpretation = Math.abs(stats.skewness) < 0.5 
      ? 'Approximately symmetric distribution (balanced around mean).'
      : stats.skewness > 0 
        ? 'Right-skewed (positive skew): tail extends toward higher values.'
        : 'Left-skewed (negative skew): tail extends toward lower values.';
    doc.text(skewInterpretation, marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    doc.setFontSize(9);
    y = drawKeyValue('Kurtosis:', stats.kurtosis.toFixed(6), y, colors.primary);
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    const kurtInterpretation = Math.abs(stats.kurtosis) < 1
      ? 'Normal distribution (mesokurtic): moderate tail thickness.'
      : stats.kurtosis > 1
        ? 'Heavy-tailed (leptokurtic): more outliers than normal distribution.'
        : 'Light-tailed (platykurtic): fewer outliers than normal distribution.';
    doc.text(kurtInterpretation, marginLeft + 10, y);
    y += 5;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Value Statistics', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const valueStats = [
      ['Count', stats.count.toLocaleString()],
      ['Mean', stats.mean.toFixed(6)],
      ['Median', stats.median.toFixed(6)],
      ['Standard Deviation', stats.stdDev.toFixed(6)],
      ['Variance', stats.variance.toFixed(6)],
      ['Minimum Value', stats.min.toFixed(6)],
      ['Maximum Value', stats.max.toFixed(6)],
      ['Range', stats.range.toFixed(6)],
      ['Q1 (25th Percentile)', stats.q1.toFixed(6)],
      ['Q2 (50th Percentile)', stats.median.toFixed(6)],
      ['Q3 (75th Percentile)', stats.q3.toFixed(6)],
      ['Interquartile Range (IQR)', stats.iqr.toFixed(6)],
      ['Skewness', stats.skewness.toFixed(6)],
      ['Kurtosis', stats.kurtosis.toFixed(6)],
    ];

    valueStats.forEach(([label, value]) => {
      y = checkPageBreak(y, 7);
      doc.text(`${label}:`, 25, y);
      doc.text(value, 100, y);
      y += 6;
    });

    // ===== SPATIAL STATISTICS (COMPLETE) =====
    y = checkPageBreak(y, 60);
    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Spatial Statistics', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const spatialStatsData = [
      ['Coverage Area', `${spatialStats.coverageArea.toFixed(4)} square degrees`],
      ['Point Density', `${spatialStats.pointDensity.toFixed(4)} points per sq degree`],
      ['Latitude Range', `${spatialStats.latRange[0].toFixed(6)}° to ${spatialStats.latRange[1].toFixed(6)}°`],
      ['Longitude Range', `${spatialStats.lonRange[0].toFixed(6)}° to ${spatialStats.lonRange[1].toFixed(6)}°`],
      ['Centroid Latitude', `${spatialStats.centroid.lat.toFixed(6)}°`],
      ['Centroid Longitude', `${spatialStats.centroid.lon.toFixed(6)}°`],
      ['Spatial Extent (Lat)', `${(spatialStats.latRange[1] - spatialStats.latRange[0]).toFixed(4)}°`],
      ['Spatial Extent (Lon)', `${(spatialStats.lonRange[1] - spatialStats.lonRange[0]).toFixed(4)}°`],
    ];

    spatialStatsData.forEach(([label, value]) => {
      y = checkPageBreak(y, 7);
      doc.text(`${label}:`, 25, y);
      doc.text(value, 100, y);
      y += 6;
    });

    // ===== DATA QUALITY METRICS =====
    if (dataQuality) {
      y = checkPageBreak(y, 60);
      y += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Quality Assessment', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const qualityStats = [
        ['Total Points', dataQuality.totalPoints.toLocaleString()],
        ['Valid Points', dataQuality.validPoints.toLocaleString()],
        ['Invalid Points', dataQuality.invalidPoints.toLocaleString()],
        ['Missing Values', dataQuality.missingValues.toLocaleString()],
        ['Outliers Detected', dataQuality.outliers.toLocaleString()],
        ['Data Completeness', `${dataQuality.completeness.toFixed(2)}%`],
        ['Quality Score', `${dataQuality.qualityScore.toFixed(2)}/100`],
      ];

      qualityStats.forEach(([label, value]) => {
        y = checkPageBreak(y, 7);
        doc.text(`${label}:`, 25, y);
        doc.text(value, 100, y);
        y += 6;
      });
    }

    // ===== DATA SAMPLE =====
    if (dataPoints && dataPoints.length > 0) {
      y = checkPageBreak(y, 80);
      y += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Sample (First 20 Points)', 20, y);
      y += 10;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      // Table header
      y = checkPageBreak(y, 10);
      doc.text('Index', 25, y);
      doc.text('Latitude', 50, y);
      doc.text('Longitude', 85, y);
      doc.text('Value', 130, y);
      y += 5;
      
      // Draw header line
      doc.line(20, y, 190, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      
      // Show first 20 data points
      const sampleSize = Math.min(20, dataPoints.length);
      for (let i = 0; i < sampleSize; i++) {
        y = checkPageBreak(y, 7);
        const point = dataPoints[i];
        doc.text(`${i + 1}`, 25, y);
        doc.text(point.lat.toFixed(6), 50, y);
        doc.text(point.lon.toFixed(6), 85, y);
        doc.text(point.value.toFixed(6), 130, y);
        y += 6;
      }
      
      if (dataPoints.length > 20) {
        y = checkPageBreak(y, 10);
        y += 5;
        doc.setFont('helvetica', 'italic');
        doc.text(`... and ${(dataPoints.length - 20).toLocaleString()} more data points`, 25, y);
      }
    }

    // ===== STATISTICAL INTERPRETATION =====
    y = checkPageBreak(y, 80);
    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistical Interpretation', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Distribution analysis
    const skewnessInterpretation = 
      Math.abs(stats.skewness) < 0.5 ? 'approximately symmetric' :
      stats.skewness > 0 ? 'right-skewed (positive skew)' : 'left-skewed (negative skew)';
    
    const kurtosisInterpretation = 
      Math.abs(stats.kurtosis) < 1 ? 'normal distribution' :
      stats.kurtosis > 1 ? 'heavy-tailed (leptokurtic)' : 'light-tailed (platykurtic)';
    
    doc.text('Distribution Shape:', 25, y);
    y += 6;
    doc.text(`• Skewness: ${skewnessInterpretation}`, 30, y);
    y += 6;
    doc.text(`• Kurtosis: ${kurtosisInterpretation}`, 30, y);
    y += 10;
    
    doc.text('Data Spread:', 25, y);
    y += 6;
    doc.text(`• Coefficient of Variation: ${((stats.stdDev / stats.mean) * 100).toFixed(2)}%`, 30, y);
    y += 6;
    doc.text(`• 68% of data falls within: ${(stats.mean - stats.stdDev).toFixed(4)} to ${(stats.mean + stats.stdDev).toFixed(4)}`, 30, y);
    y += 6;
    doc.text(`• 95% of data falls within: ${(stats.mean - 2 * stats.stdDev).toFixed(4)} to ${(stats.mean + 2 * stats.stdDev).toFixed(4)}`, 30, y);

    // Add map image if provided
    if (mapImageUrl) {
      doc.addPage();
      currentPage++;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Spatial Visualization', 20, 20);
      try {
        doc.addImage(mapImageUrl, 'PNG', 10, 30, 190, 140);
      } catch (err) {
        console.error('Failed to add image to PDF:', err);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Map visualization could not be included', 20, 100);
      }
    }

    // ===== FOOTER ON ALL PAGES =====
    const totalPages = currentPage;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Page ${i} of ${totalPages} | Generated by Geospatial Heatmap Visualization Platform`,
        105,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(filename);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    throw err;
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateShareableLink(datasetId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}?dataset=${datasetId}`;
}

export function generateEmbedCode(datasetId: string, width: number = 800, height: number = 600): string {
  const url = generateShareableLink(datasetId);
  return `<iframe src="${url}" width="${width}" height="${height}" frameborder="0"></iframe>`;
}
