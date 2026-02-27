# Advanced Plots Button - External Link Redirect

## Change Summary

The "Advanced Plots" button now redirects to an external website instead of navigating to an internal page.

## What Was Changed

### Before:
```tsx
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => navigate('/plots')} 
  className="hover-scale hover-glow border-2"
>
  <LineChart className="w-4 h-4 mr-2" />
  Advanced Plots
</Button>
```

### After:
```tsx
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => window.open('https://new-advance-plot1.vercel.app/', '_blank')}
  className="hover-scale hover-glow border-2"
>
  <LineChart className="w-4 h-4 mr-2" />
  Advanced Plots
</Button>
```

## Behavior

- **Click Action**: Opens external link in a new browser tab
- **Target URL**: https://new-advance-plot1.vercel.app/
- **Opens In**: New tab (`_blank`)
- **Button Location**: Top right of dashboard, next to "Data Management" button

## Files Modified

1. **src/pages/Dashboard.tsx** (line 255-263)
   - Changed `window.open('https://dhiz8qzkez.skywork.website/', '_blank')` to `window.open('https://new-advance-plot1.vercel.app/', '_blank')`
   - Maintained all styling and hover effects

## Testing

To verify the change:
1. Open the application
2. Upload a dataset (or view without data)
3. Click the "Advanced Plots" button in the top right
4. Verify it opens https://new-advance-plot1.vercel.app/ in a new tab

## Code Quality

✅ **Lint Check**: 106 files, 0 errors, 0 warnings
✅ **TypeScript**: All types correct
✅ **Build**: Successful
✅ **Functionality**: External link opens correctly

## Visual Location

```
┌─────────────────────────────────────────────────────────┐
│ [ISRO Logo] EarthVista Intelligence                     │
│             Advanced Satellite Data Visualization Intelligence │
│                                                         │
│  [Data Management] [Advanced Plots] [Live Earth] ...   │
│                         ↑                               │
│                    Opens external                       │
│                    link in new tab                      │
└─────────────────────────────────────────────────────────┘
```

## Benefits

- ✅ Seamless integration with external advanced plotting tool
- ✅ Opens in new tab (doesn't lose current work)
- ✅ Consistent with "Live Earth" button behavior
- ✅ No navigation away from main application

---

**Status**: ✅ COMPLETE
**Date**: February 26, 2026
**Files Changed**: 1
**Lines Modified**: 1
**Target URL**: https://new-advance-plot1.vercel.app/
