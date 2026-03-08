import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-dropdown.js";
import "../components/ui-dropdown-item.js";
import "../components/ui-dropdown-heading.js";
import "../components/ui-dropdown-separator.js";

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
    <ui-dropdown label="Choose fruit">
      <ui-dropdown-item value="apple">Apple</ui-dropdown-item>
      <ui-dropdown-item value="banana" selected>Banana</ui-dropdown-item>
      <ui-dropdown-item value="cherry">Cherry</ui-dropdown-item>
      <ui-dropdown-item value="date">Date</ui-dropdown-item>
    </ui-dropdown>
  `,
};

export const MultiSelect: Story = {
  render: () => html`
    <ui-dropdown label="Select toppings" multiple>
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
