import type { LayoutItem, CompactType } from "./types";
import { collides, getAllCollisions, getFirstCollision } from "./collision";
import { sortLayoutItems } from "./sort";

/**
 * Move an element in the layout. Handles collision resolution.
 * Returns the layout (mutated in place for the moved items).
 */
export function moveElement(
  layout: LayoutItem[],
  item: LayoutItem,
  x: number,
  y: number,
  isUserAction: boolean,
  preventCollision: boolean,
  compactType: CompactType,
  cols: number
): LayoutItem[] {
  if (item.static) return layout;

  const oldX = item.x;
  const oldY = item.y;

  // Short-circuit if nothing changed
  if (oldX === x && oldY === y) return layout;

  item.x = x;
  item.y = y;
  item.moved = true;

  // Sort layout — if moving up/left, reverse so we process from top/left
  let sorted = sortLayoutItems(layout, compactType);
  const movingUp = compactType === "vertical" ? y < oldY : x < oldX;
  if (movingUp) sorted = sorted.reverse();

  const collisions = getAllCollisions(sorted, item);

  if (preventCollision && collisions.length > 0) {
    // Revert position
    item.x = oldX;
    item.y = oldY;
    item.moved = false;
    return layout;
  }

  // Resolve each collision
  for (const collision of collisions) {
    if (collision.static) {
      // Can't move static items — move the dragged item away from the static
      moveElementAwayFromCollision(
        layout, collision, item, isUserAction, compactType, cols
      );
    } else {
      // Move the colliding item away from the dragged item
      moveElementAwayFromCollision(
        layout, item, collision, isUserAction, compactType, cols
      );
    }
  }

  return layout;
}

/**
 * Move `itemToMove` away from `collider`. Tries to move up/left first
 * (swap feel), then falls back to pushing down/right.
 *
 * This function directly sets positions rather than recursively calling
 * moveElement, to avoid infinite recursion.
 */
export function moveElementAwayFromCollision(
  layout: LayoutItem[],
  collider: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction: boolean,
  compactType: CompactType,
  cols: number
): void {
  const isVertical = compactType !== "horizontal";

  // If this is a user action, try to swap (move item to where collider was)
  if (isUserAction) {
    const proposedX = isVertical ? itemToMove.x : collider.x;
    const proposedY = isVertical ? collider.y : itemToMove.y;

    const testItem: LayoutItem = {
      ...itemToMove,
      x: proposedX,
      y: proposedY,
    };

    // Only swap if the proposed position is valid and free
    if (
      proposedX >= 0 &&
      proposedX + testItem.w <= cols &&
      proposedY >= 0 &&
      !getFirstCollision(layout, testItem)
    ) {
      itemToMove.x = proposedX;
      itemToMove.y = proposedY;
      itemToMove.moved = true;
      return;
    }
  }

  // Default: push down/right until no collision
  // Use a bounded loop to prevent infinite iteration
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (isVertical) {
      itemToMove.y += 1;
    } else {
      itemToMove.x += 1;
      // Wrap if overflowing columns
      if (itemToMove.x + itemToMove.w > cols) {
        itemToMove.x = 0;
        itemToMove.y += 1;
      }
    }
    itemToMove.moved = true;

    if (!getFirstCollision(layout, itemToMove)) {
      break;
    }
  }
}
