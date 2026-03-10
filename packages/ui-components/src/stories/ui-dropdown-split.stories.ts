import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { ICON_DOWNLOAD, ICON_UPLOAD, ICON_MORE_VERT } from "@maneki/foundation";
import "../components/ui-dropdown-split.js";
import "../components/ui-dropdown-item.js";
import "../components/ui-dropdown-heading.js";
import "../components/ui-dropdown-separator.js";
import "../components/ui-menu.js";

const meta: Meta = {
  title: "Components/DropdownSplit",
  component: "ui-dropdown-split",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l", "xl"],
    },
    action: {
      control: { type: "select" },
      options: ["primary", "secondary", "destructive", "info", "contrast"],
    },
    emphasis: {
      control: { type: "select" },
      options: ["bold", "subtle", "minimal"],
    },
    shape: {
      control: { type: "select" },
      options: ["basic", "rounded"],
    },
    icon: {
      control: { type: "select" },
      options: ["text-only", "leading-icon", "trailing-icon", "icon-only"],
    },
    disabled: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
  },
  args: {
    size: "m",
    action: "primary",
    emphasis: "bold",
    shape: "basic",
    icon: "text-only",
    disabled: false,
    label: "Save",
  },
  render: (args) => html`
    <ui-dropdown-split
      size=${args.size}
      action=${args.action}
      emphasis=${args.emphasis}
      shape=${args.shape}
      icon=${args.icon}
      ?disabled=${args.disabled}
      label=${args.label}
    >
      <ui-dropdown-item value="save">Save</ui-dropdown-item>
      <ui-dropdown-item value="save-as">Save as…</ui-dropdown-item>
      <ui-dropdown-item value="save-all">Save all</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: flex-start;">
      <ui-dropdown-split size="s" label="Small">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split size="m" label="Medium">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split size="l" label="Large">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split size="xl" label="Extra Large">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
      </ui-dropdown-split>
    </div>
  `,
};

export const AllActions: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <ui-dropdown-split action="primary" label="Primary">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split action="secondary" label="Secondary">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split action="destructive" label="Destructive">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split action="info" label="Info">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split action="contrast" label="Contrast">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
    </div>
  `,
};

export const AllEmphases: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <ui-dropdown-split emphasis="bold" label="Bold">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split emphasis="subtle" label="Subtle">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split emphasis="minimal" label="Minimal">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
    </div>
  `,
};

export const Rounded: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <ui-dropdown-split shape="rounded" label="Rounded">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
        <ui-dropdown-item>Option C</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split shape="rounded" action="secondary" label="Secondary">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split shape="rounded" emphasis="subtle" label="Subtle">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
      </ui-dropdown-split>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <ui-dropdown-split icon="leading-icon" label="Download">
        <span slot="icon-start" class="material-symbols-outlined" style="font-size: 20px; font-variation-settings: 'wght' 500;">${ICON_DOWNLOAD}</span>
        <ui-dropdown-item>Download as PDF</ui-dropdown-item>
        <ui-dropdown-item>Download as CSV</ui-dropdown-item>
        <ui-dropdown-item>Download as XLSX</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split icon="trailing-icon" label="Export">
        <span slot="icon-end" class="material-symbols-outlined" style="font-size: 20px; font-variation-settings: 'wght' 500;">${ICON_UPLOAD}</span>
        <ui-dropdown-item>Export JSON</ui-dropdown-item>
        <ui-dropdown-item>Export XML</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split icon="icon-only">
        <span slot="icon-start" class="material-symbols-outlined" style="font-size: 20px; font-variation-settings: 'wght' 500;">${ICON_MORE_VERT}</span>
        <ui-dropdown-item>Edit</ui-dropdown-item>
        <ui-dropdown-item>Delete</ui-dropdown-item>
      </ui-dropdown-split>
    </div>
  `,
};

export const WithSections: Story = {
  render: () => html`
    <ui-dropdown-split label="Actions">
      <ui-dropdown-heading>File</ui-dropdown-heading>
      <ui-dropdown-item value="save">Save</ui-dropdown-item>
      <ui-dropdown-item value="save-as">Save as…</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-heading>Export</ui-dropdown-heading>
      <ui-dropdown-item value="pdf">Export as PDF</ui-dropdown-item>
      <ui-dropdown-item value="csv">Export as CSV</ui-dropdown-item>
      <ui-dropdown-item value="xlsx">Export as XLSX</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <ui-dropdown-split disabled label="Disabled Bold">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split disabled emphasis="subtle" label="Disabled Subtle">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split disabled action="destructive" label="Disabled Destructive">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown-split>
    </div>
  `,
};

export const Selectable: Story = {
  render: () => html`
    <ui-dropdown-split label="Choose action" selectable>
      <ui-dropdown-item value="edit">Edit</ui-dropdown-item>
      <ui-dropdown-item value="duplicate" selected>Duplicate</ui-dropdown-item>
      <ui-dropdown-item value="archive">Archive</ui-dropdown-item>
      <ui-dropdown-item value="delete">Delete</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};

export const WithLeadingIcons: Story = {
  render: () => html`
    <ui-dropdown-split label="Actions">
      <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 4v12M4 10h12"/></svg></span>New File</ui-dropdown-item>
      <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h12M4 10h12M4 14h8"/></svg></span>Open File</ui-dropdown-item>
      <ui-dropdown-item leading="icon" disabled><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/></svg></span>Disabled</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};

export const WithCheckboxes: Story = {
  render: () => html`
    <ui-dropdown-split label="Formatting" selectable multiple>
      <ui-dropdown-item leading="checkbox" value="bold" selected>Bold</ui-dropdown-item>
      <ui-dropdown-item leading="checkbox" value="italic">Italic</ui-dropdown-item>
      <ui-dropdown-item leading="checkbox" value="underline">Underline</ui-dropdown-item>
      <ui-dropdown-item leading="checkbox" value="strike" disabled>Strikethrough</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};

export const WithRadios: Story = {
  render: () => html`
    <ui-dropdown-split label="Sort By" selectable>
      <ui-dropdown-heading>Sort By</ui-dropdown-heading>
      <ui-dropdown-item leading="radio" value="name" selected>Name</ui-dropdown-item>
      <ui-dropdown-item leading="radio" value="date">Date Modified</ui-dropdown-item>
      <ui-dropdown-item leading="radio" value="size">Size</ui-dropdown-item>
      <ui-dropdown-item leading="radio" value="type">Type</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};

export const WithSecondaryLabels: Story = {
  render: () => html`
    <ui-dropdown-split label="File Menu">
      <ui-dropdown-item secondary="Ctrl+N">New File</ui-dropdown-item>
      <ui-dropdown-item secondary="Ctrl+O">Open File</ui-dropdown-item>
      <ui-dropdown-item secondary="Ctrl+S">Save</ui-dropdown-item>
      <ui-dropdown-item secondary="Ctrl+Shift+S">Save As</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-item secondary="Ctrl+Q">Quit</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <ui-dropdown-split label="File">
      <ui-dropdown-item description="Create a new empty document">New File</ui-dropdown-item>
      <ui-dropdown-item description="Open an existing file from disk">Open File</ui-dropdown-item>
      <ui-dropdown-item description="Save changes to current file" disabled>Save</ui-dropdown-item>
    </ui-dropdown-split>
  `,
};

export const WithSubmenu: Story = {
  render: () => html`
    <ui-dropdown-split label="Edit" open>
      <ui-dropdown-item>Cut</ui-dropdown-item>
      <ui-dropdown-item>Copy</ui-dropdown-item>
      <ui-dropdown-item>Paste</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-item submenu>Find
        <ui-menu slot="submenu" open>
          <ui-dropdown-item>Find in File</ui-dropdown-item>
          <ui-dropdown-item secondary="Ctrl+F">Find in Project</ui-dropdown-item>
          <ui-dropdown-item secondary="Ctrl+H">Find and Replace</ui-dropdown-item>
        </ui-menu>
      </ui-dropdown-item>
      <ui-dropdown-item submenu>Replace
        <ui-menu slot="submenu">
          <ui-dropdown-item>Replace in File</ui-dropdown-item>
          <ui-dropdown-item secondary="Ctrl+Shift+H">Replace in Project</ui-dropdown-item>
        </ui-menu>
      </ui-dropdown-item>
    </ui-dropdown-split>
  `,
};
