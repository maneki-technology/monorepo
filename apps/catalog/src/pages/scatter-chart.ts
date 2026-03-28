import { registerPage } from "../registry.js";
import "@maneki/charts";
import type { ChartScatterElement } from "@maneki/charts";

registerPage("scatter-chart", {
  title: "Scatter / Bubble",
  section: "Charts",
  render: () => `
    <h3>Scatter Plot (declarative)</h3>
    <p class="hint">Basic scatter — each point positioned by x,y coordinates</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-scatter
        title="Height vs Weight"
        datasets='[{"label":"Group A","data":[{"x":165,"y":55},{"x":170,"y":62},{"x":175,"y":70},{"x":180,"y":78},{"x":185,"y":85},{"x":160,"y":50},{"x":172,"y":65},{"x":178,"y":75}],"color":1},{"label":"Group B","data":[{"x":155,"y":48},{"x":162,"y":55},{"x":168,"y":60},{"x":174,"y":68},{"x":182,"y":80},{"x":158,"y":52},{"x":166,"y":58},{"x":176,"y":72}],"color":2}]'
      ></chart-scatter>
    </div>

    <h3>Bubble Chart (declarative)</h3>
    <p class="hint">Scatter with r values — bubble size represents a third dimension</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-scatter
        title="GDP vs Life Expectancy"
        datasets='[{"label":"Countries","data":[{"x":10000,"y":72,"r":50},{"x":25000,"y":76,"r":120},{"x":40000,"y":80,"r":30},{"x":55000,"y":82,"r":80},{"x":15000,"y":74,"r":200},{"x":35000,"y":79,"r":60},{"x":8000,"y":68,"r":150},{"x":45000,"y":81,"r":40}]}]'
        min-bubble-radius="8"
        max-bubble-radius="50"
      ></chart-scatter>
    </div>

    <h3>Multi-Dataset Scatter (programmatic)</h3>
    <p class="hint">Three datasets with distinct colors</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-scatter id="scatter-multi"></chart-scatter>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-scatter
        title="Responsive Scatter"
        datasets='[{"label":"Data","data":[{"x":1,"y":2},{"x":3,"y":5},{"x":5,"y":4},{"x":7,"y":8},{"x":9,"y":6},{"x":2,"y":3},{"x":4,"y":7},{"x":6,"y":5},{"x":8,"y":9},{"x":10,"y":7}],"color":5}]'
      ></chart-scatter>
    </div>
  `,
  setup: () => {
    const multi = document.getElementById("scatter-multi") as ChartScatterElement;
    if (multi) {
      multi.options = { title: "Cluster Analysis" };
      multi.datasets = [
        {
          label: "Cluster A",
          color: 1,
          data: Array.from({ length: 15 }, () => ({
            x: 20 + Math.random() * 30,
            y: 40 + Math.random() * 30,
          })),
        },
        {
          label: "Cluster B",
          color: 3,
          data: Array.from({ length: 15 }, () => ({
            x: 60 + Math.random() * 30,
            y: 20 + Math.random() * 25,
          })),
        },
        {
          label: "Cluster C",
          color: 5,
          data: Array.from({ length: 15 }, () => ({
            x: 40 + Math.random() * 25,
            y: 70 + Math.random() * 25,
          })),
        },
      ];
    }
  },
});
