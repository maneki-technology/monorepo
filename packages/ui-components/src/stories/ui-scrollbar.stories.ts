import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-scrollbar.js";

const meta: Meta = {
  title: "Components/Scrollbar",
  component: "ui-scrollbar",
  argTypes: {
    emphasis: {
      control: { type: "select" },
      options: ["bold", "minimal"],
    },
    orientation: {
      control: { type: "select" },
      options: ["vertical", "horizontal"],
    },
  },
};

export default meta;
type Story = StoryObj;

const TALL_CONTENT = html`
  <div style="padding: 16px;">
    ${Array.from(
      { length: 20 },
      (_, i) => html`<p style="margin: 0 0 12px;">Line ${i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`,
    )}
  </div>
`;

const WIDE_CONTENT = html`
  <div style="white-space: nowrap; padding: 16px;">
    ${Array.from(
      { length: 10 },
      (_, i) =>
        html`<p style="margin: 0 0 12px;">
          Row ${i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>`,
    )}
  </div>
`;

const wrapperStyle = "width: 300px; height: 200px; border: 1px solid #dce3e8; border-radius: 4px;";

export const BoldVertical: Story = {
  args: {
    emphasis: "bold",
    orientation: "vertical",
  },
  render: (args) =>
    html`<ui-scrollbar
      emphasis=${args.emphasis}
      orientation=${args.orientation}
      style=${wrapperStyle}
    >${TALL_CONTENT}</ui-scrollbar>`,
};

export const BoldHorizontal: Story = {
  args: {
    emphasis: "bold",
    orientation: "horizontal",
  },
  render: (args) =>
    html`<ui-scrollbar
      emphasis=${args.emphasis}
      orientation=${args.orientation}
      style=${wrapperStyle}
    >${WIDE_CONTENT}</ui-scrollbar>`,
};

export const MinimalVertical: Story = {
  args: {
    emphasis: "minimal",
    orientation: "vertical",
  },
  render: (args) =>
    html`<ui-scrollbar
      emphasis=${args.emphasis}
      orientation=${args.orientation}
      style=${wrapperStyle}
    >${TALL_CONTENT}</ui-scrollbar>`,
};

export const MinimalHorizontal: Story = {
  args: {
    emphasis: "minimal",
    orientation: "horizontal",
  },
  render: (args) =>
    html`<ui-scrollbar
      emphasis=${args.emphasis}
      orientation=${args.orientation}
      style=${wrapperStyle}
    >${WIDE_CONTENT}</ui-scrollbar>`,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 700px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Bold / Vertical</p>
        <ui-scrollbar emphasis="bold" orientation="vertical" style=${wrapperStyle}>
          ${TALL_CONTENT}
        </ui-scrollbar>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Bold / Horizontal</p>
        <ui-scrollbar emphasis="bold" orientation="horizontal" style=${wrapperStyle}>
          ${WIDE_CONTENT}
        </ui-scrollbar>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Minimal / Vertical</p>
        <ui-scrollbar emphasis="minimal" orientation="vertical" style=${wrapperStyle}>
          ${TALL_CONTENT}
        </ui-scrollbar>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Minimal / Horizontal</p>
        <ui-scrollbar emphasis="minimal" orientation="horizontal" style=${wrapperStyle}>
          ${WIDE_CONTENT}
        </ui-scrollbar>
      </div>
    </div>
  `,
};
