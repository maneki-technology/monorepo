import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-side-panel.js";

const meta: Meta = {
  title: "Navigation/SidePanel",
  component: "ui-side-panel",
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["expanded", "collapsed"],
    },
    overlay: {
      control: { type: "boolean" },
    },
    title: {
      control: { type: "text" },
    },
  },
  args: {
    state: "expanded",
    overlay: false,
    title: "Panel Title",
  },
  render: (args) => html`
    <div style="height: 400px; display: flex;">
      <ui-side-panel
        state=${args.state}
        ?overlay=${args.overlay}
        title=${args.title}
      >
        <div style="padding: 16px; font-family: Geist, sans-serif; font-size: 14px; color: #3e5463;">
          Panel body content goes here.
        </div>
      </ui-side-panel>
    </div>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Collapsed: Story = {
  args: {
    state: "collapsed",
  },
};

export const Overlay: Story = {
  args: {
    state: "expanded",
    overlay: true,
  },
};

export const WithContent: Story = {
  args: {
    state: "expanded",
    title: "Navigation",
  },
  render: (args) => html`
    <div style="height: 400px; display: flex;">
      <ui-side-panel
        state=${args.state}
        ?overlay=${args.overlay}
        title=${args.title}
      >
        <ul style="list-style: none; margin: 0; padding: 8px 0; font-family: Geist, sans-serif; font-size: 14px; color: #3e5463;">
          <li style="padding: 8px 16px;">Dashboard</li>
          <li style="padding: 8px 16px;">Settings</li>
          <li style="padding: 8px 16px;">Users</li>
          <li style="padding: 8px 16px;">Reports</li>
          <li style="padding: 8px 16px;">Help</li>
        </ul>
      </ui-side-panel>
    </div>
  `,
};
