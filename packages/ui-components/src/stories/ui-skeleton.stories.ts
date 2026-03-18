import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-skeleton.js";

const meta: Meta = {
  title: "Components/Skeleton",
  component: "ui-skeleton",
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["text", "circle", "rect"],
    },
    width: { control: { type: "text" } },
    height: { control: { type: "text" } },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    variant: "text",
  },
  render: (args) =>
    html`<ui-skeleton
      variant=${args.variant}
      style="width:100%"
    ></ui-skeleton>`,
};

export const TextLines: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:8px; max-width:480px;">
      <ui-skeleton variant="text" width="100%"></ui-skeleton>
      <ui-skeleton variant="text" width="92%"></ui-skeleton>
      <ui-skeleton variant="text" width="85%"></ui-skeleton>
      <ui-skeleton variant="text" width="40%"></ui-skeleton>
    </div>
  `,
};

export const Circle: Story = {
  render: () =>
    html`<ui-skeleton variant="circle" width="48" height="48"></ui-skeleton>`,
};

export const Rect: Story = {
  render: () =>
    html`<ui-skeleton
      variant="rect"
      width="100%"
      height="192"
    ></ui-skeleton>`,
};

export const CardSkeleton: Story = {
  render: () => html`
    <div
      style="max-width:320px; padding:16px; border:1px solid #dce3e8; border-radius:8px; display:flex; flex-direction:column; gap:12px;"
    >
      <ui-skeleton variant="rect" width="100%" height="192"></ui-skeleton>
      <div style="display:flex; align-items:center; gap:12px;">
        <ui-skeleton variant="circle" width="40" height="40"></ui-skeleton>
        <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
          <ui-skeleton variant="text" width="60%"></ui-skeleton>
          <ui-skeleton variant="text" width="40%"></ui-skeleton>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <ui-skeleton variant="text" width="100%"></ui-skeleton>
        <ui-skeleton variant="text" width="90%"></ui-skeleton>
        <ui-skeleton variant="text" width="70%"></ui-skeleton>
      </div>
    </div>
  `,
};

export const ListSkeleton: Story = {
  render: () => html`
    <div
      style="max-width:480px; display:flex; flex-direction:column; gap:16px;"
    >
      ${[0, 1, 2].map(
        () => html`
          <div style="display:flex; align-items:center; gap:12px;">
            <ui-skeleton
              variant="circle"
              width="36"
              height="36"
            ></ui-skeleton>
            <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
              <ui-skeleton variant="text" width="50%"></ui-skeleton>
              <ui-skeleton variant="text" width="80%"></ui-skeleton>
            </div>
          </div>
        `,
      )}
    </div>
  `,
};
