import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COLOR_SCHEMES, ColorScheme } from '@/utils/colorSchemes';
import { Palette, Eye, Accessibility } from 'lucide-react';

interface ColorSchemeSelectorProps {
  selectedScheme: string;
  onSchemeChange: (schemeId: string) => void;
}

export function ColorSchemeSelector({ selectedScheme, onSchemeChange }: ColorSchemeSelectorProps) {
  const currentScheme = COLOR_SCHEMES.find(s => s.id === selectedScheme) || COLOR_SCHEMES[0];

  const categories = Array.from(new Set(COLOR_SCHEMES.map(s => s.category)));

  return (
    <Card className="bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Scheme
        </CardTitle>
        <CardDescription>Choose visualization colors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedScheme} onValueChange={onSchemeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[300px]">
              {categories.map(category => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    {category}
                  </div>
                  {COLOR_SCHEMES.filter(s => s.category === category).map(scheme => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {scheme.colors.slice(0, 5).map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span>{scheme.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <div className="space-y-3">
          <div className="flex gap-1 h-8 rounded-md overflow-hidden">
            {currentScheme.colors.map((color, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{currentScheme.description}</p>
            <div className="flex flex-wrap gap-2">
              {currentScheme.colorblindSafe && (
                <Badge variant="outline" className="text-xs">
                  <Accessibility className="h-3 w-3 mr-1" />
                  Colorblind Safe
                </Badge>
              )}
              {currentScheme.perceptuallyUniform && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Perceptually Uniform
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs capitalize">
                {currentScheme.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
