import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-radio-item.js";
import "../components/ui-radio-group.js";
import "../components/ui-label.js";

const meta: Meta = {
  title: "Components/RadioItem",
  component: "ui-radio-item",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    labelPosition: {
      control: { type: "select" },
      options: ["none", "right", "left"],
    },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    size: "m",
    labelPosition: "right",
    checked: false,
    disabled: false,
    error: false,
  },
  render: (args) => html`
    <ui-radio-item
      size=${args.size}
      label-position=${args.labelPosition}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?error=${args.error}
    >
      <ui-label slot="label">Radio label</ui-label>
    </ui-radio-item>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-radio-item label-position="right"><ui-label slot="label">Default radio</ui-label></ui-radio-item>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item size="s" label-position="right"><ui-label slot="label">Small</ui-label></ui-radio-item>
      <ui-radio-item size="m" label-position="right"><ui-label slot="label">Medium</ui-label></ui-radio-item>
      <ui-radio-item size="l" label-position="right"><ui-label slot="label">Large</ui-label></ui-radio-item>
    </div>
  `,
};

export const CheckStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item label-position="right"><ui-label slot="label">Unchecked</ui-label></ui-radio-item>
      <ui-radio-item checked label-position="right"><ui-label slot="label">Checked</ui-label></ui-radio-item>
    </div>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item checked aria-label="No label radio"
        ><ui-label slot="label">No label</ui-label></ui-radio-item
      >
      <ui-radio-item checked label-position="right"
        ><ui-label slot="label">Label right</ui-label></ui-radio-item
      >
      <ui-radio-item checked label-position="left"><ui-label slot="label">Label left</ui-label></ui-radio-item>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item label-position="right"><ui-label slot="label">Enabled</ui-label></ui-radio-item>
      <ui-radio-item disabled label-position="right"><ui-label slot="label">Disabled</ui-label></ui-radio-item>
      <ui-radio-item disabled checked label-position="right"
        ><ui-label slot="label">Disabled checked</ui-label></ui-radio-item
      >
      <ui-radio-item error label-position="right"><ui-label slot="label">Error</ui-label></ui-radio-item>
      <ui-radio-item error checked label-position="right"
        ><ui-label slot="label">Error checked</ui-label></ui-radio-item
      >
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ui-radio-item size="s" label-position="right"
        ><ui-label slot="label">I agree to the terms and conditions</ui-label></ui-radio-item
      >
      <ui-radio-item size="m" label-position="right"
        ><ui-label slot="label">Subscribe to newsletter</ui-label></ui-radio-item
      >
      <ui-radio-item size="l" label-position="right"
        ><ui-label slot="label">Remember my preferences</ui-label></ui-radio-item
      >
    </div>
  `,
};

export const GroupVertical: Story = {
  render: () => html`
    <ui-radio-group size="m" orientation="vertical">
      <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="4"><ui-label slot="label">Option 4</ui-label></ui-radio-item>
    </ui-radio-group>
  `,
};

export const GroupHorizontal: Story = {
  render: () => html`
    <ui-radio-group size="m" orientation="horizontal">
      <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="4"><ui-label slot="label">Option 4</ui-label></ui-radio-item>
    </ui-radio-group>
  `,
};

export const GroupSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: S</p>
        <ui-radio-group size="s" orientation="vertical">
          <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: M</p>
        <ui-radio-group size="m" orientation="vertical">
          <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: L</p>
        <ui-radio-group size="l" orientation="vertical">
          <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
        </ui-radio-group>
      </div>
    </div>
  `,
};

export const GroupPreselected: Story = {
  render: () => html`
    <ui-radio-group size="m" orientation="vertical">
      <ui-radio-item label-position="right" value="a"><ui-label slot="label">Option A</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="b" checked><ui-label slot="label">Option B (preselected)</ui-label></ui-radio-item>
      <ui-radio-item label-position="right" value="c"><ui-label slot="label">Option C</ui-label></ui-radio-item>
    </ui-radio-group>
  `,
};
