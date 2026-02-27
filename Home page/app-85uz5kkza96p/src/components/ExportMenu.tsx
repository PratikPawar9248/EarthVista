import { Download, FileImage, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Dataset } from '@/types/heatmap';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ExportMenuProps {
  dataset: Dataset | null;
  mapContainerId?: string;
  compact?: boolean;
}

export default function ExportMenu({ dataset, mapContainerId = 'map-container', compact = false }: ExportMenuProps) {
  const exportAsImage = async () => {
    try {
      const mapElement = document.getElementById(mapContainerId);
      if (!mapElement) {
        toast.error('Map container not found');
        return;
      }

      toast.info('Capturing map image...');
      
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a1128'
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `heatmap-${dataset?.name || 'export'}-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Map exported as PNG');
        }
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export map image');
    }
  };

  const exportAsCSV = () => {
    if (!dataset) {
      toast.error('No dataset to export');
      return;
    }

    const headers = ['latitude', 'longitude', 'value'];
    const rows = dataset.points.map(p => [p.lat, p.lon, p.value].join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported as CSV');
  };

  const exportAsJSON = () => {
    if (!dataset) {
      toast.error('No dataset to export');
      return;
    }

    const json = JSON.stringify(dataset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported as JSON');
  };

  if (!dataset) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={compact ? "sm" : "sm"}
          className={compact ? "w-full h-7 text-xs" : ""}
        >
          <Download className={compact ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportAsImage}>
          <FileImage className="w-4 h-4 mr-2" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
