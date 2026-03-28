import { registerPage } from "../registry.js";
import "@maneki/charts";

registerPage("radar-chart", {
  title: "Radar",
  section: "Charts",
  render: () => `
    <h3>Basic Radar (declarative)</h3>
    <p class="hint">Radar chart with two datasets — polygon overlay with fill</p>
    <div style="max-width:700px;margin-bottom:32px">
      <chart-radar
        title="Developer Skills"
        axes='[{"label":"JavaScript"},{"label":"CSS"},{"label":"HTML"},{"label":"React"},{"label":"Node.js"},{"label":"TypeScript"}]'
        datasets='[{"label":"Alice","data":[90,80,95,70,85,88],"color":1},{"label":"Bob","data":[70,90,80,85,75,65],"color":2}]'
      ></chart-radar>
    </div>

    <h3>Single Dataset (declarative)</h3>
    <p class="hint">Single polygon — good for showing one entity's profile</p>
    <div style="max-width:700px;margin-bottom:32px">
      <chart-radar
        title="Product Ratings"
        axes='[{"label":"Design"},{"label":"Features"},{"label":"Performance"},{"label":"Reliability"},{"label":"Support"}]'
        datasets='[{"label":"Product A","data":[85,70,90,75,80],"color":3}]'
      ></chart-radar>
    </div>

    <h3>No Fill (declarative)</h3>
    <p class="hint">fill="false" shows outlines only</p>
    <div style="max-width:700px;margin-bottom:32px">
      <chart-radar
        title="Team Comparison"
        axes='[{"label":"Speed"},{"label":"Accuracy"},{"label":"Teamwork"},{"label":"Leadership"},{"label":"Creativity"},{"label":"Communication"},{"label":"Problem Solving"}]'
        datasets='[{"label":"Team A","data":[80,90,70,60,85,75,90],"color":1},{"label":"Team B","data":[70,75,90,85,60,80,70],"color":5},{"label":"Team C","data":[90,60,80,70,75,85,65],"color":3}]'
        fill="false"
      ></chart-radar>
    </div>

    <h3>Custom Max Values (declarative)</h3>
    <p class="hint">Each axis can have its own max — useful for different scales</p>
    <div style="max-width:700px;margin-bottom:32px">
      <chart-radar
        title="Server Metrics"
        axes='[{"label":"CPU %","max":100},{"label":"Memory GB","max":64},{"label":"Disk TB","max":4},{"label":"Network Mbps","max":1000},{"label":"Uptime %","max":100}]'
        datasets='[{"label":"Server 1","data":[75,48,2.5,800,99.9],"color":1},{"label":"Server 2","data":[45,32,1.8,600,99.5],"color":4}]'
        levels="4"
      ></chart-radar>
    </div>

    <h3>Responsive</h3>
    <p class="hint">Resize the container — SVG viewBox handles responsiveness</p>
    <div style="width:100%;resize:horizontal;overflow:auto;border:1px dashed var(--fd-border-minimal);padding:16px;margin-bottom:32px">
      <chart-radar
        title="Responsive Radar"
        axes='[{"label":"A"},{"label":"B"},{"label":"C"},{"label":"D"},{"label":"E"},{"label":"F"}]'
        datasets='[{"label":"Data","data":[80,60,90,70,85,75],"color":6}]'
      ></chart-radar>
    </div>
  `,
});
