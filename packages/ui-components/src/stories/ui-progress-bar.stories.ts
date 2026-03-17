import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-progress-bar.js";

const meta: Meta = {
  title: "Components/Progress Bar",
  component: "ui-progress-bar",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
    label: {
      control: { type: "select" },
      options: ["none", "top-label", "inner-label"],
    },
    status: {
      control: { type: "select" },
      options: [
        "none",
        "information",
        "success",
        "warning",
        "error",
        "open",
        "complete",
        "suspended",
        "cancelled",
      ],
    },
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    labelText: {
      control: { type: "text" },
    },
  },
  args: {
    size: "m",
    label: "top-label",
    status: "information",
    value: 50,
    labelText: "Progress",
  },
  render: (args) => html`
    <ui-progress-bar
      size=${args.size}
      label=${args.label}
      status=${args.status}
      value=${args.value}
      label-text=${args.labelText}
    ></ui-progress-bar>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size S</div>
        <ui-progress-bar size="s" label="top-label" status="information" value="50" label-text="Small"></ui-progress-bar>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size M</div>
        <ui-progress-bar size="m" label="top-label" status="information" value="50" label-text="Medium"></ui-progress-bar>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size L</div>
        <ui-progress-bar size="l" label="top-label" status="information" value="50" label-text="Large"></ui-progress-bar>
      </div>
    </div>
  `,
};

export const LabelModes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">None</div>
        <ui-progress-bar label="none" status="information" value="50" label-text="Hidden"></ui-progress-bar>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Top Label</div>
        <ui-progress-bar label="top-label" status="information" value="50" label-text="Top label"></ui-progress-bar>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Inner Label</div>
        <ui-progress-bar label="inner-label" status="information" value="50" label-text="Inner label"></ui-progress-bar>
      </div>
    </div>
  `,
};

export const AllStatuses: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
      ${(
        [
          "information",
          "success",
          "warning",
          "error",
          "open",
          "complete",
          "suspended",
          "cancelled",
        ] as const
      ).map(
        (status) => html`
          <ui-progress-bar
            label="top-label"
            status=${status}
            value="65"
            label-text=${status}
          ></ui-progress-bar>
        `,
      )}
    </div>
  `,
};

export const ProgressAmounts: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
      ${([10, 25, 50, 75, 100] as const).map(
        (val) => html`
          <ui-progress-bar
            label="top-label"
            status="information"
            value=${val}
            label-text="${val}% complete"
          ></ui-progress-bar>
        `,
      )}
    </div>
  `,
};
