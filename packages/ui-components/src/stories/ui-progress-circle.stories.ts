import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-progress-circle.js";

const meta: Meta = {
  title: "Components/Progress Circle",
  component: "ui-progress-circle",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m"],
    },
    labelPosition: {
      control: { type: "select" },
      options: ["none", "bottom", "right"],
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
    labelPosition: "bottom",
    status: "information",
    value: 25,
    labelText: "Progress",
  },
  render: (args) => html`
    <ui-progress-circle
      size=${args.size}
      label-position=${args.labelPosition}
      status=${args.status}
      value=${args.value}
      label-text=${args.labelText}
    ></ui-progress-circle>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: flex-end;">
      <div style="text-align: center;">
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size S</div>
        <ui-progress-circle size="s" label-position="bottom" status="information" value="50" label-text="Small"></ui-progress-circle>
      </div>
      <div style="text-align: center;">
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Size M</div>
        <ui-progress-circle size="m" label-position="bottom" status="information" value="50" label-text="Medium"></ui-progress-circle>
      </div>
    </div>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <div style="display: flex; gap: 48px; align-items: flex-start;">
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">None</div>
        <ui-progress-circle label-position="none" status="information" value="50" label-text="Hidden"></ui-progress-circle>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Bottom</div>
        <ui-progress-circle label-position="bottom" status="information" value="50" label-text="Bottom"></ui-progress-circle>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Right</div>
        <ui-progress-circle label-position="right" status="information" value="50" label-text="Right"></ui-progress-circle>
      </div>
    </div>
  `,
};

export const AllStatuses: Story = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 24px;">
      ${(
        [
          "none",
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
          <ui-progress-circle
            label-position="bottom"
            status=${status}
            value="65"
            label-text=${status}
          ></ui-progress-circle>
        `,
      )}
    </div>
  `,
};

export const ProgressAmounts: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px;">
      ${([25, 50, 75, 100] as const).map(
        (val) => html`
          <ui-progress-circle
            label-position="bottom"
            status="information"
            value=${val}
            label-text="${val}%"
          ></ui-progress-circle>
        `,
      )}
    </div>
  `,
};
