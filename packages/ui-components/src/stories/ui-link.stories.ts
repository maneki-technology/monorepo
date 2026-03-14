import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-link.js";

const meta: Meta = {
  title: "Components/Link",
  component: "ui-link",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    emphasis: { control: { type: "select" }, options: ["bold", "subtle"] },
    href: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "m",
    emphasis: "bold",
    href: "#",
    disabled: false,
  },
  render: (args) => html`
    <ui-link
      size=${args.size}
      emphasis=${args.emphasis}
      href=${args.href}
      ?disabled=${args.disabled}
    >Link text</ui-link>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<ui-link href="#">Default link</ui-link>`,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: baseline;">
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #9fb1bd;">S</span>
        <ui-link size="s" href="#">Small link</ui-link>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #9fb1bd;">M</span>
        <ui-link size="m" href="#">Medium link</ui-link>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #9fb1bd;">L</span>
        <ui-link size="l" href="#">Large link</ui-link>
      </div>
    </div>
  `,
};

export const Emphases: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: baseline;">
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #9fb1bd;">Bold</span>
        <ui-link emphasis="bold" href="#">Bold link</ui-link>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #9fb1bd;">Subtle</span>
        <ui-link emphasis="subtle" href="#">Subtle link</ui-link>
      </div>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: baseline;">
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #9fb1bd;">Enabled</span>
        <ui-link href="#">Enabled</ui-link>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #9fb1bd;">Disabled</span>
        <ui-link href="#" disabled>Disabled</ui-link>
      </div>
    </div>
  `,
};

export const Inline: Story = {
  render: () => html`
    <p style="font-family: Inter, sans-serif; font-size: 14px; color: #1c2b36; max-width: 480px; line-height: 1.6;">
      This is a paragraph with an <ui-link href="#" size="m">inline link</ui-link> embedded
      in the text. Links can also be <ui-link href="#" emphasis="subtle" size="m">subtle emphasis</ui-link>
      to blend more naturally with surrounding content.
    </p>
  `,
};

export const WithTarget: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: baseline;">
      <ui-link href="#" target="_self">Same window</ui-link>
      <ui-link href="#" target="_blank" rel="noopener noreferrer">New window</ui-link>
    </div>
  `,
};

export const AllSizesEmphases: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h3 style="margin: 0 0 12px; font-family: Inter, sans-serif; font-size: 14px; color: #5b7282;">Bold</h3>
        <div style="display: flex; gap: 32px; align-items: baseline;">
          <ui-link size="s" emphasis="bold" href="#">Small</ui-link>
          <ui-link size="m" emphasis="bold" href="#">Medium</ui-link>
          <ui-link size="l" emphasis="bold" href="#">Large</ui-link>
        </div>
      </div>
      <div>
        <h3 style="margin: 0 0 12px; font-family: Inter, sans-serif; font-size: 14px; color: #5b7282;">Subtle</h3>
        <div style="display: flex; gap: 32px; align-items: baseline;">
          <ui-link size="s" emphasis="subtle" href="#">Small</ui-link>
          <ui-link size="m" emphasis="subtle" href="#">Medium</ui-link>
          <ui-link size="l" emphasis="subtle" href="#">Large</ui-link>
        </div>
      </div>
      <div>
        <h3 style="margin: 0 0 12px; font-family: Inter, sans-serif; font-size: 14px; color: #5b7282;">Disabled</h3>
        <div style="display: flex; gap: 32px; align-items: baseline;">
          <ui-link size="s" href="#" disabled>Small</ui-link>
          <ui-link size="m" href="#" disabled>Medium</ui-link>
          <ui-link size="l" href="#" disabled>Large</ui-link>
        </div>
      </div>
    </div>
  `,
};
