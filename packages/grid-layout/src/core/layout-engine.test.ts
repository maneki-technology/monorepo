import { describe, it, expect } from "vitest";
import type { LayoutItem } from "./types";
import { moveElement, moveElementAwayFromCollision } from "./layout-engine";

describe("moveElement", () => {
  it("moves item to new position", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 4, y: 0, w: 2, h: 2 },
    ];
    const item = layout[0];
    const result = moveElement(layout, item, 2, 0, true, false, "vertical", 12);
    expect(item.x).toBe(2);
    expect(item.y).toBe(0);
  });

  it("does not move static items", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2, static: true },
    ];
    const item = layout[0];
    moveElement(layout, item, 5, 5, true, false, "vertical", 12);
    expect(item.x).toBe(0);
    expect(item.y).toBe(0);
  });

  it("reverts position when preventCollision is true and collision occurs", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 2, y: 0, w: 2, h: 2 },
    ];
    const item = layout[0];
    moveElement(layout, item, 2, 0, true, true, "vertical", 12);
    expect(item.x).toBe(0);
    expect(item.y).toBe(0);
  });

  it("resolves collisions by pushing other items", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 2, y: 0, w: 2, h: 2 },
    ];
    const item = layout[0];
    moveElement(layout, item, 2, 0, true, false, "vertical", 12);
    // b should have been pushed away
    const b = layout[1];
    expect(b.x !== 2 || b.y !== 0).toBe(true);
  });

  it("short-circuits when position unchanged", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 3, y: 3, w: 1, h: 1 },
    ];
    const item = layout[0];
    const result = moveElement(layout, item, 3, 3, true, false, "vertical", 12);
    expect(result).toBe(layout);
    expect(item.moved).toBeUndefined();
  });
});

describe("moveElementAwayFromCollision", () => {
  it("pushes item down in vertical mode", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 0, w: 2, h: 2 },
    ];
    moveElementAwayFromCollision(layout, layout[0], layout[1], false, "vertical", 12);
    expect(layout[1].y).toBeGreaterThan(0);
  });

  it("pushes item right in horizontal mode", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 0, w: 2, h: 2 },
    ];
    moveElementAwayFromCollision(layout, layout[0], layout[1], false, "horizontal", 12);
    expect(layout[1].x).toBeGreaterThan(0);
  });

  it("tries swap position on user action", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 2, w: 2, h: 2 },
    ];
    // Simulate: a is at (0,0), b is being pushed away from a
    // With user action, b should try to swap to collider's y position
    moveElementAwayFromCollision(layout, layout[0], layout[1], true, "vertical", 12);
    expect(layout[1].y).toBeGreaterThanOrEqual(0);
    expect(layout[1].moved).toBe(true);
  });
});
