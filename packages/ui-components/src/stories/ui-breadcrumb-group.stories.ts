import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-breadcrumb-item.js";
import "../components/ui-breadcrumb-group.js";

const meta: Meta = {
  title: "Components/Breadcrumb Group",
  component: "ui-breadcrumb-group",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
  },
  args: {
    size: "m",
  },
  render: (args) => html`
    <ui-breadcrumb-group size=${args.size}>
      <ui-breadcrumb-item href="/home">Home</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products">Products</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products/shoes">Shoes</ui-breadcrumb-item>
      <ui-breadcrumb-item>Running Shoes</ui-breadcrumb-item>
    </ui-breadcrumb-group>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-breadcrumb-group>
      <ui-breadcrumb-item href="/home">Home</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products">Products</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products/shoes">Shoes</ui-breadcrumb-item>
      <ui-breadcrumb-item>Running Shoes</ui-breadcrumb-item>
    </ui-breadcrumb-group>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Size: s</div>
        <ui-breadcrumb-group size="s" aria-label="Small breadcrumb">
          <ui-breadcrumb-item href="/home">Home</ui-breadcrumb-item>
          <ui-breadcrumb-item href="/docs">Docs</ui-breadcrumb-item>
          <ui-breadcrumb-item>Current</ui-breadcrumb-item>
        </ui-breadcrumb-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Size: m</div>
        <ui-breadcrumb-group size="m" aria-label="Medium breadcrumb">
          <ui-breadcrumb-item href="/home">Home</ui-breadcrumb-item>
          <ui-breadcrumb-item href="/docs">Docs</ui-breadcrumb-item>
          <ui-breadcrumb-item>Current</ui-breadcrumb-item>
        </ui-breadcrumb-group>
      </div>
      <div>
        <div style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Size: l</div>
        <ui-breadcrumb-group size="l" aria-label="Large breadcrumb">
          <ui-breadcrumb-item href="/home">Home</ui-breadcrumb-item>
          <ui-breadcrumb-item href="/docs">Docs</ui-breadcrumb-item>
          <ui-breadcrumb-item>Current</ui-breadcrumb-item>
        </ui-breadcrumb-group>
      </div>
    </div>
  `,
};

export const WithManyItems: Story = {
  render: () => html`
    <ui-breadcrumb-group>
      <ui-breadcrumb-item href="/home">Home</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products">Products</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products/clothing">Clothing</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products/clothing/mens">Men's</ui-breadcrumb-item>
      <ui-breadcrumb-item href="/products/clothing/mens/shirts">Shirts</ui-breadcrumb-item>
      <ui-breadcrumb-item>Oxford Button-Down</ui-breadcrumb-item>
    </ui-breadcrumb-group>
  `,
};
