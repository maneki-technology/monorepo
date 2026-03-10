import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-select.js";
import "../components/ui-dropdown-item.js";
import "../components/ui-dropdown-heading.js";
import "../components/ui-dropdown-separator.js";

const meta: Meta = {
  title: "Components/Select",
  component: "ui-select",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    status: {
      control: { type: "select" },
      options: ["none", "warning", "error", "success", "loading"],
    },
    label: { control: "text" },
    "secondary-label": { control: "text" },
    supportive: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    multiple: { control: "boolean" },
    error: { control: "boolean" },
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    size: "m",
    status: "none",
    label: "",
    "secondary-label": "",
    supportive: "",
    placeholder: "Select an option",
    disabled: false,
    readonly: false,
    multiple: false,
    error: false,
  },
  render: (args) => html`
    <ui-select
      size=${args.size}
      status=${args.status}
      label=${args.label || undefined}
      secondary-label=${args["secondary-label"] || undefined}
      supportive=${args.supportive || undefined}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?multiple=${args.multiple}
      ?error=${args.error}
    >
      <ui-dropdown-item value="apple">Apple</ui-dropdown-item>
      <ui-dropdown-item value="banana">Banana</ui-dropdown-item>
      <ui-dropdown-item value="cherry">Cherry</ui-dropdown-item>
      <ui-dropdown-item value="date">Date</ui-dropdown-item>
      <ui-dropdown-item value="elderberry">Elderberry</ui-dropdown-item>
    </ui-select>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-select label="Fruit" supportive="Pick your favorite fruit" placeholder="Select a fruit">
      <ui-dropdown-item value="apple">Apple</ui-dropdown-item>
      <ui-dropdown-item value="banana">Banana</ui-dropdown-item>
      <ui-dropdown-item value="cherry">Cherry</ui-dropdown-item>
    </ui-select>
  `,
};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap;">
      <div style="display: flex; flex-direction: column; gap: 16px; width: 280px;">
        <h4 style="margin: 0; font-family: Inter, sans-serif; font-size: 13px; color: #3e5463;">Without Labels</h4>
        <ui-select size="s" placeholder="Small (S)">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
        <ui-select size="m" placeholder="Medium (M)">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
        <ui-select size="l" placeholder="Large (L)">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px; width: 280px;">
        <h4 style="margin: 0; font-family: Inter, sans-serif; font-size: 13px; color: #3e5463;">With Labels</h4>
        <ui-select size="s" label="Label" supportive="Supportive Text" placeholder="Small (S)">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
        <ui-select size="m" label="Label" supportive="Supportive Text" placeholder="Medium (M)">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
        <ui-select size="l" label="Label" supportive="Supportive Text" placeholder="Large (L)">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, 280px); gap: 24px;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Enabled</span>
        <ui-select label="Label" supportive="Supportive Text" placeholder="Select an option">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Filled (Single)</span>
        <ui-select label="Label" supportive="Supportive Text" value="a">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Filled (Multi)</span>
        <ui-select label="Label" supportive="Supportive Text" multiple value="a,b">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
          <ui-dropdown-item value="c">Option C</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Disabled</span>
        <ui-select label="Label" supportive="Supportive Text" disabled placeholder="Select an option">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Read Only</span>
        <ui-select label="Label" supportive="Supportive Text" readonly value="a">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
    </div>
  `,
};

export const Status: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, 280px); gap: 24px;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">None</span>
        <ui-select label="Label" supportive="Supportive Text" placeholder="Select an option">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Warning</span>
        <ui-select label="Label" supportive="Warning message" status="warning" placeholder="Select an option">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Error</span>
        <ui-select label="Label" supportive="Error message" status="error" placeholder="Select an option">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Success</span>
        <ui-select label="Label" supportive="Success message" status="success" placeholder="Select an option">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        </ui-select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: Inter, sans-serif; font-size: 11px; color: #5b7282;">Loading</span>
        <ui-select label="Label" supportive="Loading..." status="loading" placeholder="Select an option">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        </ui-select>
      </div>
    </div>
  `,
};

export const LeadingIcon: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: flex-start;">
      <ui-select label="With Leading Icon" supportive="Supportive Text" placeholder="Select an option">
        <span slot="leading" class="material-symbols-outlined" style="font-size: 20px;">account_circle</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        <ui-dropdown-item value="c">Option C</ui-dropdown-item>
      </ui-select>
      <ui-select label="Without Leading Icon" supportive="Supportive Text" placeholder="Select an option">
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        <ui-dropdown-item value="c">Option C</ui-dropdown-item>
      </ui-select>
    </div>
  `,
};

export const WithHeadings: Story = {
  render: () => html`
    <ui-select label="Country" supportive="Select your country" placeholder="Choose a country" style="width: 300px;">
      <ui-dropdown-heading>North America</ui-dropdown-heading>
      <ui-dropdown-item value="us">United States</ui-dropdown-item>
      <ui-dropdown-item value="ca">Canada</ui-dropdown-item>
      <ui-dropdown-item value="mx">Mexico</ui-dropdown-item>
      <ui-dropdown-separator></ui-dropdown-separator>
      <ui-dropdown-heading>Europe</ui-dropdown-heading>
      <ui-dropdown-item value="uk">United Kingdom</ui-dropdown-item>
      <ui-dropdown-item value="de">Germany</ui-dropdown-item>
      <ui-dropdown-item value="fr">France</ui-dropdown-item>
    </ui-select>
  `,
};

export const MultiSelect: Story = {
  render: () => html`
    <ui-select label="Tags" supportive="Select multiple tags" multiple style="width: 400px;">
      <ui-dropdown-item value="react">React</ui-dropdown-item>
      <ui-dropdown-item value="vue">Vue</ui-dropdown-item>
      <ui-dropdown-item value="angular">Angular</ui-dropdown-item>
      <ui-dropdown-item value="svelte">Svelte</ui-dropdown-item>
      <ui-dropdown-item value="solid">Solid</ui-dropdown-item>
    </ui-select>
  `,
};
