import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-metric.js";
import "../components/ui-metric-group.js";

const meta: Meta = {
  title: "Components/Metric",
  component: "ui-metric",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "s", "m", "l"],
    },
    orientation: {
      control: { type: "select" },
      options: ["vertical", "horizontal"],
    },
    delta: {
      control: { type: "select" },
      options: ["none", "up", "down"],
    },
    label: {
      control: { type: "text" },
    },
    value: {
      control: { type: "text" },
    },
    deltaText: {
      control: { type: "text" },
    },
    secondaryLabel: {
      control: { type: "text" },
    },
    legendColor: {
      control: { type: "color" },
    },
    clickable: {
      control: { type: "boolean" },
    },
  },
  args: {
    size: "s",
    orientation: "vertical",
    delta: "none",
    label: "Total Revenue",
    value: "$45.2K",
    deltaText: "",
    secondaryLabel: "",
    legendColor: "",
    clickable: false,
  },
  render: (args) => html`
    <ui-metric
      size=${args.size}
      orientation=${args.orientation}
      label=${args.label}
      value=${args.value}
      delta=${args.delta}
      delta-text=${args.deltaText}
      secondary-label=${args.secondaryLabel}
      legend-color=${args.legendColor}
      ?clickable=${args.clickable}
    ></ui-metric>
  `,
};

export default meta;
type Story = StoryObj;

// ─── Individual metric stories ───────────────────────────────────────────────

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: flex-start;">
      <ui-metric size="xs" label="XS Metric" value="1,234"></ui-metric>
      <ui-metric size="s" label="S Metric" value="$45.2K"></ui-metric>
      <ui-metric size="m" label="M Metric" value="89,102"></ui-metric>
      <ui-metric size="l" label="L Metric" value="$1.2M"></ui-metric>
    </div>
  `,
};

export const DeltaUp: Story = {
  args: {
    delta: "up",
    deltaText: "+12.5K (3.2%)",
  },
};

export const DeltaDown: Story = {
  args: {
    delta: "down",
    deltaText: "-5.2K (1.1%)",
  },
};

export const WithLegend: Story = {
  args: {
    legendColor: "#cc1d92",
  },
};

export const WithSecondaryLabel: Story = {
  args: {
    secondaryLabel: "vs last month",
  },
};

export const FullVariant: Story = {
  args: {
    legendColor: "#cc1d92",
    delta: "up",
    deltaText: "+12.5K (3.2%)",
    secondaryLabel: "vs last month",
  },
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    size: "m",
  },
};

export const Clickable: Story = {
  args: {
    clickable: true,
  },
};

// ─── Group stories ───────────────────────────────────────────────────────────

export const MetricGroup: Story = {
  render: () => html`
    <ui-metric-group title="Revenue Overview" size="s">
      <ui-metric
        label="Total Revenue"
        value="$45.2K"
        delta="up"
        delta-text="+12.5K (3.2%)"
        legend-color="#186ADE"
      ></ui-metric>
      <ui-metric
        label="New Customers"
        value="1,234"
        delta="up"
        delta-text="+89 (7.8%)"
        legend-color="#0D9488"
      ></ui-metric>
      <ui-metric
        label="Churn Rate"
        value="2.4%"
        delta="down"
        delta-text="-0.3% (11%)"
        legend-color="#D91F11"
      ></ui-metric>
      <ui-metric
        label="Avg Order"
        value="$128"
        legend-color="#cc1d92"
      ></ui-metric>
      <ui-metric
        label="Conversion"
        value="3.6%"
        delta="up"
        delta-text="+0.4%"
        legend-color="#F59E0B"
      ></ui-metric>
    </ui-metric-group>
  `,
};

export const MetricGroupSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 40px;">
      <ui-metric-group title="XS Group" size="xs">
        <ui-metric label="Users" value="1,200" legend-color="#186ADE"></ui-metric>
        <ui-metric label="Sessions" value="3,400" legend-color="#0D9488"></ui-metric>
        <ui-metric label="Bounce" value="42%" legend-color="#D91F11"></ui-metric>
      </ui-metric-group>

      <ui-metric-group title="S Group" size="s">
        <ui-metric label="Users" value="1,200" legend-color="#186ADE"></ui-metric>
        <ui-metric label="Sessions" value="3,400" legend-color="#0D9488"></ui-metric>
        <ui-metric label="Bounce" value="42%" legend-color="#D91F11"></ui-metric>
      </ui-metric-group>

      <ui-metric-group title="M Group" size="m">
        <ui-metric label="Users" value="1,200" legend-color="#186ADE"></ui-metric>
        <ui-metric label="Sessions" value="3,400" legend-color="#0D9488"></ui-metric>
        <ui-metric label="Bounce" value="42%" legend-color="#D91F11"></ui-metric>
      </ui-metric-group>

      <ui-metric-group title="L Group" size="l">
        <ui-metric label="Users" value="1,200" legend-color="#186ADE"></ui-metric>
        <ui-metric label="Sessions" value="3,400" legend-color="#0D9488"></ui-metric>
        <ui-metric label="Bounce" value="42%" legend-color="#D91F11"></ui-metric>
      </ui-metric-group>
    </div>
  `,
};
