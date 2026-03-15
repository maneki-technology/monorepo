import { registerPage } from "../registry.js";

registerPage("calendar", {
  title: "Calendar",
  section: "Calendar & Date",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"].map(size => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <ui-calendar size="${size}" value="2024-06-15"></ui-calendar>
        </div>
      `).join("")}
    </div>

    <h3>Range Selection</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"].map(size => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <ui-calendar id="cal-range-${size}" size="${size}" mode="range"></ui-calendar>
        </div>
      `).join("")}
    </div>

    <h3>Monthly View</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"].map(size => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <ui-calendar size="${size}" view="monthly" value="2024-06-15"></ui-calendar>
        </div>
      `).join("")}
    </div>

    <h3>With Min/Max Constraints</h3>
    <ui-calendar size="m" value="2024-06-15" min="2024-06-10" max="2024-06-20"></ui-calendar>

    <h3>With Events</h3>
    <ui-calendar id="cal-events-demo" size="m" value="2024-06-15"></ui-calendar>

    <h3>Quicklinks — Side</h3>
    <ui-calendar-panel size="m">
      <ui-calendar-quicklinks id="cal-ql-side" slot="side" orientation="side"></ui-calendar-quicklinks>
      <ui-calendar value="2024-06-15"></ui-calendar>
    </ui-calendar-panel>

    <h3>Quicklinks — Bottom</h3>
    <ui-calendar-panel size="m">
      <ui-calendar value="2024-06-15"></ui-calendar>
      <ui-calendar-quicklinks id="cal-ql-bottom" slot="bottom" orientation="bottom"></ui-calendar-quicklinks>
    </ui-calendar-panel>

    <h3>Inline Time Panel</h3>
    <ui-calendar-panel size="m">
      <ui-calendar value="2024-06-15"></ui-calendar>
      <ui-calendar-time slot="bottom" value="14:30"></ui-calendar-time>
    </ui-calendar-panel>

    <h3>Inline Time Panel with Actions</h3>
    <ui-calendar-panel size="m" show-actions>
      <ui-calendar value="2024-06-15"></ui-calendar>
      <ui-calendar-time slot="bottom" value="14:30"></ui-calendar-time>
    </ui-calendar-panel>
  `,
  setup: () => {
    for (const size of ["s", "m", "l"]) {
      const cal = document.getElementById(`cal-range-${size}`) as HTMLElement | null;
      if (cal && "rangeStart" in cal) {
        (cal as any).rangeStart = "2024-06-10";
        (cal as any).rangeEnd = "2024-06-20";
      }
    }

    const qlSide = document.getElementById("cal-ql-side") as HTMLElement | null;
    if (qlSide && "setItems" in qlSide) {
      (qlSide as any).setItems([
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 days", value: "last-7" },
        { label: "Last 30 days", value: "last-30" },
      ]);
    }

    const qlBottom = document.getElementById("cal-ql-bottom") as HTMLElement | null;
    if (qlBottom && "setItems" in qlBottom) {
      (qlBottom as any).setItems([
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 days", value: "last-7" },
        { label: "Last 30 days", value: "last-30" },
      ]);
    }

    const calEvents = document.getElementById("cal-events-demo") as HTMLElement | null;
    if (calEvents && "setEvents" in calEvents) {
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
      (calEvents as any).setEvents(events);
    }
  },
});
