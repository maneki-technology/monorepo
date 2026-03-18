import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-separator.js";

const meta: Meta = {
  title: "Components/Separator",
  component: "ui-separator",
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    emphasis: {
      control: { type: "select" },
      options: ["minimal", "subtle", "moderate", "bold", "contrast"],
    },
    length: {
      control: { type: "select" },
      options: ["full", "inset-04", "inset-08", "inset-16", "inset-24"],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    orientation: "horizontal",
    emphasis: "minimal",
    length: "full",
  },
  render: (args) =>
    html`<ui-separator
      orientation=${args.orientation}
      emphasis=${args.emphasis}
      length=${args.length}
    ></ui-separator>`,
};

export const AllEmphases: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${(["minimal", "subtle", "moderate", "bold", "contrast"] as const).map(
        (e) => html`
          <div>
            <div style="margin-bottom:4px; font-size:12px; color:#666;">${e}</div>
            <ui-separator emphasis=${e}></ui-separator>
          </div>
        `,
      )}
    </div>
  `,
};

export const AllLengths: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${(["full", "inset-04", "inset-08", "inset-16", "inset-24"] as const).map(
        (l) => html`
          <div>
            <div style="margin-bottom:4px; font-size:12px; color:#666;">${l}</div>
            <ui-separator emphasis="bold" length=${l}></ui-separator>
          </div>
        `,
      )}
    </div>
  `,
};

export const Vertical: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:row; gap:16px; height:100px;">
      ${(["minimal", "subtle", "moderate", "bold", "contrast"] as const).map(
        (e) => html`
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="font-size:12px; color:#666;">${e}</span>
            <ui-separator orientation="vertical" emphasis=${e}></ui-separator>
          </div>
        `,
      )}
    </div>
  `,
};

export const VerticalLengths: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:row; gap:16px; height:100px;">
      ${(["full", "inset-04", "inset-08", "inset-16", "inset-24"] as const).map(
        (l) => html`
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="font-size:12px; color:#666;">${l}</span>
            <ui-separator
              orientation="vertical"
              emphasis="bold"
              length=${l}
            ></ui-separator>
          </div>
        `,
      )}
    </div>
  `,
};
