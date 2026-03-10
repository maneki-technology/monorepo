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
  title: "Flex Layout/Title Options",
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

function tabs() {
  return html`
    <ui-tab-group slot="tabs" size="s" closable>
      <ui-tab-item label="Tab 1" selected></ui-tab-item>
      <ui-tab-item label="Tab 2"></ui-tab-item>
      <ui-tab-item label="Tab 3"></ui-tab-item>
    </ui-tab-group>
  `;
}

// ---------------------------------------------------------------------------
// Tabs Only (variant="tabs")
// ---------------------------------------------------------------------------

export const TabsOnly: Story = {
  name: "Tabs Only",
  render: () => html`
    <div style="width: 100%; height: 600px;">
      <flex-layout size="medium">
        <!-- Panel Left -->
          <flex-layout direction="column" size="medium" style="flex: 1; padding: 0;">
            <flex-panel>
              <flex-panel-header slot="header" size="medium" variant="tabs">
                ${tabs()}
              </flex-panel-header>
              <div style="${panelContentStyle}">Content</div>
            </flex-panel>
            <flex-layout size="medium" style="flex: 1; padding: 0;">
              <flex-panel>
                <flex-panel-header slot="header" size="medium" variant="tabs">
                  ${tabs()}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
              <flex-panel>
                <flex-panel-header slot="header" size="medium" variant="tabs">
                  ${tabs()}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
            </flex-layout>
          </flex-layout>
        <flex-panel width="300">
          <flex-panel-header slot="header" size="medium" variant="tabs">
            ${tabs()}
          </flex-panel-header>
          <div style="${panelContentStyle}">Content</div>
        </flex-panel>
      </flex-layout>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Title Only (variant="title")
// ---------------------------------------------------------------------------

export const TitleOnly: Story = {
  name: "Title Only",
  render: () => html`
    <div style="width: 100%; height: 600px;">
      <flex-layout size="medium">
        <!-- Panel Left -->
          <flex-layout direction="column" size="medium" style="flex: 1; padding: 0;">
            <flex-panel>
              <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title"></flex-panel-header>
              <div style="${panelContentStyle}">Content</div>
            </flex-panel>
            <flex-layout size="medium" style="flex: 1; padding: 0;">
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title"></flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title"></flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
            </flex-layout>
          </flex-layout>
        <flex-panel width="300">
          <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title"></flex-panel-header>
          <div style="${panelContentStyle}">Content</div>
        </flex-panel>
      </flex-layout>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Title + Tabs (variant="title-tabs")
// ---------------------------------------------------------------------------

export const TitleAndTabs: Story = {
  name: "Title + Tabs",
  render: () => html`
    <div style="width: 100%; height: 600px;">
      <flex-layout size="medium">
        <!-- Panel Left -->
          <flex-layout direction="column" size="medium" style="flex: 1; padding: 0;">
            <flex-panel>
              <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title-tabs">
                ${tabs()}
              </flex-panel-header>
              <div style="${panelContentStyle}">Content</div>
            </flex-panel>
            <flex-layout size="medium" style="flex: 1; padding: 0;">
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title-tabs">
                  ${tabs()}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
              <flex-panel>
                <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title-tabs">
                  ${tabs()}
                </flex-panel-header>
                <div style="${panelContentStyle}">Content</div>
              </flex-panel>
            </flex-layout>
          </flex-layout>
        <flex-panel width="300">
          <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title-tabs">
            ${tabs()}
          </flex-panel-header>
          <div style="${panelContentStyle}">Content</div>
        </flex-panel>
      </flex-layout>
    </div>
  `,
};
