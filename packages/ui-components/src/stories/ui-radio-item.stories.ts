import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-radio-item.js";
import "../components/ui-radio-group.js";

const meta: Meta = {
  title: "Components/RadioItem",
  component: "ui-radio-item",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    label: {
      control: { type: "select" },
      options: ["none", "right", "left"],
    },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    size: "m",
    label: "right",
    checked: false,
    disabled: false,
    error: false,
  },
  render: (args) => html`
    <ui-radio-item
      size=${args.size}
      label=${args.label}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?error=${args.error}
    >
      Radio label
    </ui-radio-item>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-radio-item label="right">Default radio</ui-radio-item>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item size="s" label="right">Small</ui-radio-item>
      <ui-radio-item size="m" label="right">Medium</ui-radio-item>
      <ui-radio-item size="l" label="right">Large</ui-radio-item>
    </div>
  `,
};

export const CheckStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item label="right">Unchecked</ui-radio-item>
      <ui-radio-item checked label="right">Checked</ui-radio-item>
    </div>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item checked aria-label="No label radio"
        >No label</ui-radio-item
      >
      <ui-radio-item checked label="right"
        >Label right</ui-radio-item
      >
      <ui-radio-item checked label="left">Label left</ui-radio-item>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ui-radio-item label="right">Enabled</ui-radio-item>
      <ui-radio-item disabled label="right">Disabled</ui-radio-item>
      <ui-radio-item disabled checked label="right"
        >Disabled checked</ui-radio-item
      >
      <ui-radio-item error label="right">Error</ui-radio-item>
      <ui-radio-item error checked label="right"
        >Error checked</ui-radio-item
      >
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ui-radio-item size="s" label="right"
        >I agree to the terms and conditions</ui-radio-item
      >
      <ui-radio-item size="m" label="right"
        >Subscribe to newsletter</ui-radio-item
      >
      <ui-radio-item size="l" label="right"
        >Remember my preferences</ui-radio-item
      >
    </div>
  `,
};

export const GroupVertical: Story = {
  render: () => html`
    <ui-radio-group size="m" orientation="vertical">
      <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
      <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
      <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
      <ui-radio-item label="right" value="4">Option 4</ui-radio-item>
    </ui-radio-group>
  `,
};

export const GroupHorizontal: Story = {
  render: () => html`
    <ui-radio-group size="m" orientation="horizontal">
      <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
      <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
      <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
      <ui-radio-item label="right" value="4">Option 4</ui-radio-item>
    </ui-radio-group>
  `,
};

export const GroupSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: S</p>
        <ui-radio-group size="s" orientation="vertical">
          <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
          <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
          <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: M</p>
        <ui-radio-group size="m" orientation="vertical">
          <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
          <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
          <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <p style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Size: L</p>
        <ui-radio-group size="l" orientation="vertical">
          <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
          <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
          <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
        </ui-radio-group>
      </div>
    </div>
  `,
};

export const GroupPreselected: Story = {
  render: () => html`
    <ui-radio-group size="m" orientation="vertical">
      <ui-radio-item label="right" value="a">Option A</ui-radio-item>
      <ui-radio-item label="right" value="b" checked>Option B (preselected)</ui-radio-item>
      <ui-radio-item label="right" value="c">Option C</ui-radio-item>
    </ui-radio-group>
  `,
};
