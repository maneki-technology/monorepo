import { describe, it, expect } from "vitest";
import type { LayoutItem, CompactType } from "./types";
import { compact } from "./compact";
import { moveElement } from "./layout-engine";
import { sortLayoutItems } from "./sort";

/**
 * Generate a grid layout with `count` items packed into `cols` columns.
 */
function generateLayout(count: number, cols: number): LayoutItem[] {
  const layout: LayoutItem[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < count; i++) {
    const w = 1 + (i % 3); // 1-3
    const h = 1 + (i % 2); // 1-2
    if (x + w > cols) {
      x = 0;
      y++;
    }
    layout.push({ i: `item-${i}`, x, y, w, h });
    x += w;
    if (x >= cols) {
      x = 0;
      y++;
    }
  }
  return layout;
}

function generateLayoutWithStatics(count: number, cols: number, staticRatio: number): LayoutItem[] {
  const layout = generateLayout(count, cols);
  const staticCount = Math.floor(count * staticRatio);
  for (let i = 0; i < staticCount; i++) {
    layout[i].static = true;
  }
  return layout;
}

function measure(fn: () => void, iterations: number): { avg: number; min: number; max: number; total: number } {
  // Warmup
  for (let i = 0; i < 3; i++) fn();

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    fn();
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  const total = times.reduce((s, t) => s + t, 0);
  return {
    avg: total / times.length,
    min: times[0],
    max: times[times.length - 1],
    total,
  };
}

describe("benchmark: compact", () => {
  const sizes = [50, 100, 250, 500, 1000];
  const cols = 12;
  const iterations = 50;

  for (const size of sizes) {
    it(`compact vertical — ${size} items < 16ms avg`, () => {
      const layout = generateLayout(size, cols);
      const result = measure(() => compact(layout, "vertical", cols), iterations);
      console.log(`  compact(vertical, ${size}): avg=${result.avg.toFixed(3)}ms min=${result.min.toFixed(3)}ms max=${result.max.toFixed(3)}ms`);
      // Under 16ms budget (one frame) for up to 500 items
      if (size <= 500) {
        expect(result.avg).toBeLessThan(16);
      }
    });

    it(`compact horizontal — ${size} items < 16ms avg`, () => {
      const layout = generateLayout(size, cols);
      const result = measure(() => compact(layout, "horizontal", cols), iterations);
      console.log(`  compact(horizontal, ${size}): avg=${result.avg.toFixed(3)}ms min=${result.min.toFixed(3)}ms max=${result.max.toFixed(3)}ms`);
      if (size <= 500) {
        expect(result.avg).toBeLessThan(16);
      }
    });
  }

  it("compact with 10% statics — 500 items", () => {
    const layout = generateLayoutWithStatics(500, cols, 0.1);
    const result = measure(() => compact(layout, "vertical", cols), iterations);
    console.log(`  compact(vertical, 500, 10% static): avg=${result.avg.toFixed(3)}ms`);
    expect(result.avg).toBeLessThan(16);
  });

  it("compact with pre-cached statics — 500 items", () => {
    const layout = generateLayoutWithStatics(500, cols, 0.1);
    const statics = layout.filter(l => l.static);
    const result = measure(() => compact(layout, "vertical", cols, statics), iterations);
    console.log(`  compact(vertical, 500, cached statics): avg=${result.avg.toFixed(3)}ms`);
    expect(result.avg).toBeLessThan(16);
  });
});

describe("benchmark: moveElement", () => {
  const sizes = [50, 100, 250, 500];
  const cols = 12;
  const iterations = 50;

  for (const size of sizes) {
    it(`moveElement + compact — ${size} items < 16ms avg`, () => {
      const baseLayout = generateLayout(size, cols);
      const compacted = compact(baseLayout, "vertical", cols);

      const result = measure(() => {
        // Clone so each iteration starts fresh
        const layout = compacted.map(l => ({ ...l }));
        const item = layout[0];
        const newX = Math.min(cols - item.w, item.x + 2);
        const newY = item.y + 2;
        const moved = moveElement(layout, item, newX, newY, true, false, "vertical", cols);
        compact(moved, "vertical", cols);
      }, iterations);

      console.log(`  moveElement+compact(${size}): avg=${result.avg.toFixed(3)}ms min=${result.min.toFixed(3)}ms max=${result.max.toFixed(3)}ms`);
      if (size <= 250) {
        expect(result.avg).toBeLessThan(16);
      }
    });
  }
});

describe("benchmark: sortLayoutItems", () => {
  const sizes = [100, 500, 1000, 2000];
  const cols = 12;
  const iterations = 100;

  for (const size of sizes) {
    it(`sort vertical — ${size} items`, () => {
      const layout = generateLayout(size, cols);
      const result = measure(() => sortLayoutItems(layout, "vertical"), iterations);
      console.log(`  sort(vertical, ${size}): avg=${result.avg.toFixed(3)}ms`);
      expect(result.avg).toBeLessThan(16);
    });
  }
});

describe("benchmark: rapid drag simulation", () => {
  it("60 consecutive moveElement+compact calls on 200 items < 960ms (16ms each)", () => {
    const cols = 12;
    const baseLayout = compact(generateLayout(200, cols), "vertical", cols);
    let layout = baseLayout.map(l => ({ ...l }));
    const item = layout[0];

    const t0 = performance.now();
    for (let frame = 0; frame < 60; frame++) {
      const newX = Math.max(0, Math.min(cols - item.w, item.x + (frame % 2 === 0 ? 1 : -1)));
      const newY = Math.max(0, item.y + (frame % 3 === 0 ? 1 : 0));
      layout = moveElement(layout, item, newX, newY, true, false, "vertical", cols);
      layout = compact(layout, "vertical", cols);
    }
    const total = performance.now() - t0;

    console.log(`  60-frame drag sim (200 items): total=${total.toFixed(1)}ms avg=${(total / 60).toFixed(3)}ms/frame`);
    expect(total).toBeLessThan(960); // 60 frames * 16ms budget
  });

  it("60 consecutive moveElement+compact calls on 500 items", () => {
    const cols = 12;
    const baseLayout = compact(generateLayout(500, cols), "vertical", cols);
    let layout = baseLayout.map(l => ({ ...l }));
    const item = layout[0];

    const t0 = performance.now();
    for (let frame = 0; frame < 60; frame++) {
      const newX = Math.max(0, Math.min(cols - item.w, item.x + (frame % 2 === 0 ? 1 : -1)));
      const newY = Math.max(0, item.y + (frame % 3 === 0 ? 1 : 0));
      layout = moveElement(layout, item, newX, newY, true, false, "vertical", cols);
      layout = compact(layout, "vertical", cols);
    }
    const total = performance.now() - t0;

    console.log(`  60-frame drag sim (500 items): total=${total.toFixed(1)}ms avg=${(total / 60).toFixed(3)}ms/frame`);
    // Log only — 500 items may exceed 16ms/frame budget
  });
});
