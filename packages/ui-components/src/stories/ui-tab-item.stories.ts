import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-icon.js";
import "../components/ui-tab-item.js";
import "../components/ui-tab-group.js";

const meta: Meta = {
  title: "Components/Tab Item",
  component: "ui-tab-item",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m"] },
    orientation: { control: { type: "select" }, options: ["horizontal", "vertical"] },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    subMenu: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    size: "m",
    orientation: "horizontal",
    selected: false,
    disabled: false,
    subMenu: false,
    label: "Label",
  },
  render: (args) => html`
    <ui-tab-item
      size=${args.size}
      orientation=${args.orientation}
      ?selected=${args.selected}
      ?disabled=${args.disabled}
      ?sub-menu=${args.subMenu}
      label=${args.label}
    ></ui-tab-item>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

// ---------------------------------------------------------------------------
// Variants (Size S vs M)
// ---------------------------------------------------------------------------

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Tab Item (S)</div>
        <ui-tab-group size="s">
          <ui-tab-item label="Label" selected></ui-tab-item>
          <ui-tab-item label="Label"></ui-tab-item>
          <ui-tab-item label="Label"></ui-tab-item>
        </ui-tab-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Tab Item (M)</div>
        <ui-tab-group size="m">
          <ui-tab-item label="Label" selected></ui-tab-item>
          <ui-tab-item label="Label"></ui-tab-item>
          <ui-tab-item label="Label"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Orientation
// ---------------------------------------------------------------------------

export const Orientation: Story = {
  render: () => html`
    <div style="display: flex; gap: 64px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Horizontal</div>
        <ui-tab-group orientation="horizontal">
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
          <ui-tab-item label="Pie Chart"></ui-tab-item>
        </ui-tab-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Vertical</div>
        <ui-tab-group orientation="vertical">
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
          <ui-tab-item label="Pie Chart"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Leading Icon
// ---------------------------------------------------------------------------

function iconSpan(name: string): string {
  return `<ui-icon name="${name}" size="m" slot="leading-icon"></ui-icon>`;
}

export const LeadingIcon: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Leading Icon — On</div>
        <ui-tab-group>
          <ui-tab-item label="Data Grid" selected>
            <ui-icon name="bar_chart" size="m" slot="leading-icon"></ui-icon>
          </ui-tab-item>
          <ui-tab-item label="Table">
            <ui-icon name="bar_chart" size="m" slot="leading-icon"></ui-icon>
          </ui-tab-item>
          <ui-tab-item label="Pie Chart">
            <ui-icon name="bar_chart" size="m" slot="leading-icon"></ui-icon>
          </ui-tab-item>
        </ui-tab-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Leading Icon — Off</div>
        <ui-tab-group>
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
          <ui-tab-item label="Pie Chart"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Trailing Icon
// ---------------------------------------------------------------------------

export const TrailingIcon: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Trailing Icon — On</div>
        <ui-tab-group>
          <ui-tab-item label="Data Grid" selected>
            <ui-icon name="bar_chart" size="m" slot="trailing-icon"></ui-icon>
          </ui-tab-item>
          <ui-tab-item label="Table">
            <ui-icon name="bar_chart" size="m" slot="trailing-icon"></ui-icon>
          </ui-tab-item>
        </ui-tab-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Trailing Icon — Off</div>
        <ui-tab-group>
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Label Only (icon-only tab)
// ---------------------------------------------------------------------------

export const LabelOnly: Story = {
  name: "Label",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Label — On</div>
        <ui-tab-group>
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
          <ui-tab-item label="Pie Chart"></ui-tab-item>
        </ui-tab-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Label — Off (icon only)</div>
        <ui-tab-group>
          <ui-tab-item selected>
            <ui-icon name="bar_chart" size="m" slot="leading-icon"></ui-icon>
          </ui-tab-item>
          <ui-tab-item>
            <ui-icon name="home" size="m" slot="leading-icon"></ui-icon>
          </ui-tab-item>
          <ui-tab-item>
            <ui-icon name="settings" size="m" slot="leading-icon"></ui-icon>
          </ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Sub Menu
// ---------------------------------------------------------------------------

export const SubMenu: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Sub Menu — On</div>
        <ui-tab-group>
          <ui-tab-item label="Data Grid" sub-menu selected></ui-tab-item>
          <ui-tab-item label="Table" sub-menu></ui-tab-item>
        </ui-tab-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Sub Menu — Off</div>
        <ui-tab-group>
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 64px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Enabled</div>
        <ui-tab-item label="Label" size="m"></ui-tab-item>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Active (Selected)</div>
        <ui-tab-item label="Label" size="m" selected></ui-tab-item>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Disabled</div>
        <ui-tab-item label="Label" size="m" disabled></ui-tab-item>
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Overflow: Scroll vs Menu
// ---------------------------------------------------------------------------

export const OverflowScroll: Story = {
  name: "Overflow: Scroll (default)",
  render: () => html`
    <div style="width: 300px;">
      <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Constrained width (300px) — scroll overflow</div>
      <ui-tab-group>
        <ui-tab-item label="Data Grid" selected></ui-tab-item>
        <ui-tab-item label="Table"></ui-tab-item>
        <ui-tab-item label="Pie Chart"></ui-tab-item>
        <ui-tab-item label="Bar Chart"></ui-tab-item>
        <ui-tab-item label="Line Chart"></ui-tab-item>
        <ui-tab-item label="Scatter Plot"></ui-tab-item>
      </ui-tab-group>
    </div>
  `,
};

export const OverflowMenu: Story = {
  name: "Overflow: Menu",
  render: () => html`
    <div style="width: 300px;">
      <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Constrained width (300px) — menu overflow with ⋮ button</div>
      <ui-tab-group overflow="menu">
        <ui-tab-item label="Data Grid" selected></ui-tab-item>
        <ui-tab-item label="Table"></ui-tab-item>
        <ui-tab-item label="Pie Chart"></ui-tab-item>
        <ui-tab-item label="Bar Chart"></ui-tab-item>
        <ui-tab-item label="Line Chart"></ui-tab-item>
        <ui-tab-item label="Scatter Plot"></ui-tab-item>
      </ui-tab-group>
    </div>
  `,
};

export const OverflowMenuVertical: Story = {
  name: "Overflow: Menu (Vertical)",
  render: () => html`
    <div style="height: 120px;">
      <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 13px; color: #5b7282;">Constrained height (120px) — vertical menu overflow</div>
      <ui-tab-group orientation="vertical" overflow="menu" style="height: 100px;">
        <ui-tab-item label="Data Grid" selected></ui-tab-item>
        <ui-tab-item label="Table"></ui-tab-item>
        <ui-tab-item label="Pie Chart"></ui-tab-item>
        <ui-tab-item label="Bar Chart"></ui-tab-item>
        <ui-tab-item label="Line Chart"></ui-tab-item>
      </ui-tab-group>
    </div>
  `,
};
