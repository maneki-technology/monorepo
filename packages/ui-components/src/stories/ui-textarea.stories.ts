import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-icon.js";
import "../components/ui-textarea.js";

const meta: Meta = {
  title: "Components/Textarea",
  component: "ui-textarea",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    status: {
      control: { type: "select" },
      options: ["none", "warning", "error", "success", "loading"],
    },
    label: { control: "text" },
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
    label: "",
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
      label=${args.label || undefined}
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
    <ui-textarea placeholder="Enter text..." label="Text area"></ui-textarea>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea size="s" label="Small" placeholder="Size S"></ui-textarea>
      <ui-textarea size="m" label="Medium" placeholder="Size M"></ui-textarea>
      <ui-textarea size="l" label="Large" placeholder="Size L"></ui-textarea>
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea label="Description" placeholder="Enter a description..."></ui-textarea>
      <ui-textarea
        label="Bio"
        placeholder="Tell us about yourself..."
        maxlength="200"
      ></ui-textarea>
    </div>
  `,
};

export const WithSecondaryLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea
        label="Notes"
        placeholder="Add notes..."
        secondary-label="Optional"
      ></ui-textarea>
      <ui-textarea
        label="Feedback"
        placeholder="Share your feedback..."
        secondary-label="Max 500 characters"
      ></ui-textarea>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea label="Enabled" placeholder="Default state"></ui-textarea>
      <ui-textarea label="Filled" value="Some value entered by the user"></ui-textarea>
      <ui-textarea label="Disabled" placeholder="Cannot edit" disabled></ui-textarea>
      <ui-textarea label="Disabled filled" value="Cannot edit this content" disabled></ui-textarea>
      <ui-textarea label="Readonly" value="Read only value" readonly></ui-textarea>
    </div>
  `,
};

export const Statuses: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-textarea
        label="None"
        placeholder="No status"
        status="none"
        secondary-label="Default secondary text"
      ></ui-textarea>
      <ui-textarea
        label="Warning"
        value="Might be wrong"
        status="warning"
        secondary-label="Please double-check this value"
      ></ui-textarea>
      <ui-textarea
        label="Error"
        value="Invalid"
        status="error"
        secondary-label="This field is required"
      ></ui-textarea>
      <ui-textarea
        label="Error (boolean)"
        value="Invalid"
        error
        secondary-label="This field has an error"
      ></ui-textarea>
      <ui-textarea
        label="Success"
        value="Valid input"
        status="success"
        secondary-label="Looks good!"
      ></ui-textarea>
      <ui-textarea
        label="Loading"
        value="Checking..."
        status="loading"
        secondary-label="Validating..."
      ></ui-textarea>
    </div>
  `,
};

export const Hover: Story = {
  render: () => html`
    <ui-textarea
      label="Hover state"
      placeholder="Hover over this textarea"
      style="max-width: 320px;"
    ></ui-textarea>
  `,
};

export const Focus: Story = {
  render: () => html`
    <ui-textarea
      label="Focus state"
      placeholder="Click to focus this textarea"
      secondary-label="Focus ring appears on click or tab"
      style="max-width: 320px;"
    ></ui-textarea>
  `,
};

export const Active: Story = {
  render: () => html`
    <ui-textarea
      label="Active / Filled"
      value="This textarea has content, showing the active/filled state."
      style="max-width: 320px;"
    ></ui-textarea>
  `,
};

export const FullFeatured: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <ui-textarea
        size="m"
        label="Description"
        secondary-label="Required"
        placeholder="Enter a detailed description..."
        value="This is a fully featured textarea with all options enabled."
        maxlength="300"
        status="success"
      ></ui-textarea>

      <ui-textarea
        size="l"
        label="Comments"
        secondary-label="Optional"
        placeholder="Leave a comment..."
        rows="6"
        maxlength="500"
      ></ui-textarea>
    </div>
  `,
};
