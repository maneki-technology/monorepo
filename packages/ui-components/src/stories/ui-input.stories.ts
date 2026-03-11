import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-icon.js";
import "../components/ui-input.js";

const meta: Meta = {
  title: "Components/Input",
  component: "ui-input",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    type: { control: { type: "select" }, options: ["text", "numeric", "clearable", "password"] },
    status: {
      control: { type: "select" },
      options: ["none", "warning", "error", "success", "loading"],
    },
    label: { control: "text" },
    "secondary-label": { control: "text" },
    supportive: { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    error: { control: "boolean" },
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    size: "m",
    type: "text",
    status: "none",
    label: "",
    "secondary-label": "",
    supportive: "",
    placeholder: "Placeholder text",
    value: "",
    disabled: false,
    readonly: false,
    error: false,
  },
  render: (args) => html`
    <ui-input
      size=${args.size}
      type=${args.type}
      status=${args.status}
      label=${args.label || undefined}
      secondary-label=${args["secondary-label"] || undefined}
      supportive=${args.supportive || undefined}
      placeholder=${args.placeholder}
      value=${args.value}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?error=${args.error}
    ></ui-input>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-input placeholder="Enter text..." label="Text input"></ui-input>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input size="s" label="Small" placeholder="Size S"></ui-input>
      <ui-input size="m" label="Medium" placeholder="Size M"></ui-input>
      <ui-input size="l" label="Large" placeholder="Size L"></ui-input>
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input label="Email" placeholder="you@example.com"></ui-input>
      <ui-input label="Username" secondary-label="Optional" placeholder="johndoe"></ui-input>
    </div>
  `,
};

export const WithSupportive: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        label="Password"
        placeholder="Enter password"
        supportive="Must be at least 8 characters"
      ></ui-input>
      <ui-input
        label="Email"
        placeholder="you@example.com"
        status="error"
        supportive="Please enter a valid email address"
      ></ui-input>
      <ui-input
        label="Username"
        placeholder="johndoe"
        status="success"
        supportive="Username is available"
      ></ui-input>
    </div>
  `,
};

export const LeadingElement: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input label="Search" placeholder="Search...">
        <ui-icon name="search" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input label="Amount" placeholder="0.00">
        <ui-icon name="attach_money" size="m" slot="leading"></ui-icon>
      </ui-input>
    </div>
  `,
};

export const TrailingElement: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input label="Weight" placeholder="0" value="72">
        <span slot="trailing" style="font-size: 12px; color: #9FB1BD;">kg</span>
      </ui-input>
      <ui-input label="Website" placeholder="example.com">
        <span slot="trailing" style="font-size: 12px; color: #9FB1BD;">.com</span>
      </ui-input>
    </div>
  `,
};

export const NumericType: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        type="numeric"
        size="s"
        label="Quantity (S)"
        placeholder="0"
        value="1"
      ></ui-input>
      <ui-input
        type="numeric"
        size="m"
        label="Quantity (M)"
        placeholder="0"
        value="10"
      ></ui-input>
      <ui-input
        type="numeric"
        size="l"
        label="Quantity (L)"
        placeholder="0"
        value="100"
      ></ui-input>
    </div>
  `,
};

export const ClearableType: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        type="clearable"
        label="Search"
        placeholder="Type to search..."
        value="React components"
      ></ui-input>
      <ui-input
        type="clearable"
        label="Filter"
        placeholder="Filter items..."
      ></ui-input>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input label="Enabled" placeholder="Default state"></ui-input>
      <ui-input label="Filled" value="Some value"></ui-input>
      <ui-input label="Disabled" placeholder="Cannot edit" disabled></ui-input>
      <ui-input label="Disabled filled" value="Cannot edit" disabled></ui-input>
      <ui-input label="Readonly" value="Read only value" readonly></ui-input>
    </div>
  `,
};

export const Statuses: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        label="None"
        placeholder="No status"
        status="none"
        supportive="Default supportive text"
      ></ui-input>
      <ui-input
        label="Warning"
        value="Might be wrong"
        status="warning"
        supportive="Please double-check this value"
      ></ui-input>
      <ui-input
        label="Error"
        value="Invalid"
        status="error"
        supportive="This field is required"
      ></ui-input>
      <ui-input
        label="Error (boolean)"
        value="Invalid"
        error
        supportive="This field has an error"
      ></ui-input>
      <ui-input
        label="Success"
        value="Valid input"
        status="success"
        supportive="Looks good!"
      ></ui-input>
      <ui-input
        label="Loading"
        value="Checking..."
        status="loading"
        supportive="Validating..."
      ></ui-input>
    </div>
  `,
};

export const FullFeatured: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <ui-input
        size="m"
        type="clearable"
        label="Email Address"
        secondary-label="Required"
        placeholder="you@example.com"
        value="john@example.com"
        status="success"
        supportive="Email verified successfully"
      >
        <ui-icon name="mail" size="m" slot="leading"></ui-icon>
      </ui-input>

      <ui-input
        size="m"
        type="numeric"
        label="Quantity"
        secondary-label="Max 99"
        placeholder="0"
        value="5"
        supportive="Enter the number of items"
      ></ui-input>

      <ui-input
        size="l"
        label="Description"
        secondary-label="Optional"
        placeholder="Enter a description..."
        supportive="Maximum 200 characters"
      >
        <span slot="trailing" style="font-size: 12px; color: #9FB1BD;">0/200</span>
      </ui-input>
    </div>
  `,
};
export const PasswordType: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        type="password"
        size="s"
        label="Password (S)"
        placeholder="Enter password"
        value="secret123"
      ></ui-input>
      <ui-input
        type="password"
        size="m"
        label="Password (M)"
        placeholder="Enter password"
        value="secret123"
      ></ui-input>
      <ui-input
        type="password"
        size="l"
        label="Password (L)"
        placeholder="Enter password"
        value="secret123"
      ></ui-input>
    </div>
  `,
};

