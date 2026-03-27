import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-queryfield.js";
import "../components/ui-queryfield-tag.js";
import "../components/ui-label.js";

const meta: Meta = {
  title: "Components/Queryfield",
  component: "ui-queryfield",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
    placeholder: {
      control: { type: "text" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { size: "m" },
  render: ({ size }) => html`
    <ui-queryfield size=${size}>
      <ui-queryfield-tag
        slot="tags"
        category="City"
        expression="equals London or Bengaluru"
      ></ui-queryfield-tag>
      <ui-queryfield-tag
        slot="tags"
        category="Status"
        expression="equals Active"
      ></ui-queryfield-tag>
    </ui-queryfield>
  `,
};

// ── All Sizes ───────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:16px;max-width:600px">
      ${(["s", "m", "l"] as const).map(
        (size) => html`
          <ui-queryfield size=${size}>
            <ui-queryfield-tag
              slot="tags"
              category="City"
              expression="equals London"
            ></ui-queryfield-tag>
            <ui-queryfield-tag
              slot="tags"
              category="Status"
              expression="contains Active"
            ></ui-queryfield-tag>
          </ui-queryfield>
        `,
      )}
    </div>
  `,
};

// ── Tag Only ────────────────────────────────────────────────────────────────

export const TagOnly: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:12px">
      ${(["s", "m", "l"] as const).map(
        (size) => html`
          <div style="display:flex;gap:8px;align-items:center">
            <ui-queryfield-tag
              size=${size}
              category="City"
              expression="equals London or Bengaluru"
            ></ui-queryfield-tag>
            <ui-queryfield-tag
              size=${size}
              category="Status"
              expression="starts with Act"
            ></ui-queryfield-tag>
          </div>
        `,
      )}
    </div>
  `,
};

// ── With Placeholder ────────────────────────────────────────────────────────

export const WithPlaceholder: Story = {
  args: { size: "m", placeholder: "Filter by name, city, or status..." },
  render: ({ size, placeholder }) => html`
    <ui-queryfield size=${size} placeholder=${placeholder}>
      <ui-queryfield-tag
        slot="tags"
        category="Region"
        expression="equals EMEA"
      ></ui-queryfield-tag>
    </ui-queryfield>
  `,
};

// ── Disabled ────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { size: "m" },
  render: ({ size }) => html`
    <ui-queryfield size=${size} disabled>
      <ui-queryfield-tag
        slot="tags"
        category="City"
        expression="equals London"
      ></ui-queryfield-tag>
    </ui-queryfield>
  `,
};

// ── Empty ───────────────────────────────────────────────────────────────────

export const Empty: Story = {
  args: { size: "m" },
  render: ({ size }) => html`
    <ui-queryfield size=${size}></ui-queryfield>
  `,
};


// ── With Label ────────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  render: () => html`
    <div style="width: 400px;">
      <ui-queryfield>
        <ui-label slot="label" size="m">Search filters</ui-label>
        <ui-queryfield-tag
          slot="tags"
          category="City"
          expression="equals London"
        ></ui-queryfield-tag>
      </ui-queryfield>
    </div>
  `,
};