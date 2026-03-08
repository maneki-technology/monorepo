import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { GridLayoutElement } from "../components/grid-layout.js";
import "../components/grid-layout.js";
import "../components/grid-item.js";
import { colorVar, semanticVar, injectAllTokens } from "@maneki/foundation";

injectAllTokens();

const meta: Meta = {
  title: "Grid Layout/Theming",
};
export default meta;
type Story = StoryObj;

const ITEMS = ["t1", "t2", "t3", "t4", "t5", "t6"];

const LAYOUT = [
  { i: "t1", x: 0, y: 0, w: 4, h: 2 },
  { i: "t2", x: 4, y: 0, w: 4, h: 2 },
  { i: "t3", x: 8, y: 0, w: 4, h: 2 },
  { i: "t4", x: 0, y: 2, w: 6, h: 2 },
  { i: "t5", x: 6, y: 2, w: 3, h: 2 },
  { i: "t6", x: 9, y: 2, w: 3, h: 3 },
];

function setupGrid(id: string) {
  setTimeout(() => {
    const grid = document.querySelector<GridLayoutElement>(`grid-layout#${id}`);
    if (grid) {
      grid.gridConfig = { cols: 12, rowHeight: 70, margin: [10, 10], containerPadding: [10, 10] };
      grid.layout = LAYOUT.map((item) => ({ ...item }));
    }
  }, 0);
}

const COLORS = [
  { bg: colorVar("red", 50), text: "#111820" },
  { bg: colorVar("blue", 60), text: "#fff" },
  { bg: colorVar("green", 50), text: "#111820" },
  { bg: colorVar("purple", 60), text: "#fff" },
  { bg: colorVar("orange", 50), text: "#111820" },
  { bg: colorVar("teal", 50), text: "#111820" },
];

export const Default: Story = {
  render: () => {
    setupGrid("theme-default");

    return html`
      <style>
        grid-layout#theme-default {
          display: block;
          width: 100%;
          min-height: 400px;
          border-radius: 8px;
          background: ${semanticVar("surface", "secondary")};
        }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .theme-item {
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
        Default theme — no custom properties overridden.
      </p>
      <grid-layout id="theme-default">
        ${ITEMS.map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div
                class="theme-item"
                style="background:${COLORS[i].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[i].text}"
              >
                ${id}
              </div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};

export const DarkTheme: Story = {
  render: () => {
    setupGrid("theme-dark");

    return html`
      <style>
        grid-layout#theme-dark {
          display: block;
          width: 100%;
          min-height: 400px;
          border: 1px solid ${colorVar("gray", 80)};
          border-radius: 8px;
          background: ${colorVar("gray", 100)};

          --grid-placeholder-bg: rgba(255, 255, 255, 0.06);
          --grid-placeholder-border: 2px dashed ${colorVar("gray", 60)};
          --grid-placeholder-radius: 6px;
          --grid-handle-color: ${colorVar("gray", 40)};
          --grid-focus-ring-color: ${colorVar("blue", 40)};
          --grid-item-active-opacity: 0.85;
        }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .dark-item {
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
          background: ${colorVar("gray", 90)};
          border: 1px solid ${colorVar("gray", 70)};
          color: ${colorVar("gray", 20)};
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${colorVar("gray", 80)};margin:0 0 8px">
        Dark theme — custom placeholder, handle, and focus ring colors.
      </p>
      <grid-layout id="theme-dark">
        ${ITEMS.map(
          (id) => html`
            <grid-item item-id=${id}>
              <div class="dark-item">${id}</div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};

export const ColorfulTheme: Story = {
  render: () => {
    setupGrid("theme-colorful");

    const neonColors = [
      { bg: colorVar("red", 60), text: "#fff" },
      { bg: colorVar("blue", 60), text: "#fff" },
      { bg: colorVar("purple", 60), text: "#fff" },
      { bg: colorVar("green", 60), text: "#fff" },
      { bg: colorVar("pink", 60), text: "#fff" },
      { bg: colorVar("turquoise", 60), text: "#fff" },
    ];

    return html`
      <style>
        grid-layout#theme-colorful {
          display: block;
          width: 100%;
          min-height: 400px;
          border: 1px solid ${colorVar("purple", 70)};
          border-radius: 8px;
          background: ${colorVar("gray", 100)};

          --grid-placeholder-bg: rgba(204, 29, 146, 0.12);
          --grid-placeholder-border: 2px dashed ${colorVar("pink", 60)};
          --grid-placeholder-radius: 8px;
          --grid-handle-color: ${colorVar("pink", 50)};
          --grid-focus-ring-color: ${colorVar("turquoise", 40)};
          --grid-item-active-opacity: 0.9;
        }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .neon-item {
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
          letter-spacing: 0.5px;
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${colorVar("gray", 80)};margin:0 0 8px">
        Neon theme — bright placeholder, handles, and focus ring on dark background.
      </p>
      <grid-layout id="theme-colorful">
        ${ITEMS.map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div
                class="neon-item"
                style="background:${neonColors[i].bg};border:1px solid transparent;color:${neonColors[i].text}"
              >
                ${id}
              </div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};

export const NoAnimation: Story = {
  render: () => {
    setupGrid("theme-no-anim");

    const warmColors = [
      { bg: colorVar("orange", 50), text: "#111820" },
      { bg: colorVar("yellow", 30), text: colorVar("gray", 100) },
      { bg: colorVar("orange", 60), text: "#fff" },
      { bg: colorVar("yellow", 40), text: colorVar("gray", 100) },
      { bg: colorVar("orange", 40), text: colorVar("gray", 100) },
      { bg: colorVar("yellow", 50), text: "#111820" },
    ];

    return html`
      <style>
        grid-layout#theme-no-anim {
          display: block;
          width: 100%;
          min-height: 400px;
          border-radius: 8px;
          background: ${semanticVar("surface", "secondary")};
        }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .no-anim-item {
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          height: 100%;
          box-sizing: border-box;
          user-select: none;
        }
      </style>
      <p style="font-family:system-ui;font-size:13px;color:${semanticVar("text", "secondary")};margin:0 0 8px">
        All transitions disabled via the <code>no-animation</code> attribute. Items snap instantly.
      </p>
      <grid-layout id="theme-no-anim" no-animation>
        ${ITEMS.map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div
                class="no-anim-item"
                style="background:${warmColors[i].bg};border:1px solid ${semanticVar("border", "minimal")};color:${warmColors[i].text}"
              >
                ${id}
              </div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};
