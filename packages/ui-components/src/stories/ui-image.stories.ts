import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-image.js";

const meta: Meta = {
  title: "Components/Image",
  component: "ui-image",
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    ratio: {
      control: { type: "select" },
      options: ["", "16:9", "3:2", "1:1", "3:1", "21:9"],
    },
    fit: {
      control: { type: "select" },
      options: ["cover", "contain", "fill", "none"],
    },
  },
  args: {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop",
    alt: "Landscape",
    ratio: "16:9",
    fit: "cover",
  },
  render: (args) => html`
    <ui-image
      src=${args.src}
      alt=${args.alt}
      ratio=${args.ratio}
      fit=${args.fit}
      style="max-width: 480px;"
    ></ui-image>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const AspectRatios: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 480px;">
      <div>
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">16:9</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="16:9 landscape"
          ratio="16:9"
        ></ui-image>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">3:2</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="3:2 landscape"
          ratio="3:2"
        ></ui-image>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">1:1</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="1:1 landscape"
          ratio="1:1"
        ></ui-image>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">3:1</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="3:1 landscape"
          ratio="3:1"
        ></ui-image>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">21:9</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="21:9 landscape"
          ratio="21:9"
        ></ui-image>
      </div>
    </div>
  `,
};

export const Placeholder: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; max-width: 720px;">
      <div style="flex: 1;">
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">No src (default bg)</p>
        <ui-image ratio="16:9"></ui-image>
      </div>
      <div style="flex: 1;">
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">Custom placeholder</p>
        <ui-image ratio="16:9">
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #5b7282; font-size: 14px;">
            No image available
          </div>
        </ui-image>
      </div>
    </div>
  `,
};

export const ObjectFit: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; max-width: 720px;">
      <div style="flex: 1;">
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">cover (default)</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="Cover"
          ratio="1:1"
          fit="cover"
        ></ui-image>
      </div>
      <div style="flex: 1;">
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">contain</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="Contain"
          ratio="1:1"
          fit="contain"
        ></ui-image>
      </div>
      <div style="flex: 1;">
        <p style="margin: 0 0 8px; font-size: 13px; font-family: monospace;">fill</p>
        <ui-image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop"
          alt="Fill"
          ratio="1:1"
          fit="fill"
        ></ui-image>
      </div>
    </div>
  `,
};

export const InCard: Story = {
  render: () => html`
    <ui-card style="max-width: 320px;">
      <ui-image
        slot="image"
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&h=360&fit=crop"
        alt="Card image"
        ratio="16:9"
      ></ui-image>
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Card with Image</h3>
      <p style="margin: 0; font-size: 14px;">
        Using ui-image inside a card's image slot.
      </p>
    </ui-card>
  `,
};
