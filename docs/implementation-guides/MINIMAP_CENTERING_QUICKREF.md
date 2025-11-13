# Minimap Centering Fix - Quick Reference

## Problem Statement
1. Clicking on the minimap should center the viewport around the click (instead of bottom right corner)
2. The draggable minimap should be limited to the div network-graph-svg minus a 10px buffer

## Solutions Implemented

### ✅ Issue 1: Minimap Click Centering

**Before:**
- Used complex constraint calculations
- Prevented clicking near edges/corners
- Formula: `newX = -(constrainedMx / minimapScale - width / 2) * scale`

**After:**
- Simple direct conversion: `graphX = mx / minimapScale`
- Centers properly: `newX = -(graphX - width / 2) * scale`
- Works everywhere on minimap, all zoom levels

### ✅ Issue 2: Minimap Drag Constraints

**Before:**
- Only minimum constraint: `bottom: Math.max(10, newBottom)`
- Could drag off-screen or outside container

**After:**
- Full bounds checking with container dimensions
- Constrained to: `[buffer, containerSize - minimapSize - buffer]`
- Stays within network-graph-svg div with 10px buffer

## Code Locations

All changes in: `interactivetextanalyzer/src/components/NetworkGraph.jsx`

1. Click handler: Lines 205-225
2. Drag handler: Lines 227-254  
3. Container drag: Lines 326-375

## Testing

### Manual Test Steps

1. **Test Click Centering:**
   - Open network graph visualization
   - Click various points on minimap
   - Verify viewport centers on clicked location
   - Try edges and corners

2. **Test Drag Centering:**
   - Click and drag the blue viewport rectangle
   - Verify smooth centering as you drag
   - Test at different zoom levels

3. **Test Container Constraints:**
   - Drag the minimap container by its label
   - Try to drag past edges
   - Verify it stops at 10px from container edges
   - Resize window and test again

### Expected Results

✓ Click centers viewport exactly on clicked point  
✓ Drag smoothly centers as you move  
✓ Works at all zoom levels (0.1x to 4x)  
✓ Minimap stays within graph container + 10px buffer  
✓ No off-screen or overflow issues

## Technical Details

### Centering Formula
```
minimap coordinates (mx, my) 
→ graph coordinates (graphX, graphY) via: graphX = mx / minimapScale
→ transform (newX, newY) via: newX = -(graphX - width/2) * scale
```

### Constraint Formula
```
buffer = 10px
maxBottom = containerHeight - minimapHeight - buffer
maxRight = containerWidth - minimapWidth - buffer
finalBottom = clamp(newBottom, buffer, maxBottom)
finalRight = clamp(newRight, buffer, maxRight)
```

## Files Changed

- Modified: `interactivetextanalyzer/src/components/NetworkGraph.jsx`
- Added: `MINIMAP_CENTERING_FIX.md` (detailed documentation)
- Lines: +35 insertions, -21 deletions

## Verification

See test calculations and visual verification:
https://github.com/user-attachments/assets/abc1a805-b7c3-4ab6-aa10-8bace4fed25a
