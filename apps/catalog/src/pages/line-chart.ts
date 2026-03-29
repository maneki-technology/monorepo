import { registerPage } from "../registry.js";
import "@maneki/charts";
import type { ChartLineElement } from "@maneki/charts";

registerPage("line-chart", {
  title: "Line Chart",
  section: "Charts",
  render: () => `
    <h3>Single Dataset (declarative)</h3>
    <p class="hint">Basic line chart with data points — fully declarative</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line
        title="Monthly Revenue"
        labels='["January","February","March","April","May","June","July"]'
        datasets='[{"label":"Revenue","data":[65,59,80,81,56,55,40],"color":1}]'
        label-rotation="25"
      ></chart-line>
    </div>

    <h3>Multi-Dataset (declarative)</h3>
    <p class="hint">Two datasets with distinct colors</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line
        title="Sales vs Expenses"
        labels='["Jan","Feb","Mar","Apr","May","Jun","Jul"]'
        datasets='[{"label":"Sales","data":[350,300,150,100,700,550,30],"color":1},{"label":"Expenses","data":[200,250,180,120,400,300,80],"color":2}]'
      ></chart-line>
    </div>

    <h3>Area Fill (declarative)</h3>
    <p class="hint">Line with filled area underneath — fill attribute</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line
        title="Website Traffic"
        labels='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
        datasets='[{"label":"Visitors","data":[1200,1900,3000,5000,2000,3000,4500],"color":3}]'
        fill
      ></chart-line>
    </div>

    <h3>Curved Lines (declarative)</h3>
    <p class="hint">Smooth curves via tension="0.4" — cubic Bézier interpolation</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line
        title="Temperature"
        labels='["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]'
        datasets='[{"label":"High","data":[5,7,12,18,23,28,31,30,25,18,11,6],"color":2},{"label":"Low","data":[-2,0,4,8,13,17,20,19,14,8,3,-1],"color":1}]'
        tension="0.4"
        fill
      ></chart-line>
    </div>

    <h3>No Points (declarative)</h3>
    <p class="hint">Clean line without data point circles</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line
        title="Stock Price"
        labels='["9am","10am","11am","12pm","1pm","2pm","3pm","4pm"]'
        datasets='[{"label":"AAPL","data":[150,152,148,155,153,157,160,158],"color":5}]'
        show-points="false"
        tension="0.4"
        line-width="3"
      ></chart-line>
    </div>

    <h3>Many Datasets (programmatic)</h3>
    <p class="hint">Five datasets cycling through the chart palette</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line id="chart-many"></chart-line>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container — SVG viewBox handles responsiveness</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-line
        title="Responsive Line Chart"
        labels='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
        datasets='[{"label":"Dataset 1","data":[65,59,80,81,56,55,40],"color":1},{"label":"Dataset 2","data":[28,48,40,19,86,27,90],"color":2}]'
        tension="0.4"
      ></chart-line>
    </div>

    <h3>Gradient Fill (declarative)</h3>
    <p class="hint">gradient attribute uses SVG linearGradient — color fades from top to transparent</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line
        title="Revenue Trend"
        labels='["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]'
        datasets='[{"label":"Revenue","data":[120,180,150,220,280,250,320,300,350,310,380,420],"color":1}]'
        gradient
        tension="0.4"
      ></chart-line>
    </div>

    <h3>Multi-Dataset Gradient (declarative)</h3>
    <p class="hint">Each dataset gets its own gradient</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-line
        title="Traffic Sources"
        labels='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
        datasets='[{"label":"Organic","data":[1200,1500,1800,2200,1900,1100,900],"color":3},{"label":"Paid","data":[800,1000,900,1100,1300,700,500],"color":1}]'
        gradient
        tension="0.4"
        show-points="false"
      ></chart-line>
    </div>
  `,
  setup: () => {
    // Many datasets — programmatic for readability
    const many = document.getElementById("chart-many") as ChartLineElement;
    if (many) {
      many.options = {
        title: "Quarterly Metrics",
        labels: ["Q1", "Q2", "Q3", "Q4"],
        tension: 0.4,
      };
      many.datasets = [
        { label: "Revenue", data: [120, 200, 150, 180] },
        { label: "Profit", data: [60, 80, 100, 90] },
        { label: "Users", data: [300, 450, 400, 500] },
        { label: "Sessions", data: [500, 700, 600, 800] },
        { label: "Conversions", data: [40, 60, 55, 70] },
      ];
    }
  },
});
