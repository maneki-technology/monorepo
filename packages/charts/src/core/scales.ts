/**
 * Scale computations for mapping data values to pixel positions.
 *
 * Pure functions — no DOM, no side effects.
 */

import type {
  LinearScaleResult,
  CategoryScaleResult,
  Tick,
  AxisConfig,
} from "./types.js";

// ---------------------------------------------------------------------------
// Nice numbers — for human-friendly tick intervals
// ---------------------------------------------------------------------------

/**
 * Find a "nice" number that is approximately equal to the given range.
 * Used to compute tick intervals that are multiples of 1, 2, or 5.
 */
function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let nice: number;

  if (round) {
    if (fraction < 1.5) nice = 1;
    else if (fraction < 3) nice = 2;
    else if (fraction < 7) nice = 5;
    else nice = 10;
  } else {
    if (fraction <= 1) nice = 1;
    else if (fraction <= 2) nice = 2;
    else if (fraction <= 5) nice = 5;
    else nice = 10;
  }

  return nice * Math.pow(10, exponent);
}

// ---------------------------------------------------------------------------
// Linear scale
// ---------------------------------------------------------------------------

/**
 * Compute a linear scale for a numeric axis.
 *
 * @param dataMin - Minimum value across all datasets
 * @param dataMax - Maximum value across all datasets
 * @param axisLength - Pixel length of the axis
 * @param config - Optional axis configuration overrides
 */
export function linearScale(
  dataMin: number,
  dataMax: number,
  axisLength: number,
  config?: AxisConfig,
): LinearScaleResult {
  const tickCount = config?.tickCount ?? 5;
  const formatTick = config?.formatTick ?? defaultFormat;

  // Handle edge case: all values are the same
  if (dataMin === dataMax) {
    dataMin = dataMin === 0 ? -1 : dataMin - Math.abs(dataMin) * 0.1;
    dataMax = dataMax === 0 ? 1 : dataMax + Math.abs(dataMax) * 0.1;
  }

  // Include zero if data is all positive or all negative (unless beginAtZero is false)
  const beginAtZero = config?.beginAtZero ?? true;
  if (beginAtZero) {
    if (dataMin > 0 && config?.min === undefined) dataMin = 0;
    if (dataMax < 0 && config?.max === undefined) dataMax = 0;
  }

  // Apply user overrides
  let min = config?.min ?? dataMin;
  let max = config?.max ?? dataMax;

  // Compute nice tick interval
  const range = niceNum(max - min, false);
  const tickSpacing = niceNum(range / (tickCount - 1), true);

  // Snap min/max to tick boundaries
  min = Math.floor(min / tickSpacing) * tickSpacing;
  max = Math.ceil(max / tickSpacing) * tickSpacing;

  // Generate ticks
  const ticks: Tick[] = [];
  for (let v = min; v <= max + tickSpacing * 0.5; v += tickSpacing) {
    const rounded = Math.round(v * 1e10) / 1e10; // avoid floating point drift
    if (rounded > max) break;
    const position = ((rounded - min) / (max - min)) * axisLength;
    ticks.push({
      value: rounded,
      position,
      label: formatTick(rounded),
    });
  }

  const scale = (value: number): number => {
    return ((value - min) / (max - min)) * axisLength;
  };

  return { min, max, ticks, scale };
}

// ---------------------------------------------------------------------------
// Category scale
// ---------------------------------------------------------------------------

/**
 * Compute a category (band) scale for a categorical axis.
 *
 * @param labels - Category labels
 * @param axisLength - Pixel length of the axis
 * @param padding - Fraction of band width used as outer padding. Default: 0.1
 */
export function categoryScale(
  labels: string[],
  axisLength: number,
  padding = 0.1,
): CategoryScaleResult {
  const n = labels.length;
  if (n === 0) {
    return {
      labels: [],
      bandWidth: 0,
      scale: () => 0,
      start: () => 0,
    };
  }

  // Total padding = padding on each side of the axis
  const totalPadding = padding * 2;
  const usableLength = axisLength * (1 - totalPadding);
  const bandWidth = usableLength / n;
  const offset = axisLength * padding;

  const scale = (index: number): number => {
    return offset + bandWidth * index + bandWidth / 2;
  };

  const start = (index: number): number => {
    return offset + bandWidth * index;
  };

  return { labels, bandWidth, scale, start };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultFormat(value: number): string {
  if (Math.abs(value) >= 1000) {
    // Use space as thousands separator to match Figma
    return value.toLocaleString("en-US").replace(/,/g, " ");
  }
  // Avoid "-0"
  if (value === 0) return "0";
  return String(value);
}

/**
 * Find the min and max values across multiple datasets.
 * Ignores null values.
 */
export function dataExtent(datasets: { data: (number | null)[] }[]): {
  min: number;
  max: number;
} {
  let min = Infinity;
  let max = -Infinity;

  for (const ds of datasets) {
    for (const v of ds.data) {
      if (v === null) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  if (min === Infinity) return { min: 0, max: 1 };
  return { min, max };
}
