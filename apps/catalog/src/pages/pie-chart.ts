import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("pie-chart", {
  title: "Pie / Doughnut",
  section: "Charts",
  render: () => `
    <h3>Pie Chart (declarative)</h3>
    <p class="hint">Basic pie chart — slices sized by value</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-pie
        title="Market Share"
        slices='[{"label":"Chrome","value":65},{"label":"Safari","value":19},{"label":"Firefox","value":10},{"label":"Edge","value":4},{"label":"Other","value":2}]'
      ></chart-pie>
    </div>

    <h3>Doughnut Chart (declarative)</h3>
    <p class="hint">inner-radius="0.6" creates the doughnut hole</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-pie
        title="Budget Allocation"
        slices='[{"label":"Rent","value":1200},{"label":"Food","value":400},{"label":"Transport","value":200},{"label":"Utilities","value":150},{"label":"Entertainment","value":100},{"label":"Savings","value":350}]'
        inner-radius="0.6"
      ></chart-pie>
    </div>

    <h3>Custom Colors (declarative)</h3>
    <p class="hint">Explicit palette index per slice</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-pie
        title="Revenue by Region"
        slices='[{"label":"North America","value":42,"color":1},{"label":"Europe","value":28,"color":3},{"label":"Asia","value":20,"color":5},{"label":"Other","value":10,"color":4}]'
        inner-radius="0.5"
      ></chart-pie>
    </div>

    <h3>Many Slices (declarative)</h3>
    <p class="hint">10 slices cycling through the full palette</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-pie
        title="Top Languages"
        slices='[{"label":"JavaScript","value":25},{"label":"Python","value":20},{"label":"TypeScript","value":15},{"label":"Java","value":10},{"label":"C#","value":8},{"label":"Go","value":6},{"label":"Rust","value":5},{"label":"PHP","value":4},{"label":"Swift","value":4},{"label":"Kotlin","value":3}]'
      ></chart-pie>
    </div>

    <h3>Thin Doughnut (declarative)</h3>
    <p class="hint">inner-radius="0.8" for a thin ring style</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-pie
        title="Task Status"
        slices='[{"label":"Complete","value":72,"color":3},{"label":"In Progress","value":18,"color":1},{"label":"Blocked","value":10,"color":2}]'
        inner-radius="0.8"
      ></chart-pie>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container — SVG viewBox handles responsiveness</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-pie
        title="Responsive Doughnut"
        slices='[{"label":"A","value":40},{"label":"B","value":30},{"label":"C","value":20},{"label":"D","value":10}]'
        inner-radius="0.55"
      ></chart-pie>
    </div>
  `,
});
