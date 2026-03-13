import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-calendar-time.js";
import "../components/ui-calendar.js";
import "../components/ui-button.js";

const meta: Meta = {
  title: "Components/Calendar Time",
  component: "ui-calendar-time",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["s", "m", "l"] },
    value: { control: "text" },
  },
  args: {
    size: "m",
  },
};
export default meta;
type Story = StoryObj;

// ─── Default ────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => html`<ui-calendar-time size="m"></ui-calendar-time>`,
};

// ─── With Value ─────────────────────────────────────────────────────────────

export const WithValue: Story = {
  render: () => html`<ui-calendar-time size="m" value="14:30"></ui-calendar-time>`,
};

export const MorningTime: Story = {
  render: () => html`<ui-calendar-time size="m" value="09:15"></ui-calendar-time>`,
};

// ─── All Sizes ──────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: flex-start; font-family: Inter, sans-serif;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size S</span>
        <ui-calendar-time size="s" value="14:30"></ui-calendar-time>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size M</span>
        <ui-calendar-time size="m" value="14:30"></ui-calendar-time>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size L</span>
        <ui-calendar-time size="l" value="14:30"></ui-calendar-time>
      </div>
    </div>
  `,
};

// ─── Composed with Calendar ─────────────────────────────────────────────────

const containerStyle = "display: inline-flex; flex-direction: column; border-radius: 2px; box-shadow: 0px 8px 10px 0px rgba(0,0,0,0.14), 0px 3px 14px 0px rgba(0,0,0,0.12), 0px 5px 5px 0px rgba(0,0,0,0.2); overflow: hidden;";

export const WithCalendar: Story = {
  render: () => html`
    <div style="${containerStyle}">
      <ui-calendar size="m" value="2024-06-15" style="--ui-calendar-elevation: none; border-radius: 0;"></ui-calendar>
      <ui-calendar-time size="m" value="14:30" style="border-radius: 0;"></ui-calendar-time>
    </div>
  `,
};

export const WithCalendarAndActions: Story = {
  render: () => html`
    <div style="${containerStyle}">
      <ui-calendar size="m" value="2024-06-15" style="--ui-calendar-elevation: none; border-radius: 0;"></ui-calendar>
      <ui-calendar-time size="m" value="14:30" style="border-radius: 0;"></ui-calendar-time>
      <div style="display: flex; justify-content: flex-end; gap: 8px; padding: 8px 12px; border-top: 1px solid #DCE3E8;">
        <ui-button action="secondary" emphasis="minimal" size="m">Cancel</ui-button>
        <ui-button action="primary" emphasis="bold" size="m">OK</ui-button>
      </div>
    </div>
  `,
};
