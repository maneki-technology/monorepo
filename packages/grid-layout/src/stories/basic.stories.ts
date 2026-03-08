import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { GridLayoutElement } from "../components/grid-layout.js";
import "../components/grid-layout.js";
import "../components/grid-item.js";
import { colorVar, semanticVar, injectAllTokens } from "@maneki/foundation";

injectAllTokens();

const meta: Meta = {
  title: "Grid Layout/Basic",
};
export default meta;
type Story = StoryObj;

const COLORS = [
  { bg: colorVar("red", 50), text: "#fff" },
  { bg: colorVar("blue", 60), text: "#fff" },
  { bg: colorVar("green", 50), text: "#fff" },
  { bg: colorVar("purple", 60), text: "#fff" },
  { bg: colorVar("orange", 50), text: "#fff" },
  { bg: colorVar("teal", 50), text: "#fff" },
];

export const Default: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#basic-default");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 80, margin: [10, 10], containerPadding: [10, 10] };
        grid.layout = [
          { i: "a", x: 0, y: 0, w: 4, h: 2 },
          { i: "b", x: 4, y: 0, w: 4, h: 2 },
          { i: "c", x: 8, y: 0, w: 4, h: 2 },
          { i: "d", x: 0, y: 2, w: 6, h: 2 },
          { i: "e", x: 6, y: 2, w: 3, h: 2 },
          { i: "f", x: 9, y: 2, w: 3, h: 3 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#basic-default {
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
        .basic-item {
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
      <grid-layout id="basic-default">
        ${["a", "b", "c", "d", "e", "f"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div
                class="basic-item"
                style="background:${COLORS[i].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[i].text}"
              >
                ${id.toUpperCase()}
              </div>
            </grid-item>
          `,
        )}
      </grid-layout>
    `;
  },
};

export const StaticItems: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#basic-static");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 80, margin: [10, 10], containerPadding: [10, 10] };
        grid.layout = [
          { i: "s1", x: 0, y: 0, w: 12, h: 1, static: true },
          { i: "d1", x: 0, y: 1, w: 4, h: 2 },
          { i: "s2", x: 4, y: 1, w: 4, h: 2, static: true },
          { i: "d2", x: 8, y: 1, w: 4, h: 2 },
          { i: "d3", x: 0, y: 3, w: 6, h: 2 },
          { i: "d4", x: 6, y: 3, w: 6, h: 2 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#basic-static {
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
        .static-item {
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
        .static-item--locked {
          background: ${semanticVar("surface", "moderate")};
          color: ${semanticVar("text", "reversed")};
          border: 1px solid ${semanticVar("border", "subtle")};
        }
        .static-item--free {
          background: ${COLORS[1].bg};
          border: 1px solid ${semanticVar("border", "minimal")};
          color: #fff;
        }
      </style>
      <grid-layout id="basic-static">
        <grid-item item-id="s1" static>
          <div class="static-item static-item--locked">Header (static)</div>
        </grid-item>
        <grid-item item-id="d1">
          <div class="static-item static-item--free">Draggable 1</div>
        </grid-item>
        <grid-item item-id="s2" static>
          <div class="static-item static-item--locked">Locked</div>
        </grid-item>
        <grid-item item-id="d2">
          <div class="static-item static-item--free">Draggable 2</div>
        </grid-item>
        <grid-item item-id="d3">
          <div class="static-item static-item--free">Draggable 3</div>
        </grid-item>
        <grid-item item-id="d4">
          <div class="static-item static-item--free">Draggable 4</div>
        </grid-item>
      </grid-layout>
    `;
  },
};

export const Constraints: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#basic-constraints");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 80, margin: [10, 10], containerPadding: [10, 10] };
        grid.layout = [
          { i: "c1", x: 0, y: 0, w: 4, h: 2, minW: 2, maxW: 6 },
          { i: "c2", x: 4, y: 0, w: 4, h: 2, minH: 2, maxH: 4 },
          { i: "c3", x: 8, y: 0, w: 4, h: 2, minW: 3, maxW: 5, minH: 1, maxH: 3 },
          { i: "c4", x: 0, y: 2, w: 6, h: 2, minW: 4 },
          { i: "c5", x: 6, y: 2, w: 6, h: 2, maxW: 8, maxH: 3 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#basic-constraints {
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
        .constraint-item {
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
        .constraint-item__id {
          font-size: 14px;
          font-weight: 600;
        }
        .constraint-item__label {
          font-size: 11px;
          font-family: monospace;
          opacity: 0.7;
        }
      </style>
      <grid-layout id="basic-constraints">
        <grid-item item-id="c1" min-w="2" max-w="6">
          <div
            class="constraint-item"
            style="background:${COLORS[0].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[0].text}"
          >
            <span class="constraint-item__id">C1</span>
            <span class="constraint-item__label">w: 2–6</span>
          </div>
        </grid-item>
        <grid-item item-id="c2" min-h="2" max-h="4">
          <div
            class="constraint-item"
            style="background:${COLORS[1].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[1].text}"
          >
            <span class="constraint-item__id">C2</span>
            <span class="constraint-item__label">h: 2–4</span>
          </div>
        </grid-item>
        <grid-item item-id="c3" min-w="3" max-w="5" min-h="1" max-h="3">
          <div
            class="constraint-item"
            style="background:${COLORS[2].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[2].text}"
          >
            <span class="constraint-item__id">C3</span>
            <span class="constraint-item__label">w: 3–5, h: 1–3</span>
          </div>
        </grid-item>
        <grid-item item-id="c4" min-w="4">
          <div
            class="constraint-item"
            style="background:${COLORS[3].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[3].text}"
          >
            <span class="constraint-item__id">C4</span>
            <span class="constraint-item__label">min-w: 4</span>
          </div>
        </grid-item>
        <grid-item item-id="c5" max-w="8" max-h="3">
          <div
            class="constraint-item"
            style="background:${COLORS[4].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[4].text}"
          >
            <span class="constraint-item__id">C5</span>
            <span class="constraint-item__label">max-w: 8, max-h: 3</span>
          </div>
        </grid-item>
      </grid-layout>
    `;
  },
};
