import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-accordion-item.js";

const meta: Meta = {
  title: "Components/Accordion Item",
  component: "ui-accordion-item",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    emphasis: { control: { type: "select" }, options: ["bold", "subtle"] },
    status: { control: { type: "select" }, options: ["none", "error", "warning", "success"] },
    expanded: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "m",
    emphasis: "subtle",
    status: "none",
    expanded: false,
    disabled: false,
  },
  render: (args) => html`
    <ui-accordion-item
      size=${args.size}
      emphasis=${args.emphasis}
      status=${args.status}
      ?expanded=${args.expanded}
      ?disabled=${args.disabled}
    >
      <span slot="label">Accordion Label</span>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </ui-accordion-item>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-accordion-item size="s" expanded>
        <span slot="label">Small</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
      <ui-accordion-item size="m" expanded>
        <span slot="label">Medium</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
      <ui-accordion-item size="l" expanded>
        <span slot="label">Large</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
    </div>
  `,
};

export const BoldEmphasis: Story = {
  render: () => html`
    <ui-accordion-item emphasis="bold" expanded>
      <span slot="label">Bold Emphasis</span>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </ui-accordion-item>
  `,
};

export const WithLeadingIcon: Story = {
  render: () => html`
    <ui-accordion-item leading-icon expanded>
      <span slot="icon" class="material-symbols-outlined" style="font-size: 20px; font-variation-settings: 'wght' 500;">info</span>
      <span slot="label">With Leading Icon</span>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </ui-accordion-item>
  `,
};

export const WithStatus: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-accordion-item status="error" expanded>
        <span slot="label">Error Status</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
      <ui-accordion-item status="warning" expanded>
        <span slot="label">Warning Status</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
      <ui-accordion-item status="success" expanded>
        <span slot="label">Success Status</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <ui-accordion-item disabled>
      <span slot="label">Disabled Accordion</span>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </ui-accordion-item>
  `,
};

export const Expanded: Story = {
  render: () => html`
    <ui-accordion-item expanded>
      <span slot="label">Pre-expanded Accordion</span>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </ui-accordion-item>
  `,
};
