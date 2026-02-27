import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { storageManager, DatasetMetadata } from '@/utils/storage';
import { Database, Search, Trash2, Download, Calendar, FileType } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DatasetLibraryProps {
  onLoadDataset: (id: string) => void;
}

export function DatasetLibrary({ onLoadDataset }: DatasetLibraryProps) {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const metadata = await storageManager.getAllMetadata();
      setDatasets(metadata.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      ));
    } catch (error) {
      console.error('Failed to load datasets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dataset library',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete dataset "${name}"?`)) return;

    try {
      await storageManager.deleteDataset(id);
      await loadDatasets();
      toast({
        title: 'Success',
        description: 'Dataset deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dataset',
        variant: 'destructive',
      });
    }
  };

  const filteredDatasets = datasets.filter(ds =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dataset Library
        </CardTitle>
        <CardDescription>
          {datasets.length} saved dataset{datasets.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredDatasets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No datasets found' : 'No saved datasets'}
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredDatasets.map((dataset) => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    onLoad={() => onLoadDataset(dataset.id)}
                    onDelete={() => handleDelete(dataset.id, dataset.name)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DatasetCard({
  dataset,
  onLoad,
  onDelete,
}: {
  dataset: DatasetMetadata;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{dataset.name}</h4>
          {dataset.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {dataset.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <FileType className="h-3 w-3 mr-1" />
              {dataset.fileType.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {dataset.pointCount.toLocaleString()} points
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(dataset.uploadDate)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {formatFileSize(dataset.fileSize)} • 
            Lat: [{dataset.bounds.minLat.toFixed(2)}, {dataset.bounds.maxLat.toFixed(2)}] • 
            Lon: [{dataset.bounds.minLon.toFixed(2)}, {dataset.bounds.maxLon.toFixed(2)}]
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="default" onClick={onLoad}>
            <Download className="h-3 w-3 mr-1" />
            Load
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
