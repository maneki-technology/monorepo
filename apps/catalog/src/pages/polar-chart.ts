import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("polar-chart", {
  title: "Polar Area",
  section: "Charts",
  render: () => `
    <h3>Basic Polar Area (declarative)</h3>
    <p class="hint">Equal-angle slices with varying radius — radius represents value</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-polar
        title="Skill Assessment"
        slices='[{"label":"JavaScript","value":90},{"label":"CSS","value":75},{"label":"HTML","value":95},{"label":"React","value":80},{"label":"Node.js","value":70},{"label":"TypeScript","value":85}]'
      ></chart-polar>
    </div>

    <h3>Many Slices (declarative)</h3>
    <p class="hint">10 slices cycling through the full palette</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-polar
        title="Monthly Rainfall (mm)"
        slices='[{"label":"Jan","value":80},{"label":"Feb","value":60},{"label":"Mar","value":50},{"label":"Apr","value":40},{"label":"May","value":30},{"label":"Jun","value":20},{"label":"Jul","value":15},{"label":"Aug","value":25},{"label":"Sep","value":45},{"label":"Oct","value":65},{"label":"Nov","value":75},{"label":"Dec","value":85}]'
      ></chart-polar>
    </div>

    <h3>Few Slices (declarative)</h3>
    <p class="hint">Three large sectors</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-polar
        title="Performance Metrics"
        slices='[{"label":"Speed","value":92,"color":1},{"label":"Accuracy","value":78,"color":3},{"label":"Reliability","value":85,"color":5}]'
      ></chart-polar>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-polar
        title="Responsive Polar"
        slices='[{"label":"A","value":80},{"label":"B","value":60},{"label":"C","value":90},{"label":"D","value":45},{"label":"E","value":70}]'
      ></chart-polar>
    </div>
  `,
});
