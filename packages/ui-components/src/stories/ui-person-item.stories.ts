import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-person-item.js";
import "../components/ui-person-group.js";

const meta: Meta = {
  title: "Components/Person Item",
  component: "ui-person-item",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m", "l"],
    },
    name: {
      control: { type: "text" },
    },
    personTitle: {
      control: { type: "text" },
    },
    location: {
      control: { type: "text" },
    },
    nameOnly: {
      control: { type: "boolean" },
    },
    avatarText: {
      control: { type: "text" },
    },
  },
  args: {
    size: "s",
    name: "Jane Wilson",
    personTitle: "Product Designer",
    location: "",
    nameOnly: false,
    avatarText: "",
  },
  render: (args) => html`
    <ui-person-item
      size=${args.size}
      name=${args.name}
      title=${args.personTitle}
      location=${args.location}
      ?name-only=${args.nameOnly}
      avatar-text=${args.avatarText}
    ></ui-person-item>
  `,
};

export default meta;
type Story = StoryObj;

// ─── Individual person item stories ──────────────────────────────────────────

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <ui-person-item
        size="xs"
        name="Alice Chen"
        title="Software Engineer"
        location="San Francisco, CA"
      ></ui-person-item>
      <ui-person-item
        size="s"
        name="Bob Martinez"
        title="Product Manager"
        location="New York, NY"
      ></ui-person-item>
      <ui-person-item
        size="m"
        name="Carol Davis"
        title="UX Researcher"
        location="London, UK"
      ></ui-person-item>
      <ui-person-item
        size="l"
        name="David Kim"
        title="Engineering Lead"
        location="Seoul, KR"
      ></ui-person-item>
    </div>
  `,
};

export const NameOnly: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <ui-person-item size="xs" name="Alice Chen" name-only></ui-person-item>
      <ui-person-item size="s" name="Bob Martinez" name-only></ui-person-item>
      <ui-person-item size="m" name="Carol Davis" name-only></ui-person-item>
      <ui-person-item size="l" name="David Kim" name-only></ui-person-item>
    </div>
  `,
};

export const WithAvatarText: Story = {
  args: {
    avatarText: "JW",
  },
};

// ─── Group stories ───────────────────────────────────────────────────────────

export const PersonGroup: Story = {
  render: () => html`
    <ui-person-group title="Engineering Team" size="s" style="max-width: 400px;">
      <ui-person-item name="Alice Chen" title="Software Engineer" location="San Francisco, CA"></ui-person-item>
      <ui-person-item name="Bob Martinez" title="Product Manager" location="New York, NY"></ui-person-item>
      <ui-person-item name="Carol Davis" title="UX Researcher" location="London, UK"></ui-person-item>
      <ui-person-item name="David Kim" title="Engineering Lead" location="Seoul, KR"></ui-person-item>
      <ui-person-item name="Eve Johnson" title="QA Engineer" location="Austin, TX"></ui-person-item>
    </ui-person-group>
  `,
};

export const PersonGroupSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 40px; max-width: 400px;">
      <ui-person-group title="XS Group" size="xs">
        <ui-person-item name="Alice Chen" title="Engineer"></ui-person-item>
        <ui-person-item name="Bob Martinez" title="Designer"></ui-person-item>
        <ui-person-item name="Carol Davis" title="Manager"></ui-person-item>
      </ui-person-group>

      <ui-person-group title="S Group" size="s">
        <ui-person-item name="Alice Chen" title="Engineer"></ui-person-item>
        <ui-person-item name="Bob Martinez" title="Designer"></ui-person-item>
        <ui-person-item name="Carol Davis" title="Manager"></ui-person-item>
      </ui-person-group>

      <ui-person-group title="M Group" size="m">
        <ui-person-item name="Alice Chen" title="Engineer"></ui-person-item>
        <ui-person-item name="Bob Martinez" title="Designer"></ui-person-item>
        <ui-person-item name="Carol Davis" title="Manager"></ui-person-item>
      </ui-person-group>

      <ui-person-group title="L Group" size="l">
        <ui-person-item name="Alice Chen" title="Engineer"></ui-person-item>
        <ui-person-item name="Bob Martinez" title="Designer"></ui-person-item>
        <ui-person-item name="Carol Davis" title="Manager"></ui-person-item>
      </ui-person-group>
    </div>
  `,
};
