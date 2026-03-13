import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-table.js";
import "../components/ui-table-row.js";
import "../components/ui-table-cell.js";

const meta: Meta = {
  title: "Components/Table",
  component: "ui-table",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    separator: { control: { type: "select" }, options: ["none", "minimal", "moderate"] },
    zebra: { control: "boolean" },
    bordered: { control: "boolean" },
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    size: "m",
    separator: "none",
    zebra: false,
    bordered: false,
  },
  render: (args) => html`
    <div style="max-width: 720px;">
      <ui-table
        size=${args.size}
        separator=${args.separator === "none" ? undefined : args.separator}
        ?zebra=${args.zebra}
        ?bordered=${args.bordered}
      >
        <ui-table-row header>
          <ui-table-cell header>Name</ui-table-cell>
          <ui-table-cell header>Email</ui-table-cell>
          <ui-table-cell header>Role</ui-table-cell>
          <ui-table-cell header>Status</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>John Doe</ui-table-cell>
          <ui-table-cell>john@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Jane Smith</ui-table-cell>
          <ui-table-cell>jane@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Bob Wilson</ui-table-cell>
          <ui-table-cell>bob@example.com</ui-table-cell>
          <ui-table-cell>Viewer</ui-table-cell>
          <ui-table-cell>Inactive</ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; max-width: 720px;">
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Size S</h4>
        <ui-table size="s">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Jane Smith</ui-table-cell>
            <ui-table-cell>jane@example.com</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Size M</h4>
        <ui-table size="m">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Jane Smith</ui-table-cell>
            <ui-table-cell>jane@example.com</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Size L</h4>
        <ui-table size="l">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Jane Smith</ui-table-cell>
            <ui-table-cell>jane@example.com</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
    </div>
  `,
};

export const CellVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 720px;">
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Data Cells</h4>
        <ui-table size="s">
          <ui-table-row><ui-table-cell>Cell S</ui-table-cell></ui-table-row>
        </ui-table>
        <ui-table size="m">
          <ui-table-row><ui-table-cell>Cell M</ui-table-cell></ui-table-row>
        </ui-table>
        <ui-table size="l">
          <ui-table-row><ui-table-cell>Cell L</ui-table-cell></ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Header Cells</h4>
        <ui-table size="s">
          <ui-table-row header><ui-table-cell header>Header Cell S</ui-table-cell></ui-table-row>
        </ui-table>
        <ui-table size="m">
          <ui-table-row header><ui-table-cell header>Header Cell M</ui-table-cell></ui-table-row>
        </ui-table>
        <ui-table size="l">
          <ui-table-row header><ui-table-cell header>Header Cell L</ui-table-cell></ui-table-row>
        </ui-table>
      </div>
    </div>
  `,
};

export const HeaderRows: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 720px;">
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Header Row S</h4>
        <ui-table size="s">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
            <ui-table-cell header>Status</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Header Row M</h4>
        <ui-table size="m">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
            <ui-table-cell header>Status</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Header Row L</h4>
        <ui-table size="l">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
            <ui-table-cell header>Status</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
    </div>
  `,
};

export const DataRows: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 720px;">
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Data Row S</h4>
        <ui-table size="s">
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
            <ui-table-cell>Active</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Data Row M</h4>
        <ui-table size="m">
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
            <ui-table-cell>Active</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Data Row L</h4>
        <ui-table size="l">
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
            <ui-table-cell>Active</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
    </div>
  `,
};

export const Density: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; max-width: 720px;">
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Compact (Size S)</h4>
        <ui-table size="s">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
            <ui-table-cell header>Status</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
            <ui-table-cell>Active</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Jane Smith</ui-table-cell>
            <ui-table-cell>jane@example.com</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
            <ui-table-cell>Active</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Bob Wilson</ui-table-cell>
            <ui-table-cell>bob@example.com</ui-table-cell>
            <ui-table-cell>Viewer</ui-table-cell>
            <ui-table-cell>Inactive</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div>
        <h4 style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3E5463;">Spacious (Size L)</h4>
        <ui-table size="l">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
            <ui-table-cell header>Status</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
            <ui-table-cell>Active</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Jane Smith</ui-table-cell>
            <ui-table-cell>jane@example.com</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
            <ui-table-cell>Active</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Bob Wilson</ui-table-cell>
            <ui-table-cell>bob@example.com</ui-table-cell>
            <ui-table-cell>Viewer</ui-table-cell>
            <ui-table-cell>Inactive</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
    </div>
  `,
};

export const SeparatorMinimal: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-table separator="minimal">
        <ui-table-row header>
          <ui-table-cell header>Name</ui-table-cell>
          <ui-table-cell header>Email</ui-table-cell>
          <ui-table-cell header>Role</ui-table-cell>
          <ui-table-cell header>Status</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>John Doe</ui-table-cell>
          <ui-table-cell>john@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Jane Smith</ui-table-cell>
          <ui-table-cell>jane@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Bob Wilson</ui-table-cell>
          <ui-table-cell>bob@example.com</ui-table-cell>
          <ui-table-cell>Viewer</ui-table-cell>
          <ui-table-cell>Inactive</ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
};

export const SeparatorModerate: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-table separator="moderate">
        <ui-table-row header>
          <ui-table-cell header>Name</ui-table-cell>
          <ui-table-cell header>Email</ui-table-cell>
          <ui-table-cell header>Role</ui-table-cell>
          <ui-table-cell header>Status</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>John Doe</ui-table-cell>
          <ui-table-cell>john@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Jane Smith</ui-table-cell>
          <ui-table-cell>jane@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Bob Wilson</ui-table-cell>
          <ui-table-cell>bob@example.com</ui-table-cell>
          <ui-table-cell>Viewer</ui-table-cell>
          <ui-table-cell>Inactive</ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
};

export const ZebraStriping: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-table zebra>
        <ui-table-row header>
          <ui-table-cell header>Name</ui-table-cell>
          <ui-table-cell header>Email</ui-table-cell>
          <ui-table-cell header>Role</ui-table-cell>
          <ui-table-cell header>Status</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>John Doe</ui-table-cell>
          <ui-table-cell>john@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Jane Smith</ui-table-cell>
          <ui-table-cell>jane@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Bob Wilson</ui-table-cell>
          <ui-table-cell>bob@example.com</ui-table-cell>
          <ui-table-cell>Viewer</ui-table-cell>
          <ui-table-cell>Inactive</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Alice Brown</ui-table-cell>
          <ui-table-cell>alice@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Charlie Lee</ui-table-cell>
          <ui-table-cell>charlie@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-table>
        <ui-table-row header>
          <ui-table-cell header>Name</ui-table-cell>
          <ui-table-cell header>Email</ui-table-cell>
          <ui-table-cell header>Role</ui-table-cell>
          <ui-table-cell header>State</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>John Doe</ui-table-cell>
          <ui-table-cell>john@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Default</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Jane Smith</ui-table-cell>
          <ui-table-cell>jane@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Hover (mouse over)</ui-table-cell>
        </ui-table-row>
        <ui-table-row selected>
          <ui-table-cell>Bob Wilson</ui-table-cell>
          <ui-table-cell>bob@example.com</ui-table-cell>
          <ui-table-cell>Viewer</ui-table-cell>
          <ui-table-cell>Selected</ui-table-cell>
        </ui-table-row>
        <ui-table-row disabled>
          <ui-table-cell>Alice Brown</ui-table-cell>
          <ui-table-cell>alice@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Disabled</ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
};

export const Bordered: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-table bordered>
        <ui-table-row header>
          <ui-table-cell header>Name</ui-table-cell>
          <ui-table-cell header>Email</ui-table-cell>
          <ui-table-cell header>Role</ui-table-cell>
          <ui-table-cell header>Status</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>John Doe</ui-table-cell>
          <ui-table-cell>john@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Jane Smith</ui-table-cell>
          <ui-table-cell>jane@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Bob Wilson</ui-table-cell>
          <ui-table-cell>bob@example.com</ui-table-cell>
          <ui-table-cell>Viewer</ui-table-cell>
          <ui-table-cell>Inactive</ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
};

export const FullFeatured: Story = {
  render: () => html`
    <div style="max-width: 720px;">
      <ui-table bordered zebra separator="moderate" size="m">
        <ui-table-row header>
          <ui-table-cell header>Name</ui-table-cell>
          <ui-table-cell header>Email</ui-table-cell>
          <ui-table-cell header>Role</ui-table-cell>
          <ui-table-cell header>Status</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>John Doe</ui-table-cell>
          <ui-table-cell>john@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Jane Smith</ui-table-cell>
          <ui-table-cell>jane@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Bob Wilson</ui-table-cell>
          <ui-table-cell>bob@example.com</ui-table-cell>
          <ui-table-cell>Viewer</ui-table-cell>
          <ui-table-cell>Inactive</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Alice Brown</ui-table-cell>
          <ui-table-cell>alice@example.com</ui-table-cell>
          <ui-table-cell>Editor</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell>Charlie Lee</ui-table-cell>
          <ui-table-cell>charlie@example.com</ui-table-cell>
          <ui-table-cell>Admin</ui-table-cell>
          <ui-table-cell>Active</ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
};
