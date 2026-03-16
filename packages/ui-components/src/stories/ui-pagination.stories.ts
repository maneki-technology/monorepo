import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-pagination.js";

const meta: Meta = {
  title: "Components/Pagination",
  component: "ui-pagination",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m"],
    },
    type: {
      control: { type: "select" },
      options: ["minimal", "basic", "data-grid"],
    },
    currentPage: {
      control: { type: "number" },
    },
    totalPages: {
      control: { type: "number" },
    },
    pageSize: {
      control: { type: "number" },
    },
    totalItems: {
      control: { type: "number" },
    },
  },
  args: {
    size: "m",
    type: "data-grid",
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 100,
  },
  render: (args) => html`
    <ui-pagination
      size=${args.size}
      type=${args.type}
      current-page=${args.currentPage}
      total-pages=${args.totalPages}
      page-size=${args.pageSize}
      total-items=${args.totalItems}
    ></ui-pagination>
  `,
};

export default meta;
type Story = StoryObj;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    type: "data-grid",
    totalPages: 20,
    currentPage: 4,
  },
};

export const Minimal: Story = {
  args: {
    type: "minimal",
    totalPages: 20,
  },
};

export const Basic: Story = {
  args: {
    type: "basic",
    totalItems: 124,
    pageSize: 10,
  },
  render: (args) => html`
    <ui-pagination
      size=${args.size}
      type="basic"
      current-page=${args.currentPage}
      total-pages=${Math.ceil(args.totalItems / args.pageSize)}
      page-size=${args.pageSize}
      total-items=${args.totalItems}
    ></ui-pagination>
  `,
};

export const BasicWithAddon: Story = {
  args: {
    type: "basic",
    totalItems: 500,
    pageSize: 25,
  },
  render: (args) => html`
    <ui-pagination
      size=${args.size}
      type="basic"
      current-page=${args.currentPage}
      total-pages=${Math.ceil(args.totalItems / args.pageSize)}
      page-size=${args.pageSize}
      total-items=${args.totalItems}
    ></ui-pagination>
  `,
};

export const DataGridFirstPage: Story = {
  args: {
    type: "data-grid",
    currentPage: 1,
    totalPages: 20,
  },
};

export const DataGridLastPage: Story = {
  args: {
    type: "data-grid",
    currentPage: 20,
    totalPages: 20,
  },
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">xs</p>
        <ui-pagination size="xs" type="data-grid" current-page="4" total-pages="20"></ui-pagination>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">s</p>
        <ui-pagination size="s" type="data-grid" current-page="4" total-pages="20"></ui-pagination>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">m</p>
        <ui-pagination size="m" type="data-grid" current-page="4" total-pages="20"></ui-pagination>
      </div>
    </div>
  `,
};

export const MinimalSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">xs</p>
        <ui-pagination size="xs" type="minimal" current-page="4" total-pages="20"></ui-pagination>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">s</p>
        <ui-pagination size="s" type="minimal" current-page="4" total-pages="20"></ui-pagination>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">m</p>
        <ui-pagination size="m" type="minimal" current-page="4" total-pages="20"></ui-pagination>
      </div>
    </div>
  `,
};

export const BasicSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">xs</p>
        <ui-pagination size="xs" type="basic" current-page="3" total-pages="13" page-size="10" total-items="124"></ui-pagination>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">s</p>
        <ui-pagination size="s" type="basic" current-page="3" total-pages="13" page-size="10" total-items="124"></ui-pagination>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">m</p>
        <ui-pagination size="m" type="basic" current-page="3" total-pages="13" page-size="10" total-items="124"></ui-pagination>
      </div>
    </div>
  `,
};

export const CustomPageSizeOptions: Story = {
  args: {
    type: "data-grid",
    currentPage: 1,
    totalPages: 20,
  },
  render: (args) => html`
    <ui-pagination
      size=${args.size}
      type=${args.type}
      current-page=${args.currentPage}
      total-pages=${args.totalPages}
      page-size-options="5,10,25,50,100"
    ></ui-pagination>
  `,
};
