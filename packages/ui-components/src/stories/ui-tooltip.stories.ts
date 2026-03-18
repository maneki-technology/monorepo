import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-tooltip.js";

const meta: Meta = {
  title: "Components/Tooltip",
  component: "ui-tooltip",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m", "l"],
    },
    placement: {
      control: { type: "select" },
      options: [
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
    },
    text: {
      control: { type: "text" },
    },
    dismissible: {
      control: { type: "boolean" },
    },
    open: {
      control: { type: "boolean" },
    },
    trigger: {
      control: { type: "select" },
      options: ["hover", "click"],
    },
  },
  args: {
    size: "m",
    placement: "top",
    text: "Tooltip",
    dismissible: false,
    open: true,
    trigger: "hover",
  },
  render: (args) => html`
    <div style="padding: 80px 200px; display: inline-block;">
      <ui-tooltip
        size=${args.size}
        placement=${args.placement}
        text=${args.text}
        ?dismissible=${args.dismissible}
        ?open=${args.open}
        trigger=${args.trigger}
      >
        <button>Hover me</button>
      </ui-tooltip>
    </div>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 80px; padding: 60px 40px; align-items: center;">
      ${(["xs", "s", "m", "l"] as const).map(
        (size) => html`
          <ui-tooltip size=${size} text="Size ${size}" open placement="top">
            <button>Size ${size}</button>
          </ui-tooltip>
        `,
      )}
    </div>
  `,
};

export const AllPlacements: Story = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; padding: 100px 80px;"
    >
      ${(
        [
          "top",
          "top-left",
          "top-right",
          "bottom",
          "bottom-left",
          "bottom-right",
          "left",
          "right",
        ] as const
      ).map(
        (placement) => html`
          <div style="display: flex; justify-content: center;">
            <ui-tooltip placement=${placement} text=${placement} open>
              <button>${placement}</button>
            </ui-tooltip>
          </div>
        `,
      )}
    </div>
  `,
};

export const Dismissible: Story = {
  args: {
    dismissible: true,
    open: true,
    text: "Dismissible tooltip",
  },
};
