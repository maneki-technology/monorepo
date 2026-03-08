import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { spacing } from "../spacing.js";
import { injectAllTokens } from "../tokens.js";

const meta: Meta = {
  title: "Foundation/Spacing",
};
export default meta;
type Story = StoryObj;

function spaceKey(step: string): string {
  return step.replace(/\./g, "-");
}

export const Scale: Story = {
  render: () => {
    injectAllTokens();

    const steps = Object.entries(spacing) as [string, number][];

    return html`
      <style>
        .spacing-container {
          font-family: system-ui, sans-serif;
          color: #1c2b36;
          max-width: 720px;
        }
        .spacing-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 6px 0;
        }
        .spacing-label {
          font-size: 12px;
          font-weight: 500;
          min-width: 48px;
          text-align: right;
          color: #3e5463;
        }
        .spacing-bar-track {
          flex: 1;
          position: relative;
          height: 24px;
          background: #f2f5f7;
          border-radius: 4px;
          overflow: hidden;
        }
        .spacing-bar {
          height: 100%;
          background: #186ade;
          border-radius: 4px;
          min-width: 1px;
          transition: width 0.3s ease;
        }
        .spacing-value {
          font-size: 11px;
          color: #7a909e;
          min-width: 56px;
          font-family: monospace;
        }
        .spacing-var {
          font-size: 10px;
          color: #9fb1bd;
          font-family: monospace;
          min-width: 130px;
        }
      </style>
      <div class="spacing-container">
        ${steps.map(
          ([step, value]) => html`
            <div class="spacing-row">
              <span class="spacing-label">${step}</span>
              <div class="spacing-bar-track">
                <div
                  class="spacing-bar"
                  style="width: ${Math.min((value / 80) * 100, 100)}%;"
                ></div>
              </div>
              <span class="spacing-value">${value}px</span>
              <span class="spacing-var">--fd-space-${spaceKey(step)}</span>
            </div>
          `,
        )}
      </div>
    `;
  },
};
