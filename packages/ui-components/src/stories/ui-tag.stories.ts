import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-tag.js";

const meta: Meta = {
  title: "Components/Tag",
  component: "ui-tag",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m", "l"],
    },
    type: {
      control: { type: "select" },
      options: ["basic", "selectable", "toggle"],
    },
    emphasis: {
      control: { type: "select" },
      options: ["bold", "subtle", "minimal"],
    },
    state: {
      control: { type: "select" },
      options: ["enabled", "selected", "disabled"],
    },
    dismissible: {
      control: { type: "boolean" },
    },
    check: {
      control: { type: "boolean" },
    },
  },
  args: {
    size: "m",
    type: "basic",
    emphasis: "bold",
    state: "enabled",
    dismissible: false,
    check: false,
  },
  render: (args) => html`
    <ui-tag
      size=${args.size}
      type=${args.type}
      emphasis=${args.emphasis}
      state=${args.state}
      ?dismissible=${args.dismissible}
      ?check=${args.check}
    >
      Tag
    </ui-tag>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<ui-tag>Tag</ui-tag>`,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag size="xs">XS Tag</ui-tag>
      <ui-tag size="s">S Tag</ui-tag>
      <ui-tag size="m">M Tag</ui-tag>
      <ui-tag size="l">L Tag</ui-tag>
    </div>
  `,
};

export const Types: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag type="basic">Basic</ui-tag>
      <ui-tag type="selectable">Selectable</ui-tag>
      <ui-tag type="toggle">Toggle</ui-tag>
    </div>
  `,
};

export const Emphases: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag emphasis="bold">Bold</ui-tag>
      <ui-tag emphasis="subtle">Subtle</ui-tag>
      <ui-tag emphasis="minimal">Minimal</ui-tag>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag type="selectable" state="enabled">Enabled</ui-tag>
      <ui-tag type="selectable" state="selected">Selected</ui-tag>
      <ui-tag type="selectable" state="disabled">Disabled</ui-tag>
    </div>
  `,
};

export const Dismissible: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag dismissible>Dismissible</ui-tag>
      <ui-tag emphasis="subtle" dismissible>Subtle Dismissible</ui-tag>
      <ui-tag emphasis="minimal" dismissible>Minimal Dismissible</ui-tag>
    </div>
  `,
};

export const Check: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag check>With Check</ui-tag>
      <ui-tag emphasis="subtle" check>Subtle Check</ui-tag>
      <ui-tag emphasis="minimal" check>Minimal Check</ui-tag>
    </div>
  `,
};

export const DismissibleWithCheck: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag check dismissible>Bold</ui-tag>
      <ui-tag emphasis="subtle" check dismissible>Subtle</ui-tag>
      <ui-tag emphasis="minimal" check dismissible>Minimal</ui-tag>
    </div>
  `,
};

export const Colors: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <div style="margin-bottom: 4px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Bold emphasis</div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <ui-tag color="red">Red</ui-tag>
          <ui-tag color="yellow">Yellow</ui-tag>
          <ui-tag color="green">Green</ui-tag>
          <ui-tag color="blue">Blue</ui-tag>
          <ui-tag color="lime">Lime</ui-tag>
          <ui-tag color="teal">Teal</ui-tag>
          <ui-tag color="turquoise">Turquoise</ui-tag>
          <ui-tag color="aqua">Aqua</ui-tag>
          <ui-tag color="ultramarine">Ultramarine</ui-tag>
          <ui-tag color="pink">Pink</ui-tag>
          <ui-tag color="purple">Purple</ui-tag>
          <ui-tag color="orange">Orange</ui-tag>
          <ui-tag>None (default)</ui-tag>
        </div>
      </div>
      <div>
        <div style="margin-bottom: 4px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Subtle emphasis</div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <ui-tag color="red" emphasis="subtle">Red</ui-tag>
          <ui-tag color="yellow" emphasis="subtle">Yellow</ui-tag>
          <ui-tag color="green" emphasis="subtle">Green</ui-tag>
          <ui-tag color="blue" emphasis="subtle">Blue</ui-tag>
          <ui-tag color="lime" emphasis="subtle">Lime</ui-tag>
          <ui-tag color="teal" emphasis="subtle">Teal</ui-tag>
          <ui-tag color="turquoise" emphasis="subtle">Turquoise</ui-tag>
          <ui-tag color="aqua" emphasis="subtle">Aqua</ui-tag>
          <ui-tag color="ultramarine" emphasis="subtle">Ultramarine</ui-tag>
          <ui-tag color="pink" emphasis="subtle">Pink</ui-tag>
          <ui-tag color="purple" emphasis="subtle">Purple</ui-tag>
          <ui-tag color="orange" emphasis="subtle">Orange</ui-tag>
          <ui-tag emphasis="subtle">None (default)</ui-tag>
        </div>
      </div>
      <div>
        <div style="margin-bottom: 4px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Minimal emphasis</div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <ui-tag color="red" emphasis="minimal">Red</ui-tag>
          <ui-tag color="yellow" emphasis="minimal">Yellow</ui-tag>
          <ui-tag color="green" emphasis="minimal">Green</ui-tag>
          <ui-tag color="blue" emphasis="minimal">Blue</ui-tag>
          <ui-tag color="lime" emphasis="minimal">Lime</ui-tag>
          <ui-tag color="teal" emphasis="minimal">Teal</ui-tag>
          <ui-tag color="turquoise" emphasis="minimal">Turquoise</ui-tag>
          <ui-tag color="aqua" emphasis="minimal">Aqua</ui-tag>
          <ui-tag color="ultramarine" emphasis="minimal">Ultramarine</ui-tag>
          <ui-tag color="pink" emphasis="minimal">Pink</ui-tag>
          <ui-tag color="purple" emphasis="minimal">Purple</ui-tag>
          <ui-tag color="orange" emphasis="minimal">Orange</ui-tag>
          <ui-tag emphasis="minimal">None (default)</ui-tag>
        </div>
      </div>
    </div>
  `,
};

export const Interaction: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <div style="margin-bottom: 4px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Selectable — click to toggle</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <ui-tag type="selectable">Click me</ui-tag>
          <ui-tag type="selectable" check>With check</ui-tag>
          <ui-tag type="selectable" size="s">Small</ui-tag>
          <ui-tag type="selectable" size="l">Large</ui-tag>
        </div>
      </div>
      <div>
        <div style="margin-bottom: 4px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Dismissible — click close icon</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <ui-tag dismissible>Dismiss me</ui-tag>
          <ui-tag emphasis="subtle" dismissible>Subtle</ui-tag>
          <ui-tag emphasis="minimal" dismissible>Minimal</ui-tag>
        </div>
      </div>
      <div>
        <div style="margin-bottom: 4px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Check + Dismissible</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <ui-tag check dismissible>Bold</ui-tag>
          <ui-tag emphasis="subtle" check dismissible>Subtle</ui-tag>
          <ui-tag emphasis="minimal" check dismissible>Minimal</ui-tag>
        </div>
      </div>
      <div>
        <div style="margin-bottom: 4px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Disabled selectable — non-interactive</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <ui-tag type="selectable" state="disabled">Disabled</ui-tag>
          <ui-tag type="selectable" state="disabled" check>Disabled check</ui-tag>
          <ui-tag type="selectable" state="disabled" dismissible>Disabled dismiss</ui-tag>
        </div>
      </div>
    </div>
  `,
};

export const AddNewTag: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ui-tag emphasis="subtle">Existing Tag</ui-tag>
      <ui-tag emphasis="subtle">Another Tag</ui-tag>
      <ui-tag editable>New tag</ui-tag>
    </div>
  `,
};
