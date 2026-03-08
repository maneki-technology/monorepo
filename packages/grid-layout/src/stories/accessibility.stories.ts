import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { GridLayoutElement } from "../components/grid-layout.js";
import "../components/grid-layout.js";
import "../components/grid-item.js";
import { colorVar, semanticVar, injectAllTokens } from "@maneki/foundation";

injectAllTokens();

const meta: Meta = {
  title: "Grid Layout/Accessibility",
};
export default meta;
type Story = StoryObj;

const COLORS = [
  { bg: colorVar("red", 50), text: "#111820" },
  { bg: colorVar("blue", 60), text: "#fff" },
  { bg: colorVar("green", 50), text: "#111820" },
  { bg: colorVar("purple", 60), text: "#fff" },
];

export const KeyboardNavigation: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#a11y-keyboard");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 70, margin: [10, 10], containerPadding: [10, 10] };
        grid.layout = [
          { i: "k1", x: 0, y: 0, w: 4, h: 2 },
          { i: "k2", x: 4, y: 0, w: 4, h: 2 },
          { i: "k3", x: 8, y: 0, w: 4, h: 2 },
          { i: "k4", x: 0, y: 2, w: 6, h: 2 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#a11y-keyboard {
          display: block;
          width: 100%;
          min-height: 350px;
          border-radius: 8px;
          background: ${semanticVar("surface", "secondary")};
          --grid-focus-ring-color: ${colorVar("blue", 60)};
        }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .kb-instructions {
          font-family: system-ui, sans-serif;
          font-size: 13px;
          color: ${colorVar("gray", 80)};
          background: ${colorVar("gray", 10)};
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 16px;
          line-height: 1.7;
        }
        .kb-instructions code {
          font-family: monospace;
          font-size: 12px;
          background: ${colorVar("gray", 20)};
          padding: 2px 6px;
          border-radius: 3px;
          color: ${colorVar("gray", 90)};
        }
        .kb-instructions ol {
          margin: 8px 0 0;
          padding-left: 20px;
        }
        .kb-item {
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
      <div class="kb-instructions">
        Keyboard navigation flow:
        <ol>
          <li><code>Tab</code> to focus a grid item</li>
          <li><code>Enter</code> or <code>Space</code> to grab it (drag mode)</li>
          <li><code>Arrow keys</code> to move one cell at a time</li>
          <li><code>Enter</code> to confirm placement</li>
          <li><code>Escape</code> to cancel and revert</li>
        </ol>
        For resize: press <code>R</code> instead of Enter, then use arrows to grow/shrink.
      </div>
      <grid-layout id="a11y-keyboard">
        ${["k1", "k2", "k3", "k4"].map(
          (id, i) => html`
            <grid-item item-id=${id}>
              <div
                class="kb-item"
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

export const AriaRoles: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector<GridLayoutElement>("grid-layout#a11y-aria");
      if (grid) {
        grid.gridConfig = { cols: 12, rowHeight: 70, margin: [10, 10], containerPadding: [10, 10] };
        grid.layout = [
          { i: "a1", x: 0, y: 0, w: 6, h: 2 },
          { i: "a2", x: 6, y: 0, w: 6, h: 2 },
          { i: "a3", x: 0, y: 2, w: 4, h: 2, static: true },
          { i: "a4", x: 4, y: 2, w: 8, h: 2 },
        ];
      }
    }, 0);

    return html`
      <style>
        grid-layout#a11y-aria {
          display: block;
          width: 100%;
          min-height: 350px;
          border-radius: 8px;
          background: ${semanticVar("surface", "secondary")};
        }
        grid-item {
          cursor: grab;
        }
        grid-item[dragging] {
          cursor: grabbing;
        }
        .aria-table {
          font-family: system-ui, sans-serif;
          font-size: 13px;
          border-collapse: collapse;
          margin-bottom: 16px;
          width: 100%;
          max-width: 600px;
        }
        .aria-table th,
        .aria-table td {
          text-align: left;
          padding: 6px 12px;
          border: 1px solid ${semanticVar("border", "minimal")};
        }
        .aria-table th {
          background: ${colorVar("gray", 10)};
          color: ${colorVar("gray", 80)};
          font-weight: 600;
        }
        .aria-table td {
          color: ${semanticVar("text", "secondary")};
        }
        .aria-table code {
          font-family: monospace;
          font-size: 12px;
          background: ${semanticVar("surface", "secondary")};
          padding: 1px 4px;
          border-radius: 2px;
        }
        .aria-item {
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
        .aria-item__role {
          font-size: 1rem;
          font-weight: 600;
        }
        .aria-item__attr {
          font-size: 11px;
          font-family: monospace;
          color: #fff;
        }
      </style>
      <table class="aria-table">
        <thead>
          <tr>
            <th>Element</th>
            <th>Role</th>
            <th>Attributes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>&lt;grid-layout&gt;</code></td>
            <td><code>role="grid"</code></td>
            <td><code>aria-roledescription="draggable grid"</code></td>
          </tr>
          <tr>
            <td><code>&lt;grid-item&gt;</code></td>
            <td><code>role="gridcell"</code></td>
            <td><code>tabindex="0"</code>, <code>aria-grabbed="false"</code></td>
          </tr>
          <tr>
            <td>Live region</td>
            <td>—</td>
            <td><code>aria-live="polite"</code> (announces drag/resize state)</td>
          </tr>
        </tbody>
      </table>
      <grid-layout id="a11y-aria">
        <grid-item item-id="a1">
          <div
            class="aria-item"
            style="background:${COLORS[0].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[0].text}"
          >
            <span class="aria-item__role">gridcell</span>
            <span class="aria-item__attr">tabindex="0" aria-grabbed</span>
          </div>
        </grid-item>
        <grid-item item-id="a2">
          <div
            class="aria-item"
            style="background:${COLORS[1].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[1].text}"
          >
            <span class="aria-item__role">gridcell</span>
            <span class="aria-item__attr">tabindex="0" aria-grabbed</span>
          </div>
        </grid-item>
        <grid-item item-id="a3" static>
          <div
            class="aria-item"
            style="background:${semanticVar("surface", "moderate")};border:2px dashed ${semanticVar("border", "subtle")};color:${semanticVar("text", "tertiary")}"
          >
            <span class="aria-item__role">gridcell (static)</span>
            <span class="aria-item__attr">not draggable</span>
          </div>
        </grid-item>
        <grid-item item-id="a4">
          <div
            class="aria-item"
            style="background:${COLORS[3].bg};border:1px solid ${semanticVar("border", "minimal")};color:${COLORS[3].text}"
          >
            <span class="aria-item__role">gridcell</span>
            <span class="aria-item__attr">tabindex="0" aria-grabbed</span>
          </div>
        </grid-item>
      </grid-layout>
    `;
  },
};
