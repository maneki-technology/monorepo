import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { elevation } from "../semantic-tokens.js";
import { injectAllTokens } from "../tokens.js";

const meta: Meta = {
  title: "Foundation/Elevation",
};
export default meta;
type Story = StoryObj;

export const Levels: Story = {
  render: () => {
    injectAllTokens();

    const levels = Object.entries(elevation) as [
      string,
      { boxShadow: string },
    ][];

    return html`
      <style>
        .elevation-container {
          font-family: system-ui, sans-serif;
          color: #1c2b36;
          padding: 32px;
          background: #f2f5f7;
          border-radius: 12px;
        }
        .elevation-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .elevation-card {
          background: #ffffff;
          border-radius: 10px;
          padding: 24px;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease;
        }
        .elevation-card:hover {
          transform: translateY(-2px);
        }
        .elevation-level {
          font-size: 20px;
          font-weight: 600;
          color: #1c2b36;
          margin-bottom: 8px;
        }
        .elevation-var {
          font-size: 11px;
          font-family: monospace;
          color: #5b7282;
          margin-bottom: 12px;
        }
        .elevation-shadow {
          font-size: 10px;
          font-family: monospace;
          color: #5b7282;
          line-height: 1.5;
          word-break: break-all;
        }
      </style>
      <div class="elevation-container">
        <div class="elevation-grid">
          ${levels.map(
            ([level, token]) => html`
              <div
                class="elevation-card"
                style="box-shadow: ${token.boxShadow};"
              >
                <div>
                  <div class="elevation-level">${level}</div>
                  <div class="elevation-var">--fd-elevation-${level}</div>
                </div>
                <div class="elevation-shadow">${token.boxShadow}</div>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  },
};
