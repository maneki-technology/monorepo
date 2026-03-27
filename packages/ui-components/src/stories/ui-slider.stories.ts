import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-slider.js";
import "../components/ui-label.js";

const meta: Meta = {
  title: "Components/Slider",
  component: "ui-slider",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
    min: {
      control: { type: "number" },
    },
    max: {
      control: { type: "number" },
    },
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    valueHigh: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    step: {
      control: { type: "number" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
  args: {
    size: "m",
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    disabled: false,
  },
  render: (args) => html`
    <ui-slider
      size=${args.size}
      min=${args.min}
      max=${args.max}
      value=${args.value}
      step=${args.step}
      ?labels=${args.labels}
      ?tooltip=${args.tooltip}
      ?disabled=${args.disabled}
    ></ui-slider>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; max-width: 400px;">
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size S</div>
        <ui-slider size="s" value="50" labels></ui-slider>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size M</div>
        <ui-slider size="m" value="50" labels></ui-slider>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size L</div>
        <ui-slider size="l" value="50" labels></ui-slider>
      </div>
    </div>
  `,
};

export const Range: Story = {
  render: () => html`
    <div style="max-width: 400px;">
      <ui-slider range value="25" value-high="75" labels tooltip></ui-slider>
    </div>
  `,
};

export const WithLabels: Story = {
  render: () => html`
    <div style="max-width: 400px;">
      <ui-slider value="40" labels></ui-slider>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Disabled single</div>
        <ui-slider value="60" disabled labels></ui-slider>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Disabled range</div>
        <ui-slider range value="20" value-high="80" disabled labels></ui-slider>
      </div>
    </div>
  `,
};

export const Steps: Story = {
  render: () => html`
    <div style="max-width: 400px;">
      <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Step = 10</div>
      <ui-slider value="50" step="10" labels tooltip></ui-slider>
    </div>
  `,
};


// ── With Label ────────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  render: () => html`
    <div style="width: 400px;">
      <ui-slider>
        <ui-label slot="label" size="m">Volume</ui-label>
      </ui-slider>
    </div>
  `,
};