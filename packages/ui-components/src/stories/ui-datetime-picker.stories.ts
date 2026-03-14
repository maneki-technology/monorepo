import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-datetime-picker.js";
import "../components/ui-datetime-picker-input.js";
import "../components/ui-calendar.js";
import "../components/ui-calendar-time.js";
import "../components/ui-button.js";

const meta: Meta = {
  title: "Components/Date Picker",
  component: "ui-datetime-picker",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["s", "m", "l"] },
    type: { control: "select", options: ["single-date", "range-date", "time"] },
    value: { control: "text" },
    label: { control: "text" },
    supportive: { control: "text" },
    status: { control: "select", options: ["none", "error", "warning", "success"] },
    min: { control: "text" },
    max: { control: "text" },
    disabled: { control: "boolean" },
    open: { control: "boolean" },
  },
  args: {
    size: "m",
    type: "single-date",
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { label: "Select Date" },
};

export const WithValue: Story = {
  args: { label: "Select Date", value: "2024-06-15" },
};

export const Open: Story = {
  args: { label: "Select Date", open: true, value: "2024-06-15" },
};

export const RangeDate: Story = {
  args: { label: "Date Range", type: "range-date", open: true, value: "2024-06-10/2024-06-20" },
};

export const WithMinMax: Story = {
  args: { label: "Select Date", open: true, min: "2024-06-05", max: "2024-06-25", value: "2024-06-15" },
};

export const WithActions: Story = {
  render: () => html`
    <ui-datetime-picker
      label="Select Date"
      open
      show-actions
      value="2024-06-15"
    ></ui-datetime-picker>
  `,
};

export const Disabled: Story = {
  args: { label: "Select Date", disabled: true, value: "2024-06-15" },
};

export const StatusError: Story = {
  args: { label: "Select Date", status: "error", supportive: "This field is required" },
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 4px;">Size S</div>
        <ui-datetime-picker size="s" label="Date" value="2024-06-15" open></ui-datetime-picker>
      </div>
      <div style="margin-top: 280px;">
        <div style="margin-bottom: 4px;">Size M</div>
        <ui-datetime-picker size="m" label="Date" value="2024-06-15" open></ui-datetime-picker>
      </div>
      <div style="margin-top: 320px;">
        <div style="margin-bottom: 4px;">Size L</div>
        <ui-datetime-picker size="l" label="Date" value="2024-06-15" open></ui-datetime-picker>
      </div>
    </div>
  `,
};

// ─── Time type ────────────────────────────────────────────────────────────

export const TimePicker: Story = {
  args: { label: "Select Time", type: "time", open: true, value: "14:30" },
};

export const TimePickerClosed: Story = {
  args: { label: "Select Time", type: "time", value: "09:15" },
};

export const AllTypes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 4px;">Single Date</div>
        <ui-datetime-picker type="single-date" label="Date" value="2024-06-15" open></ui-datetime-picker>
      </div>
      <div style="margin-top: 320px;">
        <div style="margin-bottom: 4px;">Range Date</div>
        <ui-datetime-picker type="range-date" label="Date Range" open></ui-datetime-picker>
      </div>
      <div style="margin-top: 320px;">
        <div style="margin-bottom: 4px;">Time</div>
        <ui-datetime-picker type="time" label="Time" value="14:30" open></ui-datetime-picker>
      </div>
    </div>
  `,
};

export const MatchPanel: Story = {
  render: () => html`
    <ui-datetime-picker
      label="Select Date"
      value="2024-06-15"
      open
      match-panel
    ></ui-datetime-picker>
  `,
};

export const MatchPanelTime: Story = {
  render: () => html`
    <ui-datetime-picker
      label="Select Time"
      type="time"
      value="14:30"
      open
      match-panel
    ></ui-datetime-picker>
  `,
};

export const Datetime: Story = {
  render: () => html`
    <ui-datetime-picker
      label="Select Date & Time"
      type="datetime"
      value="2024-06-15 14:30"
      open
    ></ui-datetime-picker>
  `,
};

export const DatetimeWithActions: Story = {
  render: () => html`
    <ui-datetime-picker
      label="Select Date & Time"
      type="datetime"
      value="2024-06-15 14:30"
      open
      show-actions
    ></ui-datetime-picker>
  `,
};

export const DateWithInlineTime: Story = {
  render: () => html`
    <ui-datetime-picker
      label="Select Date & Time"
      type="datetime"
      time-mode="inline"
      value="2024-06-15 14:30"
      open
    ></ui-datetime-picker>
  `,
};

export const DateWithInlineTimeAndActions: Story = {
  render: () => html`
    <ui-datetime-picker
      label="Select Date & Time"
      type="datetime"
      time-mode="inline"
      value="2024-06-15 14:30"
      open
      show-actions
    ></ui-datetime-picker>
  `,
};
