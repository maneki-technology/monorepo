import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-input-group.js";
import "../components/ui-input.js";

const meta: Meta = {
  title: "Components/Input Group",
  component: "ui-input-group",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    size: "m",
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-input-group style="width: 360px;">
      <span slot="prefix">https://</span>
      <ui-input placeholder="www.example.com"></ui-input>
      <span slot="suffix">Open URL</span>
    </ui-input-group>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
      <ui-input-group size="s">
        <span slot="prefix">https://</span>
        <ui-input size="s" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="m">
        <span slot="prefix">https://</span>
        <ui-input size="m" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="l">
        <span slot="prefix">https://</span>
        <ui-input size="l" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
    </div>
  `,
};

export const PrefixOnly: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
      <ui-input-group size="m">
        <span slot="prefix">https://</span>
        <ui-input placeholder="www.example.com"></ui-input>
      </ui-input-group>
      <ui-input-group size="m">
        <span slot="prefix">$</span>
        <ui-input placeholder="0.00"></ui-input>
      </ui-input-group>
    </div>
  `,
};

export const SuffixOnly: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
      <ui-input-group size="m">
        <ui-input placeholder="0" value="72"></ui-input>
        <span slot="suffix">kg</span>
      </ui-input-group>
      <ui-input-group size="m">
        <ui-input placeholder="Enter email"></ui-input>
        <span slot="suffix">@gmail.com</span>
      </ui-input-group>
    </div>
  `,
};
