import { Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ColorScheme = 'thermal' | 'rainbow' | 'viridis' | 'plasma' | 'ocean' | 'grayscale';

export interface ColorSchemeOption {
  id: ColorScheme;
  name: string;
  gradient: string[];
  description: string;
}

export const colorSchemes: ColorSchemeOption[] = [
  {
    id: 'thermal',
    name: 'Thermal (Default)',
    gradient: ['#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000'],
    description: 'Blue to red heat map'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    gradient: ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'],
    description: 'Full spectrum colors'
  },
  {
    id: 'viridis',
    name: 'Viridis',
    gradient: ['#440154', '#31688e', '#35b779', '#fde724'],
    description: 'Perceptually uniform'
  },
  {
    id: 'plasma',
    name: 'Plasma',
    gradient: ['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921'],
    description: 'High contrast plasma'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    gradient: ['#000033', '#000066', '#0066CC', '#00CCFF', '#FFFFFF'],
    description: 'Deep ocean to surface'
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    gradient: ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'],
    description: 'Black to white'
  }
];

interface ColorSchemeSelectorProps {
  value: ColorScheme;
  onChange: (scheme: ColorScheme) => void;
}

export default function ColorSchemeSelector({ value, onChange }: ColorSchemeSelectorProps) {
  const selectedScheme = colorSchemes.find(s => s.id === value) || colorSchemes[0];

  return (
    <div className="space-y-2">
      <Label className="text-xs flex items-center gap-1.5">
        <Palette className="w-3.5 h-3.5" />
        Color Scheme
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ColorScheme)}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colorSchemes.map((scheme) => (
            <SelectItem key={scheme.id} value={scheme.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-12 h-3 rounded"
                  style={{
                    background: `linear-gradient(to right, ${scheme.gradient.join(', ')})`
                  }}
                />
                <span>{scheme.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{selectedScheme.description}</p>
    </div>
  );
}
