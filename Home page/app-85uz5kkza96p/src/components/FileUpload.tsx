import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { parseFile } from '@/utils/dataParser';
import type { Dataset } from '@/types/heatmap';

interface FileUploadProps {
  onDataLoaded: (dataset: Dataset) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    if (file.size === 0) {
      toast.error('File is empty');
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`Processing file: ${file.name}, Size: ${fileSizeMB.toFixed(2)} MB`);

    // Show info for large files
    if (fileSizeMB > 100) {
      toast.info(`Processing large file (${fileSizeMB.toFixed(1)} MB). This may take a moment...`, {
        duration: 5000
      });
    } else if (fileSizeMB > 50) {
      toast.info(`Processing file (${fileSizeMB.toFixed(1)} MB) with streaming optimization...`, {
        duration: 3000
      });
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      const result = await parseFile(file, {
        maxPoints: 100000,
        onProgress: (prog) => {
          setProgress(Math.min(100, Math.max(0, prog)));
        }
      });

      if (result.success && result.data) {
        onDataLoaded(result.data);
        
        const fileType = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        const pointCount = result.data.points.length.toLocaleString();
        
        // Show different messages based on file size and optimization
        if (result.data.points.length >= 100000) {
          toast.success(`${fileType} loaded: ${pointCount} points (optimized for performance)`, {
            duration: 5000
          });
        } else {
          toast.success(`${fileType} loaded successfully: ${pointCount} data points`, {
            duration: 4000
          });
        }
      } else {
        toast.error(result.error || 'Failed to parse file');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMsg);
      console.error('File upload error:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [onDataLoaded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadSample = () => {
    const csv = `lat,lon,value
23.5,88.2,29.1
-10.2,45.1,26.4
51.5,-0.1,15.3
35.7,139.7,22.5
40.7,-74.0,18.2
-33.9,151.2,25.8`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_data.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Sample CSV downloaded');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.nc,.hdf,.hdf5,.h5"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
        `}
        onClick={!isLoading ? handleButtonClick : undefined}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <p className="text-xl font-bold mb-2">Upload Dataset</p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop or click to browse
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
                disabled={isLoading}
                type="button"
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSample();
                }}
                variant="outline"
                disabled={isLoading}
                type="button"
              >
                <Download className="w-4 h-4 mr-2" />
                Sample CSV
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-sm">✅ Supported Formats:</p>
            <p><strong>CSV</strong> (.csv) • <strong>JSON</strong> (.json) • <strong>NetCDF</strong> (.nc) • <strong>HDF5</strong> (.hdf, .hdf5, .h5)</p>
            <p className="text-green-600 dark:text-green-400 font-medium">📊 Large file support with streaming optimization</p>
            <p className="text-muted-foreground/80">No file size limit • Automatic data optimization</p>
          </div>
        </div>
        
        {isLoading && (
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Processing... {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
