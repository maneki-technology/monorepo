# Charts Architecture

*Snapshot: April 2026*

## Overview

`@maneki/charts` is a zero-dependency SVG chart Web Component library. 11 custom elements cover the common chart types: bar, line, pie, radar, scatter, polar, stacked bar, horizontal bar, stacked horizontal bar, multi-line, and multitype. All rendering is pure SVG inside Shadow DOM. Foundation tokens drive colors and typography.

## Structure

```
packages/charts/
├── src/
│   ├── core/                          # Shared rendering utilities
│   │   ├── types.ts                   # All shared interfaces and types
│   │   ├── scales.ts                  # Linear + category scale functions
│   │   ├── axis.ts                    # Grid line + axis label renderers
│   │   ├── legend.ts                  # Legend layout + rendering
│   │   ├── header.ts                  # Title + legend header block
│   │   ├── math.ts                    # Cartesian layout computation
│   │   └── colors.ts                  # Chart palette + dataset color resolution
│   ├── components/
│   │   ├── chart-bar.ts               # <chart-bar> grouped vertical bars
│   │   ├── chart-line.ts              # <chart-line> line chart with optional fill
│   │   ├── chart-pie.ts               # <chart-pie> pie / doughnut
│   │   ├── chart-radar.ts             # <chart-radar> spider/radar
│   │   ├── chart-scatter.ts           # <chart-scatter> scatter / bubble
│   │   ├── chart-stacked-bar.ts       # <chart-stacked-bar> stacked vertical bars
│   │   ├── chart-horizontal-bar.ts    # <chart-horizontal-bar> horizontal bars
│   │   ├── chart-stacked-horizontal-bar.ts  # <chart-stacked-horizontal-bar>
│   │   ├── chart-polar.ts             # <chart-polar> polar area
│   │   ├── chart-multi-line.ts        # <chart-multi-line> multiple line series
│   │   └── chart-multitype.ts         # <chart-multitype> mixed bar + line
│   └── index.ts                       # Barrel export (types + utilities + components)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Components

| Element | Description |
|---|---|
| `<chart-bar>` | Grouped vertical bar chart, multiple datasets |
| `<chart-line>` | Line chart, optional fill, tension, gradient |
| `<chart-pie>` | Pie or doughnut (configurable inner radius) |
| `<chart-radar>` | Radar / spider chart with configurable axes |
| `<chart-scatter>` | Scatter or bubble chart |
| `<chart-stacked-bar>` | Stacked vertical bars |
| `<chart-horizontal-bar>` | Horizontal bar chart |
| `<chart-stacked-horizontal-bar>` | Stacked horizontal bars |
| `<chart-polar>` | Polar area chart |
| `<chart-multi-line>` | Multiple line series with shared axes |
| `<chart-multitype>` | Mixed bar and line series on shared axes |

All components support both a declarative attribute API (JSON-encoded `labels` and `datasets` attributes) and a programmatic property API (`chart.datasets = [...]`, `chart.options = {...}`). Attribute changes are batched via `requestAnimationFrame` to avoid redundant renders when multiple attributes change together.

## Core Utilities

### Scales (`scales.ts`)

`linearScale(min, max, length, axisConfig)` computes tick marks and a pixel-mapping function for numeric axes. `categoryScale(labels, width, padding)` computes band widths and center/start positions for categorical axes. `dataExtent(datasets)` finds the global min/max across all datasets.

### Axis (`axis.ts`)

`renderYGridLines`, `renderYLabels`, `renderXGridLines`, `renderXLabels` write SVG elements directly into a provided `<g>` group. `renderTitle` places the chart title text.

### Legend (`legend.ts`)

`renderLegend` lays out color swatches and labels in rows. `legendHeight` and `legendRowWidth` compute the space the legend will occupy so the plot area can be sized accordingly. `splitLegendRows` handles wrapping for long legend lists.

### Math (`math.ts`)

`computeCartesianLayout(viewBoxW, viewBoxH, options)` returns a `CartesianLayout` with named `Rect` regions: `viewBox`, `title`, `legend`, `plot`, `xAxis`, `yAxis`. All rendering functions receive these regions rather than computing their own offsets.

### Colors (`colors.ts`)

`CHART_PALETTE` is a 10-color array derived from foundation semantic tokens. `getDatasetColor(index, override)` resolves a dataset's color — either the override value or the palette entry at `index % 10`. `GRID_LINE_COLOR` is a foundation semantic token reference.

## Rendering Model

Each component owns a fixed `960×960` SVG viewBox. The SVG scales to fill its container via `width: 100%; height: auto`. This means all coordinate math is done in viewBox units, not pixels, and the browser handles scaling. Tooltips are positioned in host-relative pixels using `getBoundingClientRect()` comparisons between the SVG and the hovered element.

Rendering is imperative: each `_render()` call clears the SVG and rebuilds it from scratch. There's no diffing or incremental update. Renders are scheduled via `requestAnimationFrame` and deduplicated with a `_renderScheduled` flag.

## Accessibility

Each component sets `role="img"` on the host in `connectedCallback` (with a presence guard). The SVG receives a `<title>` element for screen readers and an optional `<desc>` for detailed descriptions. `aria-label` on the host mirrors the chart title.

## CSS Custom Properties

All components use the `--chart-*` prefix. Key properties: `--chart-font`, `--chart-title-font-size`, `--chart-axis-font-size`, `--chart-legend-font-size`, `--chart-text-color`, `--chart-grid-color`, `--chart-tooltip-bg`. Fallbacks reference foundation token constants (`TEXT_PRIMARY`, `SURFACE_PRIMARY`, `FONT_PRIMARY`, etc.).

## Design Decisions

**Fixed viewBox, fluid container.** A 960×960 viewBox with `preserveAspectRatio="xMidYMid meet"` means the chart always renders at the same internal resolution regardless of container size. This avoids re-rendering on resize and keeps coordinate math simple.

**Imperative SVG construction.** Charts rebuild their SVG on every render rather than patching it. For the data sizes these charts handle (tens to low hundreds of points), a full rebuild is fast enough and far simpler than diffing SVG trees.

**Core/components split.** Shared rendering logic (scales, axes, legend, layout math, colors) lives in `src/core/` and is exported from the package barrel. Components compose these utilities rather than duplicating them.

**Render batching via `requestAnimationFrame`.** Multiple attribute or property changes in the same microtask queue up a single render rather than triggering one per change.

## Known Issues

1. **No unit tests for components.** The `src/core/` modules have tests (`colors.test.ts`, `legend.test.ts`, `math.test.ts`, `scales.test.ts`) but the 11 component files have none. Component behavior is only verified visually via the catalog.

2. **No Playwright visual tests.** Unlike grid-layout, charts has no screenshot regression suite. Visual correctness depends on the catalog's per-page screenshots.

3. **Tooltip positioning breaks on transformed ancestors.** The tooltip uses `getBoundingClientRect()` relative to the host element. If the host has a CSS transform applied by an ancestor, tooltip positions will be off.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
