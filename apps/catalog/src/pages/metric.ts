import { registerPage } from "../registry.js";

registerPage("metric", {
  title: "Metric",
  section: "Data Display",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <div class="variant-col">
        <span class="variant-label">XS</span>
        <ui-metric size="xs" label="Revenue" value="$1.2M"></ui-metric>
      </div>
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-metric size="s" label="Revenue" value="$1.2M"></ui-metric>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-metric size="m" label="Revenue" value="$1.2M"></ui-metric>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-metric size="l" label="Revenue" value="$1.2M"></ui-metric>
      </div>
    </div>

    <h3>Delta Up</h3>
    <div class="variant-row">
      <ui-metric size="xs" label="Users" value="24.5K" delta="up" delta-text="+1.2K (5.1%)"></ui-metric>
      <ui-metric size="s" label="Users" value="24.5K" delta="up" delta-text="+1.2K (5.1%)"></ui-metric>
      <ui-metric size="m" label="Users" value="24.5K" delta="up" delta-text="+1.2K (5.1%)"></ui-metric>
      <ui-metric size="l" label="Users" value="24.5K" delta="up" delta-text="+1.2K (5.1%)"></ui-metric>
    </div>

    <h3>Delta Down</h3>
    <div class="variant-row">
      <ui-metric size="xs" label="Churn" value="3.2%" delta="down" delta-text="-0.5% (2.1%)"></ui-metric>
      <ui-metric size="s" label="Churn" value="3.2%" delta="down" delta-text="-0.5% (2.1%)"></ui-metric>
      <ui-metric size="m" label="Churn" value="3.2%" delta="down" delta-text="-0.5% (2.1%)"></ui-metric>
      <ui-metric size="l" label="Churn" value="3.2%" delta="down" delta-text="-0.5% (2.1%)"></ui-metric>
    </div>

    <h3>With Legend</h3>
    <div class="variant-row">
      <ui-metric size="m" label="Series A" value="$450K" legend-color="#cc1d92"></ui-metric>
      <ui-metric size="m" label="Series B" value="$780K" legend-color="#0d4ea6"></ui-metric>
      <ui-metric size="m" label="Series C" value="$120K" legend-color="#077d55"></ui-metric>
    </div>

    <h3>With Secondary Label</h3>
    <div class="variant-row">
      <ui-metric size="s" label="Revenue" value="$1.2M" secondary-label="vs last month"></ui-metric>
      <ui-metric size="m" label="Revenue" value="$1.2M" secondary-label="vs last quarter"></ui-metric>
      <ui-metric size="l" label="Revenue" value="$1.2M" secondary-label="vs last year"></ui-metric>
    </div>

    <h3>Full Variant (Legend + Delta + Secondary)</h3>
    <div class="variant-row">
      <ui-metric size="xs" label="Revenue" value="$1.2M" delta="up" delta-text="+12.5K (3.2%)" secondary-label="vs last month" legend-color="#cc1d92"></ui-metric>
      <ui-metric size="s" label="Revenue" value="$1.2M" delta="up" delta-text="+12.5K (3.2%)" secondary-label="vs last month" legend-color="#cc1d92"></ui-metric>
      <ui-metric size="m" label="Revenue" value="$1.2M" delta="up" delta-text="+12.5K (3.2%)" secondary-label="vs last month" legend-color="#cc1d92"></ui-metric>
      <ui-metric size="l" label="Revenue" value="$1.2M" delta="up" delta-text="+12.5K (3.2%)" secondary-label="vs last month" legend-color="#cc1d92"></ui-metric>
    </div>

    <h3>Horizontal (M only)</h3>
    <div class="stack-m">
      <ui-metric size="m" orientation="horizontal" label="Total Revenue" value="$1.2M"></ui-metric>
      <ui-metric size="m" orientation="horizontal" label="Active Users" value="24.5K"></ui-metric>
      <ui-metric size="m" orientation="horizontal" label="Conversion" value="3.2%"></ui-metric>
    </div>

    <h3>Clickable</h3>
    <div class="variant-row">
      <ui-metric size="m" label="Revenue" value="$1.2M" clickable></ui-metric>
      <ui-metric size="m" label="Users" value="24.5K" clickable delta="up" delta-text="+1.2K"></ui-metric>
    </div>

    <h3>Metric Group</h3>
    <div class="stack-l">
      <ui-metric-group size="xs" title="Performance">
        <ui-metric label="Revenue" value="$1.2M"></ui-metric>
        <ui-metric label="Users" value="24.5K"></ui-metric>
        <ui-metric label="Orders" value="8.3K"></ui-metric>
        <ui-metric label="AOV" value="$142"></ui-metric>
        <ui-metric label="Conv." value="3.2%"></ui-metric>
      </ui-metric-group>

      <ui-metric-group size="s" title="Performance">
        <ui-metric label="Revenue" value="$1.2M"></ui-metric>
        <ui-metric label="Users" value="24.5K"></ui-metric>
        <ui-metric label="Orders" value="8.3K"></ui-metric>
        <ui-metric label="AOV" value="$142"></ui-metric>
        <ui-metric label="Conv." value="3.2%"></ui-metric>
      </ui-metric-group>

      <ui-metric-group size="m" title="Performance">
        <ui-metric label="Revenue" value="$1.2M"></ui-metric>
        <ui-metric label="Users" value="24.5K"></ui-metric>
        <ui-metric label="Orders" value="8.3K"></ui-metric>
        <ui-metric label="AOV" value="$142"></ui-metric>
        <ui-metric label="Conv." value="3.2%"></ui-metric>
      </ui-metric-group>

      <ui-metric-group size="l" title="Performance">
        <ui-metric label="Revenue" value="$1.2M" secondary-label="YTD"></ui-metric>
        <ui-metric label="Users" value="24.5K" secondary-label="YTD"></ui-metric>
        <ui-metric label="Orders" value="8.3K" secondary-label="YTD"></ui-metric>
        <ui-metric label="AOV" value="$142" secondary-label="YTD"></ui-metric>
        <ui-metric label="Conv." value="3.2%" secondary-label="YTD"></ui-metric>
      </ui-metric-group>
    </div>
  `,
});
