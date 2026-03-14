import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-calendar-quicklinks.js";
import "../components/ui-calendar.js";

const sideItems = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "PRESETS", value: "presets", section: true },
  { label: "Last 7 days", value: "last-7" },
  { label: "Last 30 days", value: "last-30" },
  { label: "CUSTOM", value: "custom", section: true },
  { label: "Custom range", value: "custom-range" },
];

const bottomItems = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7d", value: "last-7" },
  { label: "Last 30d", value: "last-30" },
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
  { label: "This year", value: "this-year" },
  { label: "1w", value: "1w" },
];

const meta: Meta = {
  title: "Components/Calendar Quicklinks",
  component: "ui-calendar-quicklinks",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["s", "m", "l"] },
    orientation: { control: "select", options: ["side", "bottom"] },
  },
  args: {
    size: "m",
    orientation: "side",
  },
};
export default meta;
type Story = StoryObj;

// ─── Side (vertical) ────────────────────────────────────────────────────────

export const SideDefault: Story = {
  render: () => {
    const tpl = html`<ui-calendar-quicklinks id="ql-side-default" orientation="side" size="m"></ui-calendar-quicklinks>`;
    setTimeout(() => {
      const el = document.getElementById("ql-side-default") as HTMLElement & { setItems(items: typeof sideItems): void };
      if (el) el.setItems(sideItems);
    });
    return tpl;
  },
};

export const SideWithSelection: Story = {
  render: () => {
    const tpl = html`<ui-calendar-quicklinks id="ql-side-selected" orientation="side" size="m"></ui-calendar-quicklinks>`;
    setTimeout(() => {
      const el = document.getElementById("ql-side-selected") as HTMLElement & { setItems(items: typeof sideItems): void; selectedValue: string | null };
      if (el) {
        el.setItems(sideItems);
        el.selectedValue = "last-7";
      }
    });
    return tpl;
  },
};

// ─── Bottom (horizontal) ────────────────────────────────────────────────────

export const BottomDefault: Story = {
  render: () => {
    const tpl = html`<ui-calendar-quicklinks id="ql-bottom-default" orientation="bottom" size="m"></ui-calendar-quicklinks>`;
    setTimeout(() => {
      const el = document.getElementById("ql-bottom-default") as HTMLElement & { setItems(items: typeof bottomItems): void };
      if (el) el.setItems(bottomItems);
    });
    return tpl;
  },
};

// ─── All sizes ──────────────────────────────────────────────────────────────

export const AllSizesSide: Story = {
  render: () => {
    const tpl = html`
      <div style="display: flex; gap: 32px; font-family: Inter, sans-serif;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size S</span>
          <ui-calendar-quicklinks id="ql-side-s" orientation="side" size="s"></ui-calendar-quicklinks>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size M</span>
          <ui-calendar-quicklinks id="ql-side-m" orientation="side" size="m"></ui-calendar-quicklinks>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size L</span>
          <ui-calendar-quicklinks id="ql-side-l" orientation="side" size="l"></ui-calendar-quicklinks>
        </div>
      </div>
    `;
    setTimeout(() => {
      for (const suffix of ["s", "m", "l"]) {
        const el = document.getElementById(`ql-side-${suffix}`) as HTMLElement & { setItems(items: typeof sideItems): void };
        if (el) el.setItems(sideItems);
      }
    });
    return tpl;
  },
};

export const AllSizesBottom: Story = {
  render: () => {
    const tpl = html`
      <div style="display: flex; flex-direction: column; gap: 32px; font-family: Inter, sans-serif;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size S</span>
          <ui-calendar-quicklinks id="ql-bottom-s" orientation="bottom" size="s"></ui-calendar-quicklinks>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size M</span>
          <ui-calendar-quicklinks id="ql-bottom-m" orientation="bottom" size="m"></ui-calendar-quicklinks>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #3E5463;">Size L</span>
          <ui-calendar-quicklinks id="ql-bottom-l" orientation="bottom" size="l"></ui-calendar-quicklinks>
        </div>
      </div>
    `;
    setTimeout(() => {
      for (const suffix of ["s", "m", "l"]) {
        const el = document.getElementById(`ql-bottom-${suffix}`) as HTMLElement & { setItems(items: typeof bottomItems): void };
        if (el) el.setItems(bottomItems);
      }
    });
    return tpl;
  },
};

// ─── Composed with Calendar ─────────────────────────────────────────────────

export const WithCalendarSide: Story = {
  render: () => {
    const tpl = html`
      <div style="display: inline-flex; border-radius: 2px; box-shadow: 0px 8px 10px 0px rgba(0,0,0,0.14), 0px 3px 14px 0px rgba(0,0,0,0.12), 0px 5px 5px 0px rgba(0,0,0,0.2); overflow: hidden;">
        <ui-calendar-quicklinks id="ql-cal-side" orientation="side" size="m" style="border-radius: 0;"></ui-calendar-quicklinks>
        <ui-calendar size="m" value="2024-06-15" style="--ui-calendar-elevation: none; border-radius: 0;"></ui-calendar>
      </div>
    `;
    setTimeout(() => {
      const el = document.getElementById("ql-cal-side") as HTMLElement & { setItems(items: typeof sideItems): void; selectedValue: string | null };
      if (el) {
        el.setItems(sideItems);
        el.selectedValue = "last-7";
      }
    });
    return tpl;
  },
};

export const WithCalendarBottom: Story = {
  render: () => {
    const tpl = html`
      <div style="display: inline-flex; flex-direction: column; border-radius: 2px; box-shadow: 0px 8px 10px 0px rgba(0,0,0,0.14), 0px 3px 14px 0px rgba(0,0,0,0.12), 0px 5px 5px 0px rgba(0,0,0,0.2); overflow: hidden;">
        <ui-calendar size="m" value="2024-06-15" style="--ui-calendar-elevation: none; border-radius: 0;"></ui-calendar>
        <ui-calendar-quicklinks id="ql-cal-bottom" orientation="bottom" size="m" style="border-radius: 0;"></ui-calendar-quicklinks>
      </div>
    `;
    setTimeout(() => {
      const el = document.getElementById("ql-cal-bottom") as HTMLElement & { setItems(items: typeof bottomItems): void; selectedValue: string | null };
      if (el) {
        el.setItems(bottomItems);
        el.selectedValue = "last-30";
      }
    });
    return tpl;
  },
};
