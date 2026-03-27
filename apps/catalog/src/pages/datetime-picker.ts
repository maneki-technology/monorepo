import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-datetime-picker.js";

registerPage("datetime-picker", {
  title: "Datetime Picker",
  section: "Calendar & Date",
  render: () => `
    <h3>Types</h3>
    <div class="variant-group stack-m w-320">
      <div class="variant-col">
        <span class="variant-label">Single Date</span>
        <ui-datetime-picker type="single-date"><ui-label slot="label">Pick a date</ui-label></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Range Date</span>
        <ui-datetime-picker type="range-date"><ui-label slot="label">Date range</ui-label></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Time</span>
        <ui-datetime-picker type="time"><ui-label slot="label">Select time</ui-label></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Datetime</span>
        <ui-datetime-picker type="datetime"><ui-label slot="label">Date &amp; time</ui-label></ui-datetime-picker>
      </div>
    </div>

    <h3>With Value</h3>
    <div class="variant-group stack-m w-320">
      <div class="variant-col">
        <span class="variant-label">Single Date</span>
        <ui-datetime-picker type="single-date" value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Range Date</span>
        <ui-datetime-picker type="range-date" value="2024-06-10/2024-06-20"><ui-label slot="label">Date Range</ui-label></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Time</span>
        <ui-datetime-picker type="time" value="14:30"><ui-label slot="label">Select Time</ui-label></ui-datetime-picker>
      </div>
      <div class="variant-col">
        <span class="variant-label">Datetime</span>
        <ui-datetime-picker type="datetime" value="2024-06-15 14:30"><ui-label slot="label">Date &amp; Time</ui-label></ui-datetime-picker>
      </div>
    </div>

    <h3>With Actions</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" show-actions value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
    </div>

    <h3>Disabled</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" disabled value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
    </div>

    <h3>Status Error</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" status="error" supportive="This field is required"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
    </div>

    <h3>Inline Time Mode</h3>
    <div class="w-320">
      <ui-datetime-picker type="datetime" time-mode="inline" value="2024-06-15 14:30"><ui-label slot="label">Date &amp; Time</ui-label></ui-datetime-picker>
    </div>

    <h3>Match Panel Width</h3>
    <div class="w-320">
      <ui-datetime-picker type="single-date" match-panel value="2024-06-15"><ui-label slot="label">Select Date</ui-label></ui-datetime-picker>
    </div>
  `,
});
