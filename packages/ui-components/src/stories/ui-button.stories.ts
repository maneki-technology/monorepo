import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-button.js";

const meta: Meta = {
  title: "Components/Button",
  component: "ui-button",
  argTypes: {
    action: {
      control: { type: "select" },
      options: ["primary", "secondary", "destructive", "info", "contrast"],
    },
    emphasis: {
      control: { type: "select" },
      options: ["bold", "subtle", "minimal"],
    },
    size: {
      control: { type: "select" },
      options: ["s", "m", "l", "xl"],
    },
    shape: {
      control: { type: "select" },
      options: ["basic", "rounded"],
    },
    icon: {
      control: { type: "select" },
      options: ["text-only", "leading-icon", "trailing-icon", "icon-only"],
    },
    status: {
      control: { type: "select" },
      options: ["none", "error", "loading", "success"],
    },
    disabled: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
  },
  args: {
    action: "primary",
    emphasis: "bold",
    size: "m",
    shape: "basic",
    icon: "text-only",
    status: "none",
    disabled: false,
    label: "Button",
  },
  render: (args) => html`
    <ui-button
      action=${args.action}
      emphasis=${args.emphasis}
      size=${args.size}
      shape=${args.shape}
      icon=${args.icon}
      status=${args.status}
      ?disabled=${args.disabled}
    >${args.label}</ui-button>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllActions: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <ui-button action="primary">Primary</ui-button>
      <ui-button action="secondary">Secondary</ui-button>
      <ui-button action="destructive">Destructive</ui-button>
      <ui-button action="info">Info</ui-button>
      <ui-button action="contrast">Contrast</ui-button>
    </div>
  `,
};

export const AllEmphases: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <ui-button emphasis="bold">Bold</ui-button>
      <ui-button emphasis="subtle">Subtle</ui-button>
      <ui-button emphasis="minimal">Minimal</ui-button>
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <ui-button size="s">Small</ui-button>
      <ui-button size="m">Medium</ui-button>
      <ui-button size="l">Large</ui-button>
      <ui-button size="xl">Extra Large</ui-button>
    </div>
  `,
};

export const Rounded: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <ui-button shape="rounded" size="s">Small</ui-button>
      <ui-button shape="rounded" size="m">Medium</ui-button>
      <ui-button shape="rounded" size="l">Large</ui-button>
      <ui-button shape="rounded" size="xl">Extra Large</ui-button>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <ui-button icon="leading-icon">
        <span slot="icon-start" class="material-symbols-outlined" style="font-size: 20px; font-variation-settings: 'wght' 500;">add_circle</span>
        Leading
      </ui-button>
      <ui-button icon="trailing-icon">
        Trailing
        <span slot="icon-end" class="material-symbols-outlined" style="font-size: 20px; font-variation-settings: 'wght' 500;">add_circle</span>
      </ui-button>
      <ui-button icon="icon-only">
        <span slot="icon-start" class="material-symbols-outlined" style="font-size: 20px; font-variation-settings: 'wght' 500;">add_circle</span>
      </ui-button>
    </div>
  `,
};

export const StatusIndicators: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <ui-button status="none">Normal</ui-button>
      <ui-button status="loading">Loading</ui-button>
      <ui-button status="success">Success</ui-button>
      <ui-button status="error">Error</ui-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <ui-button disabled>Primary</ui-button>
      <ui-button action="secondary" disabled>Secondary</ui-button>
      <ui-button action="destructive" disabled>Destructive</ui-button>
    </div>
  `,
};

export const ActionEmphasisMatrix: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, auto); gap: 8px; align-items: center;">
      ${["primary", "secondary", "destructive", "info", "contrast"].flatMap(action =>
        ["bold", "subtle", "minimal"].map(emphasis =>
          html`<ui-button action=${action} emphasis=${emphasis}>${action} ${emphasis}</ui-button>`
        )
      )}
    </div>
  `,
};
