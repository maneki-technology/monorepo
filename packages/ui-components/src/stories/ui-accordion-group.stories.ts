import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-accordion-item.js";
import "../components/ui-accordion-group.js";

const meta: Meta = {
  title: "Components/Accordion Group",
  component: "ui-accordion-group",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    emphasis: { control: { type: "select" }, options: ["bold", "subtle"] },
    exclusive: { control: "boolean" },
  },
  args: {
    size: "m",
    emphasis: "subtle",
    exclusive: false,
  },
  render: (args) => html`
    <ui-accordion-group
      size=${args.size}
      emphasis=${args.emphasis}
      ?exclusive=${args.exclusive}
    >
      <ui-accordion-item>
        <span slot="label">Section One</span>
        Content for section one.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Two</span>
        Content for section two.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Three</span>
        Content for section three.
      </ui-accordion-item>
    </ui-accordion-group>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Exclusive: Story = {
  render: () => html`
    <ui-accordion-group exclusive>
      <ui-accordion-item expanded>
        <span slot="label">Section One</span>
        Content for section one.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Two</span>
        Content for section two.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Three</span>
        Content for section three.
      </ui-accordion-item>
    </ui-accordion-group>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h3 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Small</h3>
        <ui-accordion-group size="s">
          <ui-accordion-item>
            <span slot="label">Small Item One</span>
            Content for small item one.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Small Item Two</span>
            Content for small item two.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Small Item Three</span>
            Content for small item three.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
      <div>
        <h3 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Medium</h3>
        <ui-accordion-group size="m">
          <ui-accordion-item>
            <span slot="label">Medium Item One</span>
            Content for medium item one.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Medium Item Two</span>
            Content for medium item two.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Medium Item Three</span>
            Content for medium item three.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
      <div>
        <h3 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;">Large</h3>
        <ui-accordion-group size="l">
          <ui-accordion-item>
            <span slot="label">Large Item One</span>
            Content for large item one.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Large Item Two</span>
            Content for large item two.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Large Item Three</span>
            Content for large item three.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
    </div>
  `,
};

export const BoldEmphasis: Story = {
  render: () => html`
    <ui-accordion-group emphasis="bold">
      <ui-accordion-item>
        <span slot="label">Section One</span>
        Content for section one.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Two</span>
        Content for section two.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Three</span>
        Content for section three.
      </ui-accordion-item>
    </ui-accordion-group>
  `,
};
