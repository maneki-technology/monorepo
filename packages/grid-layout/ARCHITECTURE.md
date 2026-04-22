# Grid Layout Architecture

*Snapshot: April 2026*

## Overview

`@maneki/grid-layout` is a zero-dependency Web Component grid layout library inspired by react-grid-layout. Three custom elements (`<grid-layout>`, `<grid-item>`, `<responsive-grid-layout>`) provide drag, resize, responsive breakpoints, keyboard accessibility, and external drag-and-drop. ~3700 lines of TypeScript, ~44 kB / ~9.9 kB gzip as an ES module.

## Structure

```
packages/grid-layout/
├── src/
│   ├── core/                    # Pure logic engine — no DOM
│   │   ├── types.ts             # All shared types and interfaces
│   │   ├── collision.ts         # AABB overlap detection
│   │   ├── compact.ts           # Vertical + horizontal compaction
│   │   ├── layout-engine.ts     # Move, push, bounded collision resolution
│   │   ├── responsive.ts        # Breakpoint matching, layout generation
│   │   └── math.ts              # Position/size calculations (calcColWidth, calcXY, etc.)
│   ├── components/
│   │   ├── grid-item.ts         # <grid-item> — individual cell, ARIA gridcell
│   │   ├── grid-layout.ts       # <grid-layout> — container, drag/resize/keyboard (~923 lines)
│   │   └── responsive-grid-layout.ts  # <responsive-grid-layout> — breakpoint wrapper
│   └── index.ts                 # Barrel export (types + utilities + components)
├── e2e/
│   ├── fixtures.html            # 8 grid scenarios for visual tests
│   ├── visual.spec.ts           # 16 Playwright screenshot tests
│   └── snapshots/               # Baseline screenshots
├── demo.html                    # Three demos: basic, responsive, customization
├── stress-test.html             # FPS counter, auto-drag/resize
└── playwright.config.ts
```

## Components

### `<grid-layout>`

The main container. Manages all layout state, drag, resize, keyboard navigation, and external drop for its child `<grid-item>` elements. The largest file in the package at ~923 lines.

Carries `role="grid"` and `aria-roledescription="draggable grid"`. A live region inside the shadow root announces state changes to screen readers.

Key properties: `layout`, `gridConfig`, `dragConfig`, `resizeConfig`, `compactType`, `preventCollision`, `isDroppable`, `droppingItem`.

Events emitted: `drag-start`, `drag`, `drag-stop`, `resize-start`, `resize`, `resize-stop`, `layout-change`, `external-drop`.

### `<grid-item>`

Individual grid cell. Carries `role="gridcell"`, `tabindex="0"`, and `aria-grabbed`. Attributes (`item-id`, `x`, `y`, `w`, `h`, `min-w`, `max-w`, `min-h`, `max-h`, `static`) mirror the layout item fields. Per-item drag/resize overrides via `isDraggable` / `isResizable` properties.

### `<responsive-grid-layout>`

A thin breakpoint-aware wrapper around `<grid-layout>`. Observes container width via `ResizeObserver`, matches the current breakpoint, and swaps the active layout. Forwards all config properties and lifecycle hooks to the inner `<grid-layout>`. Emits `breakpoint-change` in addition to the standard layout events.

Default breakpoints: `{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }`. Default cols: `{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }`.

## Core Engine

The `src/core/` directory contains pure functions with no DOM dependency. This separation means the layout math can be unit-tested without a browser environment.

### Collision Detection (`collision.ts`)

AABB (axis-aligned bounding box) overlap check. `collides(a, b)` returns true if two layout items overlap. `getFirstCollision` and `getAllCollisions` scan a layout array.

### Compaction (`compact.ts`)

`compact(layout, compactType, cols)` produces a new layout with items packed toward the origin. Supports `"vertical"` (pack upward), `"horizontal"` (pack leftward), and `null` (no compaction).

### Layout Engine (`layout-engine.ts`)

`moveElement` moves an item and resolves collisions by pushing displaced items. Collision resolution uses a bounded loop (max 100 iterations) to prevent infinite recursion — a regression from an earlier recursive implementation.

### Responsive Utils (`responsive.ts`)

`getBreakpointFromWidth` maps a pixel width to a breakpoint name. `findOrGenerateResponsiveLayout` returns the stored layout for a breakpoint or generates one from the largest available layout.

## Drag and Resize System

Drag and resize are pointer-event driven. `handlePointerDown` on `<grid-layout>` uses `composedPath()` to find the target `<grid-item>` across shadow DOM boundaries (since `closest("grid-item")` can't cross shadow roots). `setPointerCapture` is called on the `<grid-layout>` element itself — not `e.target` — with `pointermove` and `pointerup` listeners on `this`. This keeps all pointer events within the component regardless of where the pointer moves.

During interaction, the `[interacting]` attribute is set on the container to suppress height transitions and prevent layout jank. The placeholder element fades via opacity/visibility rather than appearing abruptly.

`prefers-reduced-motion` is respected: near-zero transition durations are applied automatically. The `no-animation` attribute disables all transitions globally.

## Keyboard Accessibility

Full keyboard navigation is implemented in `handleKeyDown` on `<grid-layout>`:

| Key | Context | Action |
|---|---|---|
| Enter / Space | Item focused | Start drag mode |
| R | Item focused | Start resize mode |
| Arrow keys | Drag mode | Move one cell |
| Arrow keys | Resize mode | Grow/shrink one cell |
| Enter | Drag or resize mode | Confirm |
| Escape | Drag or resize mode | Cancel, revert |

Keyboard state is tracked via private fields: `_kbDragActive`, `_kbResizeActive`, `_kbFocusedItemId`, `_kbOldLayout`. The live region announces pick-up, movement, drop, and cancel events.

## External Drag-and-Drop

HTML5 drag events (`dragenter`, `dragover`, `dragleave`, `drop`) on `<grid-layout>`. Enabled via `isDroppable = true`. The `droppingItem` property provides the size descriptor `{ i, w, h }` for the incoming item. A placeholder is shown as the user drags over the grid. On drop, an `external-drop` event fires with the final layout and placed item.

External drop state is tracked via `_isDroppable`, `_droppingItem`, `_externalDragOver`, `_externalPlaceholderItem`.

## Lifecycle Hooks

Hooks are JS property setters, not attributes. Return `false` to cancel.

| Hook | Fires | Cancel effect |
|---|---|---|
| `beforeDragStart` | Before drag begins | Prevents drag |
| `beforeResizeStart` | Before resize begins | Prevents resize |
| `layoutChangeFilter` | On every layout change | Rejects or modifies layout |
| `afterDrop` | After drag ends | Reverts to pre-drag layout |

`<responsive-grid-layout>` forwards all four hooks to its inner `<grid-layout>`.

## CSS Custom Properties

All 15 properties are set on the host element and cascade into Shadow DOM via `var(--grid-*, fallback)`. Fallbacks use `colorVar()` / `semanticVar()` from `@maneki/foundation`.

Key properties: `--grid-item-transition-duration`, `--grid-item-active-opacity`, `--grid-handle-size`, `--grid-handle-color`, `--grid-placeholder-bg`, `--grid-placeholder-border`, `--grid-focus-ring-color`, `--grid-container-transition-duration`.

## Design Decisions

**Core/components split.** All layout math lives in `src/core/` as pure functions. Components are thin wrappers that translate DOM events into core function calls and apply the results. This makes the logic independently testable and keeps component files focused on DOM concerns.

**Composition over inheritance.** `<responsive-grid-layout>` wraps `<grid-layout>` rather than extending it. This avoids the fragility of Web Component inheritance and keeps the two components independently usable.

**Bounded collision resolution.** The layout engine uses a loop capped at 100 iterations instead of recursion. An earlier recursive implementation caused stack overflows on certain layouts.

**Pointer capture on the container.** `setPointerCapture` on `<grid-layout>` (not the dragged item) ensures `pointermove` and `pointerup` events are always received even when the pointer leaves the component boundary mid-drag.

**Layout always cloned on get/set.** The `layout` getter returns a deep clone. This prevents external code from mutating internal state directly, which would bypass compaction and event emission.

**No attributes in constructors.** `role` and `aria-roledescription` are set in `connectedCallback` with a presence guard. Setting attributes in constructors causes `NotSupportedError` when elements are created via `document.createElement` during Lit template cloning.

## Testing

220 unit tests (Vitest + happy-dom), co-located with source. 21 Playwright visual screenshot tests against `e2e/fixtures.html` (8 grid scenarios). Benchmarks in `benchmark.test.ts`.

## Known Issues

1. **No Moon build dependency on foundation.** `grid-layout` depends on `@maneki/foundation` at runtime but doesn't declare `foundation:build` in `moon.yml`. A clean build from scratch could fail if foundation hasn't been built yet.

2. **`src/styles/` is empty.** The directory exists but all CSS lives inside component files as template literals. The directory is vestigial.

3. **`responsive-grid-layout` layouts setter bypasses `onWidthChange`.** The setter applies the layout for the current breakpoint directly rather than going through `onWidthChange`. This was intentional — it fixes a race condition where `ResizeObserver` fires before `setTimeout(0)` sets the layouts — but it means the two code paths are not symmetric.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
