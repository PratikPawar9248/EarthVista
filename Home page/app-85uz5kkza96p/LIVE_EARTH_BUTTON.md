# Live Earth Button Feature

## Overview
Added a "Live Earth" button that redirects users to MOSDAC's live satellite imagery viewer.

## Button Locations

### 1. Header Navigation (When Dataset is Loaded)
- **Location**: Top-right header, after "Advanced Plots" button
- **Appearance**: Outlined button with Globe icon
- **Style**: Primary accent with hover effects
- **Behavior**: Opens MOSDAC live viewer in new tab

### 2. Welcome Screen (No Dataset Loaded)
- **Location**: Below the file upload area
- **Appearance**: Large outlined button with Globe icon
- **Style**: Primary accent with description text
- **Behavior**: Opens MOSDAC live viewer in new tab

## Technical Details

### Link
```
https://www.mosdac.gov.in/live/index_one.php?url_name=india
```

### Implementation
- Opens in new browser tab (`_blank`)
- Uses Lucide React `Globe` icon
- Consistent styling with other navigation buttons
- Smooth hover animations and effects

### Code Changes
**File**: `src/pages/Dashboard.tsx`

**Changes Made**:
1. Added `Globe` icon import from `lucide-react`
2. Added "Live Earth" button in header navigation (line 245-254)
3. Added "Live Earth" button on welcome screen (line 360-374)

## User Experience

### When Dataset is Loaded
- Button appears in the header alongside other navigation buttons
- Clicking opens MOSDAC live viewer in a new tab
- User can continue working with their dataset

### When No Dataset is Loaded
- Button appears prominently on the welcome screen
- Includes descriptive text: "Explore real-time satellite imagery from MOSDAC"
- Provides alternative activity while preparing data

## Styling

### Button Styles
- **Variant**: Outline
- **Border**: 2px with primary color at 50% opacity
- **Background**: Primary color at 10% opacity
- **Hover**: Primary color at 20% opacity
- **Effects**: Scale animation and glow on hover

### Icon
- **Component**: `Globe` from Lucide React
- **Size**: 4x4 (header), 5x5 (welcome screen)
- **Position**: Left of button text

## Testing

### Test Steps
1. Open the application
2. Verify "View Live Earth" button appears on welcome screen
3. Click the button
4. Verify MOSDAC live viewer opens in new tab
5. Upload a dataset
6. Verify "Live Earth" button appears in header
7. Click the header button
8. Verify MOSDAC live viewer opens in new tab

## Benefits

1. **Quick Access**: Direct link to live satellite imagery
2. **Contextual**: Available both with and without dataset
3. **Non-Intrusive**: Opens in new tab, doesn't interrupt workflow
4. **Educational**: Provides access to real-time Earth observation data
5. **Integration**: Seamlessly integrated with existing UI

## Future Enhancements

Possible improvements:
- Add tooltip with more information
- Show preview thumbnail on hover
- Add more MOSDAC links (different regions)
- Integrate live data directly into the application
- Add keyboard shortcut for quick access

## Related Resources

- MOSDAC Website: https://www.mosdac.gov.in/
- Live Earth Viewer: https://www.mosdac.gov.in/live/index_one.php?url_name=india
- ISRO: https://www.isro.gov.in/

## Notes

- Button uses `window.open()` with `_blank` target
- No additional dependencies required
- Fully responsive design
- Accessible with keyboard navigation
- Consistent with application design system
