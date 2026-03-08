import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-alert.js";
import "../components/ui-button.js";

const meta: Meta = {
  title: "Components/Alert",
  component: "ui-alert",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    emphasis: { control: { type: "select" }, options: ["bold", "subtle"] },
    status: {
      control: { type: "select" },
      options: ["none", "information", "success", "error", "warning"],
    },
    dismissable: { control: "boolean" },
  },
  args: {
    size: "m",
    emphasis: "bold",
    status: "none",
    dismissable: false,
  },
  render: (args) => html`
    <ui-alert
      size=${args.size}
      emphasis=${args.emphasis}
      status=${args.status}
      ?dismissable=${args.dismissable}
    >
      This is an alert message
    </ui-alert>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-alert>This is an alert message</ui-alert>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-alert size="s">Small alert</ui-alert>
      <ui-alert size="m">Medium alert</ui-alert>
      <ui-alert size="l">Large alert</ui-alert>
    </div>
  `,
};

export const SubtleEmphasis: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-alert status="none" emphasis="subtle">None subtle</ui-alert>
      <ui-alert status="information" emphasis="subtle"
        >Information subtle</ui-alert
      >
      <ui-alert status="success" emphasis="subtle">Success subtle</ui-alert>
      <ui-alert status="error" emphasis="subtle">Error subtle</ui-alert>
      <ui-alert status="warning" emphasis="subtle">Warning subtle</ui-alert>
    </div>
  `,
};

export const BoldEmphasis: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-alert status="none" emphasis="bold">None bold</ui-alert>
      <ui-alert status="information" emphasis="bold"
        >Information bold</ui-alert
      >
      <ui-alert status="success" emphasis="bold">Success bold</ui-alert>
      <ui-alert status="error" emphasis="bold">Error bold</ui-alert>
      <ui-alert status="warning" emphasis="bold">Warning bold</ui-alert>
    </div>
  `,
};

export const WithDescription: Story = {
  render: () => html`
    <ui-alert status="information">
      Alert Title
      <span slot="description"
        >This is a longer description that provides more context about the
        alert.</span
      >
    </ui-alert>
  `,
};

export const WithLeadingIcon: Story = {
  render: () => html`
    <ui-alert status="information" leading-icon>
      <svg slot="icon" viewBox="0 0 20 20" width="100%" height="100%">
        <circle cx="10" cy="10" r="8" fill="currentColor" />
      </svg>
      Alert with leading icon
    </ui-alert>
  `,
};

export const Dismissable: Story = {
  render: () => html`
    <ui-alert status="information" dismissable>
      This alert can be dismissed
    </ui-alert>
  `,
};

export const AllStatuses: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ui-alert status="none" leading-icon>
        <svg slot="icon" viewBox="0 0 20 20" width="100%" height="100%">
          <circle cx="10" cy="10" r="8" fill="currentColor" />
        </svg>
        None status
      </ui-alert>
      <ui-alert status="information" leading-icon>
        <svg slot="icon" viewBox="0 0 20 20" width="100%" height="100%">
          <circle cx="10" cy="10" r="8" fill="currentColor" />
        </svg>
        Information status
      </ui-alert>
      <ui-alert status="success" leading-icon>
        <svg slot="icon" viewBox="0 0 20 20" width="100%" height="100%">
          <circle cx="10" cy="10" r="8" fill="currentColor" />
        </svg>
        Success status
      </ui-alert>
      <ui-alert status="error" leading-icon>
        <svg slot="icon" viewBox="0 0 20 20" width="100%" height="100%">
          <circle cx="10" cy="10" r="8" fill="currentColor" />
        </svg>
        Error status
      </ui-alert>
      <ui-alert status="warning" leading-icon>
        <svg slot="icon" viewBox="0 0 20 20" width="100%" height="100%">
          <circle cx="10" cy="10" r="8" fill="currentColor" />
        </svg>
        Warning status
      </ui-alert>
    </div>
  `,
};

export const WithFooterButton: Story = {
  render: () => html`
    <ui-alert status="none" leading-icon dismissable>
      <svg slot="icon" viewBox="0 0 20 20" width="100%" height="100%">
        <circle cx="10" cy="10" r="8" fill="currentColor" />
      </svg>
      Alert Title
      <span slot="description">Description text explaining the alert in more detail.</span>
      <div slot="footer">
        <ui-button action="contrast" emphasis="subtle" size="s">Refresh</ui-button>
      </div>
    </ui-alert>
  `,
};
