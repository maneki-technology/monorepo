import type { Meta, StoryObj } from "@storybook/web-components";
import { html, nothing } from "lit";
import {
  surface,
  border,
  text,
  icon,
  global,
  statusSurface,
  statusText,
  statusIcon,
  statusGeneral,
  resolveSemanticValue,
  type SemanticValue,
} from "../semantic-tokens.js";
import { injectAllTokens } from "../tokens.js";

const meta: Meta = {
  title: "Foundation/Semantic Tokens",
};
export default meta;
type Story = StoryObj;

function toKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function renderColorSwatch(
  name: string,
  cssVar: string,
  value: SemanticValue,
  mode: "surface" | "border" | "text" | "icon",
) {
  const resolved = resolveSemanticValue(value);
  const isLight =
    resolved === "#ffffff" || resolved === "rgba(28, 43, 54, 0.8)";

  if (mode === "surface") {
    return html`
      <div class="token-row">
        <div
          class="surface-swatch"
          style="background-color: ${resolved}; ${isLight ? "border: 1px solid #dce3e8;" : ""}"
        ></div>
        <div class="token-info">
          <div class="token-name">${name}</div>
          <code class="token-var">${cssVar}</code>
          <div class="token-value">${resolved}</div>
        </div>
      </div>
    `;
  }

  if (mode === "border") {
    return html`
      <div class="token-row">
        <div
          class="border-swatch"
          style="border: 2px solid ${resolved};"
        ></div>
        <div class="token-info">
          <div class="token-name">${name}</div>
          <code class="token-var">${cssVar}</code>
          <div class="token-value">${resolved}</div>
        </div>
      </div>
    `;
  }

  // text or icon
  return html`
    <div class="token-row">
      <div class="text-swatch" style="color: ${resolved};">
        ${mode === "icon" ? "★" : "Aa"}
      </div>
      <div class="token-info">
        <div class="token-name">${name}</div>
        <code class="token-var">${cssVar}</code>
        <div class="token-value">${resolved}</div>
      </div>
    </div>
  `;
}

function renderGroup(
  tokens: Record<string, SemanticValue>,
  prefix: string,
  mode: "surface" | "border" | "text" | "icon",
) {
  return html`
    <div class="token-grid">
      ${Object.entries(tokens).map(([name, value]) => {
        const cssVar = `--fd-${prefix}-${toKebab(name)}`;
        return renderColorSwatch(name, cssVar, value, mode);
      })}
    </div>
  `;
}

const sharedStyles = html`
  <style>
    .semantic-container {
      font-family: system-ui, sans-serif;
      color: #1c2b36;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 16px;
      color: #1c2b36;
      letter-spacing: 0.02em;
    }
    .token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 32px;
    }
    .token-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 8px;
      background: #f8f9fa;
    }
    .surface-swatch {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .border-swatch {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      flex-shrink: 0;
      background: #ffffff;
    }
    .text-swatch {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      background: #ffffff;
      border: 1px solid #dce3e8;
    }
    .token-info {
      min-width: 0;
    }
    .token-name {
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 2px;
    }
    .token-var {
      font-size: 10px;
      color: #5b7282;
      display: block;
      margin-bottom: 1px;
    }
    .token-value {
      font-size: 10px;
          color: #5b7282;
      font-family: monospace;
    }
    .status-section {
      margin-bottom: 24px;
    }
    .status-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #5b7282;
      margin-bottom: 8px;
    }
  </style>
`;

export const Surface: Story = {
  render: () => {
    injectAllTokens();
    return html`
      ${sharedStyles}
      <div class="semantic-container">
        <p class="section-title">Surface</p>
        ${renderGroup(surface, "surface", "surface")}
      </div>
    `;
  },
};

export const Border: Story = {
  render: () => {
    injectAllTokens();
    return html`
      ${sharedStyles}
      <div class="semantic-container">
        <p class="section-title">Border</p>
        ${renderGroup(border, "border", "border")}
      </div>
    `;
  },
};

export const Text: Story = {
  parameters: { a11y: { test: "todo" } },
  render: () => {
    injectAllTokens();
    return html`
      ${sharedStyles}
      <div class="semantic-container">
        <p class="section-title">Text</p>
        ${renderGroup(text, "text", "text")}
      </div>
    `;
  },
};

export const Icon: Story = {
  render: () => {
    injectAllTokens();
    return html`
      ${sharedStyles}
      <div class="semantic-container">
        <p class="section-title">Icon</p>
        ${renderGroup(icon, "icon", "icon")}
      </div>
    `;
  },
};

export const Global: Story = {
  render: () => {
    injectAllTokens();
    return html`
      ${sharedStyles}
      <div class="semantic-container">
        <p class="section-title">Global</p>
        ${renderGroup(global, "global", "surface")}
      </div>
    `;
  },
};

export const Status: Story = {
  render: () => {
    injectAllTokens();

    const renderStatusGroup = (
      label: string,
      tokens: Record<string, SemanticValue>,
      prefix: string,
      mode: "surface" | "border" | "text" | "icon",
    ) => {
      const bold: Record<string, SemanticValue> = {};
      const subtle: Record<string, SemanticValue> = {};
      const other: Record<string, SemanticValue> = {};

      for (const [k, v] of Object.entries(tokens)) {
        const kl = k.toLowerCase();
        if (kl.includes("bold")) bold[k] = v;
        else if (kl.includes("subtle")) subtle[k] = v;
        else other[k] = v;
      }

      return html`
        <div class="status-section">
          <p class="section-title">${label}</p>
          ${Object.keys(other).length > 0
            ? html`
                <div class="status-label">Base</div>
                ${renderGroup(other, prefix, mode)}
              `
            : nothing}
          ${Object.keys(bold).length > 0
            ? html`
                <div class="status-label">Bold</div>
                ${renderGroup(bold, prefix, mode)}
              `
            : nothing}
          ${Object.keys(subtle).length > 0
            ? html`
                <div class="status-label">Subtle</div>
                ${renderGroup(subtle, prefix, mode)}
              `
            : nothing}
        </div>
      `;
    };

    return html`
      ${sharedStyles}
      <div class="semantic-container">
        ${renderStatusGroup("Status — General", statusGeneral, "status-general", "surface")}
        ${renderStatusGroup("Status — Surface", statusSurface, "status-surface", "surface")}
        ${renderStatusGroup("Status — Text", statusText, "status-text", "text")}
        ${renderStatusGroup("Status — Icon", statusIcon, "status-icon", "icon")}
      </div>
    `;
  },
};
