import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-popover.js";

const placements = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
  "left-top",
  "left-center",
  "left-bottom",
  "right-top",
  "right-center",
  "right-bottom",
] as const;

const meta: Meta = {
  title: "Components/Popover",
  component: "ui-popover",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m"],
    },
    placement: {
      control: { type: "select" },
      options: [...placements],
    },
    dismissable: {
      control: { type: "boolean" },
    },
    open: {
      control: { type: "boolean" },
    },
    titleText: {
      control: { type: "text" },
    },
    description: {
      control: { type: "text" },
    },
  },
  args: {
    size: "m",
    placement: "top-center",
    dismissable: false,
    open: true,
    titleText: "Popover Title",
    description: "This is a popover description with helpful context.",
  },
  render: (args) => html`
    <div style="padding: 120px 200px; display: inline-block;">
      <ui-popover
        size=${args.size}
        placement=${args.placement}
        ?dismissable=${args.dismissable}
        ?open=${args.open}
        title-text=${args.titleText}
        description=${args.description}
      >
        <ui-button slot="trigger" size="s">Trigger</ui-button>
      </ui-popover>
    </div>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const SizeS: Story = {
  args: {
    size: "s",
    open: true,
  },
};

export const Dismissable: Story = {
  args: {
    dismissable: true,
    open: true,
  },
};

export const TopPlacements: Story = {
  render: () => html`
    <div style="display: flex; gap: 80px; padding: 140px 60px 40px;">
      ${(["top-left", "top-center", "top-right"] as const).map(
        (p) => html`
          <ui-popover
            placement=${p}
            open
            title-text=${p}
            description="Placement demo"
          >
            <ui-button slot="trigger" size="s">${p}</ui-button>
          </ui-popover>
        `,
      )}
    </div>
  `,
};

export const BottomPlacements: Story = {
  render: () => html`
    <div style="display: flex; gap: 80px; padding: 40px 60px 140px;">
      ${(["bottom-left", "bottom-center", "bottom-right"] as const).map(
        (p) => html`
          <ui-popover
            placement=${p}
            open
            title-text=${p}
            description="Placement demo"
          >
            <ui-button slot="trigger" size="s">${p}</ui-button>
          </ui-popover>
        `,
      )}
    </div>
  `,
};

export const LeftPlacements: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 60px; padding: 40px 40px 40px 220px;"
    >
      ${(["left-top", "left-center", "left-bottom"] as const).map(
        (p) => html`
          <ui-popover
            placement=${p}
            open
            title-text=${p}
            description="Placement demo"
          >
            <ui-button slot="trigger" size="s">${p}</ui-button>
          </ui-popover>
        `,
      )}
    </div>
  `,
};

export const RightPlacements: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 60px; padding: 40px 220px 40px 40px;"
    >
      ${(["right-top", "right-center", "right-bottom"] as const).map(
        (p) => html`
          <ui-popover
            placement=${p}
            open
            title-text=${p}
            description="Placement demo"
          >
            <ui-button slot="trigger" size="s">${p}</ui-button>
          </ui-popover>
        `,
      )}
    </div>
  `,
};

export const WithTrigger: Story = {
  args: {
    open: false,
  },
  render: (args) => html`
    <div style="padding: 120px 200px; display: inline-block;">
      <ui-popover
        size=${args.size}
        placement=${args.placement}
        ?dismissable=${args.dismissable}
        ?open=${args.open}
        title-text=${args.titleText}
        description=${args.description}
      >
        <ui-button slot="trigger" action="primary" emphasis="bold" size="m">
          Click to toggle
        </ui-button>
      </ui-popover>
    </div>
  `,
};
