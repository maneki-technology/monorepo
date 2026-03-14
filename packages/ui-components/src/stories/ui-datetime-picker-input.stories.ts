import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-datetime-picker-input.js";

const meta: Meta = {
  title: "Components/Date Picker Input",
  component: "ui-datetime-picker-input",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["s", "m", "l"] },
    type: { control: "select", options: ["single-date", "range-date", "time"] },
    value: { control: "text" },
    label: { control: "text" },
    supportive: { control: "text" },
    status: { control: "select", options: ["none", "error", "warning", "success", "loading"] },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
  },
  args: {
    size: "m",
    type: "single-date",
  },
};
export default meta;
type Story = StoryObj;

// ─── Basic variants ─────────────────────────────────────────────────────────

export const Default: Story = {};

export const SingleDate: Story = {
  args: { value: "2024-06-15" },
};

export const RangeDate: Story = {
  args: { type: "range-date", value: "2024-06-10/2024-06-20" },
};

export const Time: Story = {
  args: { type: "time", value: "02:30 PM" },
};

// ─── Sizes ──────────────────────────────────────────────────────────────────

export const SizeS: Story = {
  args: { size: "s", value: "2024-06-15" },
};

export const SizeM: Story = {
  args: { size: "m", value: "2024-06-15" },
};

export const SizeL: Story = {
  args: { size: "l", value: "2024-06-15" },
};

// ─── With label / supportive ────────────────────────────────────────────────

export const WithLabel: Story = {
  args: { label: "Select Date", value: "2024-06-15" },
};

export const WithSupportive: Story = {
  args: { label: "Select Date", supportive: "Choose a date for your appointment", value: "2024-06-15" },
};

// ─── States ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { disabled: true, value: "2024-06-15", label: "Select Date" },
};

export const Readonly: Story = {
  args: { readonly: true, value: "2024-06-15", label: "Select Date" },
};

export const StatusError: Story = {
  args: { status: "error", label: "Select Date", supportive: "This field is required", value: "" },
};

export const StatusWarning: Story = {
  args: { status: "warning", label: "Select Date", supportive: "Date is in the past", value: "2020-01-01" },
};

export const StatusSuccess: Story = {
  args: { status: "success", label: "Select Date", value: "2024-06-15" },
};

// ─── Comparison stories ─────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 4px;">Size S</div>
        <ui-datetime-picker-input size="s" value="2024-06-15"></ui-datetime-picker-input>
      </div>
      <div>
        <div style="margin-bottom: 4px;">Size M</div>
        <ui-datetime-picker-input size="m" value="2024-06-15"></ui-datetime-picker-input>
      </div>
      <div>
        <div style="margin-bottom: 4px;">Size L</div>
        <ui-datetime-picker-input size="l" value="2024-06-15"></ui-datetime-picker-input>
      </div>
    </div>
  `,
};

export const AllTypes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 4px;">Single Date</div>
        <ui-datetime-picker-input type="single-date" value="2024-06-15"></ui-datetime-picker-input>
      </div>
      <div>
        <div style="margin-bottom: 4px;">Range Date</div>
        <ui-datetime-picker-input type="range-date" value="2024-06-10/2024-06-20"></ui-datetime-picker-input>
      </div>
      <div>
        <div style="margin-bottom: 4px;">Time</div>
        <ui-datetime-picker-input type="time" value="02:30 PM"></ui-datetime-picker-input>
      </div>
    </div>
  `,
};
