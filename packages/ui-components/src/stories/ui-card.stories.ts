import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { ICON_SHARE } from "@maneki/foundation";
import "../components/ui-card.js";
import "../components/ui-button.js";
import "../components/ui-image.js";

const meta: Meta = {
  title: "Components/Card",
  component: "ui-card",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    elevation: {
      control: { type: "select" },
      options: ["00", "01", "02", "04"],
    },
    bordered: { control: "boolean" },
  },
  args: {
    size: "m",
    elevation: "02",
    bordered: false,
  },
  render: (args) => html`
    <ui-card
      size=${args.size}
      elevation=${args.elevation}
      ?bordered=${args.bordered}
    >
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Card Title</h3>
      <p style="margin: 0; font-size: 14px;">
        This is a basic card with some body text content.
      </p>
    </ui-card>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-card style="max-width: 320px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Card Title</h3>
      <p style="margin: 0; font-size: 14px;">
        This is a basic card with some body text content.
      </p>
    </ui-card>
  `,
};

export const WithImage: Story = {
  render: () => html`
    <ui-card style="max-width: 320px;">
      <ui-image slot="image" ratio="16:9"></ui-image>
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Card Title</h3>
      <p style="margin: 0; font-size: 14px;">
        Card content below the image area.
      </p>
    </ui-card>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: start;">
      <ui-card size="s" style="flex: 1;">
        <h3 style="margin: 0; font-size: 14px; font-weight: 500;">Small</h3>
        <p style="margin: 0; font-size: 12px;">Size s card content.</p>
      </ui-card>
      <ui-card size="m" style="flex: 1;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Medium</h3>
        <p style="margin: 0; font-size: 14px;">Size m card content.</p>
      </ui-card>
      <ui-card size="l" style="flex: 1;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 500;">Large</h3>
        <p style="margin: 0; font-size: 16px;">Size l card content.</p>
      </ui-card>
    </div>
  `,
};

export const AllElevations: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: start;">
      <ui-card elevation="00" style="flex: 1;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 500;">
          Elevation 00
        </h3>
        <p style="margin: 0; font-size: 14px;">No shadow.</p>
      </ui-card>
      <ui-card elevation="01" style="flex: 1;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 500;">
          Elevation 01
        </h3>
        <p style="margin: 0; font-size: 14px;">Subtle shadow.</p>
      </ui-card>
      <ui-card elevation="02" style="flex: 1;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 500;">
          Elevation 02
        </h3>
        <p style="margin: 0; font-size: 14px;">Default shadow.</p>
      </ui-card>
      <ui-card elevation="04" style="flex: 1;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 500;">
          Elevation 04
        </h3>
        <p style="margin: 0; font-size: 14px;">Strong shadow.</p>
      </ui-card>
    </div>
  `,
};

export const Bordered: Story = {
  render: () => html`
    <ui-card bordered elevation="00" style="max-width: 320px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">
        Bordered Card
      </h3>
      <p style="margin: 0; font-size: 14px;">
        A card with a border and no elevation shadow.
      </p>
    </ui-card>
  `,
};

export const WithFooter: Story = {
  render: () => html`
    <ui-card style="max-width: 320px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Card Title</h3>
      <p style="margin: 0; font-size: 14px;">Card body content goes here.</p>
      <div slot="footer" style="display: flex; gap: 8px; padding: 0 16px 16px;">
        <ui-button action="primary" emphasis="bold" size="s">Confirm</ui-button>
        <ui-button action="secondary" emphasis="subtle" size="s">Cancel</ui-button>
      </div>
    </ui-card>
  `,
};

export const ImageCard: Story = {
  render: () => html`
    <ui-card style="max-width: 320px;">
      <ui-image
        slot="image"
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&h=360&fit=crop"
        alt="Featured article"
        ratio="16:9"
      ></ui-image>
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">
        Featured Article
      </h3>
      <p style="margin: 0; font-size: 14px;">
        A full card example with image, heading, body text, and an action
        button.
      </p>
      <div slot="footer" style="padding: 0 16px 16px;">
        <ui-button action="primary" emphasis="bold" size="s">Read More</ui-button>
      </div>
    </ui-card>
  `,
};

export const ArticleCard: Story = {
  render: () => html`
    <ui-card style="max-width: 320px;">
      <ui-image
        slot="image"
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&h=360&fit=crop"
        alt="Article headline"
        ratio="16:9"
      ></ui-image>
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">
        Article Headline
      </h3>
      <p style="margin: 0; font-size: 14px;">
        Brief summary of the article content that gives readers a preview of
        what to expect.
      </p>
      <div
        slot="footer"
        style="display: flex; justify-content: space-between; align-items: center; padding: 0 16px 16px;"
      >
        <span style="font-size: 12px; color: #5b7282;">5 min read</span>
        <span class="material-symbols-outlined" style="font-size: 20px; color: #5b7282;">${ICON_SHARE}</span>
      </div>
    </ui-card>
  `,
};
