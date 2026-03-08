import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { colors } from "../colors.js";
import { injectAllTokens } from "../tokens.js";

const meta: Meta = {
  title: "Foundation/Colors",
};
export default meta;
type Story = StoryObj;

export const Palette: Story = {
  render: () => {
    injectAllTokens();

    const families = Object.keys(colors) as (keyof typeof colors)[];
    const allSteps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

    return html`
      <style>
        .color-grid {
          font-family: system-ui, sans-serif;
          font-size: 11px;
          color: #1c2b36;
        }
        .color-grid table {
          border-collapse: collapse;
          width: 100%;
        }
        .color-grid th {
          padding: 6px 8px;
          text-align: center;
          font-weight: 500;
          color: #5b7282;
          font-size: 11px;
          letter-spacing: 0.03em;
        }
        .color-grid th:first-child {
          text-align: left;
          min-width: 100px;
        }
        .color-grid td {
          padding: 4px;
          text-align: center;
          vertical-align: top;
        }
        .color-grid td:first-child {
          text-align: left;
          font-weight: 500;
          font-size: 12px;
          padding-top: 14px;
          text-transform: capitalize;
        }
        .swatch {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          margin: 0 auto 4px;
          border: 1px solid rgba(0,0,0,0.06);
          transition: transform 0.15s ease;
          cursor: default;
        }
        .swatch:hover {
          transform: scale(1.12);
        }
        .swatch-label {
          font-size: 10px;
          color: #7a909e;
          line-height: 1.3;
        }
        .swatch-var {
          font-size: 9px;
          color: #9fb1bd;
          font-family: monospace;
          display: none;
        }
        td:hover .swatch-var {
          display: block;
        }
        .empty-cell {
          width: 48px;
          height: 48px;
        }
      </style>
      <div class="color-grid">
        <table>
          <thead>
            <tr>
              <th></th>
              ${allSteps.map((s) => html`<th>${s}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${families.map((family) => {
              const steps = colors[family] as Record<number, string>;
              return html`
                <tr>
                  <td>${family}</td>
                  ${allSteps.map((step) => {
                    const hex = steps[step];
                    if (!hex) {
                      return html`<td><div class="empty-cell"></div></td>`;
                    }
                    return html`
                      <td>
                        <div
                          class="swatch"
                          style="background-color: ${hex};"
                        ></div>
                        <div class="swatch-label">${hex}</div>
                        <div class="swatch-var">--fd-color-${family}-${step}</div>
                      </td>
                    `;
                  })}
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    `;
  },
};
