import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-datetime-picker.js";
import "../components/ui-datetime-picker-input.js";
import "../components/ui-calendar.js";
import "../components/ui-calendar-time.js";
import "../components/ui-button.js";
import "../components/ui-label.js";

const meta: Meta = {
  title: "Components/Date Picker",
  component: "ui-datetime-picker",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["s", "m", "l"] },
    type: { control: "select", options: ["single-date", "range-date", "time"] },
    value: { control: "text" },
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
  render: () => html`
    <ui-datetime-picker><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const WithValue: Story = {
  render: () => html`
    <ui-datetime-picker value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const Open: Story = {
  render: () => html`
    <ui-datetime-picker open value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const RangeDate: Story = {
  render: () => html`
    <ui-datetime-picker type="range-date" open value="2024-06-10/2024-06-20"><ui-label slot="label">Date Range</ui-label></ui-datetime-picker>
  `,
};

export const WithMinMax: Story = {
  render: () => html`
    <ui-datetime-picker open min="2024-06-05" max="2024-06-25" value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const WithActions: Story = {
  render: () => html`
    <ui-datetime-picker
      open
      show-actions
      value="2024-06-15"
    ><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <ui-datetime-picker disabled value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const StatusError: Story = {
  render: () => html`
    <ui-datetime-picker status="error" supportive="This field is required"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 4px;">Size S</div>
        <ui-datetime-picker size="s" value="2024-06-15" open><ui-label slot="label" size="s">Date</ui-label></ui-datetime-picker>
      </div>
      <div style="margin-top: 280px;">
        <div style="margin-bottom: 4px;">Size M</div>
        <ui-datetime-picker size="m" value="2024-06-15" open><ui-label slot="label" size="m">Date</ui-label></ui-datetime-picker>
      </div>
      <div style="margin-top: 320px;">
        <div style="margin-bottom: 4px;">Size L</div>
        <ui-datetime-picker size="l" value="2024-06-15" open><ui-label slot="label" size="l">Date</ui-label></ui-datetime-picker>
      </div>
    </div>
  `,
};

// ─── Time type ────────────────────────────────────────────────────────────

export const TimePicker: Story = {
  render: () => html`
    <ui-datetime-picker type="time" open value="14:30"><ui-label slot="label">Select Time</ui-label></ui-datetime-picker>
  `,
};

export const TimePickerClosed: Story = {
  render: () => html`
    <ui-datetime-picker type="time" value="09:15"><ui-label slot="label">Select Time</ui-label></ui-datetime-picker>
  `,
};

export const AllTypes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 4px;">Single Date</div>
        <ui-datetime-picker type="single-date" value="2024-06-15" open><ui-label slot="label">Date</ui-label></ui-datetime-picker>
      </div>
      <div style="margin-top: 320px;">
        <div style="margin-bottom: 4px;">Range Date</div>
        <ui-datetime-picker type="range-date" open><ui-label slot="label">Date Range</ui-label></ui-datetime-picker>
      </div>
      <div style="margin-top: 320px;">
        <div style="margin-bottom: 4px;">Time</div>
        <ui-datetime-picker type="time" value="14:30" open><ui-label slot="label">Time</ui-label></ui-datetime-picker>
      </div>
    </div>
  `,
};

export const MatchPanel: Story = {
  render: () => html`
    <ui-datetime-picker
      value="2024-06-15"
      open
      match-panel
    ><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
  `,
};

export const MatchPanelTime: Story = {
  render: () => html`
    <ui-datetime-picker
      type="time"
      value="14:30"
      open
      match-panel
    ><ui-label slot="label">Select Time</ui-label></ui-datetime-picker>
  `,
};

export const Datetime: Story = {
  render: () => html`
    <ui-datetime-picker
      type="datetime"
      value="2024-06-15 14:30"
      open
    ><ui-label slot="label">Select Date &amp; Time</ui-label></ui-datetime-picker>
  `,
};

export const DatetimeWithActions: Story = {
  render: () => html`
    <ui-datetime-picker
      type="datetime"
      value="2024-06-15 14:30"
      open
      show-actions
    ><ui-label slot="label">Select Date &amp; Time</ui-label></ui-datetime-picker>
  `,
};

export const DateWithInlineTime: Story = {
  render: () => html`
    <ui-datetime-picker
      type="datetime"
      time-mode="inline"
      value="2024-06-15 14:30"
      open
    ><ui-label slot="label">Select Date &amp; Time</ui-label></ui-datetime-picker>
  `,
};

export const DateWithInlineTimeAndActions: Story = {
  render: () => html`
    <ui-datetime-picker
      type="datetime"
      time-mode="inline"
      value="2024-06-15 14:30"
      open
      show-actions
    ><ui-label slot="label">Select Date &amp; Time</ui-label></ui-datetime-picker>
  `,
};
