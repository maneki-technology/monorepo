import { registerPage } from "../registry.js";

registerPage("datetime-picker", {
  title: "Datetime Picker",
  section: "Calendar & Date",
  render: () => `
    <h3>Types</h3>
    <div class="variant-group stack-m w-320">
      <div class="variant-col">
        <span class="variant-label">Single Date</span>
        <ui-datetime-picker type="single-date" label="Pick a date"></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Range Date</span>
        <ui-datetime-picker type="range-date" label="Date range"></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Time</span>
        <ui-datetime-picker type="time" label="Select time"></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Datetime</span>
        <ui-datetime-picker type="datetime" label="Date &amp; time"></ui-datetime-picker>
      </div>
    </div>

    <h3>With Value</h3>
    <div class="variant-group stack-m w-320">
      <div class="variant-col">
        <span class="variant-label">Single Date</span>
        <ui-datetime-picker type="single-date" label="Select Date" value="2024-06-15"></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Range Date</span>
        <ui-datetime-picker type="range-date" label="Date Range" value="2024-06-10/2024-06-20"></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Time</span>
        <ui-datetime-picker type="time" label="Select Time" value="14:30"></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Datetime</span>
        <ui-datetime-picker type="datetime" label="Date &amp; Time" value="2024-06-15 14:30"></ui-datetime-picker>
      </div>
    </div>

    <h3>With Actions</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" label="Select Date" show-actions value="2024-06-15"></ui-datetime-picker>
    </div>

    <h3>Disabled</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" label="Select Date" disabled value="2024-06-15"></ui-datetime-picker>
    </div>

    <h3>Status Error</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" label="Select Date" status="error" supportive="This field is required"></ui-datetime-picker>
    </div>

    <h3>Inline Time Mode</h3>
    <div class="w-320">
      <ui-datetime-picker type="datetime" label="Date &amp; Time" time-mode="inline" value="2024-06-15 14:30"></ui-datetime-picker>
    </div>

    <h3>Match Panel Width</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" label="Select Date" match-panel value="2024-06-15"></ui-datetime-picker>
    </div>
  `,
});
