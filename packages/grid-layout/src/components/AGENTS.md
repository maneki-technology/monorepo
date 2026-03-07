# src/components — Web Components

## OVERVIEW
Three custom elements with Shadow DOM: `<grid-item>`, `<grid-layout>`, `<responsive-grid-layout>`. Composition pattern, not inheritance.

## COMPONENT HIERARCHY
```
<responsive-grid-layout>        # Breakpoint-aware wrapper
  └── <grid-layout>             # Core container (created in shadow DOM)
        └── <grid-item> (slot)  # Individual grid cells
```

## COMPONENTS
| Element | Class | Registration | Role |
|---------|-------|-------------|------|
| `<grid-item>` | `GridItemElement` | `grid-item` | Positioned cell with resize handles |
| `<grid-layout>` | `GridLayoutElement` | `grid-layout` | Container: drag/resize/compact/layout/keyboard nav/external drop (~923 lines) |
| `<responsive-grid-layout>` | `ResponsiveGridLayoutElement` | `responsive-grid-layout` | Wraps grid-layout, switches layouts per breakpoint |

## CSS CUSTOM PROPERTIES
All use `var(--grid-*, fallback)` pattern. Set on host or parent.

| Property | Default | Used In |
|----------|---------|---------|
| `--grid-item-transition-duration` | `0.2s` | grid-item |
| `--grid-item-transition-easing` | `ease` | grid-item |
| `--grid-item-active-opacity` | `0.8` | grid-item (dragging/resizing) |
| `--grid-item-active-z-index` | `3` | grid-item (dragging/resizing) |
| `--grid-handle-size` | `20px` | grid-item resize handles |
| `--grid-handle-color` | `rgba(0,0,0,0.4)` | grid-item SE handle indicator |
| `--grid-handle-indicator-size` | `5px` | grid-item SE handle indicator |
| `--grid-handle-indicator-offset` | `3px` | grid-item SE handle indicator |
| `--grid-container-transition-duration` | `0.2s` | grid-layout height |
| `--grid-container-transition-easing` | `ease` | grid-layout height |
| `--grid-placeholder-bg` | `rgba(0,0,0,0.1)` | grid-layout placeholder |
| `--grid-placeholder-border` | `2px dashed rgba(0,0,0,0.3)` | grid-layout placeholder |
| `--grid-placeholder-radius` | `4px` | grid-layout placeholder |
| `--grid-placeholder-transition-duration` | `0.15s` | grid-layout placeholder |
| `--grid-placeholder-transition-easing` | `ease` | grid-layout placeholder |
| `--grid-focus-ring-color` | `#2563eb` | grid-item `:focus-visible` outline |

## LIFECYCLE HOOKS
Set as JS properties (not attributes). Return `false` to cancel.

| Hook | Signature | Effect |
|------|-----------|--------|
| `beforeDragStart` | `(item, event) → boolean \| void` | Cancel drag |
| `beforeResizeStart` | `(item, axis, event) → boolean \| void` | Cancel resize |
| `layoutChangeFilter` | `(newLayout, oldLayout, source) → Layout \| false` | Modify or reject layout changes |
| `afterDrop` | `(item, layout, oldLayout, event) → boolean \| void` | Revert drop |

All hooks forwarded from `responsive-grid-layout` → inner `grid-layout`.

## EVENTS
| Event | Detail Shape | Emitted By |
|-------|-------------|------------|
| `layout-change` | `{ layout }` or `{ layout, layouts, breakpoint }` | grid-layout, responsive-grid-layout |
| `drag-start` / `drag` / `drag-stop` | `GridDragEvent` | grid-layout (forwarded by responsive) |
| `resize-start` / `resize` / `resize-stop` | `GridResizeEvent` | grid-layout (forwarded by responsive) |
| `breakpoint-change` | `{ breakpoint, oldBreakpoint, cols }` | responsive-grid-layout only |
| `external-drop` | `ExternalDropEvent` (`{ layout, item, event }`) | grid-layout (forwarded by responsive) |

## PATTERNS
- `responsive-grid-layout` creates `grid-layout` in its shadow DOM and slots children through
- All events use `bubbles: true, composed: true` to cross shadow boundaries
- `grid-layout` uses `ResizeObserver` for container width; `responsive-grid-layout` uses its own for breakpoint detection
- Drag uses pointer events with `setPointerCapture` + threshold before committing
- Layout setter always clones → correctBounds → compact → updatePositions

## ACCESSIBILITY
- `grid-layout`: `role="grid"`, `aria-roledescription="draggable grid"`
- `grid-item`: `role="gridcell"`, `tabindex="0"`, `aria-grabbed="false"` (toggles to `"true"` during keyboard drag)
- Live region: `<div aria-live="polite">` in grid-layout shadow DOM announces state changes to screen readers
- `:focus-visible` outline ring on grid-item, customizable via `--grid-focus-ring-color`

## KEYBOARD NAVIGATION
All handled in `grid-layout.ts` → `handleKeyDown` (~line 657).

| Key | Context | Action |
|-----|---------|--------|
| Enter / Space | Item focused | Start keyboard drag |
| R | Item focused | Start keyboard resize |
| Arrow keys | Drag active | Move item by 1 grid unit |
| Arrow keys | Resize active | Grow/shrink by 1 grid unit |
| Enter | Drag/resize active | Confirm placement |
| Escape | Drag/resize active | Cancel, revert to original position |

State tracked via private fields: `_kbDragActive`, `_kbResizeActive`, `_kbFocusedItemId`, `_kbOldLayout`.

## EXTERNAL DRAG-AND-DROP
HTML5 drag events for dropping external content into the grid.

| Property | Type | Description |
|----------|------|-------------|
| `isDroppable` | `boolean` | Enable/disable external drop (default `false`) |
| `droppingItem` | `DroppingItem \| null` | Shape `{ i, w, h }` — defines placeholder size for incoming item |

Handlers in `grid-layout.ts`: `handleDragEnter`, `handleDragOver` (calculates grid position via `calcXY`), `handleDragLeave`, `handleDrop` (adds item to layout, emits `external-drop`).

State tracked via: `_isDroppable`, `_droppingItem`, `_externalDragOver`, `_externalPlaceholderItem`.

Both `isDroppable` and `droppingItem` are forwarded from `responsive-grid-layout` → inner `grid-layout`. The `external-drop` event is re-emitted by `responsive-grid-layout`.
## ANIMATION
- `prefers-reduced-motion: reduce` media query in both grid-item and grid-layout — sets `transition-duration: 0.01ms`
- `[interacting]` attribute on grid-layout host during drag/resize — suppresses container height transition
- Placeholder uses `opacity: 0` + `visibility: hidden` instead of `display: none` — enables fade enter/exit
- Placeholder has `will-change: transform` and opacity transition
- `[no-animation]` attribute on grid-layout — sets all `--grid-*-transition-duration` to `0s`, disables all transitions globally
- rAF cancelled in `disconnectedCallback` to prevent orphaned callbacks
