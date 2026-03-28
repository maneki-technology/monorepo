import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("multitype-chart", {
  title: "Multitype (Bar + Line)",
  section: "Charts",
  render: () => `
    <h3>Bar + Line Composite (declarative)</h3>
    <p class="hint">Bars for absolute values, line for trend — on the same grid</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-multitype
        title="Revenue & Growth Rate"
        labels='["Jan","Feb","Mar","Apr","May","Jun"]'
        datasets='[{"label":"Revenue ($k)","data":[120,180,150,200,250,220],"type":"bar","color":1},{"label":"Growth %","data":[10,15,12,18,25,20],"type":"line","color":2}]'
        tension="0.3"
      ></chart-multitype>
    </div>

    <h3>Multiple Bar + Line (declarative)</h3>
    <p class="hint">Two bar datasets and one line overlay</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-multitype
        title="Sales Analysis"
        labels='["Q1","Q2","Q3","Q4"]'
        datasets='[{"label":"Online","data":[300,450,380,520],"type":"bar","color":1},{"label":"Offline","data":[200,180,220,190],"type":"bar","color":3},{"label":"Target","data":[400,500,450,600],"type":"line","color":5}]'
        tension="0.3"
      ></chart-multitype>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-multitype
        title="Responsive Multitype"
        labels='["Mon","Tue","Wed","Thu","Fri"]'
        datasets='[{"label":"Actual","data":[65,59,80,81,56],"type":"bar","color":1},{"label":"Forecast","data":[60,65,75,85,60],"type":"line","color":4}]'
        tension="0.3"
      ></chart-multitype>
    </div>
  `,
});
