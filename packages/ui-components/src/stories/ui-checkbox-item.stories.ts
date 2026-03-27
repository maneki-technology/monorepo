import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-checkbox-item.js";
import "../components/ui-checkbox-group.js";
import "../components/ui-label.js";

const meta: Meta = {
  title: "Components/CheckboxItem",
  component: "ui-checkbox-item",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    labelPosition: {
      control: { type: "select" },
      options: ["none", "right", "left"],
    },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    size: "m",
    labelPosition: "right",
    checked: false,
    indeterminate: false,
    disabled: false,
    error: false,
  },
  render: (args) => html`
    <ui-checkbox-item
      size=${args.size}
      label-position=${args.labelPosition}
      ?checked=${args.checked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      ?error=${args.error}
    >
      <ui-label slot="label">Checkbox label</ui-label>
    </ui-checkbox-item>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-checkbox-item label-position="right"><ui-label slot="label">Default checkbox</ui-label></ui-checkbox-item>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item size="s" label-position="right"><ui-label slot="label">Small</ui-label></ui-checkbox-item>
      <ui-checkbox-item size="m" label-position="right"><ui-label slot="label">Medium</ui-label></ui-checkbox-item>
      <ui-checkbox-item size="l" label-position="right"><ui-label slot="label">Large</ui-label></ui-checkbox-item>
    </div>
  `,
};

export const CheckStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item label-position="right"><ui-label slot="label">Unchecked</ui-label></ui-checkbox-item>
      <ui-checkbox-item checked label-position="right"><ui-label slot="label">Checked</ui-label></ui-checkbox-item>
      <ui-checkbox-item indeterminate label-position="right"
        ><ui-label slot="label">Indeterminate</ui-label></ui-checkbox-item
      >
    </div>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item checked aria-label="No label checkbox"><ui-label slot="label">No label</ui-label></ui-checkbox-item>
      <ui-checkbox-item checked label-position="right"
        ><ui-label slot="label">Label right</ui-label></ui-checkbox-item
      >
      <ui-checkbox-item checked label-position="left"><ui-label slot="label">Label left</ui-label></ui-checkbox-item>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item label-position="right"><ui-label slot="label">Enabled</ui-label></ui-checkbox-item>
      <ui-checkbox-item disabled label-position="right"><ui-label slot="label">Disabled</ui-label></ui-checkbox-item>
      <ui-checkbox-item disabled checked label-position="right"
        ><ui-label slot="label">Disabled checked</ui-label></ui-checkbox-item
      >
      <ui-checkbox-item error label-position="right"><ui-label slot="label">Error</ui-label></ui-checkbox-item>
      <ui-checkbox-item error checked label-position="right"
        ><ui-label slot="label">Error checked</ui-label></ui-checkbox-item
      >
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ui-checkbox-item size="s" label-position="right"
        ><ui-label slot="label">I agree to the terms and conditions</ui-label></ui-checkbox-item
      >
      <ui-checkbox-item size="m" label-position="right"
        ><ui-label slot="label">Subscribe to newsletter</ui-label></ui-checkbox-item
      >
      <ui-checkbox-item size="l" label-position="right"
        ><ui-label slot="label">Remember my preferences</ui-label></ui-checkbox-item
      >
    </div>
  `,
};

export const GroupVertical: Story = {
  render: () => html`
    <ui-checkbox-group size="m" orientation="vertical">
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 4</ui-label></ui-checkbox-item>
    </ui-checkbox-group>
  `,
};

export const GroupHorizontal: Story = {
  render: () => html`
    <ui-checkbox-group size="m" orientation="horizontal">
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
      <ui-checkbox-item label-position="right"><ui-label slot="label">Option 4</ui-label></ui-checkbox-item>
    </ui-checkbox-group>
  `,
};

export const GroupSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: S</p>
        <ui-checkbox-group size="s" orientation="vertical">
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: M</p>
        <ui-checkbox-group size="m" orientation="vertical">
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: L</p>
        <ui-checkbox-group size="l" orientation="vertical">
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        </ui-checkbox-group>
      </div>
    </div>
  `,
};
