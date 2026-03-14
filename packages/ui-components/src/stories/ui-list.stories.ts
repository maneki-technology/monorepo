import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-list-item.js";
import "../components/ui-list-header.js";
import "../components/ui-list-group.js";
import "../components/ui-icon.js";
import "../components/ui-avatar.js";

const meta: Meta = {
  title: "Components/List",
  component: "ui-list-group",
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

// ─── Single Item ─────────────────────────────────────────────────────────────

export const SingleDefault: Story = {
  render: () => html`
    <ui-list-item size="m">Default list item</ui-list-item>
  `,
};

export const SingleAllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: start;">
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">S</strong>
        <ui-list-item size="s">Small item</ui-list-item>
      </div>
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">M</strong>
        <ui-list-item size="m">Medium item</ui-list-item>
      </div>
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">L</strong>
        <ui-list-item size="l">Large item</ui-list-item>
      </div>
    </div>
  `,
};

export const SingleWithDescription: Story = {
  render: () => html`
    <ui-list-item size="m" description="Supporting text that describes this item in more detail">
      Multi-line list item
    </ui-list-item>
  `,
};

export const SingleWithLeadingIcon: Story = {
  render: () => html`
    <ui-list-item size="m" leading="icon">
      <ui-icon slot="leading" name="person" size="s"></ui-icon>
      Item with leading icon
    </ui-list-item>
  `,
};

export const SingleWithLeadingAvatar: Story = {
  render: () => html`
    <ui-list-item size="m" leading="avatar">
      <ui-avatar slot="leading" size="s" type="text" color="blue">AB</ui-avatar>
      Item with leading avatar
    </ui-list-item>
  `,
};

export const SingleWithTrailingIcon: Story = {
  render: () => html`
    <ui-list-item size="m" trailing-icon>
      Item with trailing icon
      <ui-icon slot="trailing" name="chevron_right" size="xs"></ui-icon>
    </ui-list-item>
  `,
};

export const SingleSelected: Story = {
  render: () => html`
    <ui-list-item size="m" selected>Selected item (shows tick)</ui-list-item>
  `,
};

export const SingleStates: Story = {
  render: () => html`
    <div style="width: 280px;">
      <ui-list-item size="m">Enabled</ui-list-item>
      <ui-list-item size="m" class="pseudo-hover">Hover (apply hover manually)</ui-list-item>
      <ui-list-item size="m" class="pseudo-active">Active (apply active manually)</ui-list-item>
      <ui-list-item size="m" selected>Selected</ui-list-item>
    </div>
  `,
};

export const SingleWithPadding: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: start;">
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">none</strong>
        <ui-list-item size="m" padding="none">Padding none</ui-list-item>
      </div>
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">s</strong>
        <ui-list-item size="m" padding="s">Padding S</ui-list-item>
      </div>
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">m</strong>
        <ui-list-item size="m" padding="m">Padding M</ui-list-item>
      </div>
    </div>
  `,
};

export const SingleWithTopBorder: Story = {
  render: () => html`
    <div style="width: 280px;">
      <ui-list-item size="m" top-border>Item with top border</ui-list-item>
      <ui-list-item size="m" top-border>Another bordered item</ui-list-item>
      <ui-list-item size="m" top-border>Third bordered item</ui-list-item>
    </div>
  `,
};

// ─── Header ──────────────────────────────────────────────────────────────────

export const HeaderDefault: Story = {
  render: () => html`
    <ui-list-header size="m">Section Header</ui-list-header>
  `,
};

export const HeaderAllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: start;">
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">S</strong>
        <ui-list-header size="s">Small Header</ui-list-header>
      </div>
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">M</strong>
        <ui-list-header size="m">Medium Header</ui-list-header>
      </div>
      <div>
        <strong style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">L</strong>
        <ui-list-header size="l">Large Header</ui-list-header>
      </div>
    </div>
  `,
};

// ─── Group ───────────────────────────────────────────────────────────────────

export const GroupDefault: Story = {
  render: () => html`
    <ui-list-group size="m">
      <ui-list-header slot="header">Section Title</ui-list-header>
      <ui-list-item top-border>Item 1</ui-list-item>
      <ui-list-item top-border>Item 2</ui-list-item>
      <ui-list-item top-border>Item 3</ui-list-item>
      <ui-list-item top-border>Item 4</ui-list-item>
      <ui-list-item top-border>Item 5</ui-list-item>
    </ui-list-group>
  `,
};

export const GroupAllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: start;">
      <ui-list-group size="s">
        <ui-list-header slot="header">Small</ui-list-header>
        <ui-list-item top-border>Item 1</ui-list-item>
        <ui-list-item top-border>Item 2</ui-list-item>
        <ui-list-item top-border>Item 3</ui-list-item>
      </ui-list-group>
      <ui-list-group size="m">
        <ui-list-header slot="header">Medium</ui-list-header>
        <ui-list-item top-border>Item 1</ui-list-item>
        <ui-list-item top-border>Item 2</ui-list-item>
        <ui-list-item top-border>Item 3</ui-list-item>
      </ui-list-group>
      <ui-list-group size="l">
        <ui-list-header slot="header">Large</ui-list-header>
        <ui-list-item top-border>Item 1</ui-list-item>
        <ui-list-item top-border>Item 2</ui-list-item>
        <ui-list-item top-border>Item 3</ui-list-item>
      </ui-list-group>
    </div>
  `,
};

export const GroupCollapsed: Story = {
  render: () => html`
    <ui-list-group size="m" collapsed>
      <ui-list-header slot="header">Collapsed Section</ui-list-header>
      <ui-list-item top-border>Item 1</ui-list-item>
      <ui-list-item top-border>Item 2</ui-list-item>
      <ui-list-item top-border>Item 3</ui-list-item>
    </ui-list-group>
  `,
};

export const GroupWithLeadingIcons: Story = {
  render: () => html`
    <ui-list-group size="m">
      <ui-list-header slot="header">People</ui-list-header>
      <ui-list-item top-border leading="icon">
        <ui-icon slot="leading" name="person" size="s"></ui-icon>
        Alice Johnson
      </ui-list-item>
      <ui-list-item top-border leading="icon">
        <ui-icon slot="leading" name="person" size="s"></ui-icon>
        Bob Smith
      </ui-list-item>
      <ui-list-item top-border leading="icon">
        <ui-icon slot="leading" name="person" size="s"></ui-icon>
        Carol Williams
      </ui-list-item>
      <ui-list-item top-border leading="icon">
        <ui-icon slot="leading" name="person" size="s"></ui-icon>
        David Brown
      </ui-list-item>
      <ui-list-item top-border leading="icon">
        <ui-icon slot="leading" name="person" size="s"></ui-icon>
        Eve Davis
      </ui-list-item>
    </ui-list-group>
  `,
};

export const MultiLineGroup: Story = {
  render: () => html`
    <ui-list-group size="m">
      <ui-list-header slot="header">Notifications</ui-list-header>
      <ui-list-item top-border leading="icon" description="You have 3 new messages in your inbox">
        <ui-icon slot="leading" name="mail" size="s"></ui-icon>
        New Messages
      </ui-list-item>
      <ui-list-item top-border leading="icon" description="Your monthly report is ready to download">
        <ui-icon slot="leading" name="download" size="s"></ui-icon>
        Report Ready
      </ui-list-item>
      <ui-list-item top-border leading="icon" description="2 team members joined your project">
        <ui-icon slot="leading" name="group" size="s"></ui-icon>
        Team Update
      </ui-list-item>
      <ui-list-item top-border leading="icon" description="System maintenance scheduled for tonight">
        <ui-icon slot="leading" name="settings" size="s"></ui-icon>
        Maintenance
      </ui-list-item>
      <ui-list-item top-border leading="icon" description="Your file has been shared with 5 people">
        <ui-icon slot="leading" name="share" size="s"></ui-icon>
        File Shared
      </ui-list-item>
    </ui-list-group>
  `,
};
