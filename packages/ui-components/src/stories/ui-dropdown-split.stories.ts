import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-dropdown-split.js";
import "../components/ui-dropdown-item.js";
import "../components/ui-dropdown-heading.js";
import "../components/ui-dropdown-separator.js";

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
        <svg slot="icon-start" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3v10M6 9l4 4 4-4M4 15h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <ui-dropdown-item>Download as PDF</ui-dropdown-item>
        <ui-dropdown-item>Download as CSV</ui-dropdown-item>
        <ui-dropdown-item>Download as XLSX</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split icon="trailing-icon" label="Export">
        <svg slot="icon-end" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3v10M6 9l4 4 4-4M4 15h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <ui-dropdown-item>Export JSON</ui-dropdown-item>
        <ui-dropdown-item>Export XML</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split icon="icon-only">
        <svg slot="icon-start" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
          <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
        </svg>
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
