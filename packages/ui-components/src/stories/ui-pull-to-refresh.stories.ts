import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-pull-to-refresh.js";

const meta: Meta = {
  title: "Components/Pull To Refresh",
  component: "ui-pull-to-refresh",
  argTypes: {
    active: {
      control: { type: "boolean" },
    },
    variant: {
      control: { type: "select" },
      options: ["light", "dark"],
    },
    text: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    active: true,
    variant: "light",
    text: "Refreshing content",
  },
  render: (args) =>
    html`<ui-pull-to-refresh
      ?active=${args.active}
      variant=${args.variant}
      text=${args.text}
    ></ui-pull-to-refresh>`,
};

export const Dark: Story = {
  args: {
    active: true,
    variant: "dark",
    text: "Refreshing content",
  },
  render: (args) =>
    html`<div
      style="background: #1c2b36; padding: 24px; border-radius: 8px;"
    >
      <ui-pull-to-refresh
        ?active=${args.active}
        variant=${args.variant}
        text=${args.text}
      ></ui-pull-to-refresh>
    </div>`,
};

export const CustomText: Story = {
  args: {
    active: true,
    variant: "light",
    text: "Loading data...",
  },
  render: (args) =>
    html`<ui-pull-to-refresh
      ?active=${args.active}
      variant=${args.variant}
      text=${args.text}
    ></ui-pull-to-refresh>`,
};

export const Inactive: Story = {
  args: {
    active: false,
    variant: "light",
    text: "Refreshing content",
  },
  render: (args) =>
    html`<ui-pull-to-refresh
      variant=${args.variant}
      text=${args.text}
    ></ui-pull-to-refresh>`,
};
