import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-side-panel-menu.js";
import "../components/ui-side-panel-menu-item.js";

// Material Symbols icon helper (font loaded in .storybook/preview.ts)
const icon = (name: string) =>
  html`<span slot="icon" class="material-symbols-outlined" style="font-size: 20px;">${name}</span>`;

const meta: Meta = {
  title: "Components/Side Panel Menu",
  component: "ui-side-panel-menu",
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["expanded", "collapsed"],
    },
    overlay: { control: { type: "boolean" } },
    title: { control: { type: "text" } },
  },
  args: {
    state: "expanded",
    overlay: false,
    title: "Navigation",
  },
  decorators: [
    (story) => html`
      <div style="height: 500px; display: flex;">
        ${story()}
        <div style="flex: 1; padding: 24px; background: #fff;">
          <p style="margin: 0; color: #1c2b36; font-family: Goldman Sans, sans-serif;">
            Main content area
          </p>
        </div>
      </div>
    `,
  ],
};
export default meta;
type Story = StoryObj;

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => html`
    <ui-side-panel-menu
      state=${args.state}
      ?overlay=${args.overlay}
      title=${args.title}
    >
      <ui-side-panel-menu-item leading-icon>
        ${icon("home")}
        Dashboard
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon selected>
        ${icon("person")}
        Profile
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("bar_chart")}
        Analytics
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("mail")}
        Messages
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("settings")}
        Settings
      </ui-side-panel-menu-item>
    </ui-side-panel-menu>
  `,
};

// ── With Nested Items ────────────────────────────────────────────────────────

export const WithNestedItems: Story = {
  render: () => html`
    <ui-side-panel-menu title="Navigation">
      <ui-side-panel-menu-item leading-icon>
        ${icon("home")}
        Dashboard
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon expandable expanded child-parent-selected>
        ${icon("group")}
        Users
        <ui-side-panel-menu-item slot="children" level="secondary" child-parent-selected>
          All Users
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item slot="children" level="secondary" selected>
          Active Users
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item slot="children" level="secondary">
          Inactive Users
        </ui-side-panel-menu-item>
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon expandable>
        ${icon("bar_chart")}
        Reports
        <ui-side-panel-menu-item slot="children" level="secondary">
          Monthly
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item slot="children" level="secondary">
          Quarterly
        </ui-side-panel-menu-item>
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("settings")}
        Settings
      </ui-side-panel-menu-item>
    </ui-side-panel-menu>
  `,
};

// ── Collapsed ────────────────────────────────────────────────────────────────

export const Collapsed: Story = {
  render: () => html`
    <ui-side-panel-menu state="collapsed" title="Navigation">
      <ui-side-panel-menu-item leading-icon>
        ${icon("home")}
        Dashboard
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon selected>
        ${icon("person")}
        Profile
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("bar_chart")}
        Analytics
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("mail")}
        Messages
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("settings")}
        Settings
      </ui-side-panel-menu-item>
    </ui-side-panel-menu>
  `,
};

// ── Overlay ──────────────────────────────────────────────────────────────────

export const Overlay: Story = {
  render: () => html`
    <ui-side-panel-menu overlay title="Navigation">
      <ui-side-panel-menu-item leading-icon>
        ${icon("home")}
        Dashboard
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon selected>
        ${icon("person")}
        Profile
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("bar_chart")}
        Analytics
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("mail")}
        Messages
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("settings")}
        Settings
      </ui-side-panel-menu-item>
    </ui-side-panel-menu>
  `,
};

// ── All States ───────────────────────────────────────────────────────────────

export const AllStates: Story = {
  decorators: [
    (story) => html`
      <div style="height: 600px; display: flex;">
        ${story()}
      </div>
    `,
  ],
  render: () => html`
    <ui-side-panel-menu title="Item States">
      <ui-side-panel-menu-item leading-icon>
        ${icon("home")}
        Enabled
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon selected>
        ${icon("person")}
        Selected
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon child-parent-selected>
        ${icon("bar_chart")}
        Child/Parent Selected
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon disabled>
        ${icon("mail")}
        Disabled
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon expandable>
        ${icon("settings")}
        Expandable (Collapsed)
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon expandable expanded child-parent-selected>
        ${icon("group")}
        Expandable (Expanded)
        <ui-side-panel-menu-item slot="children" level="secondary">
          Secondary Item
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item slot="children" level="secondary" selected>
          Secondary Selected
        </ui-side-panel-menu-item>
      </ui-side-panel-menu-item>
    </ui-side-panel-menu>
  `,
};

// ── Levels ───────────────────────────────────────────────────────────────────

export const Levels: Story = {
  decorators: [
    (story) => html`
      <div style="height: 400px; display: flex;">
        ${story()}
      </div>
    `,
  ],
  render: () => html`
    <ui-side-panel-menu title="Levels">
      <ui-side-panel-menu-item leading-icon>
        ${icon("home")}
        Primary Level
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item level="secondary">
        Secondary Level
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item level="tertiary">
        Tertiary Level
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("person")}
        Primary Level
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item level="secondary" selected>
        Secondary Selected
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item level="tertiary" selected>
        Tertiary Selected
      </ui-side-panel-menu-item>
    </ui-side-panel-menu>
  `,
};

// ── Mobile ───────────────────────────────────────────────────────────────────

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "On viewports ≤ 767px the panel auto-collapses. Clicking the toggle expands it as a full-width overlay. Resize the browser below 768px to see it in action.",
      },
    },
  },
  decorators: [
    (story) => html`
      <div style="height: 500px; display: flex; position: relative;">
        ${story()}
        <div style="flex: 1; padding: 24px; background: #fff;">
          <p style="margin: 0; color: #1c2b36; font-family: Goldman Sans, sans-serif;">
            Main content area — resize below 768px to see mobile behavior
          </p>
        </div>
      </div>
    `,
  ],
  render: () => html`
    <ui-side-panel-menu title="Navigation">
      <ui-side-panel-menu-item leading-icon>
        ${icon("home")}
        Dashboard
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon selected>
        ${icon("person")}
        Profile
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon expandable>
        ${icon("group")}
        Users
        <ui-side-panel-menu-item slot="children" level="secondary">
          All Users
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item slot="children" level="secondary">
          Active Users
        </ui-side-panel-menu-item>
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("bar_chart")}
        Analytics
      </ui-side-panel-menu-item>
      <ui-side-panel-menu-item leading-icon>
        ${icon("settings")}
        Settings
      </ui-side-panel-menu-item>
    </ui-side-panel-menu>
  `,
};
