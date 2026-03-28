import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-side-panel-menu.js";
import "../components/ui-side-panel-menu-item.js";
import "../components/ui-side-panel-menu-section.js";

const meta: Meta = {
  title: "Components/Side Panel Menu Section",
  component: "ui-side-panel-menu-section",
  decorators: [
    (story) => html`
      <div style="height: 400px; display: flex;">
        <ui-side-panel-menu no-collapse><span slot="header">Navigation</span>
          ${story()}
        </ui-side-panel-menu>
        <div style="flex: 1; padding: 24px; background: #fff;">
          <p style="margin: 0; color: #1c2b36; font-family: Geist, sans-serif;">
            Main content area
          </p>
        </div>
      </div>
    `,
  ],
};
export default meta;
type Story = StoryObj;

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => html`
    <ui-side-panel-menu-section>Foundation</ui-side-panel-menu-section>
    <ui-side-panel-menu-item>Colors</ui-side-panel-menu-item>
    <ui-side-panel-menu-item selected>Spacing</ui-side-panel-menu-item>
    <ui-side-panel-menu-item>Typography</ui-side-panel-menu-item>
  `,
};

// ── Multiple Sections ────────────────────────────────────────────────────────

export const MultipleSections: Story = {
  render: () => html`
    <ui-side-panel-menu-section>Foundation</ui-side-panel-menu-section>
    <ui-side-panel-menu-item>Colors</ui-side-panel-menu-item>
    <ui-side-panel-menu-item selected>Spacing</ui-side-panel-menu-item>
    <ui-side-panel-menu-item>Typography</ui-side-panel-menu-item>
    <ui-side-panel-menu-item>Elevation</ui-side-panel-menu-item>

    <ui-side-panel-menu-section>Primitives</ui-side-panel-menu-section>
    <ui-side-panel-menu-item>Badge</ui-side-panel-menu-item>
    <ui-side-panel-menu-item>Button</ui-side-panel-menu-item>
    <ui-side-panel-menu-item>Avatar</ui-side-panel-menu-item>

    <ui-side-panel-menu-section>Form Controls</ui-side-panel-menu-section>
    <ui-side-panel-menu-item>Input</ui-side-panel-menu-item>
    <ui-side-panel-menu-item>Select</ui-side-panel-menu-item>
    <ui-side-panel-menu-item>Checkbox</ui-side-panel-menu-item>
  `,
};
