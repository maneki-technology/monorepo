import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { GridLayoutElement } from "../components/grid-layout.js";
import "../components/grid-layout.js";
import "../components/grid-item.js";
import { colorVar, semanticVar, injectAllTokens } from "@maneki/foundation";

injectAllTokens();

const meta: Meta = {
  title: "Grid Layout/Resize Handles",
};
export default meta;
type Story = StoryObj;

const CONTAINER_STYLE = `
  display: block;
  width: 100%;
  min-height: 400px;
  border-radius: 8px;
  background: ${semanticVar("surface", "secondary")};
`;

export const AllHandles: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#resize-all");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 60, margin: [10, 10], containerPadding: [10, 10] };
        grid.resizeConfig = {
          enabled: true,
          handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
        };
        grid.layout = [
          { i: "all-handles", x: 3, y: 1, w: 6, h: 4 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#resize-all { ${CONTAINER_STYLE} min-height: 500px; }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .resize-demo-item {
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
          background: ${colorVar("blue", 60)};
          border: 1px solid ${semanticVar("border", "minimal")};
          color: #fff;
          gap: 8px;
        }
        .resize-demo-item__title {
          font-size: 1rem;
          font-weight: 700;
        }
        .resize-demo-item__hint {
          font-size: 12px;
          opacity: 0.7;
          font-family: monospace;
        }
        .handle-legend {
          display: grid;
          grid-template-columns: repeat(4, auto);
          gap: 4px 16px;
          font-family: monospace;
          font-size: 12px;
          color: ${semanticVar("text", "secondary")};
          margin-bottom: 12px;
        }
        .handle-legend span {
          padding: 2px 6px;
          background: ${semanticVar("surface", "secondary")};
          border-radius: 3px;
        }
      </style>
      <div class="handle-legend">
        <span>nw ↖</span><span>n ↑</span><span>ne ↗</span><span></span>
        <span>w ←</span><span></span><span>e →</span><span></span>
        <span>sw ↙</span><span>s ↓</span><span>se ↘</span><span></span>
      </div>
      <grid-layout id="resize-all">
        <grid-item item-id="all-handles">
          <div class="resize-demo-item">
            <span class="resize-demo-item__title">All 8 Handles</span>
            <span class="resize-demo-item__hint">Drag any edge or corner to resize</span>
          </div>
        </grid-item>
      </grid-layout>
    `;
  },
};

export const CornerOnly: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#resize-corners");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 60, margin: [10, 10], containerPadding: [10, 10] };
        grid.resizeConfig = {
          enabled: true,
          handles: ["se", "sw", "ne", "nw"],
        };
        grid.layout = [
          { i: "corner1", x: 0, y: 0, w: 5, h: 3 },
          { i: "corner2", x: 6, y: 0, w: 5, h: 3 },
          { i: "corner3", x: 2, y: 3, w: 8, h: 3 },
        ];
      }
    }, 0);

    const colors = [
      { bg: colorVar("green", 50), text: "#fff" },
      { bg: colorVar("purple", 60), text: "#fff" },
      { bg: colorVar("orange", 50), text: "#fff" },
    ];

    return html`
      <style>
        grid-layout#resize-corners { ${CONTAINER_STYLE} }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .corner-item {
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
          gap: 4px;
        }
        .corner-item__title {
          font-size: 1rem;
          font-weight: 600;
        }
        .corner-item__hint {
          font-size: 11px;
          font-family: monospace;
          opacity: 0.7;
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${semanticVar("text", "secondary")};margin:0 0 8px">
        Corner handles only — se, sw, ne, nw. No edge handles.
      </p>
      <grid-layout id="resize-corners">
        ${["corner1", "corner2", "corner3"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div
                class="corner-item"
                style="background:${colors[i].bg};border:1px solid ${semanticVar("border", "minimal")};color:${colors[i].text}"
              >
                <span class="corner-item__title">${id}</span>
                <span class="corner-item__hint">corners only</span>
              </div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};
