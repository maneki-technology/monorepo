# @maneki/grid-layout

A zero-dependency Web Component grid layout library inspired by react-grid-layout. Drag, resize, and rearrange grid items with full responsive breakpoint support.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- Zero runtime dependencies
- Three components: `<grid-layout>`, `<grid-item>`, `<responsive-grid-layout>`
- Drag and resize with configurable handles, bounds, and thresholds
- Vertical, horizontal, or no compaction
- Responsive breakpoints with per-breakpoint layouts
- Shadow DOM encapsulation with 15 CSS custom properties for theming
- Lifecycle hooks to intercept and cancel drag, resize, and layout changes
- ~35 kB / ~8 kB gzip (ES module)
- TypeScript types included

---

## Install

```bash
npm install @maneki/grid-layout
```

Or load directly in a browser:

```html
<script type="module" src="https://unpkg.com/@maneki/grid-layout/dist/index.js"></script>
```

---

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    grid-layout {
      display: block;
      width: 100%;
      height: 600px;
    }
  </style>
</head>
<body>
  <grid-layout>
    <grid-item item-id="a" x="0" y="0" w="4" h="2">
      <div>Item A</div>
    </grid-item>
    <grid-item item-id="b" x="4" y="0" w="4" h="2">
      <div>Item B</div>
    </grid-item>
    <grid-item item-id="c" x="8" y="0" w="4" h="2">
      <div>Item C</div>
    </grid-item>
  </grid-layout>

  <script type="module">
    import '@maneki/grid-layout';

    const grid = document.querySelector('grid-layout');

    grid.gridConfig = {
      cols: 12,
      rowHeight: 150,
      margin: [10, 10],
    };

    grid.addEventListener('layout-change', (e) => {
      console.log('Layout changed:', e.detail.layout);
    });
  </script>
</body>
</html>
```

---

## Components

### `<grid-layout>`

The main container. Manages layout state, drag, and resize for all child `<grid-item>` elements.

**Properties**

| Property | Type | Default | Description |
|---|---|---|---|
| `layout` | `Layout[]` | `[]` | Array of layout item definitions |
| `gridConfig` | `GridConfig` | see below | Grid dimensions and spacing |
| `dragConfig` | `DragConfig` | see below | Drag behavior |
| `resizeConfig` | `ResizeConfig` | see below | Resize behavior |
| `compactType` | `"vertical" \| "horizontal" \| null` | `"vertical"` | How items compact after a move |
| `preventCollision` | `boolean` | `false` | Prevent items from overlapping |

**Setting layout programmatically**

```js
const grid = document.querySelector('grid-layout');

grid.layout = [
  { i: 'a', x: 0, y: 0, w: 4, h: 2 },
  { i: 'b', x: 4, y: 0, w: 4, h: 2 },
  { i: 'c', x: 8, y: 0, w: 4, h: 2 },
];
```

---

### `<grid-item>`

Individual grid cell. Place these as direct children of `<grid-layout>`.

**Attributes**

| Attribute | Type | Description |
|---|---|---|
| `item-id` | `string` | Required. Matches the `i` field in the layout array |
| `x` | `number` | Column position (0-based) |
| `y` | `number` | Row position (0-based) |
| `w` | `number` | Width in columns |
| `h` | `number` | Height in rows |
| `min-w` | `number` | Minimum width in columns |
| `max-w` | `number` | Maximum width in columns |
| `min-h` | `number` | Minimum height in rows |
| `max-h` | `number` | Maximum height in rows |
| `static` | `boolean` | If present, item cannot be dragged or resized |

**Properties**

| Property | Type | Description |
|---|---|---|
| `isDraggable` | `boolean` | Override drag for this item |
| `isResizable` | `boolean` | Override resize for this item |

---

### `<responsive-grid-layout>`

A breakpoint-aware wrapper that swaps layouts as the container width changes.

```html
<responsive-grid-layout>
  <grid-item item-id="a" x="0" y="0" w="6" h="2">Item A</grid-item>
  <grid-item item-id="b" x="6" y="0" w="6" h="2">Item B</grid-item>
</responsive-grid-layout>
```

```js
const rgl = document.querySelector('responsive-grid-layout');

rgl.layouts = {
  lg: [
    { i: 'a', x: 0, y: 0, w: 6, h: 2 },
    { i: 'b', x: 6, y: 0, w: 6, h: 2 },
  ],
  sm: [
    { i: 'a', x: 0, y: 0, w: 6, h: 2 },
    { i: 'b', x: 0, y: 2, w: 6, h: 2 },
  ],
};

rgl.addEventListener('breakpoint-change', (e) => {
  console.log('Breakpoint:', e.detail.breakpoint, 'Cols:', e.detail.cols);
});
```

**Properties**

| Property | Type | Description |
|---|---|---|
| `layouts` | `ResponsiveLayouts` | Per-breakpoint layout arrays |
| `breakpoints` | `Breakpoints` | Width thresholds per breakpoint name |
| `cols` | `Record<string, number>` | Column count per breakpoint |
| `gridConfig` | `GridConfig` | Forwarded to inner `<grid-layout>` |
| `dragConfig` | `DragConfig` | Forwarded to inner `<grid-layout>` |
| `resizeConfig` | `ResizeConfig` | Forwarded to inner `<grid-layout>` |
| `compactType` | `"vertical" \| "horizontal" \| null` | Forwarded |
| `preventCollision` | `boolean` | Forwarded |

**Default breakpoints**

```js
{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
```

**Default cols**

```js
{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
```

---

## Configuration

### GridConfig

```js
grid.gridConfig = {
  cols: 12,              // number of columns
  rowHeight: 150,        // row height in pixels
  margin: [10, 10],      // [horizontal, vertical] gap between items
  containerPadding: null, // [horizontal, vertical] padding, or null to match margin
  maxRows: Infinity,     // maximum number of rows
};
```

### DragConfig

```js
grid.dragConfig = {
  enabled: true,         // enable drag globally
  bounded: false,        // constrain drag within the grid container
  handle: null,          // CSS selector for drag handle (e.g. '.drag-handle')
  cancel: null,          // CSS selector for elements that cancel drag
  threshold: 3,          // pixels of movement before drag starts
};
```

### ResizeConfig

```js
grid.resizeConfig = {
  enabled: true,
  handles: ['se'],       // active resize handles
  // available: 's', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'
};
```

---

## CSS Custom Properties

All properties are set on the host element and cascade into Shadow DOM.

```css
grid-layout {
  /* Item transitions */
  --grid-item-transition-duration: 0.2s;
  --grid-item-transition-easing: ease;

  /* Active item (while dragging/resizing) */
  --grid-item-active-opacity: 0.8;
  --grid-item-active-z-index: 3;

  /* Resize handle */
  --grid-handle-size: 20px;
  --grid-handle-color: rgba(0, 0, 0, 0.4);
  --grid-handle-indicator-size: 5px;
  --grid-handle-indicator-offset: 3px;

  /* Container animation */
  --grid-container-transition-duration: 0.2s;
  --grid-container-transition-easing: ease;

  /* Drop placeholder */
  --grid-placeholder-bg: rgba(0, 0, 0, 0.1);
  --grid-placeholder-border: 2px dashed rgba(0, 0, 0, 0.3);
  --grid-placeholder-radius: 4px;
  --grid-placeholder-transition-duration: 0.15s;
  --grid-placeholder-transition-easing: ease;
}
```

### Animation Control

The grid respects `prefers-reduced-motion: reduce` automatically, setting near-zero transition durations for users who prefer reduced motion.

To disable all animations programmatically, add the `no-animation` attribute:

```html
<grid-layout no-animation>
  <!-- items transition instantly -->
</grid-layout>
```

During drag and resize, the container height transition is automatically suppressed via the `[interacting]` attribute to prevent jank. The placeholder fades in and out with an opacity transition rather than appearing abruptly.

---

## Lifecycle Hooks

Hooks are set as JS properties. Return `false` to cancel the operation.

```js
const grid = document.querySelector('grid-layout');

// Cancel drag for specific items
grid.beforeDragStart = (item, event) => {
  if (item.i === 'locked') return false;
};

// Cancel resize based on axis
grid.beforeResizeStart = (item, axis, event) => {
  if (item.i === 'fixed-width' && (axis === 'e' || axis === 'w')) return false;
};

// Modify or reject layout changes
grid.layoutChangeFilter = (newLayout, oldLayout, source) => {
  // source: 'drag' | 'resize' | 'compact' | 'set'
  if (source === 'drag') {
    // Return a modified layout, or false to reject
    return newLayout;
  }
  return newLayout;
};

// Called after drag ends. Return false to revert to pre-drag layout
grid.afterDrop = (item, layout, oldLayout, event) => {
  console.log('Dropped:', item.i, 'at', item.x, item.y);
};
```

`<responsive-grid-layout>` forwards all four hooks to its inner `<grid-layout>`.

---

## Events

All events bubble and are composed, so they cross Shadow DOM boundaries.

```js
grid.addEventListener('drag-start', (e) => {
  const { layout, oldItem, newItem, placeholder, event, element } = e.detail;
});

grid.addEventListener('drag', (e) => { /* same detail shape */ });
grid.addEventListener('drag-stop', (e) => { /* same detail shape */ });

grid.addEventListener('resize-start', (e) => {
  const { layout, oldItem, newItem, placeholder, event, element } = e.detail;
});

grid.addEventListener('resize', (e) => { /* same detail shape */ });
grid.addEventListener('resize-stop', (e) => { /* same detail shape */ });

grid.addEventListener('layout-change', (e) => {
  const { layout } = e.detail;
});
```

On `<responsive-grid-layout>`, `layout-change` includes extra fields:

```js
rgl.addEventListener('layout-change', (e) => {
  const { layout, layouts, breakpoint } = e.detail;
});

rgl.addEventListener('breakpoint-change', (e) => {
  const { breakpoint, oldBreakpoint, cols } = e.detail;
});
```

---

## Accessibility

`<grid-layout>` is built with accessibility in mind. Items carry the appropriate ARIA roles and attributes, keyboard navigation is fully supported, and a live region announces state changes to screen readers.

### ARIA roles and attributes

| Element | Role | Attributes |
|---|---|---|
| `<grid-layout>` | `grid` | `aria-roledescription="draggable grid"` |
| `<grid-item>` | `gridcell` | `tabindex="0"`, `aria-grabbed` (true/false during keyboard drag) |

The live region inside `<grid-layout>` announces when an item is picked up, moved, resized, dropped, or when an action is cancelled.

### Focus styles

Items show a `:focus-visible` outline when navigated by keyboard. Customize the color with:

```css
grid-layout {
  --grid-focus-ring-color: #005fcc;
}
```

### Keyboard navigation

| Key | Context | Action |
|---|---|---|
| `Enter` or `Space` | Item focused | Start drag mode |
| `R` | Item focused | Start resize mode |
| Arrow keys | Drag mode | Move item one cell in that direction |
| Arrow keys | Resize mode | Expand or shrink item by one cell |
| `Enter` | Drag or resize mode | Confirm and drop |
| `Escape` | Drag or resize mode | Cancel and revert to original position |

Keyboard interaction is automatic. Tab to a `<grid-item>` and press `Enter` or `Space` to start dragging, then use arrow keys to move, and `Enter` again to confirm.

```js
// No setup required for keyboard nav.
// Tab to a grid-item, then:
//   Enter / Space  → grab item
//   Arrow keys     → move one cell
//   Enter          → drop
//   Escape         → cancel
//
// Press R instead of Enter to enter resize mode:
//   Arrow keys     → grow or shrink by one cell
//   Enter          → confirm resize
//   Escape         → cancel resize
```

---

## External Drag-and-Drop

You can drag elements from outside the grid and drop them in as new items. Enable it with the `isDroppable` property and provide a `droppingItem` descriptor so the grid knows how large the incoming item will be.

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `isDroppable` | `boolean` | `false` | Allow external elements to be dropped onto the grid |
| `droppingItem` | `{ i: string, w: number, h: number }` | — | Size and id of the item being dragged in |

Both properties are forwarded by `<responsive-grid-layout>`.

### Event

```js
grid.addEventListener('external-drop', (e) => {
  const { layout, item, event } = e.detail;
  // layout: updated Layout array after the drop
  // item:   the LayoutItem that was placed
  // event:  the native DragEvent
});
```

### Example

```js
const paletteItem = document.querySelector('#palette-item');
const grid = document.querySelector('grid-layout');

paletteItem.setAttribute('draggable', 'true');

paletteItem.addEventListener('dragstart', () => {
  grid.isDroppable = true;
  grid.droppingItem = { i: 'new-item', w: 2, h: 2 };
});

paletteItem.addEventListener('dragend', () => {
  grid.isDroppable = false;
});

grid.addEventListener('external-drop', (e) => {
  const { item } = e.detail;
  console.log('Dropped at', item.x, item.y);

  // Persist the new item into your layout state
  grid.layout = [...grid.layout, item];
});
```

---

## Exported Utilities

For advanced use cases, the package exports the core layout engine functions directly.

```js
import {
  calcColWidth,
  calcPosition,
  calcXY,
  calcWH,
  compact,
  correctBounds,
  moveElement,
  cloneLayout,
  getLayoutItem,
  sortLayoutItems,
  collides,
  getFirstCollision,
  getAllCollisions,
  getBreakpointFromWidth,
  findOrGenerateResponsiveLayout,
} from '@maneki/grid-layout';
```

---

## Browser Support

Requires browsers with native support for:

- Custom Elements v1
- Shadow DOM v1
- CSS Custom Properties

This covers all modern browsers. No polyfills are included or needed for current Chrome, Firefox, Safari, and Edge.

---

## Development

```bash
npm run dev                  # Vite dev server with demo.html
npm run build                # tsc + vite build → dist/
npm test                     # 220 unit tests (vitest + happy-dom)
npm run test:visual          # 21 Playwright screenshot tests
npm run test:visual:update   # regenerate baseline snapshots
```

---

## License

MIT
