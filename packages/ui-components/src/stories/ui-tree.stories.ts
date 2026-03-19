import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-tree-item.js";
import "../components/ui-tree-group.js";

const meta: Meta = {
  title: "Components/Tree",
  component: "ui-tree-group",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
  },
  args: {
    size: "m",
  },
};

export default meta;
type Story = StoryObj;

// ─── Default ────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => html`
    <ui-tree-group size="m" style="width:320px">
      <ui-tree-item arrow="open" label="Documents" level="parent"></ui-tree-item>
      <ui-tree-item arrow="none" label="Resume.pdf" level="child-1"></ui-tree-item>
      <ui-tree-item arrow="none" label="Cover Letter.docx" level="child-1"></ui-tree-item>
      <ui-tree-item arrow="closed" label="Projects" level="parent"></ui-tree-item>
      <ui-tree-item arrow="none" label="Photos" level="parent"></ui-tree-item>
    </ui-tree-group>
  `,
};

// ─── All Sizes ──────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => html`
    <div style="display:flex;gap:48px;align-items:start">
      <div>
        <p style="margin:0 0 8px;font-family:sans-serif;font-size:12px;color:#666">Small</p>
        <ui-tree-group size="s" style="width:240px">
          <ui-tree-item arrow="open" label="src" level="parent"></ui-tree-item>
          <ui-tree-item arrow="none" label="index.ts" level="child-1"></ui-tree-item>
          <ui-tree-item arrow="none" label="utils.ts" level="child-1"></ui-tree-item>
        </ui-tree-group>
      </div>
      <div>
        <p style="margin:0 0 8px;font-family:sans-serif;font-size:12px;color:#666">Medium</p>
        <ui-tree-group size="m" style="width:280px">
          <ui-tree-item arrow="open" label="src" level="parent"></ui-tree-item>
          <ui-tree-item arrow="none" label="index.ts" level="child-1"></ui-tree-item>
          <ui-tree-item arrow="none" label="utils.ts" level="child-1"></ui-tree-item>
        </ui-tree-group>
      </div>
      <div>
        <p style="margin:0 0 8px;font-family:sans-serif;font-size:12px;color:#666">Large</p>
        <ui-tree-group size="l" style="width:320px">
          <ui-tree-item arrow="open" label="src" level="parent"></ui-tree-item>
          <ui-tree-item arrow="none" label="index.ts" level="child-1"></ui-tree-item>
          <ui-tree-item arrow="none" label="utils.ts" level="child-1"></ui-tree-item>
        </ui-tree-group>
      </div>
    </div>
  `,
};

// ─── With Leading Icon ──────────────────────────────────────────────────────

export const WithLeadingIcon: Story = {
  render: () => html`
    <ui-tree-group size="m" style="width:320px">
      <ui-tree-item arrow="open" label="Home" level="parent" leading-icon icon-name="home"></ui-tree-item>
      <ui-tree-item arrow="none" label="Dashboard" level="child-1" leading-icon icon-name="bar_chart"></ui-tree-item>
      <ui-tree-item arrow="none" label="Settings" level="child-1" leading-icon icon-name="settings"></ui-tree-item>
      <ui-tree-item arrow="closed" label="Users" level="parent" leading-icon icon-name="group"></ui-tree-item>
      <ui-tree-item arrow="none" label="Profile" level="parent" leading-icon icon-name="person"></ui-tree-item>
    </ui-tree-group>
  `,
};

// ─── With Checkbox ──────────────────────────────────────────────────────────

export const WithCheckbox: Story = {
  render: () => html`
    <ui-tree-group size="m" style="width:320px">
      <ui-tree-item arrow="open" label="Notifications" level="parent" checkbox>
        <ui-checkbox-item slot="checkbox" size="m" checked></ui-checkbox-item>
      </ui-tree-item>
      <ui-tree-item arrow="none" label="Email alerts" level="child-1" checkbox>
        <ui-checkbox-item slot="checkbox" size="m" checked></ui-checkbox-item>
      </ui-tree-item>
      <ui-tree-item arrow="none" label="Push notifications" level="child-1" checkbox>
        <ui-checkbox-item slot="checkbox" size="m"></ui-checkbox-item>
      </ui-tree-item>
      <ui-tree-item arrow="closed" label="Privacy" level="parent" checkbox>
        <ui-checkbox-item slot="checkbox" size="m" indeterminate></ui-checkbox-item>
      </ui-tree-item>
    </ui-tree-group>
  `,
};

// ─── Tree Group With Search ─────────────────────────────────────────────────

export const TreeGroupWithSearch: Story = {
  render: () => html`
    <ui-tree-group size="m" style="width:320px">
      <ui-input slot="search" size="m" placeholder="Search tree…" type="clearable" style="margin-bottom:8px"></ui-input>
      <ui-tree-item arrow="open" label="Application" level="parent"></ui-tree-item>
      <ui-tree-item arrow="open" label="Components" level="child-1"></ui-tree-item>
      <ui-tree-item arrow="none" label="Header.tsx" level="child-2"></ui-tree-item>
      <ui-tree-item arrow="none" label="Footer.tsx" level="child-2"></ui-tree-item>
      <ui-tree-item arrow="closed" label="Pages" level="child-1"></ui-tree-item>
      <ui-tree-item arrow="none" label="Assets" level="parent"></ui-tree-item>
      <ui-tree-item arrow="closed" label="Config" level="parent"></ui-tree-item>
    </ui-tree-group>
  `,
};
