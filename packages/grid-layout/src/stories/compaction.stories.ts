import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { GridLayoutElement } from "../components/grid-layout.js";
import "../components/grid-layout.js";
import "../components/grid-item.js";
import { colorVar, semanticVar, injectAllTokens } from "@maneki/foundation";

injectAllTokens();

const meta: Meta = {
  title: "Grid Layout/Compaction",
};
export default meta;
type Story = StoryObj;

const COLORS = [
  { bg: colorVar("red", 50), text: "#111820" },
  { bg: colorVar("blue", 60), text: "#fff" },
  { bg: colorVar("green", 50), text: "#111820" },
  { bg: colorVar("purple", 60), text: "#fff" },
  { bg: colorVar("orange", 50), text: "#111820" },
  { bg: colorVar("teal", 50), text: "#111820" },
];

const CONTAINER_STYLE = `
  display: block;
  width: 100%;
  min-height: 400px;
  border-radius: 8px;
  background: ${semanticVar("surface", "secondary")};
`;

const itemStyle = (i: number) =>
  `background:${COLORS[i % COLORS.length].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[i % COLORS.length].text}`;

export const Vertical: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#compact-vertical");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 60, margin: [10, 10], containerPadding: [10, 10] };
        grid.compactType = "vertical";
        grid.layout = [
          { i: "v1", x: 0, y: 0, w: 4, h: 2 },
          { i: "v2", x: 4, y: 0, w: 4, h: 2 },
          { i: "v3", x: 0, y: 4, w: 4, h: 2 },
          { i: "v4", x: 4, y: 6, w: 4, h: 2 },
          { i: "v5", x: 8, y: 0, w: 4, h: 3 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#compact-vertical { ${CONTAINER_STYLE} }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .compact-item {
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 600;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${semanticVar("text", "secondary")};margin:0 0 8px">
        Vertical compaction — items with gaps collapse upward.
      </p>
      <grid-layout id="compact-vertical">
        ${["v1", "v2", "v3", "v4", "v5"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div class="compact-item" style="${itemStyle(i)}">${id}</div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};

export const Horizontal: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#compact-horizontal");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 60, margin: [10, 10], containerPadding: [10, 10] };
        grid.compactType = "horizontal";
        grid.layout = [
          { i: "h1", x: 0, y: 0, w: 3, h: 2 },
          { i: "h2", x: 6, y: 0, w: 3, h: 2 },
          { i: "h3", x: 0, y: 2, w: 3, h: 2 },
          { i: "h4", x: 9, y: 2, w: 3, h: 2 },
          { i: "h5", x: 6, y: 4, w: 3, h: 2 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#compact-horizontal { ${CONTAINER_STYLE} }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .compact-item {
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 600;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${semanticVar("text", "secondary")};margin:0 0 8px">
        Horizontal compaction — items collapse leftward.
      </p>
      <grid-layout id="compact-horizontal">
        ${["h1", "h2", "h3", "h4", "h5"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div class="compact-item" style="${itemStyle(i)}">${id}</div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};

export const NoCompaction: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#compact-none");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 60, margin: [10, 10], containerPadding: [10, 10] };
        grid.compactType = null;
        grid.layout = [
          { i: "n1", x: 0, y: 0, w: 3, h: 2 },
          { i: "n2", x: 5, y: 0, w: 3, h: 2 },
          { i: "n3", x: 0, y: 4, w: 3, h: 2 },
          { i: "n4", x: 5, y: 4, w: 3, h: 2 },
          { i: "n5", x: 9, y: 2, w: 3, h: 3 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#compact-none { ${CONTAINER_STYLE} }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .compact-item {
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 600;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${semanticVar("text", "secondary")};margin:0 0 8px">
        No compaction — items stay exactly where placed. Gaps remain.
      </p>
      <grid-layout id="compact-none">
        ${["n1", "n2", "n3", "n4", "n5"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div class="compact-item" style="${itemStyle(i)}">${id}</div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};

export const PreventCollision: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#compact-collision");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 60, margin: [10, 10], containerPadding: [10, 10] };
        grid.compactType = null;
        grid.preventCollision = true;
        grid.layout = [
          { i: "p1", x: 0, y: 0, w: 4, h: 2 },
          { i: "p2", x: 4, y: 0, w: 4, h: 2 },
          { i: "p3", x: 8, y: 0, w: 4, h: 2 },
          { i: "p4", x: 2, y: 2, w: 4, h: 2 },
          { i: "p5", x: 6, y: 2, w: 4, h: 2 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#compact-collision { ${CONTAINER_STYLE} }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .compact-item {
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 600;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${semanticVar("text", "secondary")};margin:0 0 8px">
        Prevent collision — items cannot overlap. Try dragging one onto another.
      </p>
      <grid-layout id="compact-collision">
        ${["p1", "p2", "p3", "p4", "p5"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div class="compact-item" style="${itemStyle(i)}">${id}</div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};
