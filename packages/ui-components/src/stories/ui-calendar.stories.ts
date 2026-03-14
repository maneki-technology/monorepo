import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-calendar.js";

const meta: Meta = {
  title: "Components/Calendar",
  component: "ui-calendar",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["s", "m", "l"] },
    value: { control: "text" },
    min: { control: "text" },
    max: { control: "text" },
  },
  args: {
    size: "m",
  },
};
export default meta;
type Story = StoryObj;

// ─── Default ────────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Sizes ──────────────────────────────────────────────────────────────────────

export const SizeS: Story = {
  args: { size: "s" },
};

export const SizeM: Story = {
  args: { size: "m" },
};

export const SizeL: Story = {
  args: { size: "l" },
};

// ─── Selection & dates ──────────────────────────────────────────────────────────

export const WithSelectedDate: Story = {
  args: { size: "m", value: "2024-06-15" },
};

export const WithToday: Story = {
  args: { size: "m" },
};

// ─── Min/Max constraints ────────────────────────────────────────────────────────

export const WithMinMax: Story = {
  args: { size: "m", value: "2024-06-15", min: "2024-06-10", max: "2024-06-20" },
};

// ─── All sizes comparison ───────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; font-family: Inter, sans-serif;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: #3E5463;">Size S</span>
        <ui-calendar size="s" value="2024-06-15"></ui-calendar>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: #3E5463;">Size M</span>
        <ui-calendar size="m" value="2024-06-15"></ui-calendar>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: #3E5463;">Size L</span>
        <ui-calendar size="l" value="2024-06-15"></ui-calendar>
      </div>
    </div>
  `,
};

// ─── Edge cases: month boundaries ───────────────────────────────────────────────

export const JanuaryView: Story = {
  args: { value: "2024-01-15" },
};

export const FebruaryLeapYear: Story = {
  args: { value: "2024-02-15" },
};

// ─── Range selection ─────────────────────────────────────────────────────────

export const RangeSelection: Story = {
  render: () => {
    const tpl = html`<ui-calendar size="m" mode="range"></ui-calendar>`;
    setTimeout(() => {
      const cal = document.querySelector("ui-calendar[mode='range']") as any;
      if (!cal) return;
      cal.rangeStart = "2024-06-10";
      cal.rangeEnd = "2024-06-20";
    }, 0);
    return tpl;
  },
};

export const RangeStartOnly: Story = {
  render: () => {
    const tpl = html`<ui-calendar size="m" mode="range"></ui-calendar>`;
    setTimeout(() => {
      const cal = document.querySelector("ui-calendar[mode='range']") as any;
      if (!cal) return;
      cal.rangeStart = "2024-06-15";
    }, 0);
    return tpl;
  },
};

export const RangeAllSizes: Story = {
  render: () => {
    const tpl = html`
      <div style="display: flex; flex-direction: column; gap: 24px; font-family: Inter, sans-serif;">
        <div>
          <div style="margin-bottom: 8px;">Size S</div>
          <ui-calendar id="range-s" size="s" mode="range"></ui-calendar>
        </div>
        <div>
          <div style="margin-bottom: 8px;">Size M</div>
          <ui-calendar id="range-m" size="m" mode="range"></ui-calendar>
        </div>
        <div>
          <div style="margin-bottom: 8px;">Size L</div>
          <ui-calendar id="range-l" size="l" mode="range"></ui-calendar>
        </div>
      </div>
    `;
    setTimeout(() => {
      for (const id of ["range-s", "range-m", "range-l"]) {
        const cal = document.getElementById(id) as any;
        if (!cal) continue;
        cal.rangeStart = "2024-06-10";
        cal.rangeEnd = "2024-06-20";
      }
    }, 0);
    return tpl;
  },
};

// ─── Monthly view ───────────────────────────────────────────────────────────

export const MonthlyView: Story = {
  render: () => html`<ui-calendar size="m" view="monthly" value="2024-06-15"></ui-calendar>`,
};

export const MonthlyViewAllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; font-family: Inter, sans-serif;">
      <div>
        <div style="margin-bottom: 8px;">Size S</div>
        <ui-calendar size="s" view="monthly" value="2024-06-15"></ui-calendar>
      </div>
      <div>
        <div style="margin-bottom: 8px;">Size M</div>
        <ui-calendar size="m" view="monthly" value="2024-06-15"></ui-calendar>
      </div>
      <div>
        <div style="margin-bottom: 8px;">Size L</div>
        <ui-calendar size="l" view="monthly" value="2024-06-15"></ui-calendar>
      </div>
    </div>
  `,
};

// ─── Events ───────────────────────────────────────────────────────────────

export const WithEvents: Story = {
  render: () => {
    const tpl = html`<ui-calendar size="m" value="2024-06-15"></ui-calendar>`;
    setTimeout(() => {
      const cal = document.querySelector("ui-calendar") as any;
      if (!cal) return;
      const events = new Map();
      events.set("2024-06-10", [{ color: "#FC9162", label: "Meeting" }]);
      events.set("2024-06-15", [
        { color: "#FC9162", label: "Meeting" },
        { color: "#4EBFB9", label: "Holiday" },
      ]);
      events.set("2024-06-20", [
        { color: "#FC9162", label: "Meeting" },
        { color: "#4EBFB9", label: "Holiday" },
        { color: "#C89AFC", label: "Birthday" },
      ]);
      events.set("2024-06-25", [{ color: "#4EBFB9", label: "Holiday" }]);
      cal.setEvents(events);
    }, 0);
    return tpl;
  },
};
