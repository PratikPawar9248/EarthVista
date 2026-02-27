# Heatmap Animation Feature

## Overview
The heatmap now features smooth, professional animations when data is loaded, providing better visual feedback and an enhanced user experience.

## Animation Behavior

### First Load Animation
When you upload a dataset for the first time, the heatmap appears with a beautiful entrance animation:

1. **Fade-In Effect** (1.2 seconds)
   - The heatmap starts at 0% opacity
   - Gradually fades in to full visibility
   - Includes a subtle scale effect (95% → 100%)
   - Uses smooth cubic-bezier easing for natural motion

2. **Pulse Effect** (2 seconds)
   - Starts immediately after fade-in completes
   - Gentle opacity pulse (100% → 85% → 100%)
   - Draws attention to the newly loaded data
   - Automatically stops after one cycle

### Subsequent Updates
When you adjust controls (radius, opacity, intensity) or change color schemes:
- Quick fade transition (0.6 seconds)
- Smooth opacity change for seamless updates
- No scale or pulse effects (less distracting)

### New Dataset Detection
The system intelligently detects when you upload a new dataset:
- Monitors data point count changes
- If data changes by more than 20%, treats it as a new dataset
- Replays the full entrance animation (fade-in + pulse)
- Provides consistent visual feedback for new data

## Technical Implementation

### CSS Animations

#### Fade-In Animation
```css
@keyframes heatmapFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```
- **Duration**: 1.2 seconds
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) - smooth acceleration/deceleration
- **Effect**: Combines opacity and scale for depth

#### Pulse Animation
```css
@keyframes heatmapPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}
```
- **Duration**: 2 seconds
- **Easing**: ease-in-out - natural breathing effect
- **Effect**: Subtle opacity variation

### JavaScript Logic

#### Animation Trigger
```typescript
// First load: full animation
if (isFirstLoadRef.current && data.length > 0) {
  heatmapPane.classList.add('heatmap-animate-in');
  isFirstLoadRef.current = false;
  
  // Add pulse after fade-in
  setTimeout(() => {
    heatmapPane.classList.add('heatmap-pulse');
    setTimeout(() => {
      heatmapPane.classList.remove('heatmap-pulse');
    }, 2000);
  }, 1200);
}
```

#### New Dataset Detection
```typescript
// Check if data changed significantly
if (prevLength > 0 && Math.abs(currentLength - prevLength) / prevLength > 0.2) {
  isFirstLoadRef.current = true; // Replay animation
}
```

## User Experience Benefits

### Visual Feedback
- **Clear indication** that data has loaded successfully
- **Smooth transition** prevents jarring appearance
- **Professional look** enhances perceived quality

### Attention Direction
- **Pulse effect** naturally draws eye to the heatmap
- **Helps users notice** when new data appears
- **Confirms action** after file upload

### Performance
- **Lightweight animations** using CSS transforms
- **GPU-accelerated** opacity and scale changes
- **No impact** on map interaction or data processing
- **Automatic cleanup** removes animation classes after completion

## Animation Timeline

```
Upload Dataset
    ↓
Data Processing
    ↓
Heatmap Creation
    ↓
[0.0s - 1.2s] Fade-In Animation
    ├─ Opacity: 0% → 100%
    └─ Scale: 95% → 100%
    ↓
[1.2s - 3.2s] Pulse Animation
    ├─ Opacity: 100% → 85% → 100%
    └─ One cycle only
    ↓
Animation Complete
```

## Customization Options

If you want to adjust the animation, modify these values in `src/index.css`:

### Change Animation Duration
```css
.heatmap-animate-in {
  animation: heatmapFadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  /* Change 1.5s to your preferred duration */
}
```

### Adjust Pulse Intensity
```css
@keyframes heatmapPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7; /* Lower = more dramatic pulse */
  }
}
```

### Modify Scale Effect
```css
@keyframes heatmapFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9); /* Lower = more dramatic zoom */
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Disable Pulse Effect
In `src/components/HeatmapViewer.tsx`, comment out the pulse section:
```typescript
// setTimeout(() => {
//   heatmapPane.classList.add('heatmap-pulse');
//   setTimeout(() => {
//     heatmapPane.classList.remove('heatmap-pulse');
//   }, 2000);
// }, 1200);
```

## Browser Compatibility

The animations use standard CSS3 features supported by all modern browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Performance Considerations

### Optimizations
- Animations use `transform` and `opacity` (GPU-accelerated)
- No layout recalculations during animation
- Automatic cleanup prevents memory leaks
- Animations skip if data is empty

### Large Datasets
- Animation performance is independent of data size
- Works smoothly with 10,000+ data points
- No additional processing overhead

## Accessibility

### Motion Sensitivity
Users who prefer reduced motion can disable animations via browser settings:
```css
@media (prefers-reduced-motion: reduce) {
  .heatmap-animate-in,
  .heatmap-pulse {
    animation: none !important;
  }
}
```

This respects the `prefers-reduced-motion` media query for users with motion sensitivity.

## Testing the Animation

### To See the Full Animation:
1. Open the application
2. Click "Upload Dataset"
3. Select a CSV, JSON, or NetCDF file
4. Watch for:
   - Smooth fade-in over 1.2 seconds
   - Gentle pulse effect for 2 seconds
   - Clean, professional appearance

### To Test New Dataset Detection:
1. Upload a dataset (e.g., 1000 points)
2. Adjust controls (no full animation)
3. Upload a different dataset (e.g., 500 points)
4. Animation should replay (20%+ change detected)

### To Test Control Updates:
1. Upload a dataset
2. Wait for animation to complete
3. Adjust radius, opacity, or intensity sliders
4. Should see quick fade transition (not full animation)

## Future Enhancements

Potential improvements for future versions:
- **Staggered appearance**: Data points appear in waves
- **Directional wipe**: Heatmap reveals from one side
- **Color animation**: Gradient colors animate in sequence
- **Loading skeleton**: Animated placeholder before data loads
- **Zoom animation**: Auto-zoom to data bounds with animation
