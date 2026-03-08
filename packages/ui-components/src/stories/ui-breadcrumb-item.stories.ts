import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-breadcrumb-item.js";

const meta: Meta = {
  title: "Components/Breadcrumb Item",
  component: "ui-breadcrumb-item",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    href: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "m",
    href: "/home",
    disabled: false,
  },
  render: (args) => html`
    <ui-breadcrumb-item
      size=${args.size}
      href=${args.href || nothing}
      ?disabled=${args.disabled}
    >
      Home
    </ui-breadcrumb-item>
  `,
};
export default meta;
type Story = StoryObj;

import { nothing } from "lit";

export const Default: Story = {
  render: () => html`
    <ui-breadcrumb-item href="/home">Home</ui-breadcrumb-item>
  `,
};

export const Current: Story = {
  render: () => html`
    <ui-breadcrumb-item>Current Page</ui-breadcrumb-item>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-breadcrumb-item size="s" href="/home">Small</ui-breadcrumb-item>
      <ui-breadcrumb-item size="m" href="/home">Medium</ui-breadcrumb-item>
      <ui-breadcrumb-item size="l" href="/home">Large</ui-breadcrumb-item>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <ui-breadcrumb-item href="/home" disabled>Disabled Link</ui-breadcrumb-item>
  `,
};

export const AllStates: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-breadcrumb-item href="/home">Enabled</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/visited-page">Visited (browser-dependent)</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/home" disabled>Disabled</ui-breadcrumb-item>
      <ui-breadcrumb-item>Current Page</ui-breadcrumb-item>
    </div>
  `,
};
