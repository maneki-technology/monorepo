import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("stacked-horizontal-bar-chart", {
  title: "Stacked Horizontal Bar",
  section: "Charts",
  render: () => `
    <h3>Basic Stacked Horizontal (declarative)</h3>
    <p class="hint">Datasets stack left-to-right within each category row</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-stacked-horizontal-bar
        title="Task Status by Team"
        labels='["Team A","Team B","Team C","Team D"]'
        datasets='[{"label":"Done","data":[30,45,25,35],"color":3},{"label":"In Progress","data":[15,10,20,12],"color":1},{"label":"Todo","data":[5,5,15,8],"color":4}]'
      ></chart-stacked-horizontal-bar>
    </div>

    <h3>Two Datasets (declarative)</h3>
    <p class="hint">Simple two-part horizontal stack</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-stacked-horizontal-bar
        title="Budget vs Spent"
        labels='["Marketing","Engineering","Sales","Support","HR"]'
        datasets='[{"label":"Spent","data":[80,120,60,40,30],"color":2},{"label":"Remaining","data":[20,30,40,10,20],"color":6}]'
      ></chart-stacked-horizontal-bar>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-stacked-horizontal-bar
        title="Responsive Stacked Horizontal"
        labels='["A","B","C","D"]'
        datasets='[{"label":"X","data":[40,60,50,70],"color":1},{"label":"Y","data":[30,40,35,45],"color":5},{"label":"Z","data":[20,25,30,20],"color":3}]'
      ></chart-stacked-horizontal-bar>
    </div>
  `,
});
