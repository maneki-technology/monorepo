import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-icon.js";
import "../components/ui-input.js";
import "../components/ui-label.js";

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
    <ui-input placeholder="Enter text..."><ui-label slot="label">Text input</ui-label></ui-input>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input size="s" placeholder="Size S"><ui-label slot="label" size="s">Small</ui-label></ui-input>
      <ui-input size="m" placeholder="Size M"><ui-label slot="label" size="m">Medium</ui-label></ui-input>
      <ui-input size="l" placeholder="Size L"><ui-label slot="label" size="l">Large</ui-label></ui-input>
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input placeholder="you@example.com"><ui-label slot="label">Email</ui-label></ui-input>
      <ui-input secondary-label="Optional" placeholder="johndoe"><ui-label slot="label">Username</ui-label></ui-input>
    </div>
  `,
};

export const WithSupportive: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        placeholder="Enter password"
        supportive="Must be at least 8 characters"
      ><ui-label slot="label">Password</ui-label></ui-input>
      <ui-input
        placeholder="you@example.com"
        status="error"
        supportive="Please enter a valid email address"
      ><ui-label slot="label">Email</ui-label></ui-input>
      <ui-input
        placeholder="johndoe"
        status="success"
        supportive="Username is available"
      ><ui-label slot="label">Username</ui-label></ui-input>
    </div>
  `,
};

export const LeadingElement: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input placeholder="Search...">
        <ui-label slot="label">Search</ui-label>
        <ui-icon name="search" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input placeholder="0.00">
        <ui-label slot="label">Amount</ui-label>
        <ui-icon name="attach_money" size="m" slot="leading"></ui-icon>
      </ui-input>
    </div>
  `,
};

export const TrailingElement: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input placeholder="0" value="72">
        <ui-label slot="label">Weight</ui-label>
        <span slot="trailing" style="font-size: 12px; color: #9FB1BD;">kg</span>
      </ui-input>
      <ui-input placeholder="example.com">
        <ui-label slot="label">Website</ui-label>
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
        placeholder="0"
        value="1"
      ><ui-label slot="label" size="s">Quantity (S)</ui-label></ui-input>
      <ui-input
        type="numeric"
        size="m"
        placeholder="0"
        value="10"
      ><ui-label slot="label" size="m">Quantity (M)</ui-label></ui-input>
      <ui-input
        type="numeric"
        size="l"
        placeholder="0"
        value="100"
      ><ui-label slot="label" size="l">Quantity (L)</ui-label></ui-input>
    </div>
  `,
};

export const ClearableType: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        type="clearable"
        placeholder="Type to search..."
        value="React components"
      ><ui-label slot="label">Search</ui-label></ui-input>
      <ui-input
        type="clearable"
        placeholder="Filter items..."
      ><ui-label slot="label">Filter</ui-label></ui-input>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input placeholder="Default state"><ui-label slot="label">Enabled</ui-label></ui-input>
      <ui-input value="Some value"><ui-label slot="label">Filled</ui-label></ui-input>
      <ui-input placeholder="Cannot edit" disabled><ui-label slot="label">Disabled</ui-label></ui-input>
      <ui-input value="Cannot edit" disabled><ui-label slot="label">Disabled filled</ui-label></ui-input>
      <ui-input value="Read only value" readonly><ui-label slot="label">Readonly</ui-label></ui-input>
    </div>
  `,
};

export const Statuses: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-input
        placeholder="No status"
        status="none"
        supportive="Default supportive text"
      ><ui-label slot="label">None</ui-label></ui-input>
      <ui-input
        value="Might be wrong"
        status="warning"
        supportive="Please double-check this value"
      ><ui-label slot="label">Warning</ui-label></ui-input>
      <ui-input
        value="Invalid"
        status="error"
        supportive="This field is required"
      ><ui-label slot="label">Error</ui-label></ui-input>
      <ui-input
        value="Invalid"
        error
        supportive="This field has an error"
      ><ui-label slot="label">Error (boolean)</ui-label></ui-input>
      <ui-input
        value="Valid input"
        status="success"
        supportive="Looks good!"
      ><ui-label slot="label">Success</ui-label></ui-input>
      <ui-input
        value="Checking..."
        status="loading"
        supportive="Validating..."
      ><ui-label slot="label">Loading</ui-label></ui-input>
    </div>
  `,
};

export const FullFeatured: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <ui-input
        size="m"
        type="clearable"
        secondary-label="Required"
        placeholder="you@example.com"
        value="john@example.com"
        status="success"
        supportive="Email verified successfully"
      >
        <ui-label slot="label">Email Address</ui-label>
        <ui-icon name="mail" size="m" slot="leading"></ui-icon>
      </ui-input>

      <ui-input
        size="m"
        type="numeric"
        secondary-label="Max 99"
        placeholder="0"
        value="5"
        supportive="Enter the number of items"
      ><ui-label slot="label">Quantity</ui-label></ui-input>

      <ui-input
        size="l"
        secondary-label="Optional"
        placeholder="Enter a description..."
        supportive="Maximum 200 characters"
      >
        <ui-label slot="label">Description</ui-label>
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
        placeholder="Enter password"
        value="secret123"
      ><ui-label slot="label" size="s">Password (S)</ui-label></ui-input>
      <ui-input
        type="password"
        size="m"
        placeholder="Enter password"
        value="secret123"
      ><ui-label slot="label" size="m">Password (M)</ui-label></ui-input>
      <ui-input
        type="password"
        size="l"
        placeholder="Enter password"
        value="secret123"
      ><ui-label slot="label" size="l">Password (L)</ui-label></ui-input>
    </div>
  `,
};
