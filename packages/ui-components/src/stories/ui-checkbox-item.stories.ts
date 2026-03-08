import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-checkbox-item.js";
import "../components/ui-checkbox-group.js";

const meta: Meta = {
  title: "Components/CheckboxItem",
  component: "ui-checkbox-item",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    label: {
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
    label: "right",
    checked: false,
    indeterminate: false,
    disabled: false,
    error: false,
  },
  render: (args) => html`
    <ui-checkbox-item
      size=${args.size}
      label=${args.label}
      ?checked=${args.checked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      ?error=${args.error}
    >
      Checkbox label
    </ui-checkbox-item>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-checkbox-item label="right">Default checkbox</ui-checkbox-item>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item size="s" label="right">Small</ui-checkbox-item>
      <ui-checkbox-item size="m" label="right">Medium</ui-checkbox-item>
      <ui-checkbox-item size="l" label="right">Large</ui-checkbox-item>
    </div>
  `,
};

export const CheckStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item label="right">Unchecked</ui-checkbox-item>
      <ui-checkbox-item checked label="right">Checked</ui-checkbox-item>
      <ui-checkbox-item indeterminate label="right"
        >Indeterminate</ui-checkbox-item
      >
    </div>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item checked>No label</ui-checkbox-item>
      <ui-checkbox-item checked label="right"
        >Label right</ui-checkbox-item
      >
      <ui-checkbox-item checked label="left">Label left</ui-checkbox-item>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-checkbox-item label="right">Enabled</ui-checkbox-item>
      <ui-checkbox-item disabled label="right">Disabled</ui-checkbox-item>
      <ui-checkbox-item disabled checked label="right"
        >Disabled checked</ui-checkbox-item
      >
      <ui-checkbox-item error label="right">Error</ui-checkbox-item>
      <ui-checkbox-item error checked label="right"
        >Error checked</ui-checkbox-item
      >
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ui-checkbox-item size="s" label="right"
        >I agree to the terms and conditions</ui-checkbox-item
      >
      <ui-checkbox-item size="m" label="right"
        >Subscribe to newsletter</ui-checkbox-item
      >
      <ui-checkbox-item size="l" label="right"
        >Remember my preferences</ui-checkbox-item
      >
    </div>
  `,
};

export const GroupVertical: Story = {
  render: () => html`
    <ui-checkbox-group size="m" orientation="vertical">
      <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
      <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
      <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
      <ui-checkbox-item label="right">Option 4</ui-checkbox-item>
    </ui-checkbox-group>
  `,
};

export const GroupHorizontal: Story = {
  render: () => html`
    <ui-checkbox-group size="m" orientation="horizontal">
      <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
      <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
      <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
      <ui-checkbox-item label="right">Option 4</ui-checkbox-item>
    </ui-checkbox-group>
  `,
};

export const GroupSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600;">Size: S</p>
        <ui-checkbox-group size="s" orientation="vertical">
          <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600;">Size: M</p>
        <ui-checkbox-group size="m" orientation="vertical">
          <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600;">Size: L</p>
        <ui-checkbox-group size="l" orientation="vertical">
          <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        </ui-checkbox-group>
      </div>
    </div>
  `,
};
