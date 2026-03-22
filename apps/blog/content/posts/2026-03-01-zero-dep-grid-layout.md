---
title: A Zero-Dependency Grid Layout in 8KB
date: 2026-03-01
excerpt: "Drag, resize, and rearrange — all without React, Vue, or any runtime dependency. Here's how the grid layout engine works under the hood."
tags: [TypeScript, Web Components, Performance]
---

Most grid layout libraries are tied to React. I needed one that works everywhere, so I built it from scratch as a Web Component.

## The Core Algorithm

The layout engine is surprisingly simple. Each item has an `(x, y, w, h)` position on a column grid. When you drag an item, the engine:

1. Calculates the new grid position from pixel coordinates
2. Detects collisions with other items
3. Pushes colliding items down (vertical compaction) or sideways (horizontal)
4. Compacts the layout to remove gaps

```ts
grid.gridConfig = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
};
```

## Keyboard Accessibility

This was non-negotiable. Tab to an item, press Enter to grab it, arrow keys to move, Enter to drop. A live region announces every state change to screen readers.

The result: ~8KB gzipped, zero dependencies, full keyboard and screen reader support.
