/**
 * Core type definitions for @maneki/charts.
 *
 * All chart components share these interfaces for data, options,
 * layout regions, and rendering context.
 */

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/** A single data point value — number or null for gaps. */
export type DataValue = number | null;

/** A dataset for cartesian charts (bar, line, etc.). */
export interface Dataset {
  /** Display label for the legend. */
  label: string;
  /** Data values — one per category label. */
  data: DataValue[];
  /** Override color for this dataset (CSS color string or chart token index 1-10). */
  color?: string | number;
}

/** Configuration for a single axis. */
export interface AxisConfig {
  /** Axis label text. */
  label?: string;
  /** Minimum value (auto-computed if omitted). */
  min?: number;
  /** Maximum value (auto-computed if omitted). */
  max?: number;
  /** Number of ticks to aim for (hint, not exact). */
  tickCount?: number;
  /** Custom tick formatter. */
  formatTick?: (value: number) => string;
  /** Whether to include zero in the axis range. Default: true for bar charts, false for scatter. */
  beginAtZero?: boolean;
}

// ---------------------------------------------------------------------------
// Chart Options
// ---------------------------------------------------------------------------

/** Shared options for all chart types. */
export interface ChartOptions {
  /** Chart title text. */
  title?: string;
  /** Show legend. Default: true. */
  showLegend?: boolean;
  /** Show grid lines. Default: true. */
  showGrid?: boolean;
  /** Show tooltips on hover. Default: true. */
  showTooltips?: boolean;
  /** Animation duration in ms. 0 = no animation. Default: 300. */
  animationDuration?: number;
  /** Accessible description for screen readers. */
  description?: string;
}

/** Options specific to bar charts. */
export interface BarChartOptions extends ChartOptions {
  /** Category labels for the x-axis. */
  labels: string[];
  /** X-axis configuration. */
  xAxis?: AxisConfig;
  /** Y-axis configuration. */
  yAxis?: AxisConfig;
  /** Gap between bars within a group, as fraction of bar width. Default: 0.1. */
  barGap?: number;
  /** Gap between groups, as fraction of group width. Default: 0.2. */
  groupGap?: number;
  /** Rotate x-axis labels by degrees. Default: 0. */
  labelRotation?: number;
}

/** Options specific to line charts. */
export interface LineChartOptions extends ChartOptions {
  /** Category labels for the x-axis. */
  labels: string[];
  /** X-axis configuration. */
  xAxis?: AxisConfig;
  /** Y-axis configuration. */
  yAxis?: AxisConfig;
  /** Rotate x-axis labels by degrees. Default: 0. */
  labelRotation?: number;
  /** Show data points. Default: true. */
  showPoints?: boolean;
  /** Data point radius. Default: 4. */
  pointRadius?: number;
  /** Line width. Default: 2. */
  lineWidth?: number;
  /** Fill area under the line. Default: false. */
  fill?: boolean;
  /** Line tension (0 = straight, 1 = very curved). Default: 0. */
  tension?: number;
  /** Use gradient fill instead of flat opacity. Default: false. */
  gradient?: boolean;
}

/** A single slice for pie/doughnut charts. */
export interface PieSlice {
  /** Display label. */
  label: string;
  /** Numeric value (determines slice size). */
  value: number;
  /** Override color (CSS string or 1-based palette index). */
  color?: string | number;
}

/** Options specific to pie and doughnut charts. */
export interface PieChartOptions extends ChartOptions {
  /** Inner radius as fraction of outer radius (0 = pie, 0.5+ = doughnut). Default: 0. */
  innerRadius?: number;
  /** Start angle in degrees (0 = top). Default: 0. */
  startAngle?: number;
}

/** A single axis for radar charts. */
export interface RadarAxis {
  /** Axis label. */
  label: string;
  /** Maximum value for this axis (auto if omitted). */
  max?: number;
}

/** Options specific to radar charts. */
export interface RadarChartOptions extends ChartOptions {
  /** Axis definitions (one per spoke). */
  axes: RadarAxis[];
  /** Number of concentric grid rings. Default: 5. */
  levels?: number;
  /** Fill area. Default: true. */
  fill?: boolean;
  /** Fill opacity. Default: 0.15. */
  fillOpacity?: number;
  /** Line width. Default: 2. */
  lineWidth?: number;
  /** Show data points. Default: true. */
  showPoints?: boolean;
  /** Point radius. Default: 4. */
  pointRadius?: number;
}

/** A data point for scatter/bubble charts. */
export interface ScatterPoint {
  x: number;
  y: number;
  /** Bubble radius value (only for bubble charts). */
  r?: number;
}

/** A dataset for scatter/bubble charts. */
export interface ScatterDataset {
  label: string;
  data: ScatterPoint[];
  color?: string | number;
}

/** Options specific to scatter and bubble charts. */
export interface ScatterChartOptions extends ChartOptions {
  /** X-axis configuration. */
  xAxis?: AxisConfig;
  /** Y-axis configuration. */
  yAxis?: AxisConfig;
  /** Point radius (scatter). Default: 5. */
  pointRadius?: number;
  /** Min bubble radius in px (bubble). Default: 4. */
  minBubbleRadius?: number;
  /** Max bubble radius in px (bubble). Default: 40. */
  maxBubbleRadius?: number;
}

// ---------------------------------------------------------------------------
// Layout — computed regions within the SVG viewBox
// ---------------------------------------------------------------------------

/** A rectangular region within the SVG coordinate space. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Padding/margin around the plot area. */
export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Computed layout regions for a cartesian chart. */
export interface CartesianLayout {
  /** Full SVG viewBox dimensions. */
  viewBox: { width: number; height: number };
  /** Title region. */
  title: Rect;
  /** Legend region. */
  legend: Rect;
  /** Plot area (where bars/lines are drawn). */
  plot: Rect;
  /** X-axis label region. */
  xAxis: Rect;
  /** Y-axis label region. */
  yAxis: Rect;
}

// ---------------------------------------------------------------------------
// Scale output
// ---------------------------------------------------------------------------

/** A computed tick mark on an axis. */
export interface Tick {
  /** The data value at this tick. */
  value: number;
  /** The pixel position along the axis. */
  position: number;
  /** Formatted label string. */
  label: string;
}

/** Result of computing a linear scale. */
export interface LinearScaleResult {
  /** Computed minimum (may differ from input if auto). */
  min: number;
  /** Computed maximum (may differ from input if auto). */
  max: number;
  /** Tick marks. */
  ticks: Tick[];
  /** Map a data value to pixel position within the axis length. */
  scale: (value: number) => number;
}

/** Result of computing a category scale. */
export interface CategoryScaleResult {
  /** Category labels. */
  labels: string[];
  /** Width of each category band in pixels. */
  bandWidth: number;
  /** Map a category index to the center pixel position. */
  scale: (index: number) => number;
  /** Map a category index to the left edge pixel position. */
  start: (index: number) => number;
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

/** A single legend entry. */
export interface LegendItem {
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Detail for chart data point interaction events. */
export interface ChartEventDetail {
  /** Dataset index. */
  datasetIndex: number;
  /** Data point index within the dataset. */
  dataIndex: number;
  /** The data value. */
  value: DataValue;
  /** The dataset label. */
  datasetLabel: string;
  /** The category label (if applicable). */
  categoryLabel?: string;
}


// Re-export LegendConfig from legend module for header.ts
export type { LegendConfig } from "./legend.js";