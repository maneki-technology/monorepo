import type { LayoutItem, CompactType } from "./types";
import { collides, getFirstCollision } from "./collision";
import { sortLayoutItems, getStatics } from "./sort";
import { cloneLayout } from "./utils";

/**
 * Compact a single item vertically (move up as far as possible).
 */
function compactItemVertical(
  compareWith: LayoutItem[],
  item: LayoutItem,
  cols: number
): LayoutItem {
  if (item.static) return item;

  // Move up while no collision
  while (item.y > 0) {
    item.y--;
    const collision = getFirstCollision(compareWith, item);
    if (collision) {
      // Place just below the collision
      item.y = collision.y + collision.h;
      break;
    }
  }

  return item;
}

/**
 * Compact a single item horizontally (move left as far as possible).
 */
function compactItemHorizontal(
  compareWith: LayoutItem[],
  item: LayoutItem,
  cols: number
): LayoutItem {
  if (item.static) return item;

  while (item.x > 0) {
    item.x--;
    const collision = getFirstCollision(compareWith, item);
    if (collision) {
      item.x = collision.x + collision.w;
      break;
    }
  }

  // Wrap to next row if overflowing
  if (item.x + item.w > cols) {
    item.x = 0;
    item.y++;
  }

  return item;
}

/**
 * Resolve compaction collision by pushing items down/right.
 */
function resolveCompactionCollision(
  layout: LayoutItem[],
  item: LayoutItem,
  moveToCoord: number,
  axis: "x" | "y"
): void {
  const sizeProp = axis === "x" ? "w" : "h";

  for (const other of layout) {
    if (other.i === item.i) continue;
    if (other.static) continue;

    // Check if this item actually collides
    if (collides(item, other)) {
      other[axis] = item[axis] + item[sizeProp];
    }
  }
}

/**
 * Compact the layout according to the given compaction type.
 * Vertical: items float up. Horizontal: items float left.
 */
export function compact(
  layout: LayoutItem[],
  compactType: CompactType,
  cols: number,
  statics?: LayoutItem[]
): LayoutItem[] {
  if (!compactType) return cloneLayout(layout);
  const sorted = sortLayoutItems(layout, compactType);
  const staticItems = statics ?? getStatics(sorted);
  const out: LayoutItem[] = new Array(sorted.length);
  // Build index map for O(1) lookup instead of O(n) indexOf
  const indexMap = new Map<LayoutItem, number>();
  for (let i = 0; i < layout.length; i++) {
    indexMap.set(layout[i], i);
  }
  const compareWith: LayoutItem[] = [];
  for (const s of staticItems) {
    compareWith.push(s);
  }
  for (let i = 0; i < sorted.length; i++) {
    const original = sorted[i];
    let item = { ...original };
    if (!item.static) {
      if (compactType === "vertical") {
        item = compactItemVertical(compareWith, item, cols);
      } else if (compactType === "horizontal") {
        item = compactItemHorizontal(compareWith, item, cols);
      }
      compareWith.push(item);
    }
    out[indexMap.get(original)!] = item;
    item.moved = false;
  }
  return out;
}

/**
 * Correct item bounds: ensure items don't exceed column count.
 * Clamps x + w to cols, and ensures w >= 1.
 */
export function correctBounds(
  layout: LayoutItem[],
  cols: number
): LayoutItem[] {
  return layout.map((item) => {
    const l = { ...item };

    // Clamp width to cols
    if (l.x + l.w > cols) {
      l.x = Math.max(0, cols - l.w);
    }
    if (l.w > cols) {
      l.w = cols;
      l.x = 0;
    }
    if (l.x < 0) {
      l.x = 0;
    }

    return l;
  });
}
