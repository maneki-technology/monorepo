import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-switch.js";

const meta: Meta = {
  title: "Components/Switch",
  component: "ui-switch",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
    checked: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    label: {
      control: { type: "text" },
    },
    labelPosition: {
      control: { type: "select" },
      options: ["none", "left", "right"],
    },
  },
  args: {
    size: "m",
    checked: false,
    disabled: false,
    label: "",
    labelPosition: "none",
  },
  render: (args) => html`
    <ui-switch
      size=${args.size}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      label=${args.label}
      label-position=${args.labelPosition}
    ></ui-switch>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="font-size: 12px; color: #666; width: 50px;">Size S</div>
        <ui-switch size="s"></ui-switch>
        <ui-switch size="s" checked></ui-switch>
      </div>
      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="font-size: 12px; color: #666; width: 50px;">Size M</div>
        <ui-switch size="m"></ui-switch>
        <ui-switch size="m" checked></ui-switch>
      </div>
      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="font-size: 12px; color: #666; width: 50px;">Size L</div>
        <ui-switch size="l"></ui-switch>
        <ui-switch size="l" checked></ui-switch>
      </div>
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Label left</div>
        <ui-switch label="Dark mode" label-position="left"></ui-switch>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Label right</div>
        <ui-switch label="Notifications" label-position="right"></ui-switch>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Label left, checked</div>
        <ui-switch label="Auto-save" label-position="left" checked></ui-switch>
      </div>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="font-size: 12px; color: #666; width: 120px;">Disabled unchecked</div>
        <ui-switch disabled></ui-switch>
      </div>
      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="font-size: 12px; color: #666; width: 120px;">Disabled checked</div>
        <ui-switch disabled checked></ui-switch>
      </div>
    </div>
  `,
};
