import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { ICON_CODEPOINTS } from "@maneki/foundation";
import "../components/ui-icon.js";

const meta: Meta = {
  title: "Components/Icon",
  component: "ui-icon",
  argTypes: {
    name: {
      control: { type: "select" },
      options: Object.keys(ICON_CODEPOINTS),
    },
    size: {
      control: { type: "select" },
      options: ["xxs", "xs", "s", "m", "l"],
    },
    state: {
      control: { type: "select" },
      options: [
        "enabled",
        "enabled-inverse",
        "hover",
        "hover-inverse",
        "active",
        "active-inverse",
        "focus",
        "focus-inverse",
        "disabled",
        "disabled-inverse",
      ],
    },
    filled: {
      control: { type: "boolean" },
    },
    label: {
      control: { type: "text" },
    },
  },
  args: {
    name: "home",
    size: "s",
    state: "enabled",
    filled: false,
    label: "",
  },
  render: (args) => html`
    <ui-icon
      name=${args.name}
      size=${args.size}
      state=${args.state}
      ?filled=${args.filled}
      label=${args.label || ""}
    ></ui-icon>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<ui-icon name="home"></ui-icon>`,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="xxs"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">xxs (12)</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="xs"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">xs (14)</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="s"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">s (16)</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">m (20)</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="l"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">l (24)</span>
      </div>
    </div>
  `,
};

export const AllStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="enabled"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">enabled</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="hover"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">hover</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="active"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">active</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="focus"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">focus</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="disabled"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">disabled</span>
      </div>
    </div>
  `,
};

export const AllStatesInverse: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; background: #1C2B36; padding: 24px; border-radius: 8px;"
    >
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="enabled-inverse"></ui-icon>
        <span style="font-size: 11px; color: rgba(255,255,255,0.6);">enabled</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="hover-inverse"></ui-icon>
        <span style="font-size: 11px; color: rgba(255,255,255,0.6);">hover</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="active-inverse"></ui-icon>
        <span style="font-size: 11px; color: rgba(255,255,255,0.6);">active</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="focus-inverse"></ui-icon>
        <span style="font-size: 11px; color: rgba(255,255,255,0.6);">focus</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" state="disabled-inverse"></ui-icon>
        <span style="font-size: 11px; color: rgba(255,255,255,0.6);">disabled</span>
      </div>
    </div>
  `,
};

export const Filled: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">outlined</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="home" size="m" filled></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">filled</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="settings" size="m"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">outlined</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="settings" size="m" filled></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">filled</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="check_circle" size="m"></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">outlined</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <ui-icon name="check_circle" size="m" filled></ui-icon>
        <span style="font-size: 11px; color: #6b7280;">filled</span>
      </div>
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <ui-icon name="home" size="m" label="Home"></ui-icon>
      <ui-icon name="settings" size="m" label="Settings"></ui-icon>
      <ui-icon name="person" size="m" label="User profile"></ui-icon>
    </div>
  `,
};

export const IconGrid: Story = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 16px;"
    >
      ${Object.keys(ICON_CODEPOINTS).map(
        (name) => html`
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 4px;"
          >
            <ui-icon name=${name} size="m"></ui-icon>
            <span
              style="font-size: 10px; color: #6b7280; text-align: center; word-break: break-all;"
              >${name}</span
            >
          </div>
        `,
      )}
    </div>
  `,
};
