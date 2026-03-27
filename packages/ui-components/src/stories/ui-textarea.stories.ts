import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-icon.js";
import "../components/ui-textarea.js";
import "../components/ui-label.js";

const meta: Meta = {
  title: "Components/Textarea",
  component: "ui-textarea",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    status: {
      control: { type: "select" },
      options: ["none", "warning", "error", "success", "loading"],
    },
    "secondary-label": { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text" },
    rows: { control: "number" },
    maxlength: { control: "number" },
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
    status: "none",
    placeholder: "Placeholder Text",
    "secondary-label": "",
    value: "",
    rows: 4,
    disabled: false,
    readonly: false,
    error: false,
  },
  render: (args) => html`
    <ui-textarea
      size=${args.size}
      status=${args.status}
      secondary-label=${args["secondary-label"] || undefined}
      placeholder=${args.placeholder}
      value=${args.value}
      rows=${args.rows}
      maxlength=${args.maxlength || undefined}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?error=${args.error}
    ></ui-textarea>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-textarea placeholder="Enter text..."><ui-label slot="label">Text area</ui-label></ui-textarea>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea size="s" placeholder="Size S"><ui-label slot="label" size="s">Small</ui-label></ui-textarea>
      <ui-textarea size="m" placeholder="Size M"><ui-label slot="label" size="m">Medium</ui-label></ui-textarea>
      <ui-textarea size="l" placeholder="Size L"><ui-label slot="label" size="l">Large</ui-label></ui-textarea>
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea placeholder="Enter a description..."><ui-label slot="label">Description</ui-label></ui-textarea>
      <ui-textarea
        placeholder="Tell us about yourself..."
        maxlength="200"
      ><ui-label slot="label">Bio</ui-label></ui-textarea>
    </div>
  `,
};

export const WithSecondaryLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea
        placeholder="Add notes..."
        secondary-label="Optional"
      ><ui-label slot="label">Notes</ui-label></ui-textarea>
      <ui-textarea
        placeholder="Share your feedback..."
        secondary-label="Max 500 characters"
      ><ui-label slot="label">Feedback</ui-label></ui-textarea>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea placeholder="Default state"><ui-label slot="label">Enabled</ui-label></ui-textarea>
      <ui-textarea value="Some value entered by the user"><ui-label slot="label">Filled</ui-label></ui-textarea>
      <ui-textarea placeholder="Cannot edit" disabled><ui-label slot="label">Disabled</ui-label></ui-textarea>
      <ui-textarea value="Cannot edit this content" disabled><ui-label slot="label">Disabled filled</ui-label></ui-textarea>
      <ui-textarea value="Read only value" readonly><ui-label slot="label">Readonly</ui-label></ui-textarea>
    </div>
  `,
};

export const Statuses: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea
        placeholder="No status"
        status="none"
        secondary-label="Default secondary text"
      ><ui-label slot="label">None</ui-label></ui-textarea>
      <ui-textarea
        value="Might be wrong"
        status="warning"
        secondary-label="Please double-check this value"
      ><ui-label slot="label">Warning</ui-label></ui-textarea>
      <ui-textarea
        value="Invalid"
        status="error"
        secondary-label="This field is required"
      ><ui-label slot="label">Error</ui-label></ui-textarea>
      <ui-textarea
        value="Invalid"
        error
        secondary-label="This field has an error"
      ><ui-label slot="label">Error (boolean)</ui-label></ui-textarea>
      <ui-textarea
        value="Valid input"
        status="success"
        secondary-label="Looks good!"
      ><ui-label slot="label">Success</ui-label></ui-textarea>
      <ui-textarea
        value="Checking..."
        status="loading"
        secondary-label="Validating..."
      ><ui-label slot="label">Loading</ui-label></ui-textarea>
    </div>
  `,
};

export const Hover: Story = {
  render: () => html`
    <ui-textarea
      placeholder="Hover over this textarea"
      style="max-width: 320px;"
    ><ui-label slot="label">Hover state</ui-label></ui-textarea>
  `,
};

export const Focus: Story = {
  render: () => html`
    <ui-textarea
      placeholder="Click to focus this textarea"
      secondary-label="Focus ring appears on click or tab"
      style="max-width: 320px;"
    ><ui-label slot="label">Focus state</ui-label></ui-textarea>
  `,
};

export const Active: Story = {
  render: () => html`
    <ui-textarea
      value="This textarea has content, showing the active/filled state."
      style="max-width: 320px;"
    ><ui-label slot="label">Active / Filled</ui-label></ui-textarea>
  `,
};

export const FullFeatured: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <ui-textarea
        size="m"
        secondary-label="Required"
        placeholder="Enter a detailed description..."
        value="This is a fully featured textarea with all options enabled."
        maxlength="300"
        status="success"
      ><ui-label slot="label" size="m">Description</ui-label></ui-textarea>

      <ui-textarea
        size="l"
        secondary-label="Optional"
        placeholder="Leave a comment..."
        rows="6"
        maxlength="500"
      ><ui-label slot="label" size="l">Comments</ui-label></ui-textarea>
    </div>
  `,
};
