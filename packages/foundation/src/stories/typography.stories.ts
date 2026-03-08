import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { typography, type TypeToken } from "../typography.js";
import { injectAllTokens } from "../tokens.js";

const meta: Meta = {
  title: "Foundation/Typography",
};
export default meta;
type Story = StoryObj;

const groupLabels: Record<string, string> = {
  display: "Display",
  heading: "Heading",
  body: "Body",
  ui: "UI",
  caption: "Caption",
  badge: "Badge",
  code: "Code",
};

export const TypeScale: Story = {
  render: () => {
    injectAllTokens();

    const groups = Object.entries(typography) as [
      string,
      Record<string, TypeToken>,
    ][];

    return html`
      <style>
        .type-container {
          font-family: system-ui, sans-serif;
          color: #1c2b36;
        }
        .type-group {
          margin-bottom: 40px;
        }
        .group-header {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7a909e;
          margin: 0 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #dce3e8;
        }
        .type-row {
          display: grid;
          grid-template-columns: 1fr 280px;
          align-items: baseline;
          gap: 24px;
          padding: 12px 0;
          border-bottom: 1px solid #f2f5f7;
        }
        .type-sample {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .type-meta {
          display: flex;
          gap: 16px;
          align-items: baseline;
          font-size: 11px;
          color: #7a909e;
          flex-shrink: 0;
        }
        .meta-key {
          font-weight: 500;
          color: #3e5463;
          min-width: 70px;
        }
        .meta-detail {
          font-family: monospace;
          font-size: 10px;
          color: #9fb1bd;
        }
        .meta-usage {
          font-size: 10px;
          color: #9fb1bd;
          margin-top: 4px;
          font-style: italic;
        }
      </style>
      <div class="type-container">
        ${groups.map(
          ([group, tokens]) => html`
            <div class="type-group">
              <p class="group-header">${groupLabels[group] ?? group}</p>
              ${Object.entries(tokens).map(([key, token]) => {
                const t = token as TypeToken;
                return html`
                  <div class="type-row">
                    <div
                      class="type-sample"
                      style="
                        font-family: ${t.fontFamily};
                        font-size: ${t.fontSize}px;
                        line-height: ${t.lineHeight}px;
                        font-weight: ${t.fontWeight};
                      "
                    >
                      The quick brown fox jumps
                    </div>
                    <div>
                      <div class="type-meta">
                        <span class="meta-key">${group}/${key}</span>
                        <span class="meta-detail"
                          >${t.fontSize}px / ${t.lineHeight}px ·
                          ${t.fontWeight}</span
                        >
                      </div>
                      <div class="meta-usage">${t.usage}</div>
                    </div>
                  </div>
                `;
              })}
            </div>
          `,
        )}
      </div>
    `;
  },
};
