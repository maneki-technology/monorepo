import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-avatar.js";

const meta: Meta = {
  title: "Components/Avatar",
  component: "ui-avatar",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m", "l", "xl"],
    },
    type: { control: { type: "select" }, options: ["text", "icon", "image"] },
    emphasis: { control: { type: "select" }, options: ["bold", "subtle"] },
    shape: { control: { type: "select" }, options: ["circle", "square"] },
    status: {
      control: { type: "select" },
      options: ["none", "error", "warning", "success", "information"],
    },
    color: {
      control: { type: "select" },
      options: [
        "none",
        "gray",
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "lime",
        "teal",
        "turquoise",
        "aqua",
        "ultramarine",
        "purple",
        "pink",
      ],
    },
  },
  args: {
    size: "m",
    type: "text",
    emphasis: "bold",
    shape: "circle",
    status: "none",
    color: "none",
  },
  render: (args) => html`
    <ui-avatar
      size=${args.size}
      type=${args.type}
      emphasis=${args.emphasis}
      shape=${args.shape}
      status=${args.status}
      color=${args.color}
    >
      GS
    </ui-avatar>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html` <ui-avatar>GS</ui-avatar> `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 12px;">
      <ui-avatar size="xs">G</ui-avatar>
      <ui-avatar size="s">GS</ui-avatar>
      <ui-avatar size="m">GS</ui-avatar>
      <ui-avatar size="l">GS</ui-avatar>
      <ui-avatar size="xl">GS</ui-avatar>
    </div>
  `,
};

export const TextType: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 12px;">
      <ui-avatar type="text" color="blue">AB</ui-avatar>
      <ui-avatar type="text" color="red">CD</ui-avatar>
      <ui-avatar type="text" color="green">EF</ui-avatar>
      <ui-avatar type="text" color="purple">GH</ui-avatar>
      <ui-avatar type="text" color="orange">IJ</ui-avatar>
    </div>
  `,
};

export const IconType: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 12px;">
      <ui-avatar type="icon" size="xs"></ui-avatar>
      <ui-avatar type="icon" size="s"></ui-avatar>
      <ui-avatar type="icon" size="m"></ui-avatar>
      <ui-avatar type="icon" size="l"></ui-avatar>
      <ui-avatar type="icon" size="xl"></ui-avatar>
    </div>
  `,
};

export const ImageType: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 12px;">
      <ui-avatar type="image" size="s">
        <img
          slot="image"
          src="https://i.pravatar.cc/48?img=1"
          alt="User avatar"
        />
      </ui-avatar>
      <ui-avatar type="image" size="m">
        <img
          slot="image"
          src="https://i.pravatar.cc/48?img=2"
          alt="User avatar"
        />
      </ui-avatar>
      <ui-avatar type="image" size="l">
        <img
          slot="image"
          src="https://i.pravatar.cc/48?img=3"
          alt="User avatar"
        />
      </ui-avatar>
      <ui-avatar type="image" size="xl">
        <img
          slot="image"
          src="https://i.pravatar.cc/48?img=4"
          alt="User avatar"
        />
      </ui-avatar>
    </div>
  `,
};

export const CircleVsSquare: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 16px;">
      <ui-avatar shape="circle" color="blue">GS</ui-avatar>
      <ui-avatar shape="square" color="blue">GS</ui-avatar>
      <ui-avatar shape="circle" type="icon" color="green"></ui-avatar>
      <ui-avatar shape="square" type="icon" color="green"></ui-avatar>
    </div>
  `,
};

export const BoldVsSubtle: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 16px;">
      <ui-avatar emphasis="bold" color="blue">GS</ui-avatar>
      <ui-avatar emphasis="subtle" color="blue">GS</ui-avatar>
      <ui-avatar emphasis="bold" type="icon" color="red"></ui-avatar>
      <ui-avatar emphasis="subtle" type="icon" color="red"></ui-avatar>
    </div>
  `,
};

export const ColorVariants: Story = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(7, auto); gap: 8px; align-items: center;"
    >
      <ui-avatar color="none">GS</ui-avatar>
      <ui-avatar color="gray">GS</ui-avatar>
      <ui-avatar color="red">GS</ui-avatar>
      <ui-avatar color="orange">GS</ui-avatar>
      <ui-avatar color="yellow">GS</ui-avatar>
      <ui-avatar color="green">GS</ui-avatar>
      <ui-avatar color="blue">GS</ui-avatar>
      <ui-avatar color="lime">GS</ui-avatar>
      <ui-avatar color="teal">GS</ui-avatar>
      <ui-avatar color="turquoise">GS</ui-avatar>
      <ui-avatar color="aqua">GS</ui-avatar>
      <ui-avatar color="ultramarine">GS</ui-avatar>
      <ui-avatar color="purple">GS</ui-avatar>
      <ui-avatar color="pink">GS</ui-avatar>
    </div>
  `,
};

export const StatusVariants: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 12px;">
      <ui-avatar status="none">GS</ui-avatar>
      <ui-avatar status="error">GS</ui-avatar>
      <ui-avatar status="warning">GS</ui-avatar>
      <ui-avatar status="success">GS</ui-avatar>
      <ui-avatar status="information">GS</ui-avatar>
    </div>
  `,
};
