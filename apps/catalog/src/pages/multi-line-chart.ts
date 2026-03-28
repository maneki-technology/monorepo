import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("multi-line-chart", {
  title: "Multi-Axis Line",
  section: "Charts",
  render: () => `
    <h3>Dual Y-Axis (declarative)</h3>
    <p class="hint">Left axis for revenue, right axis for user count — different scales</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-multi-line
        title="Revenue & Users"
        labels='["Jan","Feb","Mar","Apr","May","Jun","Jul"]'
        datasets='[{"label":"Revenue ($k)","data":[12,18,15,22,28,25,32],"yAxisID":"left","color":1},{"label":"Users","data":[150,220,180,310,420,380,500],"yAxisID":"right","color":2}]'
        tension="0.4"
      ></chart-multi-line>
    </div>

    <h3>Three Datasets (declarative)</h3>
    <p class="hint">Two on left axis, one on right</p>
    <div style="max-width:960px;margin-bottom:32px">
      <chart-multi-line
        title="Sales Performance"
        labels='["Q1","Q2","Q3","Q4"]'
        datasets='[{"label":"Online Sales","data":[300,450,380,520],"yAxisID":"left","color":1},{"label":"Offline Sales","data":[200,180,220,190],"yAxisID":"left","color":3},{"label":"Conversion %","data":[3.2,4.1,3.8,4.5],"yAxisID":"right","color":5}]'
        tension="0.3"
      ></chart-multi-line>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-multi-line
        title="Responsive Multi-Axis"
        labels='["Mon","Tue","Wed","Thu","Fri"]'
        datasets='[{"label":"Temperature (\u00b0C)","data":[22,25,20,28,24],"yAxisID":"left","color":2},{"label":"Humidity (%)","data":[65,58,72,50,60],"yAxisID":"right","color":1}]'
        tension="0.4"
      ></chart-multi-line>
    </div>
  `,
});
