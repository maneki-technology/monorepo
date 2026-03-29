import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("horizontal-bar-chart", {
  title: "Horizontal Bar",
  section: "Charts",
  render: () => `
    <h3>Single Dataset (declarative)</h3>
    <p class="hint">Horizontal bars — categories on Y axis, values on X</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-horizontal-bar
        title="Top Languages"
        labels='["JavaScript","Python","TypeScript","Java","Go","Rust"]'
        datasets='[{"label":"Usage %","data":[25,20,15,10,8,5],"color":1}]'
      ></chart-horizontal-bar>
    </div>

    <h3>Multi-Dataset (declarative)</h3>
    <p class="hint">Two datasets with grouped horizontal bars</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-horizontal-bar
        title="Revenue by Region"
        labels='["North America","Europe","Asia Pacific","Latin America","Middle East"]'
        datasets='[{"label":"2024","data":[420,380,510,290,180],"color":1},{"label":"2025","data":[480,410,550,340,220],"color":3}]'
      ></chart-horizontal-bar>
    </div>

    <h3>Negative Values (declarative)</h3>
    <p class="hint">Bars extending left from zero line</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-horizontal-bar
        title="Net Change"
        labels='["Product A","Product B","Product C","Product D","Product E"]'
        datasets='[{"label":"Change","data":[30,-15,45,-8,22],"color":5}]'
      ></chart-horizontal-bar>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-horizontal-bar
        title="Responsive Horizontal Bar"
        labels='["A","B","C","D","E"]'
        datasets='[{"label":"Series 1","data":[65,59,80,81,56],"color":1},{"label":"Series 2","data":[28,48,40,19,86],"color":2}]'
      ></chart-horizontal-bar>
    </div>
  `,
});
