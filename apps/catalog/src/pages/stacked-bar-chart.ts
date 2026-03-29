import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("stacked-bar-chart", {
  title: "Stacked Bar",
  section: "Charts",
  render: () => `
    <h3>Basic Stacked (declarative)</h3>
    <p class="hint">Datasets stack on top of each other within each category</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-stacked-bar
        title="Revenue Breakdown"
        labels='["Q1","Q2","Q3","Q4"]'
        datasets='[{"label":"Product","data":[200,300,250,400],"color":1},{"label":"Services","data":[100,150,200,180],"color":3},{"label":"Licensing","data":[50,80,60,90],"color":5}]'
      ></chart-stacked-bar>
    </div>

    <h3>Two Datasets (declarative)</h3>
    <p class="hint">Simple two-part stack</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-stacked-bar
        title="Online vs Offline Sales"
        labels='["Jan","Feb","Mar","Apr","May","Jun"]'
        datasets='[{"label":"Online","data":[300,350,280,400,450,380],"color":1},{"label":"Offline","data":[200,180,220,150,170,200],"color":4}]'
      ></chart-stacked-bar>
    </div>

    <h3>Many Categories (declarative)</h3>
    <p class="hint">Monthly data with rotated labels</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-stacked-bar
        title="Monthly Expenses"
        labels='["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]'
        datasets='[{"label":"Rent","data":[1200,1200,1200,1200,1200,1200,1200,1200,1200,1200,1200,1200],"color":1},{"label":"Food","data":[400,380,420,390,410,430,400,380,420,400,410,450],"color":3},{"label":"Transport","data":[200,180,220,200,190,210,200,180,220,200,190,210],"color":5}]'
        label-rotation="25"
      ></chart-stacked-bar>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-stacked-bar
        title="Responsive Stacked Bar"
        labels='["A","B","C","D"]'
        datasets='[{"label":"X","data":[40,60,50,70],"color":1},{"label":"Y","data":[30,40,35,45],"color":2},{"label":"Z","data":[20,25,30,20],"color":6}]'
      ></chart-stacked-bar>
    </div>
  `,
});
