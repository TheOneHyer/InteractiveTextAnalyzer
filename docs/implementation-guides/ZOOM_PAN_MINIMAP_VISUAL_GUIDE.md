# Network Graph Zoom/Pan/Minimap - Visual Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Network Graph / Dependency Tree Visualization              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [+]  [−]  [⟲]  [⛶]                                │    │
│  │   Zoom Control Buttons                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │         Main Graph Visualization Area              │    │
│  │                                                     │    │
│  │    ●─────●        ●                                │    │
│  │    │     │       ╱│╲                               │    │
│  │    ●     ●───●  ● ● ●                              │    │
│  │         ╱│   │                                     │    │
│  │        ● ●   ●                                     │    │
│  │                                                     │    │
│  │                    ┌──────────────┐                │    │
│  │                    │  Minimap     │                │    │
│  │                    ├──────────────┤                │    │
│  │                    │ ●●●  ●●● ●●  │                │    │
│  │                    │  ●●●●    ●●● │                │    │
│  │                    │┌────────┐    │   ← Viewport   │    │
│  │                    ││        │    │     Indicator  │    │
│  │                    │└────────┘    │                │    │
│  │                    └──────────────┘                │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Control Buttons

### Visual States

**Normal State:**
```
┌────────┐
│   +    │  White background
└────────┘  Gray border (#ddd)
```

**Hover State:**
```
┌────────┐
│   +    │  Light blue background (#e3f2fd)
└────────┘  Blue border (#2196F3)
            Slightly elevated (transform: translateY(-1px))
```

**Active/Pressed State:**
```
┌────────┐
│   +    │  Light blue background
└────────┘  Blue border
            No elevation
```

### Button Functions

```
┌─────┬─────┬─────┬─────┐
│  +  │  −  │  ⟲  │  ⛶  │
└─────┴─────┴─────┴─────┘
  │     │     │     │
  │     │     │     └─ Fit to View
  │     │     └─ Reset to Default
  │     └─ Zoom Out (0.7x)
  └─ Zoom In (1.3x)
```

## Zoom Behavior

### Zoom Levels Example

**Default View (1x):**
```
┌────────────────────┐
│  ●─────●           │
│  │     │           │
│  ●─────●───────●   │
│        │       │   │
│        ●───────●   │
└────────────────────┘
```

**Zoomed In (2x):**
```
┌────────────────────┐
│                    │
│     ●──────        │  Only part of graph visible
│     │              │  Can pan to see rest
│     ●              │
│                    │
└────────────────────┘
```

**Zoomed Out (0.5x):**
```
┌────────────────────┐
│                    │
│   ●●●●●●●          │  All nodes easily visible
│    ●●●●●           │  More whitespace
│                    │
└────────────────────┘
```

## Minimap States

### At Default Zoom (1x):
```
┌──────────────┐
│ ●●●  ●●● ●●  │
│  ●●●●    ●●● │
│┌────────────┐│  Viewport = full minimap
││            ││  Blue rectangle covers most area
│└────────────┘│
└──────────────┘
```

### Zoomed In (2x):
```
┌──────────────┐
│ ●●●  ●●● ●●  │  All nodes still visible
│  ●●●●    ●●● │
│┌────┐        │  Viewport = smaller rectangle
││    │        │  Shows what's visible in main view
│└────┘        │
└──────────────┘
```

### Panned to Different Area:
```
┌──────────────┐
│ ●●●  ●●● ●●  │
│  ●●●●    ●●● │
│      ┌────┐  │  Rectangle moved
│      │    │  │  Reflects panned position
│      └────┘  │
└──────────────┘
```

## Interaction Examples

### 1. Mouse Wheel Zoom
```
User scrolls up ↑
─────────────────→  Graph zooms in
                    Minimap viewport shrinks
                    Nodes appear larger
```

### 2. Click and Drag Pan
```
User clicks and drags ←
─────────────────────→  Graph moves
                        Minimap viewport moves
                        New area becomes visible
```

### 3. Minimap Click Navigation
```
User clicks here on minimap ●
─────────────────────────────→  Main view pans to that location
                                 Smooth 300ms transition
                                 Zoom level stays same
```

### 4. Fit to View
```
Before:                    After:
┌──────────────┐          ┌──────────────┐
│ ●            │          │  ●─────●     │
│              │  ────→   │  │     │     │
│              │          │  ●─────●───●  │
│    ●         │          │        │   │  │
└──────────────┘          │        ●───●  │
Nodes scattered           └──────────────┘
                          All nodes visible
```

## CSS Class Structure

```
.network-graph-container (or .dependency-tree-container)
├── .network-graph-controls (or .dependency-tree-zoom-controls)
│   ├── .control-btn (+)
│   ├── .control-btn (−)
│   ├── .control-btn (⟲)
│   └── .control-btn (⛶)
├── .network-graph-svg (or .dependency-tree-viz)
│   └── <svg> (main visualization)
└── .network-graph-minimap (or .dependency-tree-minimap)
    ├── .minimap-label
    └── <svg> (minimap visualization)
```

## Color Scheme

### Control Buttons:
- **Normal**: White background, gray border (#ddd)
- **Hover**: Light blue (#e3f2fd), blue border (#2196F3)
- **Text**: Dark blue-gray (#2c3e50)
- **Focus Ring**: Blue with 20% opacity

### Minimap:
- **Background**: Light gray (#f0f0f0)
- **Border**: Medium gray (#999)
- **Viewport Rectangle**: Blue stroke (#2196F3), no fill
- **Container**: White with subtle shadow

### Graph Elements:
- **SVG Background**: Very light gray (#fafafa)
- **SVG Border**: Light gray (#e0e0e0)
- **Nodes**: D3 Category10 color scheme
- **Links**: Gray (#999) with varying opacity

## Responsive Behavior

### Desktop (> 768px):
- Control buttons: 36x36 pixels
- Full minimap: 150x100 pixels
- Positioned bottom-right with 15px margin

### Mobile (≤ 768px):
- Control buttons: 32x32 pixels (slightly smaller)
- Minimap: Same size but 10px margin
- Touch gestures supported via D3

## Animation Timings

- **Zoom/Pan Transitions**: 300ms
- **Fit to View**: 500ms (longer for dramatic effect)
- **Button Hover**: 200ms (CSS transition)
- **All use ease-in-out curves**

## User Feedback

### Visual Feedback Examples:

1. **Zooming In**:
   ```
   User clicks + button
   → Button animates (hover → active)
   → Graph smoothly scales up (300ms)
   → Minimap viewport shrinks
   → Button returns to normal state
   ```

2. **Panning**:
   ```
   User drags graph
   → Cursor becomes move/grabbing
   → Graph follows mouse smoothly
   → Minimap viewport moves in real-time
   → Release shows final position
   ```

3. **Reset**:
   ```
   User clicks reset button
   → Button animates
   → Graph smoothly returns to center (300ms)
   → All nodes become visible
   → Minimap viewport fills
   ```

## Accessibility Features

- ✓ All buttons keyboard accessible (Tab navigation)
- ✓ Clear focus indicators (blue ring)
- ✓ Tooltips on hover (title attributes)
- ✓ High contrast colors
- ✓ Large click targets (36x36px minimum)
- ⚠ Consider adding: ARIA labels, screen reader announcements

## Performance Indicators

- Force simulation stops after 5 seconds
- Smooth 60 FPS animations
- Minimal redraws during pan/zoom
- Efficient minimap updates

## Implementation Notes

- D3.js v7 zoom behavior
- React hooks (useRef, useEffect, useState for DependencyTree)
- No additional dependencies
- ~200 lines added per component
- CSS in separate files for maintainability
