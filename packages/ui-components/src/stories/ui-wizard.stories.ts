import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-wizard.js";
import "../components/ui-step-group.js";
import "../components/ui-step-item.js";

const meta: Meta = {
  title: "Components/Wizard",
  component: "ui-wizard",
  argTypes: {
    layout: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    title: {
      control: { type: "text" },
    },
    currentStep: {
      control: { type: "number" },
    },
  },
  args: {
    layout: "horizontal",
    title: "Setup Wizard",
  },
};

export default meta;
type Story = StoryObj;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stepsMarkup = html`
  <ui-step-group slot="steps">
    <ui-step-item label="Account" sublabel="Create account"></ui-step-item>
    <ui-step-item label="Profile" sublabel="Set up profile"></ui-step-item>
    <ui-step-item label="Settings" sublabel="Configure settings"></ui-step-item>
    <ui-step-item label="Review" sublabel="Review details"></ui-step-item>
    <ui-step-item label="Payment" sublabel="Add payment"></ui-step-item>
  </ui-step-group>
`;

const contentMarkup = html`
  <div style="padding: 24px; color: var(--fd-semantic-text-primary, #1c2b36);">
    <h3 style="margin: 0 0 8px;">Step Content</h3>
    <p style="margin: 0; line-height: 1.5;">
      This is the content area for the current step. Each step can display
      forms, information, or any other content relevant to the wizard flow.
    </p>
  </div>
`;

// ─── Horizontal ──────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  render: () => html`
    <div style="height: 422px; border: 1px solid #dce3e8; border-radius: 8px; overflow: hidden;">
      <ui-wizard layout="horizontal" title="Setup Wizard" current-step="3">
        ${stepsMarkup}
        ${contentMarkup}
      </ui-wizard>
    </div>
  `,
};

// ─── Vertical ────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => html`
    <div style="height: 460px; border: 1px solid #dce3e8; border-radius: 8px; overflow: hidden;">
      <ui-wizard layout="vertical" title="Setup Wizard" current-step="3">
        ${stepsMarkup}
        ${contentMarkup}
      </ui-wizard>
    </div>
  `,
};

// ─── First Step ──────────────────────────────────────────────────────────────

export const FirstStep: Story = {
  render: () => html`
    <div style="height: 422px; border: 1px solid #dce3e8; border-radius: 8px; overflow: hidden;">
      <ui-wizard layout="horizontal" title="Setup Wizard" current-step="1">
        ${stepsMarkup}
        <div style="padding: 24px; color: var(--fd-semantic-text-primary, #1c2b36);">
          <h3 style="margin: 0 0 8px;">Welcome</h3>
          <p style="margin: 0; line-height: 1.5;">
            This is the first step. The Previous button is disabled.
          </p>
        </div>
      </ui-wizard>
    </div>
  `,
};

// ─── Last Step ───────────────────────────────────────────────────────────────

export const LastStep: Story = {
  render: () => html`
    <div style="height: 422px; border: 1px solid #dce3e8; border-radius: 8px; overflow: hidden;">
      <ui-wizard layout="horizontal" title="Setup Wizard" current-step="5">
        ${stepsMarkup}
        <div style="padding: 24px; color: var(--fd-semantic-text-primary, #1c2b36);">
          <h3 style="margin: 0 0 8px;">Finish</h3>
          <p style="margin: 0; line-height: 1.5;">
            This is the last step. The Next button shows "Finish".
          </p>
        </div>
      </ui-wizard>
    </div>
  `,
};
