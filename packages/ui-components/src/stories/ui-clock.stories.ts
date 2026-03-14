import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-clock.js";

const meta: Meta = {
  title: "Components/Clock",
  component: "ui-clock",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["s", "m", "l"] },
    mode: { control: "select", options: ["analog", "24-hour"] },
    value: { control: "text" },
  },
  args: {
    size: "m",
    mode: "analog",
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: "03:00" },
};

export const AnalogSizeS: Story = {
  args: { size: "s", value: "09:00" },
};

export const AnalogSizeM: Story = {
  args: { size: "m", value: "09:00" },
};

export const AnalogSizeL: Story = {
  args: { size: "l", value: "09:00" },
};

export const Digital24Hour: Story = {
  args: { mode: "24-hour", value: "14:30" },
};

export const Digital24HourSizeS: Story = {
  args: { mode: "24-hour", size: "s", value: "14:30" },
};

export const Digital24HourSizeL: Story = {
  args: { mode: "24-hour", size: "l", value: "14:30" },
};

export const AllAnalogSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 8px;">Size S</div>
        <ui-clock size="s" value="03:00"></ui-clock>
      </div>
      <div>
        <div style="margin-bottom: 8px;">Size M</div>
        <ui-clock size="m" value="03:00"></ui-clock>
      </div>
      <div>
        <div style="margin-bottom: 8px;">Size L</div>
        <ui-clock size="l" value="03:00"></ui-clock>
      </div>
    </div>
  `,
};

export const AllDigitalSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 8px;">Size S</div>
        <ui-clock size="s" mode="24-hour" value="14:30"></ui-clock>
      </div>
      <div>
        <div style="margin-bottom: 8px;">Size M</div>
        <ui-clock size="m" mode="24-hour" value="14:30"></ui-clock>
      </div>
      <div>
        <div style="margin-bottom: 8px;">Size L</div>
        <ui-clock size="l" mode="24-hour" value="14:30"></ui-clock>
      </div>
    </div>
  `,
};
