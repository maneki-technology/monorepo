import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-label.js";

const meta: Meta = {
  title: "Components/Label",
  component: "ui-label",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    emphasis: { control: { type: "select" }, options: ["bold", "subtle"] },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    text: { control: "text" },
  },
  args: {
    size: "m",
    emphasis: "bold",
    disabled: false,
    required: false,
    text: "Label",
  },
  render: (args) => html`
    <ui-label
      size=${args.size}
      emphasis=${args.emphasis}
      ?disabled=${args.disabled}
      ?required=${args.required}
    >${args.text}</ui-label>
  `,
};
export default meta;

type Story = StoryObj;

// ── Variants (all sizes × emphases) ─────────────────────────────────────────

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h3 style="margin: 0 0 12px; font-size: 14px; color: #5b7282;">Bold (default)</h3>
        <div style="display: flex; align-items: baseline; gap: 32px;">
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <span style="font-size: 11px; color: #9fb1bd;">S</span>
            <ui-label size="s">Label</ui-label>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <span style="font-size: 11px; color: #9fb1bd;">M</span>
            <ui-label size="m">Label</ui-label>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <span style="font-size: 11px; color: #9fb1bd;">L</span>
            <ui-label size="l">Label</ui-label>
          </div>
        </div>
      </div>
      <div>
        <h3 style="margin: 0 0 12px; font-size: 14px; color: #5b7282;">Subtle</h3>
        <div style="display: flex; align-items: baseline; gap: 32px;">
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <span style="font-size: 11px; color: #9fb1bd;">S</span>
            <ui-label size="s" emphasis="subtle">Label</ui-label>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <span style="font-size: 11px; color: #9fb1bd;">M</span>
            <ui-label size="m" emphasis="subtle">Label</ui-label>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <span style="font-size: 11px; color: #9fb1bd;">L</span>
            <ui-label size="l" emphasis="subtle">Label</ui-label>
          </div>
        </div>
      </div>
    </div>
  `,
};

// ── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => html`
    <div style="display: flex; align-items: baseline; gap: 32px;">
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-size: 11px; color: #9fb1bd;">Enabled</span>
        <ui-label>Label</ui-label>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-size: 11px; color: #9fb1bd;">Disabled</span>
        <ui-label disabled>Label</ui-label>
      </div>
    </div>
  `,
};

// ── Required ─────────────────────────────────────────────────────────────────

export const Required: Story = {
  render: () => html`
    <div style="display: flex; align-items: baseline; gap: 32px;">
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-size: 11px; color: #9fb1bd;">Not required</span>
        <ui-label>Username</ui-label>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-size: 11px; color: #9fb1bd;">Required</span>
        <ui-label required>Username</ui-label>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-size: 11px; color: #9fb1bd;">Required + Disabled</span>
        <ui-label required disabled>Username</ui-label>
      </div>
    </div>
  `,
};

// ── Emphasis ─────────────────────────────────────────────────────────────────

export const Emphasis: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; align-items: baseline; gap: 32px;">
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <span style="font-size: 11px; color: #9fb1bd;">Bold</span>
          <ui-label emphasis="bold">Label</ui-label>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <span style="font-size: 11px; color: #9fb1bd;">Subtle</span>
          <ui-label emphasis="subtle">Label</ui-label>
        </div>
      </div>
      <div style="display: flex; align-items: baseline; gap: 32px;">
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <span style="font-size: 11px; color: #9fb1bd;">Bold + Disabled</span>
          <ui-label emphasis="bold" disabled>Label</ui-label>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <span style="font-size: 11px; color: #9fb1bd;">Subtle + Disabled</span>
          <ui-label emphasis="subtle" disabled>Label</ui-label>
        </div>
      </div>
    </div>
  `,
};
