import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-dropdown.js";
import "../components/ui-dropdown-item.js";
import "../components/ui-dropdown-heading.js";
import "../components/ui-dropdown-separator.js";
import "../components/ui-menu.js";

const meta: Meta = {
  title: "Components/Dropdown",
  component: "ui-dropdown",
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
    disabled: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
  },
  args: {
    size: "m",
    action: "primary",
    emphasis: "bold",
    shape: "basic",
    disabled: false,
    label: "Options",
  },
  render: (args) => html`
    <ui-dropdown
      size=${args.size}
      action=${args.action}
      emphasis=${args.emphasis}
      shape=${args.shape}
      ?disabled=${args.disabled}
      label=${args.label}
    >
      <ui-dropdown-item>Edit</ui-dropdown-item>
      <ui-dropdown-item>Duplicate</ui-dropdown-item>
      <ui-dropdown-item>Archive</ui-dropdown-item>
      <ui-dropdown-item>Delete</ui-dropdown-item>
    </ui-dropdown>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Small: Story = {
  render: () => html`
    <ui-dropdown size="s" label="Small Menu">
      <ui-dropdown-item>Profile</ui-dropdown-item>
      <ui-dropdown-item>Settings</ui-dropdown-item>
      <ui-dropdown-item>Log out</ui-dropdown-item>
    </ui-dropdown>
  `,
};

export const WithSections: Story = {
  render: () => html`
    <ui-dropdown label="Actions">
      <ui-dropdown-heading>Edit</ui-dropdown-heading>
      <ui-dropdown-item>Cut</ui-dropdown-item>
      <ui-dropdown-item>Copy</ui-dropdown-item>
      <ui-dropdown-item>Paste</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-heading>View</ui-dropdown-heading>
      <ui-dropdown-item>Zoom in</ui-dropdown-item>
      <ui-dropdown-item>Zoom out</ui-dropdown-item>
      <ui-dropdown-item>Reset</ui-dropdown-item>
    </ui-dropdown>
  `,
};

export const AllActions: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <ui-dropdown action="primary" label="Primary">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="secondary" label="Secondary">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="destructive" label="Destructive">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="info" label="Info">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="contrast" label="Contrast">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
    </div>
  `,
};

export const Rounded: Story = {
  render: () => html`
    <ui-dropdown shape="rounded" label="Rounded">
      <ui-dropdown-item>Option A</ui-dropdown-item>
      <ui-dropdown-item>Option B</ui-dropdown-item>
      <ui-dropdown-item>Option C</ui-dropdown-item>
    </ui-dropdown>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <ui-dropdown disabled label="Disabled">
      <ui-dropdown-item>Item 1</ui-dropdown-item>
      <ui-dropdown-item>Item 2</ui-dropdown-item>
    </ui-dropdown>
  `,
};

export const SingleSelect: Story = {
  render: () => html`
    <ui-dropdown label="Choose fruit" selectable>
      <ui-dropdown-item value="apple">Apple</ui-dropdown-item>
      <ui-dropdown-item value="banana" selected>Banana</ui-dropdown-item>
      <ui-dropdown-item value="cherry">Cherry</ui-dropdown-item>
      <ui-dropdown-item value="date">Date</ui-dropdown-item>
    </ui-dropdown>
  `,
};

export const MultiSelect: Story = {
  render: () => html`
    <ui-dropdown label="Select toppings" multiple selectable>
      <ui-dropdown-item value="cheese" selected>Cheese</ui-dropdown-item>
      <ui-dropdown-item value="pepperoni">Pepperoni</ui-dropdown-item>
      <ui-dropdown-item value="mushrooms" selected>Mushrooms</ui-dropdown-item>
      <ui-dropdown-item value="olives">Olives</ui-dropdown-item>
      <ui-dropdown-item value="onions">Onions</ui-dropdown-item>
    </ui-dropdown>
  `,
};

export const AllEmphases: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <ui-dropdown emphasis="bold" label="Bold">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown emphasis="subtle" label="Subtle">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown emphasis="minimal" label="Minimal">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
    </div>
  `,
};
export const LargeSize: Story = {
  render: () => html`
    <ui-dropdown size="l" label="Large Dropdown">
      <ui-dropdown-item>New File</ui-dropdown-item>
      <ui-dropdown-item>Open File</ui-dropdown-item>
      <ui-dropdown-item>Save</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-heading>Recent</ui-dropdown-heading>
      <ui-dropdown-item>project.ts</ui-dropdown-item>
      <ui-dropdown-item>readme.md</ui-dropdown-item>
    </ui-dropdown>
  `,
};
export const WithLeadingIcons: Story = {
  render: () => html`
    <ui-dropdown size="m" label="Actions">
      <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 4v12M4 10h12"/></svg></span>New File</ui-dropdown-item>
      <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h12M4 10h12M4 14h8"/></svg></span>Open File</ui-dropdown-item>
      <ui-dropdown-item leading="icon" disabled><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/></svg></span>Disabled</ui-dropdown-item>
    </ui-dropdown>
  `,
};
export const WithCheckboxes: Story = {
  render: () => html`
    <ui-dropdown size="m" label="Formatting" selectable multiple>
      <ui-dropdown-item leading="checkbox" value="bold" selected>Bold</ui-dropdown-item>
      <ui-dropdown-item leading="checkbox" value="italic">Italic</ui-dropdown-item>
      <ui-dropdown-item leading="checkbox" value="underline">Underline</ui-dropdown-item>
      <ui-dropdown-item leading="checkbox" value="strike" disabled>Strikethrough</ui-dropdown-item>
    </ui-dropdown>
  `,
};
export const WithRadios: Story = {
  render: () => html`
    <ui-dropdown size="m" label="Sort By" selectable>
      <ui-dropdown-heading>Sort By</ui-dropdown-heading>
      <ui-dropdown-item leading="radio" value="name" selected>Name</ui-dropdown-item>
      <ui-dropdown-item leading="radio" value="date">Date Modified</ui-dropdown-item>
      <ui-dropdown-item leading="radio" value="size">Size</ui-dropdown-item>
      <ui-dropdown-item leading="radio" value="type">Type</ui-dropdown-item>
    </ui-dropdown>
  `,
};
export const WithSecondaryLabels: Story = {
  render: () => html`
    <ui-dropdown size="m" label="File Menu">
      <ui-dropdown-item secondary="Ctrl+N">New File</ui-dropdown-item>
      <ui-dropdown-item secondary="Ctrl+O">Open File</ui-dropdown-item>
      <ui-dropdown-item secondary="Ctrl+S">Save</ui-dropdown-item>
      <ui-dropdown-item secondary="Ctrl+Shift+S">Save As</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-item secondary="Ctrl+Q">Quit</ui-dropdown-item>
    </ui-dropdown>
  `,
};
export const WithDescriptions: Story = {
  render: () => html`
    <ui-dropdown size="m" label="File" style="--ui-dropdown-menu-min-width: 300px;">
      <ui-dropdown-item description="Create a new empty document">New File</ui-dropdown-item>
      <ui-dropdown-item description="Open an existing file from disk">Open File</ui-dropdown-item>
      <ui-dropdown-item description="Save changes to current file" disabled>Save</ui-dropdown-item>
    </ui-dropdown>
  `,
};
export const WithSubmenu: Story = {
  render: () => html`
    <ui-dropdown size="m" label="Edit" open>
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
    </ui-dropdown>
  `,
};
export const KitchenSink: Story = {
  render: () => html`
    <ui-dropdown size="m" label="Advanced" selectable multiple style="--ui-dropdown-menu-min-width: 320px;">
      <ui-dropdown-heading>Formatting</ui-dropdown-heading>
      <ui-dropdown-item leading="checkbox" value="bold" selected description="Make text bold">Bold</ui-dropdown-item>
      <ui-dropdown-item leading="checkbox" value="italic" secondary="Ctrl+I">Italic</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-heading>Navigation</ui-dropdown-heading>
      <ui-dropdown-item leading="icon" submenu><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h12M4 10h12M4 14h8"/></svg></span>Go To
        <ui-menu slot="submenu">
          <ui-dropdown-item>Go to Line</ui-dropdown-item>
          <ui-dropdown-item>Go to Symbol</ui-dropdown-item>
          <ui-dropdown-item>Go to File</ui-dropdown-item>
        </ui-menu>
      </ui-dropdown-item>
      <ui-dropdown-item leading="icon" disabled><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/></svg></span>Disabled Item</ui-dropdown-item>
    </ui-dropdown>
  `,
};
