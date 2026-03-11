import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { injectAllTokens } from "@maneki/foundation";
import "@maneki/ui-components/src/components/ui-tab-item.js";
import "@maneki/ui-components/src/components/ui-tab-group.js";
import "../components/flex-layout.js";
import "../components/flex-panel.js";
import "../components/flex-panel-header.js";

injectAllTokens();

const meta: Meta = {
  title: "Flex Layout/Sizes",
};
export default meta;
type Story = StoryObj;

const panelContentStyle = `
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--fd-text-tertiary);
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 500;
`;

function tabs(size: "s" | "m") {
  return html`
    <ui-tab-group slot="tabs" size=${size} closable>
      <ui-tab-item label="Tab 1" selected></ui-tab-item>
      <ui-tab-item label="Tab 2"></ui-tab-item>
      <ui-tab-item label="Tab 3"></ui-tab-item>
    </ui-tab-group>
  `;
}

// ---------------------------------------------------------------------------
// Large
// ---------------------------------------------------------------------------

export const Large: Story = {
  render: () => html`
    <div style="width: 100%; height: 600px;">
      <flex-layout size="large">
        <!-- Panel Left -->
          <flex-layout direction="column" size="large" style="flex: 1; padding: 0;">
            <!-- Panel Top -->
            <flex-panel>
              <flex-panel-header slot="header" heading="Card Heading" size="large" variant="tabs">
                ${tabs("s")}
              </flex-panel-header>
              <div style="${panelContentStyle}">Content</div>
            </flex-panel>
            <!-- Panel Bottom (split) -->
            <flex-layout size="large" style="flex: 1; padding: 0;">
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="large" variant="tabs">
                  ${tabs("s")}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="large" variant="tabs">
                  ${tabs("s")}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
            </flex-layout>
          </flex-layout>
        <!-- Panel Right (fixed 300px) -->
        <flex-panel width="300">
          <flex-panel-header slot="header" heading="Card Heading" size="large" variant="tabs">
            ${tabs("s")}
          </flex-panel-header>
          <div style="${panelContentStyle}">Content</div>
        </flex-panel>
      </flex-layout>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Medium
// ---------------------------------------------------------------------------

export const Medium: Story = {
  render: () => html`
    <div style="width: 100%; height: 600px;">
      <flex-layout size="medium">
        <!-- Panel Left -->
          <flex-layout direction="column" size="medium" style="flex: 1; padding: 0;">
            <!-- Panel Top -->
            <flex-panel>
              <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="tabs">
                ${tabs("s")}
              </flex-panel-header>
              <div style="${panelContentStyle}">Content</div>
            </flex-panel>
            <!-- Panel Bottom (split) -->
            <flex-layout size="medium" style="flex: 1; padding: 0;">
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="tabs">
                  ${tabs("s")}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="tabs">
                  ${tabs("s")}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
            </flex-layout>
          </flex-layout>
        <!-- Panel Right (fixed 300px) -->
        <flex-panel width="300">
          <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="tabs">
            ${tabs("s")}
          </flex-panel-header>
          <div style="${panelContentStyle}">Content</div>
        </flex-panel>
      </flex-layout>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Small
// ---------------------------------------------------------------------------

export const Small: Story = {
  render: () => html`
    <div style="width: 100%; height: 600px;">
      <flex-layout size="small">
        <!-- Panel Left -->
          <flex-layout direction="column" size="small" style="flex: 1; padding: 0;">
            <!-- Panel Top -->
            <flex-panel>
              <flex-panel-header slot="header" heading="Card Heading" size="small" variant="tabs">
                ${tabs("s")}
              </flex-panel-header>
              <div style="${panelContentStyle}">Content</div>
            </flex-panel>
            <!-- Panel Bottom (split) -->
            <flex-layout size="small" style="flex: 1; padding: 0;">
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="small" variant="tabs">
                  ${tabs("s")}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="small" variant="tabs">
                  ${tabs("s")}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
            </flex-layout>
          </flex-layout>
        <!-- Panel Right (fixed 300px) -->
        <flex-panel width="300">
          <flex-panel-header slot="header" heading="Card Heading" size="small" variant="tabs">
            ${tabs("s")}
          </flex-panel-header>
          <div style="${panelContentStyle}">Content</div>
        </flex-panel>
      </flex-layout>
    </div>
  `,
};
