/**
 * Enhanced PDF Export with Clean White Background
 * Features: White paper, Colored fonts, Professional formatting
 */

import { DataPoint } from '@/types/heatmap';
import { Statistics, SpatialStatistics } from './statistics';

// Color palette for text (on white background)
const COLORS = {
  primary: [41, 128, 185] as [number, number, number],      // Professional blue
  secondary: [52, 152, 219] as [number, number, number],    // Light blue
  success: [39, 174, 96] as [number, number, number],       // Green
  warning: [243, 156, 18] as [number, number, number],      // Orange
  danger: [231, 76, 60] as [number, number, number],        // Red
  accent: [155, 89, 182] as [number, number, number],       // Purple
  dark: [44, 62, 80] as [number, number, number],           // Dark blue-gray
  text: [52, 73, 94] as [number, number, number],           // Dark text
  textLight: [127, 140, 141] as [number, number, number],   // Light text
};

export async function exportToEnhancedPDF(
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
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF() as any;
    let currentPage = 1;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    // Helper: Draw section header with colored text and underline
    const drawSectionHeader = (title: string, y: number, color: [number, number, number]): number => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(title, margin, y);
      
      // Underline
      doc.setDrawColor(...color);
      doc.setLineWidth(0.5);
      const textWidth = doc.getTextWidth(title);
      doc.line(margin, y + 2, margin + textWidth, y + 2);
      
      // Reset
      doc.setTextColor(...COLORS.text);
      doc.setLineWidth(0.2);
      
      return y + 12;
    };

    // ===== COVER PAGE (CLEAN WHITE) =====
    // Title
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('GEOSPATIAL DATA', pageWidth / 2, 50, { align: 'center' });
    doc.text('ANALYSIS REPORT', pageWidth / 2, 68, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.secondary);
    doc.text('Comprehensive Statistical & Spatial Analysis', pageWidth / 2, 85, { align: 'center' });
    
    // Decorative line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(margin + 30, 95, pageWidth - margin - 30, 95);
    
    // Platform name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.textLight);
    doc.text('Geospatial Heatmap Visualization Platform', pageWidth / 2, 105, { align: 'center' });

    // Dataset Information
    let y = 130;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Dataset Information', margin, y);
    doc.setDrawColor(...COLORS.primary);
    doc.line(margin, y + 2, margin + 60, y + 2);
    
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.text('Dataset Name:', margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(datasetName, margin + 35, y);
    
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.text('Report Generated:', margin, y);
    doc.setTextColor(...COLORS.textLight);
    doc.text(new Date().toLocaleString(), margin + 40, y);
    
    y += 8;
    doc.setTextColor(...COLORS.text);
    doc.text('Total Data Points:', margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.success);
    doc.text(stats.count.toLocaleString(), margin + 40, y);

    // Executive Summary
    y += 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text('Executive Summary', margin, y);
    doc.setDrawColor(...COLORS.accent);
    doc.line(margin, y + 2, margin + 60, y + 2);
    
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const summary = `This comprehensive report provides detailed statistical and spatial analysis of the ${datasetName} dataset containing ${stats.count.toLocaleString()} data points across ${spatialStats.coverageArea.toFixed(2)} square degrees. ${dataQuality ? `Data quality assessment shows ${dataQuality.completeness.toFixed(1)}% completeness with a quality score of ${dataQuality.qualityScore.toFixed(1)}/100.` : ''} The analysis includes descriptive statistics, spatial distribution patterns, data quality metrics, and expert interpretations.`;
    const summaryLines = doc.splitTextToSize(summary, contentWidth);
    doc.text(summaryLines, margin, y);

    // Table of Contents
    y += summaryLines.length * 5 + 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Table of Contents', margin, y);
    doc.setDrawColor(...COLORS.primary);
    doc.line(margin, y + 2, margin + 55, y + 2);
    
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const toc = [
      'Executive Summary & Key Findings',
      'Dataset Overview & Metadata',
      'Comprehensive Statistical Analysis',
      'Spatial Distribution & Geographic Coverage',
      'Data Quality & Completeness Assessment',
      'Distribution Analysis & Normality Tests',
      'Data Sample & Verification',
      'Expert Insights & Recommendations',
      'Spatial Visualization',
    ];
    
    toc.forEach((item, idx) => {
      doc.setTextColor(...COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}.`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.text(item, margin + 8, y);
      y += 7;
    });

    // ===== PAGE 2: EXECUTIVE SUMMARY =====
    doc.addPage();
    currentPage++;
    y = 25;
    y = drawSectionHeader('1. Executive Summary & Key Findings', y, COLORS.primary);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const execIntro = `This comprehensive report provides a detailed analysis of the geospatial dataset, including statistical metrics, spatial distribution patterns, data quality assessment, and expert recommendations for data interpretation and usage.`;
    const execIntroLines = doc.splitTextToSize(execIntro, contentWidth);
    doc.text(execIntroLines, margin, y);
    y += execIntroLines.length * 5 + 10;

    // Key Findings Box
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Key Findings', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    
    const keyFindings = [
      `Dataset contains ${dataPoints?.length.toLocaleString() || 'N/A'} geospatial data points`,
      `Value range: ${stats.min.toFixed(4)} to ${stats.max.toFixed(4)} (Range: ${stats.range.toFixed(4)})`,
      `Mean value: ${stats.mean.toFixed(4)} ± ${stats.stdDev.toFixed(4)} (Standard Deviation)`,
      `Coefficient of Variation: ${((stats.stdDev / stats.mean) * 100).toFixed(2)}% (${((stats.stdDev / stats.mean) * 100) < 30 ? 'Low variability' : ((stats.stdDev / stats.mean) * 100) < 60 ? 'Moderate variability' : 'High variability'})`,
      `Spatial coverage: ${spatialStats.coverageArea.toFixed(2)}° area`,
      `Data quality score: ${dataQuality ? dataQuality.qualityScore.toFixed(1) : 'N/A'}%`,
    ];

    keyFindings.forEach((finding, idx) => {
      doc.setTextColor(...COLORS.primary);
      doc.text(`${idx + 1}.`, margin, y);
      doc.setTextColor(...COLORS.text);
      const findingLines = doc.splitTextToSize(finding, contentWidth - 10);
      doc.text(findingLines, margin + 8, y);
      y += findingLines.length * 5 + 3;
    });

    y += 5;

    // Statistical Summary Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Quick Statistical Overview', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Metric', 'Value']],
      body: [
        ['Central Tendency', 'Mean', stats.mean.toFixed(6)],
        ['', 'Median', stats.median.toFixed(6)],
        ['Dispersion', 'Standard Deviation', stats.stdDev.toFixed(6)],
        ['', 'Variance', stats.variance.toFixed(6)],
        ['', 'Coefficient of Variation', `${((stats.stdDev / stats.mean) * 100).toFixed(2)}%`],
        ['Range', 'Minimum', stats.min.toFixed(6)],
        ['', 'Maximum', stats.max.toFixed(6)],
        ['', 'Range', stats.range.toFixed(6)],
        ['Distribution', 'Skewness', stats.skewness.toFixed(4)],
        ['', 'Kurtosis', stats.kurtosis.toFixed(4)],
        ['Spatial', 'Coverage Area', `${spatialStats.coverageArea.toFixed(2)}°²`],
        ['', 'Point Density', `${spatialStats.pointDensity.toFixed(2)} pts/°²`],
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.primary,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.primary
      },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, textColor: COLORS.secondary },
        1: { cellWidth: 55, textColor: COLORS.primary },
        2: { cellWidth: 'auto', halign: 'right', textColor: COLORS.accent },
      },
    });

    // ===== PAGE 3: DATASET OVERVIEW =====
    doc.addPage();
    currentPage++;
    y = 25;
    y = drawSectionHeader('2. Dataset Overview & Metadata', y, COLORS.secondary);

    doc.setFontSize(10);
    const metaIntro = `Comprehensive metadata and overview of the dataset structure, including data dimensions, geographic extent, and temporal characteristics.`;
    const metaIntroLines = doc.splitTextToSize(metaIntro, contentWidth);
    doc.text(metaIntroLines, margin, y);
    y += metaIntroLines.length * 5 + 10;

    // Dataset Information Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text('Dataset Information', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Property', 'Value', 'Description']],
      body: [
        ['Dataset Name', filename || 'Geospatial Dataset', 'Name of the uploaded dataset'],
        ['Total Data Points', dataPoints?.length.toLocaleString() || 'N/A', 'Number of valid geospatial records'],
        ['Valid Points', (dataQuality?.validPoints || dataPoints?.length || 0).toLocaleString(), 'Points with valid coordinates and values'],
        ['Invalid Points', (dataQuality?.invalidPoints || 0).toLocaleString(), 'Points with missing or invalid data'],
        ['Data Completeness', `${(dataQuality?.completeness || 100).toFixed(2)}%`, 'Percentage of complete records'],
        ['Generation Date', new Date().toLocaleDateString(), 'Report generation timestamp'],
        ['Data Dimensions', '3D (Lat, Lon, Value)', 'Spatial coordinates with measured values'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.secondary,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.secondary
      },
      styles: { fontSize: 10, cellPadding: 3, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.primary },
        1: { cellWidth: 45, halign: 'right', textColor: COLORS.secondary },
        2: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Geographic Extent Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text('Geographic Extent & Boundaries', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Dimension', 'Minimum', 'Maximum', 'Range', 'Center']],
      body: [
        [
          'Latitude (°N)',
          spatialStats.latRange[0].toFixed(6),
          spatialStats.latRange[1].toFixed(6),
          (spatialStats.latRange[1] - spatialStats.latRange[0]).toFixed(6),
          spatialStats.centroid.lat.toFixed(6)
        ],
        [
          'Longitude (°E)',
          spatialStats.lonRange[0].toFixed(6),
          spatialStats.lonRange[1].toFixed(6),
          (spatialStats.lonRange[1] - spatialStats.lonRange[0]).toFixed(6),
          spatialStats.centroid.lon.toFixed(6)
        ],
        [
          'Value',
          stats.min.toFixed(6),
          stats.max.toFixed(6),
          stats.range.toFixed(6),
          stats.mean.toFixed(6)
        ],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.accent,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.accent
      },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, textColor: COLORS.primary },
        1: { cellWidth: 35, halign: 'right', textColor: COLORS.success },
        2: { cellWidth: 35, halign: 'right', textColor: COLORS.danger },
        3: { cellWidth: 30, halign: 'right', textColor: COLORS.warning },
        4: { cellWidth: 'auto', halign: 'right', textColor: COLORS.secondary },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Coverage Statistics
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text('Spatial Coverage Statistics', margin, y);
    y += 8;

    const latSpan = spatialStats.latRange[1] - spatialStats.latRange[0];
    const lonSpan = spatialStats.lonRange[1] - spatialStats.lonRange[0];

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Unit', 'Interpretation']],
      body: [
        ['Coverage Area', spatialStats.coverageArea.toFixed(2), 'Square Degrees', 'Total geographic area covered'],
        ['Point Density', spatialStats.pointDensity.toFixed(4), 'Points/°²', 'Average data points per square degree'],
        ['Latitudinal Span', latSpan.toFixed(4), 'Degrees', 'North-South extent'],
        ['Longitudinal Span', lonSpan.toFixed(4), 'Degrees', 'East-West extent'],
        ['Aspect Ratio', (lonSpan / latSpan).toFixed(4), 'Ratio', 'Width to height proportion'],
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.accent,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.accent
      },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, textColor: COLORS.primary },
        1: { cellWidth: 30, halign: 'right', textColor: COLORS.accent },
        2: { cellWidth: 30, textColor: COLORS.textLight },
        3: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    // ===== PAGE 4: COMPREHENSIVE STATISTICAL ANALYSIS =====
    doc.addPage();
    currentPage++;
    y = 25;
    y = drawSectionHeader('3. Comprehensive Statistical Analysis', y, COLORS.primary);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const intro = `Descriptive statistics summarize the central tendency, dispersion, and shape of the dataset. These metrics provide insights into data distribution patterns and help identify anomalies or trends.`;
    const introLines = doc.splitTextToSize(intro, contentWidth);
    doc.text(introLines, margin, y);
    y += introLines.length * 5 + 8;

    // Central Tendency Table
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Explanation']],
      body: [
        ['Mean', stats.mean.toFixed(6), 'Arithmetic average of all values'],
        ['Median', stats.median.toFixed(6), 'Middle value, robust to outliers'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.success,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.success
      },
      styles: { fontSize: 10, cellPadding: 3, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.primary },
        1: { cellWidth: 40, halign: 'right', textColor: COLORS.success },
        2: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Dispersion Table
    autoTable(doc, {
      startY: y,
      head: [['Dispersion Metric', 'Value', 'Interpretation']],
      body: [
        ['Standard Deviation', stats.stdDev.toFixed(6), 'Average distance from mean'],
        ['Variance', stats.variance.toFixed(6), 'Squared standard deviation'],
        ['Coefficient of Variation', `${((stats.stdDev / stats.mean) * 100).toFixed(2)}%`, 'Relative variability measure'],
        ['Range', stats.range.toFixed(6), 'Difference between max and min'],
        ['IQR', stats.iqr.toFixed(6), 'Middle 50% spread'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.warning,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.warning
      },
      styles: { fontSize: 10, cellPadding: 3, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, textColor: COLORS.primary },
        1: { cellWidth: 40, halign: 'right', textColor: COLORS.warning },
        2: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Quartiles Table
    autoTable(doc, {
      startY: y,
      head: [['Quartile', 'Value', 'Description']],
      body: [
        ['Minimum', stats.min.toFixed(6), 'Lowest value in dataset'],
        ['Q1 (25th %ile)', stats.q1.toFixed(6), '25% of data below this value'],
        ['Q2 (Median)', stats.median.toFixed(6), '50% of data below this value'],
        ['Q3 (75th %ile)', stats.q3.toFixed(6), '75% of data below this value'],
        ['Maximum', stats.max.toFixed(6), 'Highest value in dataset'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.accent,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.accent
      },
      styles: { fontSize: 10, cellPadding: 3, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.primary },
        1: { cellWidth: 40, halign: 'right', textColor: COLORS.accent },
        2: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    // Add Distribution Shape Analysis
    y = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Distribution Shape & Normality', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Interpretation']],
      body: [
        ['Skewness', stats.skewness.toFixed(4), Math.abs(stats.skewness) < 0.5 ? 'Approximately symmetric' : stats.skewness > 0 ? 'Right-skewed (positive)' : 'Left-skewed (negative)'],
        ['Kurtosis', stats.kurtosis.toFixed(4), Math.abs(stats.kurtosis) < 1 ? 'Normal distribution' : stats.kurtosis > 0 ? 'Heavy-tailed (leptokurtic)' : 'Light-tailed (platykurtic)'],
        ['Mean vs Median', (stats.mean - stats.median).toFixed(6), Math.abs(stats.mean - stats.median) < stats.stdDev * 0.1 ? 'Similar (symmetric)' : 'Different (skewed)'],
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.accent,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.accent
      },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, textColor: COLORS.primary },
        1: { cellWidth: 35, halign: 'right', textColor: COLORS.accent },
        2: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    // ===== PAGE 5: SPATIAL DISTRIBUTION =====
    doc.addPage();
    currentPage++;
    y = 25;
    y = drawSectionHeader('4. Spatial Distribution & Geographic Coverage', y, COLORS.secondary);

    doc.setFontSize(10);
    const spatialIntro = `Spatial statistics describe the geographic distribution and coverage of data points. These metrics help understand spatial patterns, density, and geographic extent.`;
    const spatialIntroLines = doc.splitTextToSize(spatialIntro, contentWidth);
    doc.text(spatialIntroLines, margin, y);
    y += spatialIntroLines.length * 5 + 8;

    autoTable(doc, {
      startY: y,
      head: [['Spatial Metric', 'Value', 'Explanation']],
      body: [
        ['Coverage Area', `${spatialStats.coverageArea.toFixed(4)} sq°`, 'Total geographic area covered'],
        ['Point Density', `${spatialStats.pointDensity.toFixed(4)} pts/sq°`, 'Data points per square degree'],
        ['Latitude Range', `${spatialStats.latRange[0].toFixed(4)}° to ${spatialStats.latRange[1].toFixed(4)}°`, 'North-South extent'],
        ['Longitude Range', `${spatialStats.lonRange[0].toFixed(4)}° to ${spatialStats.lonRange[1].toFixed(4)}°`, 'East-West extent'],
        ['Centroid Lat', `${spatialStats.centroid.lat.toFixed(6)}°`, 'Geographic center latitude'],
        ['Centroid Lon', `${spatialStats.centroid.lon.toFixed(6)}°`, 'Geographic center longitude'],
        ['Lat Extent', `${(spatialStats.latRange[1] - spatialStats.latRange[0]).toFixed(4)}°`, 'Total latitude span'],
        ['Lon Extent', `${(spatialStats.lonRange[1] - spatialStats.lonRange[0]).toFixed(4)}°`, 'Total longitude span'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.secondary,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.secondary
      },
      styles: { fontSize: 10, cellPadding: 3, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.primary },
        1: { cellWidth: 45, halign: 'right', textColor: COLORS.secondary },
        2: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    // ===== PAGE 6: DATA QUALITY =====
    if (dataQuality) {
      doc.addPage();
      currentPage++;
      y = 25;
      y = drawSectionHeader('5. Data Quality & Completeness Assessment', y, COLORS.success);

      doc.setFontSize(10);
      const qualityIntro = `Data quality metrics evaluate the reliability, completeness, and accuracy of the dataset. Higher scores indicate better data quality and more reliable analysis results.`;
      const qualityIntroLines = doc.splitTextToSize(qualityIntro, contentWidth);
      doc.text(qualityIntroLines, margin, y);
      y += qualityIntroLines.length * 5 + 8;

      const getQualityColor = (score: number) => {
        if (score >= 90) return COLORS.success;
        if (score >= 70) return COLORS.warning;
        return COLORS.danger;
      };

      const qualityColor = getQualityColor(dataQuality.qualityScore);

      autoTable(doc, {
        startY: y,
        head: [['Quality Metric', 'Value', 'Assessment']],
        body: [
          ['Total Points', dataQuality.totalPoints.toLocaleString(), 'All data points in dataset'],
          ['Valid Points', dataQuality.validPoints.toLocaleString(), 'Points passing validation'],
          ['Invalid Points', dataQuality.invalidPoints.toLocaleString(), 'Points with coordinate errors'],
          ['Missing Values', dataQuality.missingValues.toLocaleString(), 'Points with missing data'],
          ['Outliers Detected', dataQuality.outliers.toLocaleString(), 'Statistical outliers identified'],
          ['Completeness', `${dataQuality.completeness.toFixed(2)}%`, 'Percentage of valid data'],
          ['Quality Score', `${dataQuality.qualityScore.toFixed(2)}/100`, dataQuality.qualityScore >= 90 ? 'Excellent' : dataQuality.qualityScore >= 70 ? 'Good' : 'Needs Improvement'],
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [255, 255, 255],
          textColor: qualityColor,
          fontStyle: 'bold',
          lineWidth: 0.5,
          lineColor: qualityColor
        },
        styles: { fontSize: 10, cellPadding: 3, textColor: COLORS.text },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.primary },
          1: { cellWidth: 40, halign: 'right', textColor: qualityColor },
          2: { cellWidth: 'auto', textColor: COLORS.textLight },
        },
      });
    }

    // ===== PAGE 7: DISTRIBUTION ANALYSIS =====
    doc.addPage();
    currentPage++;
    y = 25;
    y = drawSectionHeader('6. Distribution Analysis & Normality Tests', y, COLORS.accent);

    doc.setFontSize(10);
    const distIntro = `Distribution analysis examines the shape, symmetry, and tail behavior of the data. These metrics help determine if the data follows a normal distribution and identify potential outliers or anomalies.`;
    const distIntroLines = doc.splitTextToSize(distIntro, contentWidth);
    doc.text(distIntroLines, margin, y);
    y += distIntroLines.length * 5 + 10;

    // Distribution Metrics Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text('Distribution Characteristics', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Interpretation', 'Implication']],
      body: [
        [
          'Skewness',
          stats.skewness.toFixed(4),
          Math.abs(stats.skewness) < 0.5 ? 'Symmetric' : stats.skewness > 0 ? 'Right-skewed' : 'Left-skewed',
          Math.abs(stats.skewness) < 0.5 ? 'Balanced distribution' : 'Asymmetric with tail bias'
        ],
        [
          'Kurtosis',
          stats.kurtosis.toFixed(4),
          Math.abs(stats.kurtosis) < 1 ? 'Mesokurtic' : stats.kurtosis > 0 ? 'Leptokurtic' : 'Platykurtic',
          Math.abs(stats.kurtosis) < 1 ? 'Normal tail behavior' : stats.kurtosis > 0 ? 'Heavy tails, more outliers' : 'Light tails, fewer outliers'
        ],
        [
          'Mean-Median Diff',
          (stats.mean - stats.median).toFixed(6),
          Math.abs(stats.mean - stats.median) < stats.stdDev * 0.1 ? 'Small' : 'Large',
          Math.abs(stats.mean - stats.median) < stats.stdDev * 0.1 ? 'Symmetric distribution' : 'Skewed distribution'
        ],
        [
          'CV (Coefficient)',
          `${((stats.stdDev / stats.mean) * 100).toFixed(2)}%`,
          ((stats.stdDev / stats.mean) * 100) < 30 ? 'Low variability' : ((stats.stdDev / stats.mean) * 100) < 60 ? 'Moderate' : 'High variability',
          ((stats.stdDev / stats.mean) * 100) < 30 ? 'Consistent data' : 'Variable data'
        ],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.accent,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.accent
      },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40, textColor: COLORS.primary },
        1: { cellWidth: 30, halign: 'right', textColor: COLORS.accent },
        2: { cellWidth: 35, textColor: COLORS.secondary },
        3: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Confidence Intervals
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text('Confidence Intervals', margin, y);
    y += 8;

    const ci68Lower = stats.mean - stats.stdDev;
    const ci68Upper = stats.mean + stats.stdDev;
    const ci95Lower = stats.mean - 2 * stats.stdDev;
    const ci95Upper = stats.mean + 2 * stats.stdDev;

    autoTable(doc, {
      startY: y,
      head: [['Confidence Level', 'Lower Bound', 'Upper Bound', 'Range', 'Coverage']],
      body: [
        [
          '68% (1σ)',
          ci68Lower.toFixed(6),
          ci68Upper.toFixed(6),
          (ci68Upper - ci68Lower).toFixed(6),
          '~68% of data falls within this range'
        ],
        [
          '95% (2σ)',
          ci95Lower.toFixed(6),
          ci95Upper.toFixed(6),
          (ci95Upper - ci95Lower).toFixed(6),
          '~95% of data falls within this range'
        ],
        [
          'IQR (Q1-Q3)',
          stats.q1.toFixed(6),
          stats.q3.toFixed(6),
          stats.iqr.toFixed(6),
          'Middle 50% of data (robust to outliers)'
        ],
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.accent,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.accent
      },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, textColor: COLORS.primary },
        1: { cellWidth: 32, halign: 'right', textColor: COLORS.success },
        2: { cellWidth: 32, halign: 'right', textColor: COLORS.danger },
        3: { cellWidth: 28, halign: 'right', textColor: COLORS.warning },
        4: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Outlier Detection
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text('Outlier Detection (IQR Method)', margin, y);
    y += 8;

    const lowerFence = stats.q1 - 1.5 * stats.iqr;
    const upperFence = stats.q3 + 1.5 * stats.iqr;
    const outlierCount = dataPoints?.filter(p => p.value < lowerFence || p.value > upperFence).length || 0;
    const totalPoints = dataPoints?.length || 1;

    autoTable(doc, {
      startY: y,
      head: [['Threshold', 'Value', 'Description']],
      body: [
        ['Lower Fence', lowerFence.toFixed(6), 'Values below this are potential outliers'],
        ['Upper Fence', upperFence.toFixed(6), 'Values above this are potential outliers'],
        ['Outliers Detected', outlierCount.toLocaleString(), `${((outlierCount / totalPoints) * 100).toFixed(2)}% of total data points`],
        ['Normal Range', `${lowerFence.toFixed(4)} to ${upperFence.toFixed(4)}`, 'Expected value range for non-outliers'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: COLORS.warning,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: COLORS.warning
      },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, textColor: COLORS.primary },
        1: { cellWidth: 40, halign: 'right', textColor: COLORS.warning },
        2: { cellWidth: 'auto', textColor: COLORS.textLight },
      },
    });

    // ===== PAGE 8: DATA SAMPLE =====
    if (dataPoints && dataPoints.length > 0) {
      doc.addPage();
      currentPage++;
      y = 25;
      y = drawSectionHeader('7. Data Sample & Verification', y, COLORS.accent);

      doc.setFontSize(10);
      const sampleIntro = `Representative sample of the dataset showing the first 50 data points for verification and quality checking. Each row displays geographic coordinates (latitude, longitude) and the corresponding measured value.`;
      const sampleIntroLines = doc.splitTextToSize(sampleIntro, contentWidth);
      doc.text(sampleIntroLines, margin, y);
      y += sampleIntroLines.length * 5 + 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.accent);
      doc.text(`Sample Size: ${Math.min(50, dataPoints.length)} of ${dataPoints.length.toLocaleString()} total points`, margin, y);
      y += 10;

      const sampleSize = Math.min(50, dataPoints.length);
      const sampleData = dataPoints.slice(0, sampleSize).map((point, idx) => [
        (idx + 1).toString(),
        point.lat.toFixed(6),
        point.lon.toFixed(6),
        point.value.toFixed(6),
      ]);

      autoTable(doc, {
        startY: y,
        head: [['#', 'Latitude (°N)', 'Longitude (°E)', 'Value']],
        body: sampleData,
        theme: 'striped',
        headStyles: { 
          fillColor: [255, 255, 255],
          textColor: COLORS.accent,
          fontStyle: 'bold',
          lineWidth: 0.5,
          lineColor: COLORS.accent
        },
        styles: { fontSize: 8, cellPadding: 2, textColor: COLORS.text },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center', textColor: COLORS.textLight },
          1: { cellWidth: 40, halign: 'right', textColor: COLORS.primary },
          2: { cellWidth: 40, halign: 'right', textColor: COLORS.secondary },
          3: { cellWidth: 'auto', halign: 'right', textColor: COLORS.accent },
        },
      });

      y = doc.lastAutoTable.finalY + 5;
      if (dataPoints.length > 50) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...COLORS.textLight);
        doc.text(`... and ${(dataPoints.length - 50).toLocaleString()} more data points not shown in this sample`, margin, y);
      }
    }

    // ===== PAGE 9: EXPERT INSIGHTS =====
    doc.addPage();
    currentPage++;
    y = 25;
    y = drawSectionHeader('8. Expert Insights & Recommendations', y, COLORS.primary);

    doc.setFontSize(10);
    const insightsIntro = `Expert interpretation of statistical metrics provides actionable insights and helps understand the practical implications of the data analysis.`;
    const insightsIntroLines = doc.splitTextToSize(insightsIntro, contentWidth);
    doc.text(insightsIntroLines, margin, y);
    y += insightsIntroLines.length * 5 + 10;

    // Distribution Shape
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text('Distribution Shape Analysis', margin, y);
    doc.setDrawColor(...COLORS.secondary);
    doc.line(margin, y + 2, margin + 70, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);

    const skewText = Math.abs(stats.skewness) < 0.5 
      ? `Skewness (${stats.skewness.toFixed(4)}): The distribution is approximately symmetric, indicating balanced data around the mean with no significant tail bias.`
      : stats.skewness > 0 
        ? `Skewness (${stats.skewness.toFixed(4)}): The distribution is right-skewed (positive skew), meaning the tail extends toward higher values. This suggests occasional high values pulling the mean upward.`
        : `Skewness (${stats.skewness.toFixed(4)}): The distribution is left-skewed (negative skew), meaning the tail extends toward lower values. This suggests occasional low values pulling the mean downward.`;
    
    const skewLines = doc.splitTextToSize(skewText, contentWidth);
    doc.text(skewLines, margin, y);
    y += skewLines.length * 5 + 5;

    const kurtText = Math.abs(stats.kurtosis) < 1
      ? `Kurtosis (${stats.kurtosis.toFixed(4)}): Normal distribution (mesokurtic) with moderate tail thickness, indicating typical outlier frequency.`
      : stats.kurtosis > 1
        ? `Kurtosis (${stats.kurtosis.toFixed(4)}): Heavy-tailed distribution (leptokurtic) with more outliers than normal, suggesting higher variability in extreme values.`
        : `Kurtosis (${stats.kurtosis.toFixed(4)}): Light-tailed distribution (platykurtic) with fewer outliers than normal, suggesting more consistent values.`;
    
    const kurtLines = doc.splitTextToSize(kurtText, contentWidth);
    doc.text(kurtLines, margin, y);
    y += kurtLines.length * 5 + 15;

    // Data Spread
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.warning);
    doc.text('Data Spread & Confidence Intervals', margin, y);
    doc.setDrawColor(...COLORS.warning);
    doc.line(margin, y + 2, margin + 85, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);

    const cv = (stats.stdDev / stats.mean) * 100;
    doc.text(`Coefficient of Variation: `, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.warning);
    doc.text(`${cv.toFixed(2)}%`, margin + 55, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textLight);
    const cvInterpretation = cv < 15 ? 'Low variability - data is highly consistent' : cv < 30 ? 'Moderate variability - typical for most datasets' : 'High variability - data shows significant spread';
    doc.text(cvInterpretation, margin + 5, y);
    y += 10;

    doc.setTextColor(...COLORS.text);
    doc.text(`68% Confidence Interval: `, margin, y);
    doc.setTextColor(...COLORS.success);
    doc.text(`${(stats.mean - stats.stdDev).toFixed(4)} to ${(stats.mean + stats.stdDev).toFixed(4)}`, margin + 55, y);
    y += 6;
    doc.setTextColor(...COLORS.textLight);
    doc.text('Approximately 68% of data points fall within one standard deviation of the mean.', margin + 5, y);
    y += 10;

    doc.setTextColor(...COLORS.text);
    doc.text(`95% Confidence Interval: `, margin, y);
    doc.setTextColor(...COLORS.success);
    doc.text(`${(stats.mean - 2 * stats.stdDev).toFixed(4)} to ${(stats.mean + 2 * stats.stdDev).toFixed(4)}`, margin + 55, y);
    y += 6;
    doc.setTextColor(...COLORS.textLight);
    doc.text('Approximately 95% of data points fall within two standard deviations of the mean.', margin + 5, y);
    y += 15;

    // Recommendations
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.success);
    doc.text('Recommendations & Conclusions', margin, y);
    doc.setDrawColor(...COLORS.success);
    doc.line(margin, y + 2, margin + 85, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);

    const recommendations = [
      `Data Coverage: The dataset covers ${spatialStats.coverageArea.toFixed(2)} square degrees with ${stats.count.toLocaleString()} points, providing ${spatialStats.pointDensity < 1 ? 'sparse' : spatialStats.pointDensity < 10 ? 'moderate' : 'dense'} spatial coverage.`,
      `Data Quality: ${dataQuality ? `With a quality score of ${dataQuality.qualityScore.toFixed(1)}/100 and ${dataQuality.completeness.toFixed(1)}% completeness, the dataset is ${dataQuality.qualityScore >= 90 ? 'excellent for analysis' : dataQuality.qualityScore >= 70 ? 'suitable for most analyses' : 'recommended for quality improvement before critical analysis'}.` : 'Quality metrics not available.'}`,
      `Distribution: The ${Math.abs(stats.skewness) < 0.5 ? 'symmetric' : 'skewed'} distribution with ${Math.abs(stats.kurtosis) < 1 ? 'normal' : stats.kurtosis > 1 ? 'heavy' : 'light'} tails suggests ${Math.abs(stats.skewness) < 0.5 && Math.abs(stats.kurtosis) < 1 ? 'well-behaved data suitable for parametric analysis' : 'consideration of non-parametric methods may be appropriate'}.`,
      `Variability: With a coefficient of variation of ${cv.toFixed(2)}%, the data shows ${cv < 15 ? 'low variability, indicating consistent measurements' : cv < 30 ? 'moderate variability, typical for real-world data' : 'high variability, suggesting diverse conditions or measurement uncertainty'}.`,
    ];

    recommendations.forEach((rec, idx) => {
      const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, contentWidth - 5);
      doc.text(recLines, margin, y);
      y += recLines.length * 5 + 5;
    });

    // ===== MAP VISUALIZATION =====
    if (mapImageUrl) {
      doc.addPage();
      currentPage++;
      y = 25;
      y = drawSectionHeader('9. Spatial Visualization', y, COLORS.primary);
      try {
        doc.addImage(mapImageUrl, 'PNG', margin, y, contentWidth, 140);
      } catch (err) {
        console.error('Failed to add map image:', err);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...COLORS.textLight);
        doc.text('Map visualization could not be included', margin, y + 70);
      }
    }

    // ===== FOOTER ON ALL PAGES =====
    const totalPages = currentPage;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLORS.textLight);
      doc.text(
        `Page ${i} of ${totalPages} | Generated by Geospatial Heatmap Visualization Platform | ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(filename);
  } catch (err) {
    console.error('Failed to generate enhanced PDF:', err);
    throw err;
  }
}
