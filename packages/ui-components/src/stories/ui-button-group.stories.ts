import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-button.js";
import "../components/ui-button-group.js";

const meta: Meta = {
  title: "Components/Button Group",
  component: "ui-button-group",
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
  },
  args: {
    action: "primary",
    emphasis: "bold",
    size: "m",
    shape: "basic",
  },
  render: (args) => html`
    <ui-button-group
      action=${args.action}
      emphasis=${args.emphasis}
      size=${args.size}
      shape=${args.shape}
    >
      <ui-button>One</ui-button>
      <ui-button>Two</ui-button>
      <ui-button>Three</ui-button>
      <ui-button>Four</ui-button>
    </ui-button-group>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-button-group size="s"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group size="m"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group size="l"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group size="xl"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
    </div>
  `,
};

export const Rounded: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-button-group shape="rounded" size="s"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group shape="rounded" size="m"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group shape="rounded" size="l"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group shape="rounded" size="xl"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
    </div>
  `,
};

export const AllActions: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-button-group action="primary"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group action="secondary"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
      <ui-button-group action="destructive"><ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button></ui-button-group>
    </div>
  `,
};
