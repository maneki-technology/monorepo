import { registerPage } from "../registry.js";
import "@maneki/charts";
import type { ChartBarElement } from "@maneki/charts";

registerPage("bar-chart", {
  title: "Bar Chart",
  section: "Charts",
  render: () => `
    <h3>Single Dataset (declarative)</h3>
    <p class="hint">Fully declarative via HTML attributes — no JavaScript needed</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-bar
        title="Chart.js Bar Chart"
        labels='["January","February","March","April","May","June","July"]'
        datasets='[{"label":"Dataset 1","data":[350,300,150,100,700,550,30],"color":1}]'
        label-rotation="25"
      ></chart-bar>
    </div>

    <h3>Multi-Dataset (declarative)</h3>
    <p class="hint">Two datasets with grouped bars — all via attributes</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-bar
        title="Chart.js Bar Chart"
        labels='["January","February","March","April","May","June","July"]'
        datasets='[{"label":"Dataset 1","data":[350,300,150,100,700,550,30],"color":1},{"label":"Dataset 2","data":[370,630,80,380,140,260,100],"color":2}]'
        label-rotation="25"
      ></chart-bar>
    </div>

    <h3>Many Datasets (programmatic)</h3>
    <p class="hint">Five datasets cycling through the 10-color chart palette</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-bar id="chart-many"></chart-bar>
    </div>

    <h3>Negative Values (declarative)</h3>
    <p class="hint">Bars extending below zero line</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-bar
        title="Monthly Profit/Loss"
        labels='["Jan","Feb","Mar","Apr","May","Jun","Jul"]'
        datasets='[{"label":"Profit/Loss","data":[200,-150,300,-50,100,-200,400],"color":6}]'
      ></chart-bar>
    </div>

    <h3>No Grid Lines (declarative)</h3>
    <p class="hint">Clean look — show-grid="false" disables grid</p>
    <div style="max-width:600px;margin-bottom:32px">
      <chart-bar
        title="Page Views"
        labels='["Jan","Feb","Mar","Apr","May","Jun"]'
        datasets='[{"label":"Views","data":[1200,1900,3000,5000,2000,3000],"color":7}]'
        show-grid="false"
      ></chart-bar>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container — SVG viewBox handles responsiveness</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-bar
        title="Responsive Bar Chart"
        labels='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
        datasets='[{"label":"Dataset 1","data":[65,59,80,81,56,55,40],"color":1},{"label":"Dataset 2","data":[28,48,40,19,86,27,90],"color":2}]'
      ></chart-bar>
    </div>

    <h3>Custom Colors (programmatic)</h3>
    <p class="hint">Datasets with explicit palette index overrides</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-bar id="chart-colors"></chart-bar>
    </div>
  `,
  setup: () => {
    // Many datasets — programmatic for readability
    const many = document.getElementById("chart-many") as ChartBarElement;
    if (many) {
      many.options = {
        title: "Quarterly Performance",
        labels: ["Q1", "Q2", "Q3", "Q4", "Q5"],
      };
      many.datasets = [
        { label: "Sales", data: [120, 200, 150, 80, 170] },
        { label: "Revenue", data: [90, 150, 200, 120, 140] },
        { label: "Profit", data: [60, 80, 100, 50, 90] },
        { label: "Expenses", data: [100, 130, 110, 90, 120] },
        { label: "Growth", data: [40, 60, 80, 30, 70] },
      ];
    }

    // Custom colors — programmatic
    const colors = document.getElementById("chart-colors") as ChartBarElement;
    if (colors) {
      colors.options = {
        title: "Revenue by Region",
        labels: ["North", "South", "East", "West"],
      };
      colors.datasets = [
        { label: "2024", data: [420, 380, 510, 290], color: 5 },
        { label: "2025", data: [480, 410, 550, 340], color: 8 },
        { label: "2026", data: [520, 450, 600, 380], color: 3 },
      ];
    }
  },
});
