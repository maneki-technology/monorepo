import { registerPage } from "../registry.js";
import "@maneki/calendar";

registerPage("calendar", {
  title: "Calendar",
  section: "Calendar & Date",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"]
        .map(
          (size) => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <maneki-calendar size="${size}" value="2024-06-15"></maneki-calendar>
        </div>
      `,
        )
        .join("")}
    </div>

    <h3>Range Selection</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"]
        .map(
          (size) => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <maneki-calendar id="cal-range-${size}" size="${size}" range range-start="2024-06-10" range-end="2024-06-20"></maneki-calendar>
        </div>
      `,
        )
        .join("")}
    </div>

    <h3>Monthly View</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"]
        .map(
          (size) => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <maneki-calendar size="${size}" view="months" value="2024-06-15"></maneki-calendar>
        </div>
      `,
        )
        .join("")}
    </div>

    <h3>Year View</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"]
        .map(
          (size) => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <maneki-calendar size="${size}" view="years" value="2024-06-15"></maneki-calendar>
        </div>
      `,
        )
        .join("")}
    </div>

    <h3>With Min/Max Constraints</h3>
    <maneki-calendar size="m" value="2024-06-15" min="2024-06-10" max="2024-06-20"></maneki-calendar>

    <h3>With Events</h3>
    <maneki-calendar id="cal-events-demo" size="m" value="2024-06-15"></maneki-calendar>

    <h3>Panel with Time</h3>
    <maneki-calendar-panel>
      <maneki-calendar value="2024-06-15"></maneki-calendar>
      <maneki-calendar-time slot="time" value="14:30:00"></maneki-calendar-time>
    </maneki-calendar-panel>

    <h3>Panel with Actions</h3>
    <maneki-calendar-panel show-actions>
      <maneki-calendar value="2024-06-15"></maneki-calendar>
      <maneki-calendar-time slot="time" value="10:00:00"></maneki-calendar-time>
    </maneki-calendar-panel>

    <h3>CalendarPopover (Figma spec)</h3>
    <maneki-calendar-panel>
      <div slot="top" style="display:flex;flex-direction:column;gap:0;">
        <ui-button-group size="m" action="secondary" emphasis="bold" style="width:100%;--ui-btn-group-radius:16px;">
          <ui-button>Today</ui-button>
          <ui-button>Week</ui-button>
          <ui-button>Month</ui-button>
        </ui-button-group>
      </div>
      <maneki-calendar value="2024-06-16"></maneki-calendar>
      <maneki-calendar-time slot="time" value="10:30:00" use-12-hour timezone="EDT"></maneki-calendar-time>
      <div slot="bottom" style="display:flex;flex-wrap:wrap;gap:6px;">
        <ui-tag size="s" type="selectable" emphasis="bold" selected>Exact dates</ui-tag>
        <ui-tag size="s" type="selectable" emphasis="bold">1 day</ui-tag>
        <ui-tag size="s" type="selectable" emphasis="bold">2 days</ui-tag>
        <ui-tag size="s" type="selectable" emphasis="bold">7 days</ui-tag>
      </div>
    </maneki-calendar-panel>

    <h3>Today Highlight</h3>
    <maneki-calendar size="m"></maneki-calendar>

    <h3>Outside Days Hidden</h3>
    <maneki-calendar size="m" value="2024-06-15" show-outside-days="false"></maneki-calendar>
  `,
  setup: () => {
    const calEvents = document.querySelector("#cal-events-demo") as HTMLElement | null;
    if (calEvents && "events" in calEvents) {
      (calEvents as any).events = [
        { date: "2024-06-10", color: "#FC9162" },
        { date: "2024-06-15", color: "#FC9162" },
        { date: "2024-06-15", color: "#4EBFB9" },
        { date: "2024-06-20", color: "#FC9162" },
        { date: "2024-06-20", color: "#4EBFB9" },
        { date: "2024-06-20", color: "#C89AFC" },
        { date: "2024-06-25", color: "#4EBFB9" },
      ];
    }
  },
});
