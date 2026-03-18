import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-step-item.js";
import "../components/ui-step-group.js";

const meta: Meta = {
  title: "Components/Steps",
  component: "ui-step-group",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m"],
    },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    currentStep: {
      control: { type: "number" },
    },
  },
  args: {
    size: "m",
    orientation: "horizontal",
  },
};

export default meta;
type Story = StoryObj;

// ─── Horizontal M ─────────────────────────────────────────────────────────────

export const HorizontalM: Story = {
  render: () => html`
    <ui-step-group size="m" orientation="horizontal" labels>
      <ui-step-item status="complete" label="Account" sublabel="Create account"></ui-step-item>
      <ui-step-item status="complete" label="Profile" sublabel="Set up profile"></ui-step-item>
      <ui-step-item status="active" label="Settings" sublabel="Configure settings"></ui-step-item>
      <ui-step-item status="incomplete" label="Review" sublabel="Review details"></ui-step-item>
      <ui-step-item status="incomplete" label="Payment" sublabel="Add payment"></ui-step-item>
      <ui-step-item status="incomplete" label="Confirm" sublabel="Confirm order"></ui-step-item>
    </ui-step-group>
  `,
};

// ─── Horizontal S ─────────────────────────────────────────────────────────────

export const HorizontalS: Story = {
  render: () => html`
    <ui-step-group size="s" orientation="horizontal" labels>
      <ui-step-item status="complete" label="Account" sublabel="Create account"></ui-step-item>
      <ui-step-item status="complete" label="Profile" sublabel="Set up profile"></ui-step-item>
      <ui-step-item status="active" label="Settings" sublabel="Configure settings"></ui-step-item>
      <ui-step-item status="incomplete" label="Review" sublabel="Review details"></ui-step-item>
      <ui-step-item status="incomplete" label="Payment" sublabel="Add payment"></ui-step-item>
      <ui-step-item status="incomplete" label="Confirm" sublabel="Confirm order"></ui-step-item>
    </ui-step-group>
  `,
};

// ─── Vertical M ───────────────────────────────────────────────────────────────

export const VerticalM: Story = {
  render: () => html`
    <div style="height: 400px;">
      <ui-step-group size="m" orientation="vertical" labels>
        <ui-step-item status="complete" label="Account" sublabel="Create account"></ui-step-item>
        <ui-step-item status="complete" label="Profile" sublabel="Set up profile"></ui-step-item>
        <ui-step-item status="active" label="Settings" sublabel="Configure settings"></ui-step-item>
        <ui-step-item status="incomplete" label="Review" sublabel="Review details"></ui-step-item>
        <ui-step-item status="incomplete" label="Payment" sublabel="Add payment"></ui-step-item>
        <ui-step-item status="incomplete" label="Confirm" sublabel="Confirm order"></ui-step-item>
      </ui-step-group>
    </div>
  `,
};

// ─── Statuses ─────────────────────────────────────────────────────────────────

export const Statuses: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div style="display: flex; gap: 32px; align-items: center;">
        <span style="width: 80px; font-size: 13px; color: #666;">Complete</span>
        <ui-step-item status="complete" size="m" labels label="Complete" sublabel="Done"></ui-step-item>
      </div>
      <div style="display: flex; gap: 32px; align-items: center;">
        <span style="width: 80px; font-size: 13px; color: #666;">Active</span>
        <ui-step-item status="active" size="m" labels label="Active" sublabel="In progress"></ui-step-item>
      </div>
      <div style="display: flex; gap: 32px; align-items: center;">
        <span style="width: 80px; font-size: 13px; color: #666;">Incomplete</span>
        <ui-step-item status="incomplete" size="m" labels label="Incomplete" sublabel="Not started"></ui-step-item>
      </div>
      <div style="display: flex; gap: 32px; align-items: center;">
        <span style="width: 80px; font-size: 13px; color: #666;">Disabled</span>
        <ui-step-item status="disabled" size="m" labels label="Disabled" sublabel="Unavailable"></ui-step-item>
      </div>
      <div style="display: flex; gap: 32px; align-items: center;">
        <span style="width: 80px; font-size: 13px; color: #666;">Error</span>
        <ui-step-item status="error" size="m" labels label="Error" sublabel="Fix required"></ui-step-item>
      </div>
      <div style="display: flex; gap: 32px; align-items: center;">
        <span style="width: 80px; font-size: 13px; color: #666;">Warning</span>
        <ui-step-item status="warning" size="m" labels label="Warning" sublabel="Needs attention"></ui-step-item>
      </div>
    </div>
  `,
};

// ─── CurrentStep ──────────────────────────────────────────────────────────────

export const CurrentStep: Story = {
  render: () => html`
    <ui-step-group size="m" orientation="horizontal" current-step="3" labels>
      <ui-step-item label="Account" sublabel="Create account"></ui-step-item>
      <ui-step-item label="Profile" sublabel="Set up profile"></ui-step-item>
      <ui-step-item label="Settings" sublabel="Configure settings"></ui-step-item>
      <ui-step-item label="Review" sublabel="Review details"></ui-step-item>
      <ui-step-item label="Payment" sublabel="Add payment"></ui-step-item>
      <ui-step-item label="Confirm" sublabel="Confirm order"></ui-step-item>
    </ui-step-group>
  `,
};
