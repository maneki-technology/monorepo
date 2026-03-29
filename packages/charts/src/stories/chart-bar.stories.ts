import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import { injectAllTokens } from "@maneki/foundation";
import "../components/chart-bar.js";
import type { ChartBarElement } from "../components/chart-bar.js";

injectAllTokens();

const meta: Meta = {
  title: "Charts/Bar Chart",
  component: "chart-bar",
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    showLegend: { control: "boolean" },
    showGrid: { control: "boolean" },
    showTooltips: { control: "boolean" },
    labelRotation: { control: { type: "range", min: 0, max: 90, step: 5 } },
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Helper to set data on the chart element after render
// ---------------------------------------------------------------------------

function setupChart(
  el: Element | null,
  datasets: ChartBarElement["datasets"],
  options: ChartBarElement["options"],
): void {
  if (!el) return;
  const chart = el as ChartBarElement;
  chart.options = options;
  chart.datasets = datasets;
}

// ---------------------------------------------------------------------------
// Basic — single dataset, matching Figma "Bar Chart-M"
// ---------------------------------------------------------------------------

export const Basic: Story = {
  args: {
    title: "Chart.js Bar Chart",
    showLegend: true,
    showGrid: true,
    showTooltips: true,
    labelRotation: 25,
  },
  render: (args) => {
    const el = document.createElement("chart-bar");
    el.style.maxWidth = "960px";

    requestAnimationFrame(() => {
      setupChart(el, [
        {
          label: "Dataset 1",
          data: [350, 300, 150, 100, 700, 550, 30],
          color: 1,
        },
      ], {
        title: args.title as string,
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        showLegend: args.showLegend as boolean,
        showGrid: args.showGrid as boolean,
        showTooltips: args.showTooltips as boolean,
        labelRotation: args.labelRotation as number,
      });
    });

    return el;
  },
};

// ---------------------------------------------------------------------------
// Multi-Dataset — two datasets, matching Figma "Bar Chart-M"
// ---------------------------------------------------------------------------

export const MultiDataset: Story = {
  render: () => {
    const el = document.createElement("chart-bar");
    el.style.maxWidth = "960px";

    requestAnimationFrame(() => {
      setupChart(el, [
        {
          label: "Dataset 1",
          data: [350, 300, 150, 100, 700, 550, 30],
          color: 1,
        },
        {
          label: "Dataset 2",
          data: [370, 630, 80, 380, 140, 260, 100],
          color: 2,
        },
      ], {
        title: "Chart.js Bar Chart",
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        labelRotation: 25,
      });
    });

    return el;
  },
};

// ---------------------------------------------------------------------------
// Many Datasets — 5 datasets to test palette cycling
// ---------------------------------------------------------------------------

export const ManyDatasets: Story = {
  render: () => {
    const el = document.createElement("chart-bar");
    el.style.maxWidth = "960px";

    requestAnimationFrame(() => {
      setupChart(el, [
        { label: "Sales", data: [120, 200, 150, 80, 170] },
        { label: "Revenue", data: [90, 150, 200, 120, 140] },
        { label: "Profit", data: [60, 80, 100, 50, 90] },
        { label: "Expenses", data: [100, 130, 110, 90, 120] },
        { label: "Growth", data: [40, 60, 80, 30, 70] },
      ], {
        title: "Quarterly Performance",
        labels: ["Q1", "Q2", "Q3", "Q4", "Q5"],
      });
    });

    return el;
  },
};

// ---------------------------------------------------------------------------
// Negative Values — bars going below zero
// ---------------------------------------------------------------------------

export const NegativeValues: Story = {
  render: () => {
    const el = document.createElement("chart-bar");
    el.style.maxWidth = "960px";

    requestAnimationFrame(() => {
      setupChart(el, [
        {
          label: "Profit/Loss",
          data: [200, -150, 300, -50, 100, -200, 400],
          color: 6,
        },
      ], {
        title: "Monthly Profit/Loss",
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      });
    });

    return el;
  },
};

// ---------------------------------------------------------------------------
// Responsive — fills container width
// ---------------------------------------------------------------------------

export const Responsive: Story = {
  render: () => {
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.resize = "horizontal";
    wrapper.style.overflow = "auto";
    wrapper.style.border = "1px dashed #ccc";
    wrapper.style.padding = "16px";

    const el = document.createElement("chart-bar");
    wrapper.appendChild(el);

    requestAnimationFrame(() => {
      setupChart(el, [
        { label: "Dataset 1", data: [65, 59, 80, 81, 56, 55, 40], color: 1 },
        { label: "Dataset 2", data: [28, 48, 40, 19, 86, 27, 90], color: 2 },
      ], {
        title: "Responsive Bar Chart",
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      });
    });

    return wrapper;
  },
};

// ---------------------------------------------------------------------------
// No Grid — clean look without grid lines
// ---------------------------------------------------------------------------

export const NoGrid: Story = {
  render: () => {
    const el = document.createElement("chart-bar");
    el.style.maxWidth = "600px";

    requestAnimationFrame(() => {
      setupChart(el, [
        { label: "Views", data: [1200, 1900, 3000, 5000, 2000, 3000], color: 7 },
      ], {
        title: "Page Views",
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        showGrid: false,
      });
    });

    return el;
  },
};
