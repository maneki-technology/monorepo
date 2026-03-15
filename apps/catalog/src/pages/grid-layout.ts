import { registerPage } from "../registry.js";
import "@maneki/grid-layout";

const COLORS = [
  { bg: "#E8626E", text: "#111820" },
  { bg: "#186ADE", text: "#fff" },
  { bg: "#077D55", text: "#111820" },
  { bg: "#7B61FF", text: "#fff" },
  { bg: "#FC9162", text: "#111820" },
  { bg: "#4EBFB9", text: "#111820" },
];

function itemColor(i: number): string {
  return `background:${COLORS[i % COLORS.length].bg};border:1px solid #DCE3E8;color:${COLORS[i % COLORS.length].text}`;
}

registerPage("grid-layout", {
  title: "Grid Layout",
  section: "Layouts",
  render: () => `
    <style>
      .grid-container {
        display: block; width: 100%; min-height: 400px;
        border-radius: 8px; background: #F2F5F7;
        margin-bottom: 24px;
      }
      grid-item { cursor: grab; }
      grid-item[dragging] { cursor: grabbing; }
    </style>

    <h3>Basic Grid</h3>
    <grid-layout id="gl-basic" class="grid-container">
      ${["a","b","c","d","e","f"].map((id, i) =>
        `<grid-item item-id="${id}"><div class="grid-item-cell" style="${itemColor(i)}">${id.toUpperCase()}</div></grid-item>`
      ).join("")}
    </grid-layout>

    <h3>Static Items</h3>
    <grid-layout id="gl-static" class="grid-container">
      <grid-item item-id="s1" static><div class="grid-item-cell grid-item-static">Header (static)</div></grid-item>
      <grid-item item-id="d1"><div class="grid-item-cell" style="${itemColor(1)}">Draggable 1</div></grid-item>
      <grid-item item-id="s2" static><div class="grid-item-cell grid-item-static">Locked</div></grid-item>
      <grid-item item-id="d2"><div class="grid-item-cell" style="${itemColor(1)}">Draggable 2</div></grid-item>
      <grid-item item-id="d3"><div class="grid-item-cell" style="${itemColor(1)}">Draggable 3</div></grid-item>
      <grid-item item-id="d4"><div class="grid-item-cell" style="${itemColor(1)}">Draggable 4</div></grid-item>
    </grid-layout>

    <h3>Constraints (min/max width &amp; height)</h3>
    <grid-layout id="gl-constraints" class="grid-container">
      ${[
        { id: "c1", label: "C1 w:2\u20136", i: 0 },
        { id: "c2", label: "C2 h:2\u20134", i: 1 },
        { id: "c3", label: "C3 w:3\u20135 h:1\u20133", i: 2 },
        { id: "c4", label: "C4 min-w:4", i: 3 },
        { id: "c5", label: "C5 max-w:8", i: 4 },
      ].map(c =>
        `<grid-item item-id="${c.id}"><div class="grid-item-cell" style="${itemColor(c.i)}">${c.label}</div></grid-item>`
      ).join("")}
    </grid-layout>

    <h3>Compaction: Vertical</h3>
    <grid-layout id="gl-compact-v" class="grid-container">
      ${["v1","v2","v3","v4","v5"].map((id, i) =>
        `<grid-item item-id="${id}"><div class="grid-item-cell" style="${itemColor(i)}">${id.toUpperCase()}</div></grid-item>`
      ).join("")}
    </grid-layout>

    <h3>Compaction: Horizontal</h3>
    <grid-layout id="gl-compact-h" class="grid-container">
      ${["h1","h2","h3","h4","h5"].map((id, i) =>
        `<grid-item item-id="${id}"><div class="grid-item-cell" style="${itemColor(i)}">${id.toUpperCase()}</div></grid-item>`
      ).join("")}
    </grid-layout>

    <h3>Resize Handles (All Directions)</h3>
    <grid-layout id="gl-resize" class="grid-container" style="min-height:500px">
      <grid-item item-id="all-handles"><div class="grid-item-cell" style="${itemColor(1)}">Resize from any edge or corner</div></grid-item>
    </grid-layout>

    <h3>Responsive Breakpoints</h3>
    <p class="hint">Resize the browser to see layout change at lg/md/sm breakpoints</p>
    <responsive-grid-layout id="gl-responsive" class="grid-container">
      ${["r1","r2","r3","r4","r5"].map((id, i) =>
        `<grid-item item-id="${id}"><div class="grid-item-cell" style="${itemColor(i)}">${id.toUpperCase()}</div></grid-item>`
      ).join("")}
    </responsive-grid-layout>

    <h3>Dark Theme</h3>
    <grid-layout id="gl-dark" class="grid-container" style="background:#0D1826;border:1px solid #3E5463;--grid-placeholder-bg:rgba(255,255,255,0.06);--grid-placeholder-border:2px dashed #5B7282;--grid-placeholder-radius:6px;--grid-handle-color:#7A909E;--grid-focus-ring-color:#4D9EFF">
      ${["t1","t2","t3","t4","t5","t6"].map(id =>
        `<grid-item item-id="${id}"><div class="grid-item-cell" style="background:#1C2B36;border:1px solid #3E5463;color:#DCE3E8">${id.toUpperCase()}</div></grid-item>`
      ).join("")}
    </grid-layout>

    <h3>Keyboard Accessible</h3>
    <p class="hint">Tab to focus items, Enter/Space to grab, Arrow keys to move, R for resize mode, Escape to cancel</p>
    <grid-layout id="gl-a11y" class="grid-container" style="--grid-focus-ring-color:#186ADE">
      ${["k1","k2","k3","k4"].map((id, i) =>
        `<grid-item item-id="${id}"><div class="grid-item-cell" style="${itemColor(i)}">${id.toUpperCase()}</div></grid-item>`
      ).join("")}
    </grid-layout>
  `,
  setup: () => {
    const cfg = { cols: 12, rowHeight: 80, margin: [10, 10] as [number, number], containerPadding: [10, 10] as [number, number] };

    // Basic
    const basic = document.getElementById("gl-basic") as any;
    if (basic) {
      basic.gridConfig = cfg;
      basic.layout = [
        { i: "a", x: 0, y: 0, w: 4, h: 2 },
        { i: "b", x: 4, y: 0, w: 4, h: 2 },
        { i: "c", x: 8, y: 0, w: 4, h: 2 },
        { i: "d", x: 0, y: 2, w: 6, h: 2 },
        { i: "e", x: 6, y: 2, w: 3, h: 2 },
        { i: "f", x: 9, y: 2, w: 3, h: 3 },
      ];
    }

    // Static
    const stat = document.getElementById("gl-static") as any;
    if (stat) {
      stat.gridConfig = cfg;
      stat.layout = [
        { i: "s1", x: 0, y: 0, w: 12, h: 1, static: true },
        { i: "d1", x: 0, y: 1, w: 4, h: 2 },
        { i: "s2", x: 4, y: 1, w: 4, h: 2, static: true },
        { i: "d2", x: 8, y: 1, w: 4, h: 2 },
        { i: "d3", x: 0, y: 3, w: 6, h: 2 },
        { i: "d4", x: 6, y: 3, w: 6, h: 2 },
      ];
    }

    // Constraints
    const cons = document.getElementById("gl-constraints") as any;
    if (cons) {
      cons.gridConfig = cfg;
      cons.layout = [
        { i: "c1", x: 0, y: 0, w: 4, h: 2, minW: 2, maxW: 6 },
        { i: "c2", x: 4, y: 0, w: 4, h: 2, minH: 2, maxH: 4 },
        { i: "c3", x: 8, y: 0, w: 4, h: 2, minW: 3, maxW: 5, minH: 1, maxH: 3 },
        { i: "c4", x: 0, y: 2, w: 6, h: 2, minW: 4 },
        { i: "c5", x: 6, y: 2, w: 6, h: 2, maxW: 8, maxH: 3 },
      ];
    }

    // Compact vertical
    const compV = document.getElementById("gl-compact-v") as any;
    if (compV) {
      compV.gridConfig = { ...cfg, rowHeight: 60 };
      compV.compactType = "vertical";
      compV.layout = [
        { i: "v1", x: 0, y: 0, w: 4, h: 2 },
        { i: "v2", x: 4, y: 0, w: 4, h: 2 },
        { i: "v3", x: 0, y: 4, w: 4, h: 2 },
        { i: "v4", x: 4, y: 6, w: 4, h: 2 },
        { i: "v5", x: 8, y: 0, w: 4, h: 3 },
      ];
    }

    // Compact horizontal
    const compH = document.getElementById("gl-compact-h") as any;
    if (compH) {
      compH.gridConfig = { ...cfg, rowHeight: 60 };
      compH.compactType = "horizontal";
      compH.layout = [
        { i: "h1", x: 0, y: 0, w: 3, h: 2 },
        { i: "h2", x: 0, y: 2, w: 3, h: 2 },
        { i: "h3", x: 6, y: 0, w: 3, h: 2 },
        { i: "h4", x: 6, y: 2, w: 3, h: 2 },
        { i: "h5", x: 0, y: 4, w: 4, h: 2 },
      ];
    }

    // Resize handles
    const resize = document.getElementById("gl-resize") as any;
    if (resize) {
      resize.gridConfig = { cols: 12, rowHeight: 60, margin: [10, 10] as [number, number], containerPadding: [10, 10] as [number, number] };
      resize.layout = [{ i: "all-handles", x: 3, y: 1, w: 6, h: 4 }];
      resize.resizeConfig = { enabled: true, handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"] };
    }

    // Responsive
    const responsive = document.getElementById("gl-responsive") as any;
    if (responsive) {
      responsive.gridConfig = { rowHeight: 80, margin: [10, 10] as [number, number], containerPadding: [10, 10] as [number, number] };
      responsive.layouts = {
        lg: [
          { i: "r1", x: 0, y: 0, w: 4, h: 2 },
          { i: "r2", x: 4, y: 0, w: 4, h: 2 },
          { i: "r3", x: 8, y: 0, w: 4, h: 2 },
          { i: "r4", x: 0, y: 2, w: 6, h: 2 },
          { i: "r5", x: 6, y: 2, w: 6, h: 2 },
        ],
        md: [
          { i: "r1", x: 0, y: 0, w: 5, h: 2 },
          { i: "r2", x: 5, y: 0, w: 5, h: 2 },
          { i: "r3", x: 0, y: 2, w: 5, h: 2 },
          { i: "r4", x: 5, y: 2, w: 5, h: 2 },
          { i: "r5", x: 0, y: 4, w: 10, h: 2 },
        ],
        sm: [
          { i: "r1", x: 0, y: 0, w: 6, h: 2 },
          { i: "r2", x: 0, y: 2, w: 6, h: 2 },
          { i: "r3", x: 0, y: 4, w: 6, h: 2 },
          { i: "r4", x: 0, y: 6, w: 6, h: 2 },
          { i: "r5", x: 0, y: 8, w: 6, h: 2 },
        ],
      };
    }

    // Dark theme
    const dark = document.getElementById("gl-dark") as any;
    if (dark) {
      dark.gridConfig = { cols: 12, rowHeight: 70, margin: [10, 10] as [number, number], containerPadding: [10, 10] as [number, number] };
      dark.layout = [
        { i: "t1", x: 0, y: 0, w: 4, h: 2 },
        { i: "t2", x: 4, y: 0, w: 4, h: 2 },
        { i: "t3", x: 8, y: 0, w: 4, h: 2 },
        { i: "t4", x: 0, y: 2, w: 6, h: 2 },
        { i: "t5", x: 6, y: 2, w: 3, h: 2 },
        { i: "t6", x: 9, y: 2, w: 3, h: 3 },
      ];
    }

    // Keyboard accessible
    const a11y = document.getElementById("gl-a11y") as any;
    if (a11y) {
      a11y.gridConfig = { cols: 12, rowHeight: 70, margin: [10, 10] as [number, number], containerPadding: [10, 10] as [number, number] };
      a11y.layout = [
        { i: "k1", x: 0, y: 0, w: 4, h: 2 },
        { i: "k2", x: 4, y: 0, w: 4, h: 2 },
        { i: "k3", x: 8, y: 0, w: 4, h: 2 },
        { i: "k4", x: 0, y: 2, w: 6, h: 2 },
      ];
    }
  },
});
