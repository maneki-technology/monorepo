import type { LayoutItem } from "./types";

/**
 * Check if two layout items collide (AABB overlap).
 */
export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1.i === l2.i) return false;
  if (l1.x + l1.w <= l2.x) return false;
  if (l1.x >= l2.x + l2.w) return false;
  if (l1.y + l1.h <= l2.y) return false;
  if (l1.y >= l2.y + l2.h) return false;
  return true;
}

/**
 * Return the first item that collides with `item`, or undefined.
 */
export function getFirstCollision(
  layout: LayoutItem[],
  item: LayoutItem
): LayoutItem | undefined {
  for (const other of layout) {
    if (collides(item, other)) return other;
  }
  return undefined;
}

/**
 * Return all items that collide with `item`.
 */
export function getAllCollisions(
  layout: LayoutItem[],
  item: LayoutItem
): LayoutItem[] {
  return layout.filter((other) => collides(item, other));
}
