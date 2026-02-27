/**
 * Professional Color Schemes for Scientific Visualization
 * Includes perceptually uniform, colorblind-friendly, and domain-specific palettes
 */

export interface ColorScheme {
  id: string;
  name: string;
  category: 'sequential' | 'diverging' | 'qualitative' | 'cyclic';
  colors: string[];
  description: string;
  colorblindSafe: boolean;
  perceptuallyUniform: boolean;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  // Sequential - Single Hue
  {
    id: 'viridis',
    name: 'Viridis',
    category: 'sequential',
    colors: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
    description: 'Perceptually uniform, colorblind-safe, great for general use',
    colorblindSafe: true,
    perceptuallyUniform: true,
  },
  {
    id: 'plasma',
    name: 'Plasma',
    category: 'sequential',
    colors: ['#0d0887', '#5302a3', '#8b0aa5', '#b83289', '#db5c68', '#f48849', '#febd2a', '#f0f921'],
    description: 'High contrast, perceptually uniform',
    colorblindSafe: true,
    perceptuallyUniform: true,
  },
  {
    id: 'inferno',
    name: 'Inferno',
    category: 'sequential',
    colors: ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d13d', '#fcffa4'],
    description: 'Warm colors, excellent for heat data',
    colorblindSafe: true,
    perceptuallyUniform: true,
  },
  {
    id: 'turbo',
    name: 'Turbo',
    category: 'sequential',
    colors: ['#30123b', '#4662d7', '#36a9e1', '#13c75f', '#a7d400', '#fca50a', '#f6641d', '#dd2a1b', '#7a0403'],
    description: 'Rainbow-like but perceptually improved',
    colorblindSafe: false,
    perceptuallyUniform: true,
  },

  // Sequential - Multi-Hue
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'sequential',
    colors: ['#0a1128', '#001f54', '#034078', '#1282a2', '#0a9396', '#94d2bd', '#e9f5db'],
    description: 'Perfect for oceanographic data',
    colorblindSafe: true,
    perceptuallyUniform: false,
  },
  {
    id: 'thermal',
    name: 'Thermal',
    category: 'sequential',
    colors: ['#042333', '#2c3e50', '#e67e22', '#f39c12', '#f1c40f', '#ecf0f1'],
    description: 'Temperature and thermal data',
    colorblindSafe: true,
    perceptuallyUniform: false,
  },
  {
    id: 'blues',
    name: 'Blues',
    category: 'sequential',
    colors: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    description: 'Classic blue gradient',
    colorblindSafe: true,
    perceptuallyUniform: false,
  },
  {
    id: 'greens',
    name: 'Greens',
    category: 'sequential',
    colors: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    description: 'Vegetation and environmental data',
    colorblindSafe: true,
    perceptuallyUniform: false,
  },

  // Diverging
  {
    id: 'rdbu',
    name: 'Red-Blue',
    category: 'diverging',
    colors: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
    description: 'Classic diverging for anomalies',
    colorblindSafe: false,
    perceptuallyUniform: false,
  },
  {
    id: 'bwr',
    name: 'Blue-White-Red',
    category: 'diverging',
    colors: ['#0000ff', '#4d4dff', '#9999ff', '#e6e6ff', '#ffffff', '#ffe6e6', '#ff9999', '#ff4d4d', '#ff0000'],
    description: 'Temperature anomalies',
    colorblindSafe: false,
    perceptuallyUniform: false,
  },
  {
    id: 'coolwarm',
    name: 'Cool-Warm',
    category: 'diverging',
    colors: ['#3b4cc0', '#6788ee', '#9abbff', '#c9d7f0', '#edd1c2', '#f7a789', '#e26952', '#b40426'],
    description: 'Perceptually uniform diverging',
    colorblindSafe: true,
    perceptuallyUniform: true,
  },
  {
    id: 'piyg',
    name: 'Pink-Yellow-Green',
    category: 'diverging',
    colors: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
    description: 'Colorblind-safe diverging',
    colorblindSafe: true,
    perceptuallyUniform: false,
  },

  // Scientific
  {
    id: 'jet',
    name: 'Jet (Legacy)',
    category: 'sequential',
    colors: ['#00007f', '#0000ff', '#007fff', '#00ffff', '#7fff7f', '#ffff00', '#ff7f00', '#ff0000', '#7f0000'],
    description: 'Traditional but not recommended (poor perceptual uniformity)',
    colorblindSafe: false,
    perceptuallyUniform: false,
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    category: 'sequential',
    colors: ['#9400d3', '#4b0082', '#0000ff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000'],
    description: 'Full spectrum (use with caution)',
    colorblindSafe: false,
    perceptuallyUniform: false,
  },

  // Colorblind-Safe
  {
    id: 'cividis',
    name: 'Cividis',
    category: 'sequential',
    colors: ['#00204d', '#00336f', '#31446b', '#575463', '#7f6874', '#a38295', '#c9a1b8', '#edc8d9', '#fff3e0'],
    description: 'Optimized for colorblind viewers',
    colorblindSafe: true,
    perceptuallyUniform: true,
  },
];

export function getColorScheme(id: string): ColorScheme | undefined {
  return COLOR_SCHEMES.find(scheme => scheme.id === id);
}

export function getColorSchemesByCategory(category: ColorScheme['category']): ColorScheme[] {
  return COLOR_SCHEMES.filter(scheme => scheme.category === category);
}

export function getColorblindSafeSchemes(): ColorScheme[] {
  return COLOR_SCHEMES.filter(scheme => scheme.colorblindSafe);
}

export function interpolateColor(colors: string[], value: number): string {
  // value should be between 0 and 1
  const clampedValue = Math.max(0, Math.min(1, value));
  const index = clampedValue * (colors.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const fraction = index - lowerIndex;

  if (lowerIndex === upperIndex) {
    return colors[lowerIndex];
  }

  const color1 = hexToRgb(colors[lowerIndex]);
  const color2 = hexToRgb(colors[upperIndex]);

  if (!color1 || !color2) return colors[lowerIndex];

  const r = Math.round(color1.r + (color2.r - color1.r) * fraction);
  const g = Math.round(color1.g + (color2.g - color1.g) * fraction);
  const b = Math.round(color1.b + (color2.b - color1.b) * fraction);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function generateColorScale(scheme: ColorScheme, steps: number = 256): string[] {
  const scale: string[] = [];
  for (let i = 0; i < steps; i++) {
    const value = i / (steps - 1);
    scale.push(interpolateColor(scheme.colors, value));
  }
  return scale;
}

export function valueToColor(value: number, min: number, max: number, scheme: ColorScheme): string {
  const normalized = (value - min) / (max - min);
  return interpolateColor(scheme.colors, normalized);
}
