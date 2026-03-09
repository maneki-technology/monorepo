import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { GridLayoutElement } from "../components/grid-layout.js";
import "../components/grid-layout.js";
import "../components/grid-item.js";
import type { ResponsiveGridLayoutElement } from "../components/responsive-grid-layout.js";
import "../components/responsive-grid-layout.js";
import { colorVar, semanticVar, injectAllTokens } from "@maneki/foundation";

injectAllTokens();

const meta: Meta = {
  title: "Grid Layout/Responsive",
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

export const Breakpoints: Story = {
  render: () => {
    setTimeout(() => {
      const rgl = document.querySelector<ResponsiveGridLayoutElement>(
        "responsive-grid-layout#responsive-bp",
      );
      if (rgl) {
        rgl.gridConfig = { rowHeight: 80, margin: [10, 10], containerPadding: [10, 10] };
        rgl.layouts = {
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
          xs: [
            { i: "r1", x: 0, y: 0, w: 4, h: 2 },
            { i: "r2", x: 0, y: 2, w: 4, h: 2 },
            { i: "r3", x: 0, y: 4, w: 4, h: 2 },
            { i: "r4", x: 0, y: 6, w: 4, h: 2 },
            { i: "r5", x: 0, y: 8, w: 4, h: 2 },
          ],
          xxs: [
            { i: "r1", x: 0, y: 0, w: 2, h: 2 },
            { i: "r2", x: 0, y: 2, w: 2, h: 2 },
            { i: "r3", x: 0, y: 4, w: 2, h: 2 },
            { i: "r4", x: 0, y: 6, w: 2, h: 2 },
            { i: "r5", x: 0, y: 8, w: 2, h: 2 },
          ],
        };

        const label = document.querySelector("#bp-label");
        rgl.addEventListener("breakpoint-change", (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (label) {
            label.textContent = `${detail.breakpoint} (${detail.cols} cols)`;
          }
        });
      }
    }, 0);

    return html`
      <style>
        responsive-grid-layout#responsive-bp { ${CONTAINER_STYLE} }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .bp-label {
          font-family: monospace;
          font-size: 13px;
          padding: 6px 12px;
          background: ${colorVar("gray", 90)};
          color: ${colorVar("teal", 30)};
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 12px;
        }
        .responsive-item {
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
        Resize the browser window to see layout changes per breakpoint.
      </p>
      <div class="bp-label">Breakpoint: <span id="bp-label">detecting…</span></div>
      <responsive-grid-layout id="responsive-bp">
        ${["r1", "r2", "r3", "r4", "r5"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div
                class="responsive-item"
                style="background:${COLORS[i].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[i].text}"
              >
                ${id}
              </div>
            </grid-item>
          `,
        )}
      </responsive-grid-layout>
    `;
  },
};

export const CustomBreakpoints: Story = {
  render: () => {
    setTimeout(() => {
      const rgl = document.querySelector<ResponsiveGridLayoutElement>(
        "responsive-grid-layout#responsive-custom",
      );
      if (rgl) {
        rgl.breakpoints = { wide: 1000, medium: 600, narrow: 0 };
        rgl.cols = { wide: 8, medium: 4, narrow: 2 };
        rgl.gridConfig = { rowHeight: 80, margin: [12, 12], containerPadding: [10, 10] };
        rgl.layouts = {
          wide: [
            { i: "x1", x: 0, y: 0, w: 4, h: 2 },
            { i: "x2", x: 4, y: 0, w: 4, h: 2 },
            { i: "x3", x: 0, y: 2, w: 8, h: 2 },
          ],
          medium: [
            { i: "x1", x: 0, y: 0, w: 4, h: 2 },
            { i: "x2", x: 0, y: 2, w: 4, h: 2 },
            { i: "x3", x: 0, y: 4, w: 4, h: 2 },
          ],
          narrow: [
            { i: "x1", x: 0, y: 0, w: 2, h: 2 },
            { i: "x2", x: 0, y: 2, w: 2, h: 2 },
            { i: "x3", x: 0, y: 4, w: 2, h: 2 },
          ],
        };

        const label = document.querySelector("#custom-bp-label");
        rgl.addEventListener("breakpoint-change", (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (label) {
            label.textContent = `${detail.breakpoint} (${detail.cols} cols)`;
          }
        });
      }
    }, 0);

    const items = [
      { id: "x1", label: "Panel 1" },
      { id: "x2", label: "Panel 2" },
      { id: "x3", label: "Full Width" },
    ];

    return html`
      <style>
        responsive-grid-layout#responsive-custom { ${CONTAINER_STYLE} }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .bp-label-custom {
          font-family: monospace;
          font-size: 13px;
          padding: 6px 12px;
          background: ${colorVar("ultramarine", 80)};
          color: ${colorVar("purple", 30)};
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 12px;
        }
        .custom-bp-item {
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
        Custom breakpoints: wide (1000px+), medium (600–999px), narrow (&lt;600px).
      </p>
      <div class="bp-label-custom">Breakpoint: <span id="custom-bp-label">detecting…</span></div>
      <responsive-grid-layout id="responsive-custom">
        ${items.map(
          (item, i) => html`
            <grid-item item-id=${item.id}>
              <div
                class="custom-bp-item"
                style="background:${COLORS[i + 2].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[i + 2].text}"
              >
                ${item.label}
              </div>
            </grid-item>
          `,
        )}
      </responsive-grid-layout>
    `;
  },
};
