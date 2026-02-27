import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Image, FileJson, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataPoint } from '@/types/heatmap';
import { Statistics, SpatialStatistics, DataQuality } from '@/utils/statistics';
import { exportToCSV, exportToJSON, exportMapAsPNG, exportStatisticsReport, exportToEnhancedPDF } from '@/utils/export';

interface ExportControlsProps {
  data: DataPoint[] | null;
  statistics: Statistics | null;
  spatialStats: SpatialStatistics | null;
  dataQuality?: DataQuality | null;
  datasetName: string;
  mapElementId?: string;
}

export function ExportControls({
  data,
  statistics,
  spatialStats,
  dataQuality,
  datasetName,
  mapElementId = 'map-container',
}: ExportControlsProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please upload data first',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportToCSV(data, `${datasetName}_data.csv`);
      toast({
        title: 'Success',
        description: 'Data exported as CSV',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export CSV file',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = () => {
    if (!data || data.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please upload data first',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportToJSON(data, `${datasetName}_data.json`);
      toast({
        title: 'Success',
        description: 'Data exported as JSON',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export JSON file',
        variant: 'destructive',
      });
    }
  };

  const handleExportPNG = () => {
    try {
      setExporting(true);
      exportMapAsPNG(mapElementId, `${datasetName}_map.png`);
      toast({
        title: 'Success',
        description: 'Map exported as PNG',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export PNG image',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  const handleExportStatistics = () => {
    if (!statistics || !spatialStats) {
      toast({
        title: 'No Statistics',
        description: 'Please upload data first',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportStatisticsReport(statistics, spatialStats, `${datasetName}_statistics.txt`);
      toast({
        title: 'Success',
        description: 'Statistics exported',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export statistics',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = async () => {
    if (!statistics || !spatialStats) {
      toast({
        title: 'No Data',
        description: 'Please upload data first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setExporting(true);
      toast({
        title: 'Generating Enhanced PDF',
        description: 'Creating professional report with colors and detailed analysis...',
      });

      await exportToEnhancedPDF(
        datasetName,
        statistics,
        spatialStats,
        dataQuality || undefined,
        data || undefined,
        undefined,
        `${datasetName}_enhanced_report.pdf`
      );

      toast({
        title: 'Success',
        description: 'Enhanced PDF report with professional design generated successfully',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const hasData = data && data.length > 0;
  const hasStats = statistics && spatialStats;

  return (
    <Card className="bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>Download data and visualizations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!hasData || exporting}
            className="w-full"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>

          <Button
            variant="outline"
            onClick={handleExportJSON}
            disabled={!hasData || exporting}
            className="w-full"
          >
            <FileJson className="h-4 w-4 mr-2" />
            JSON
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPNG}
            disabled={!hasData || exporting}
            className="w-full"
          >
            <Image className="h-4 w-4 mr-2" />
            PNG
          </Button>

          <Button
            variant="outline"
            onClick={handleExportStatistics}
            disabled={!hasStats || exporting}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Stats
          </Button>

          <Button
            variant="default"
            onClick={handleExportPDF}
            disabled={!hasStats || exporting}
            className="w-full col-span-2"
          >
            <FileText className="h-4 w-4 mr-2" />
            {exporting ? 'Generating...' : 'Enhanced PDF Report'}
          </Button>
        </div>
        
        {hasStats && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Professional PDF with colors, tables, detailed explanations, and expert insights
          </p>
        )}
      </CardContent>
    </Card>
  );
}
