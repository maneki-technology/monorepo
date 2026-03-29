// Core types
export type {
  DataValue,
  Dataset,
  AxisConfig,
  ChartOptions,
  BarChartOptions,
  LineChartOptions,
  PieSlice,
  PieChartOptions,
  RadarAxis,
  RadarChartOptions,
  ScatterPoint,
  ScatterDataset,
  ScatterChartOptions,
  Rect,
  Padding,
  CartesianLayout,
  Tick,
  LinearScaleResult,
  CategoryScaleResult,
  LegendItem,
  ChartEventDetail,
} from "./core/types.js";

// Core utilities
export { linearScale, categoryScale, dataExtent } from "./core/scales.js";
export { renderYGridLines, renderYLabels, renderXGridLines, renderXLabels, renderTitle } from "./core/axis.js";
export { renderLegend, legendHeight, legendRowWidth, splitLegendRows } from "./core/legend.js";
export { computeCartesianLayout } from "./core/math.js";
export { CHART_PALETTE, getDatasetColor, GRID_LINE_COLOR } from "./core/colors.js";
export { renderChartHeader } from "./core/header.js";
export type { ChartHeaderResult } from "./core/header.js";

// Components
export { ChartBarElement } from "./components/chart-bar.js";
export { ChartLineElement } from "./components/chart-line.js";
export { ChartPieElement } from "./components/chart-pie.js";
export { ChartRadarElement } from "./components/chart-radar.js";
export { ChartScatterElement } from "./components/chart-scatter.js";
export { ChartStackedBarElement } from "./components/chart-stacked-bar.js";
export { ChartHorizontalBarElement } from "./components/chart-horizontal-bar.js";
export { ChartStackedHorizontalBarElement } from "./components/chart-stacked-horizontal-bar.js";
export { ChartPolarElement } from "./components/chart-polar.js";
export { ChartMultiLineElement } from "./components/chart-multi-line.js";
export type { MultiLineDataset, MultiLineChartOptions } from "./components/chart-multi-line.js";
export { ChartMultitypeElement } from "./components/chart-multitype.js";
export type { MultitypeDataset, MultitypeChartOptions } from "./components/chart-multitype.js";
