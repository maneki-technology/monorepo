import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-data-toolbar.js";
import "../components/ui-input.js";
import "../components/ui-select.js";
import "../components/ui-icon.js";

const meta: Meta = {
  title: "Components/Data Toolbar",
  component: "ui-data-toolbar",
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "select" }, options: ["xs", "s", "m"] },
    density: {
      control: { type: "select" },
      options: ["ultra-compact", "compact", "standard"],
    },
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    size: "s",
    density: "compact",
  },
  render: (args) => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size=${args.size} density=${args.density}>
        <ui-input placeholder="Search..." size="s"></ui-input>
        <ui-select placeholder="Status" size="s">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </ui-select>
        <ui-icon
          slot="actions"
          name="download"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="upload"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="more_vert"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

// ─── Size variants ──────────────────────────────────────────────────────────

export const SizeXS: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="xs" density="compact">
        <ui-input placeholder="Filter..." size="s"></ui-input>
        <ui-select placeholder="Type" size="s">
          <option value="all">All</option>
          <option value="open">Open</option>
        </ui-select>
        <ui-icon
          slot="actions"
          name="search"
          size="xs"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="download"
          size="xs"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};

export const SizeS: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="s" density="compact">
        <ui-input placeholder="Search..." size="s"></ui-input>
        <ui-select placeholder="Status" size="s">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </ui-select>
        <ui-icon
          slot="actions"
          name="download"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="more_vert"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};

export const SizeM: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="m" density="compact">
        <ui-input placeholder="Search records..." size="m"></ui-input>
        <ui-select placeholder="Category" size="m">
          <option value="all">All Categories</option>
          <option value="finance">Finance</option>
          <option value="hr">HR</option>
        </ui-select>
        <ui-icon
          slot="actions"
          name="download"
          size="m"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="upload"
          size="m"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="more_vert"
          size="m"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};

// ─── Density variants ───────────────────────────────────────────────────────

export const DensityUltraCompact: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="xs" density="ultra-compact">
        <ui-input placeholder="Filter..." size="s"></ui-input>
        <ui-select placeholder="Status" size="s">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </ui-select>
        <ui-icon
          slot="actions"
          name="search"
          size="xs"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="more_vert"
          size="xs"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};

export const DensityCompact: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="s" density="compact">
        <ui-input placeholder="Search..." size="s"></ui-input>
        <ui-select placeholder="Role" size="s">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </ui-select>
        <ui-icon
          slot="actions"
          name="download"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="settings"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};

export const DensityStandard: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="s" density="standard">
        <ui-input placeholder="Search..." size="s"></ui-input>
        <ui-select placeholder="Department" size="s">
          <option value="eng">Engineering</option>
          <option value="design">Design</option>
          <option value="product">Product</option>
        </ui-select>
        <ui-icon
          slot="actions"
          name="download"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="share"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};

// ─── Slot variants ──────────────────────────────────────────────────────────

export const WithFieldsOnly: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="s" density="compact">
        <ui-input placeholder="Search..." size="s"></ui-input>
        <ui-select placeholder="Status" size="s">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </ui-select>
        <ui-select placeholder="Role" size="s">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </ui-select>
      </ui-data-toolbar>
    </div>
  `,
};

export const WithActionsOnly: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-data-toolbar size="s" density="compact">
        <ui-icon
          slot="actions"
          name="search"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="download"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="upload"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="settings"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
        <ui-icon
          slot="actions"
          name="more_vert"
          size="s"
          style="cursor: pointer;"
        ></ui-icon>
      </ui-data-toolbar>
    </div>
  `,
};

// ─── Comparison ─────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 24px; max-width: 720px;"
    >
      <div>
        <h4
          style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;"
        >
          Size XS
        </h4>
        <ui-data-toolbar size="xs" density="compact">
          <ui-input placeholder="Filter..." size="s"></ui-input>
          <ui-select placeholder="Status" size="s">
            <option value="active">Active</option>
          </ui-select>
          <ui-icon
            slot="actions"
            name="download"
            size="xs"
            style="cursor: pointer;"
          ></ui-icon>
          <ui-icon
            slot="actions"
            name="more_vert"
            size="xs"
            style="cursor: pointer;"
          ></ui-icon>
        </ui-data-toolbar>
      </div>
      <div>
        <h4
          style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;"
        >
          Size S
        </h4>
        <ui-data-toolbar size="s" density="compact">
          <ui-input placeholder="Search..." size="s"></ui-input>
          <ui-select placeholder="Status" size="s">
            <option value="active">Active</option>
          </ui-select>
          <ui-icon
            slot="actions"
            name="download"
            size="s"
            style="cursor: pointer;"
          ></ui-icon>
          <ui-icon
            slot="actions"
            name="more_vert"
            size="s"
            style="cursor: pointer;"
          ></ui-icon>
        </ui-data-toolbar>
      </div>
      <div>
        <h4
          style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;"
        >
          Size M
        </h4>
        <ui-data-toolbar size="m" density="compact">
          <ui-input placeholder="Search records..." size="m"></ui-input>
          <ui-select placeholder="Status" size="m">
            <option value="active">Active</option>
          </ui-select>
          <ui-icon
            slot="actions"
            name="download"
            size="m"
            style="cursor: pointer;"
          ></ui-icon>
          <ui-icon
            slot="actions"
            name="more_vert"
            size="m"
            style="cursor: pointer;"
          ></ui-icon>
        </ui-data-toolbar>
      </div>
    </div>
  `,
};
