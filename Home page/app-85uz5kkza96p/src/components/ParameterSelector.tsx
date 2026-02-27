import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParameterSelectorProps {
  fields: string[];
  selectedField: string;
  onFieldChange: (field: string) => void;
  compact?: boolean;
}

export default function ParameterSelector({
  fields,
  selectedField,
  onFieldChange,
  compact = false
}: ParameterSelectorProps) {
  if (!fields || fields.length === 0) {
    return null;
  }

  // Format field name for display
  const formatFieldName = (field: string): string => {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (compact) {
    return (
      <Card className="control-panel-glass border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {fields.map((field) => (
              <Button
                key={field}
                variant={selectedField === field ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFieldChange(field)}
                className={cn(
                  'text-xs transition-all duration-300',
                  selectedField === field
                    ? 'gradient-primary text-white border-0 shadow-lg hover-scale'
                    : 'hover-scale hover-glow border-2'
                )}
              >
                {formatFieldName(field)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="control-panel-glass border-2 border-primary/20 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary animate-pulse" />
          Select Parameter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {fields.map((field) => (
            <Button
              key={field}
              variant={selectedField === field ? 'default' : 'outline'}
              size="lg"
              onClick={() => onFieldChange(field)}
              className={cn(
                'h-auto py-4 flex flex-col items-start gap-2 transition-all duration-300',
                selectedField === field
                  ? 'gradient-primary text-white border-0 shadow-lg hover-scale'
                  : 'hover-scale hover-glow border-2'
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  {formatFieldName(field)}
                </span>
              </div>
              {selectedField === field && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
