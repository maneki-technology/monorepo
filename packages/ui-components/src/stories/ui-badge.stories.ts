import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-badge.js";

const meta: Meta = {
  title: "Components/Badge",
  component: "ui-badge",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m", "l"],
    },
    emphasis: {
      control: { type: "select" },
      options: ["bold", "subtle", "minimal"],
    },
    shape: {
      control: { type: "select" },
      options: ["square", "rounded"],
    },
    color: {
      control: { type: "select" },
      options: [
        "none",
        "red",
        "yellow",
        "green",
        "blue",
        "lime",
        "teal",
        "turquoise",
        "aqua",
        "ultramarine",
        "pink",
        "purple",
        "orange",
      ],
    },
    status: {
      control: { type: "select" },
      options: ["none", "error", "warning", "success", "information"],
    },
  },
  args: {
    size: "m",
    emphasis: "bold",
    shape: "square",
    color: "none",
    status: "none",
  },
  render: (args) => html`
    <ui-badge
      size=${args.size}
      emphasis=${args.emphasis}
      shape=${args.shape}
      color=${args.color}
      status=${args.status}
    >
      Badge
    </ui-badge>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<ui-badge>Badge</ui-badge>`,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-badge size="xs">Badge</ui-badge>
      <ui-badge size="s">Badge</ui-badge>
      <ui-badge size="m">Badge</ui-badge>
      <ui-badge size="l">Badge</ui-badge>
    </div>
  `,
};

export const AllEmphases: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-badge emphasis="bold">Bold</ui-badge>
      <ui-badge emphasis="subtle">Subtle</ui-badge>
      <ui-badge emphasis="minimal">Minimal</ui-badge>
    </div>
  `,
};

export const AllShapes: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-badge shape="square">Square</ui-badge>
      <ui-badge shape="rounded">Rounded</ui-badge>
    </div>
  `,
};

export const AllColors: Story = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(7, auto); gap: 8px; align-items: center;"
    >
      <ui-badge color="none">None</ui-badge>
      <ui-badge color="red">Red</ui-badge>
      <ui-badge color="yellow">Yellow</ui-badge>
      <ui-badge color="green">Green</ui-badge>
      <ui-badge color="blue">Blue</ui-badge>
      <ui-badge color="lime">Lime</ui-badge>
      <ui-badge color="teal">Teal</ui-badge>
      <ui-badge color="turquoise">Turquoise</ui-badge>
      <ui-badge color="aqua">Aqua</ui-badge>
      <ui-badge color="ultramarine">Ultramarine</ui-badge>
      <ui-badge color="pink">Pink</ui-badge>
      <ui-badge color="purple">Purple</ui-badge>
      <ui-badge color="orange">Orange</ui-badge>
    </div>
  `,
};

export const AllStatuses: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-badge status="none">None</ui-badge>
      <ui-badge status="error">Error</ui-badge>
      <ui-badge status="warning">Warning</ui-badge>
      <ui-badge status="success">Success</ui-badge>
      <ui-badge status="information">Information</ui-badge>
    </div>
  `,
};

export const SubtleEmphasis: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-badge emphasis="subtle">Default</ui-badge>
      <ui-badge emphasis="subtle">New</ui-badge>
      <ui-badge emphasis="subtle">Draft</ui-badge>
      <ui-badge emphasis="subtle">Pending</ui-badge>
    </div>
  `,
};

export const MinimalEmphasis: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-badge emphasis="minimal">Default</ui-badge>
      <ui-badge emphasis="minimal">New</ui-badge>
      <ui-badge emphasis="minimal">Draft</ui-badge>
      <ui-badge emphasis="minimal">Pending</ui-badge>
    </div>
  `,
};
