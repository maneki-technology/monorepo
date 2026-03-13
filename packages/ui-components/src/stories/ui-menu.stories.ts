import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-menu.js";
import "../components/ui-dropdown-item.js";
import "../components/ui-dropdown-heading.js";
import "../components/ui-dropdown-separator.js";

const meta: Meta = {
  title: "Components/Menu",
  component: "ui-menu",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m"],
    },
    open: { control: { type: "boolean" } },
    selectable: { control: { type: "boolean" } },
    multiple: { control: { type: "boolean" } },
  },
  args: {
    size: "m",
    open: true,
    selectable: false,
    multiple: false,
  },
  render: (args) => html`
    <div style="position: relative; height: 300px;">
      <ui-menu
        size=${args.size}
        ?open=${args.open}
        ?selectable=${args.selectable}
        ?multiple=${args.multiple}
      >
        <ui-dropdown-item value="cut">Cut</ui-dropdown-item>
        <ui-dropdown-item value="copy">Copy</ui-dropdown-item>
        <ui-dropdown-item value="paste">Paste</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-item value="delete">Delete</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Small: Story = {
  args: { size: "s" },
};

export const WithSections: Story = {
  render: () => html`
    <div style="position: relative; height: 400px;">
      <ui-menu open>
        <ui-dropdown-heading>Edit</ui-dropdown-heading>
        <ui-dropdown-item value="cut">Cut</ui-dropdown-item>
        <ui-dropdown-item value="copy">Copy</ui-dropdown-item>
        <ui-dropdown-item value="paste">Paste</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-heading>File</ui-dropdown-heading>
        <ui-dropdown-item value="save">Save</ui-dropdown-item>
        <ui-dropdown-item value="save-as">Save as…</ui-dropdown-item>
        <ui-dropdown-item value="export">Export</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const WithDisabledItems: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open>
        <ui-dropdown-item value="cut">Cut</ui-dropdown-item>
        <ui-dropdown-item value="copy">Copy</ui-dropdown-item>
        <ui-dropdown-item value="paste" disabled>Paste</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-item value="delete" disabled>Delete</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const SingleSelect: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open selectable>
        <ui-dropdown-heading>Sort by</ui-dropdown-heading>
        <ui-dropdown-item value="name" selected>Name</ui-dropdown-item>
        <ui-dropdown-item value="date">Date modified</ui-dropdown-item>
        <ui-dropdown-item value="size">Size</ui-dropdown-item>
        <ui-dropdown-item value="type">Type</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const MultiSelect: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open selectable multiple>
        <ui-dropdown-heading>Show columns</ui-dropdown-heading>
        <ui-dropdown-item value="name" selected>Name</ui-dropdown-item>
        <ui-dropdown-item value="date" selected>Date</ui-dropdown-item>
        <ui-dropdown-item value="size">Size</ui-dropdown-item>
        <ui-dropdown-item value="type">Type</ui-dropdown-item>
        <ui-dropdown-item value="tags">Tags</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px;">
      <div style="position: relative; height: 250px;">
        <p style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Size: s</p>
        <ui-menu open size="s">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
          <ui-dropdown-item value="c">Option C</ui-dropdown-item>
        </ui-menu>
      </div>
      <div style="position: relative; height: 250px;">
        <p style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Size: m</p>
        <ui-menu open size="m">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
          <ui-dropdown-item value="c">Option C</ui-dropdown-item>
        </ui-menu>
      </div>
      <div style="position: relative; height: 250px;">
        <p style="margin: 0 0 8px; font-family: Inter, sans-serif; font-size: 12px; color: #666;">Size: l</p>
        <ui-menu open size="l">
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
          <ui-dropdown-item value="c">Option C</ui-dropdown-item>
        </ui-menu>
      </div>
    </div>
  `, 
};

export const LargeSize: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open size="l" style="position: relative;">
        <ui-dropdown-item>New File</ui-dropdown-item>
        <ui-dropdown-item>Open File</ui-dropdown-item>
        <ui-dropdown-item>Save</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-heading>Recent</ui-dropdown-heading>
        <ui-dropdown-item>project.ts</ui-dropdown-item>
        <ui-dropdown-item>readme.md</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const WithLeadingIcons: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open size="m" style="position: relative;">
        <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 4v12M4 10h12"/></svg></span>New File</ui-dropdown-item>
        <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h12M4 10h12M4 14h8"/></svg></span>Open File</ui-dropdown-item>
        <ui-dropdown-item leading="icon" disabled><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/></svg></span>Disabled</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const WithCheckboxes: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open size="m" selectable multiple style="position: relative;">
        <ui-dropdown-item leading="checkbox" value="bold" selected>Bold</ui-dropdown-item>
        <ui-dropdown-item leading="checkbox" value="italic">Italic</ui-dropdown-item>
        <ui-dropdown-item leading="checkbox" value="underline">Underline</ui-dropdown-item>
        <ui-dropdown-item leading="checkbox" value="strike" disabled>Strikethrough</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const WithRadios: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open size="m" selectable style="position: relative;">
        <ui-dropdown-heading>Sort By</ui-dropdown-heading>
        <ui-dropdown-item leading="radio" value="name" selected>Name</ui-dropdown-item>
        <ui-dropdown-item leading="radio" value="date">Date Modified</ui-dropdown-item>
        <ui-dropdown-item leading="radio" value="size">Size</ui-dropdown-item>
        <ui-dropdown-item leading="radio" value="type">Type</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const WithSecondaryLabels: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open size="m" style="position: relative;">
        <ui-dropdown-item secondary="Ctrl+N">New File</ui-dropdown-item>
        <ui-dropdown-item secondary="Ctrl+O">Open File</ui-dropdown-item>
        <ui-dropdown-item secondary="Ctrl+S">Save</ui-dropdown-item>
        <ui-dropdown-item secondary="Ctrl+Shift+S">Save As</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-item secondary="Ctrl+Q">Quit</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <div style="position: relative; height: 300px;">
      <ui-menu open size="m" style="position: relative; --ui-menu-min-width: 300px;">
        <ui-dropdown-item description="Create a new empty document">New File</ui-dropdown-item>
        <ui-dropdown-item description="Open an existing file from disk">Open File</ui-dropdown-item>
        <ui-dropdown-item description="Save changes to current file" disabled>Save</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const WithSubmenu: Story = {
  render: () => html`
    <div style="position: relative; height: 350px;">
      <ui-menu open size="m" style="position: relative;">
        <ui-dropdown-item>Cut</ui-dropdown-item>
        <ui-dropdown-item>Copy</ui-dropdown-item>
        <ui-dropdown-item>Paste</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-item submenu>Find
          <ui-menu slot="submenu">
            <ui-dropdown-item>Find in File</ui-dropdown-item>
            <ui-dropdown-item secondary="Ctrl+F">Find in Project</ui-dropdown-item>
            <ui-dropdown-item secondary="Ctrl+H">Find and Replace</ui-dropdown-item>
          </ui-menu>
        </ui-dropdown-item>
        <ui-dropdown-item submenu>Share
          <ui-menu slot="submenu">
            <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 4v12M4 10h12"/></svg></span>Copy Link</ui-dropdown-item>
            <ui-dropdown-item leading="icon"><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/></svg></span>Email</ui-dropdown-item>
          </ui-menu>
        </ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

export const KitchenSink: Story = {
  render: () => html`
    <div style="position: relative; height: 400px;">
      <ui-menu open size="m" selectable multiple style="position: relative; --ui-menu-min-width: 320px;">
        <ui-dropdown-heading>Formatting</ui-dropdown-heading>
        <ui-dropdown-item leading="checkbox" value="bold" selected description="Make text bold">Bold</ui-dropdown-item>
        <ui-dropdown-item leading="checkbox" value="italic" secondary="Ctrl+I">Italic</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-heading>Navigation</ui-dropdown-heading>
        <ui-dropdown-item leading="icon" submenu><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h12M4 10h12M4 14h8"/></svg></span>Go To</ui-dropdown-item>
        <ui-dropdown-item leading="icon" disabled><span slot="icon" style="display:inline-flex"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/></svg></span>Disabled Item</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
};

