import { registerPage } from "../registry.js";

registerPage("tabs", {
  title: "Tabs",
  section: "Tabs",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-group stack-m">
      <div class="variant-col">
        <span class="variant-label">Size s</span>
        <ui-tab-group size="s">
          <ui-tab-item label="Overview" selected></ui-tab-item>
          <ui-tab-item label="Details"></ui-tab-item>
          <ui-tab-item label="Settings"></ui-tab-item>
        </ui-tab-group>
      </div>
      <div class="variant-col">
        <span class="variant-label">Size m</span>
        <ui-tab-group size="m">
          <ui-tab-item label="Overview" selected></ui-tab-item>
          <ui-tab-item label="Details"></ui-tab-item>
          <ui-tab-item label="Settings"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>

    <h3>Orientation</h3>
    <div class="variant-row row-start-wrap gap-48">
      <div class="variant-col">
        <span class="variant-label">Horizontal</span>
        <ui-tab-group orientation="horizontal">
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
          <ui-tab-item label="Pie Chart"></ui-tab-item>
        </ui-tab-group>
      </div>
      <div class="variant-col">
        <span class="variant-label">Vertical</span>
        <ui-tab-group orientation="vertical" class="w-200">
          <ui-tab-item label="Data Grid" selected></ui-tab-item>
          <ui-tab-item label="Table"></ui-tab-item>
          <ui-tab-item label="Pie Chart"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>

    <h3>States</h3>
    <div class="variant-row row-start-wrap gap-48">
      <div class="variant-col">
        <span class="variant-label">Enabled</span>
        <ui-tab-item label="Label" size="m"></ui-tab-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">Selected</span>
        <ui-tab-item label="Label" size="m" selected></ui-tab-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">Disabled</span>
        <ui-tab-item label="Label" size="m" disabled></ui-tab-item>
      </div>
    </div>

    <h3>With Disabled Tab</h3>
    <ui-tab-group size="m" orientation="horizontal">
      <ui-tab-item label="Tab One" selected></ui-tab-item>
      <ui-tab-item label="Tab Two"></ui-tab-item>
      <ui-tab-item label="Tab Three"></ui-tab-item>
      <ui-tab-item label="Disabled" disabled></ui-tab-item>
    </ui-tab-group>

    <h3>Vertical with Disabled</h3>
    <ui-tab-group size="m" orientation="vertical" class="w-200 h-180">
      <ui-tab-item label="Dashboard" selected></ui-tab-item>
      <ui-tab-item label="Analytics"></ui-tab-item>
      <ui-tab-item label="Reports"></ui-tab-item>
      <ui-tab-item label="Disabled" disabled></ui-tab-item>
    </ui-tab-group>

    <h3>With Leading Icons</h3>
    <ui-tab-group size="m">
      <ui-tab-item label="Data Grid" selected>
        <ui-icon name="bar_chart" size="m" slot="leading-icon"></ui-icon>
      </ui-tab-item>
      <ui-tab-item label="Table">
        <ui-icon name="home" size="m" slot="leading-icon"></ui-icon>
      </ui-tab-item>
      <ui-tab-item label="Pie Chart">
        <ui-icon name="settings" size="m" slot="leading-icon"></ui-icon>
      </ui-tab-item>
    </ui-tab-group>

    <h3>Icon Only</h3>
    <ui-tab-group size="m">
      <ui-tab-item selected>
        <ui-icon name="bar_chart" size="m" slot="leading-icon"></ui-icon>
      </ui-tab-item>
      <ui-tab-item>
        <ui-icon name="home" size="m" slot="leading-icon"></ui-icon>
      </ui-tab-item>
      <ui-tab-item>
        <ui-icon name="settings" size="m" slot="leading-icon"></ui-icon>
      </ui-tab-item>
    </ui-tab-group>

    <h3>With Trailing Icons</h3>
    <ui-tab-group size="m">
      <ui-tab-item label="Data Grid" selected>
        <ui-icon name="bar_chart" size="m" slot="trailing-icon"></ui-icon>
      </ui-tab-item>
      <ui-tab-item label="Table">
        <ui-icon name="bar_chart" size="m" slot="trailing-icon"></ui-icon>
      </ui-tab-item>
    </ui-tab-group>

    <h3>Sub Menu</h3>
    <ui-tab-group size="m">
      <ui-tab-item label="Data Grid" sub-menu selected></ui-tab-item>
      <ui-tab-item label="Table" sub-menu></ui-tab-item>
    </ui-tab-group>

    <h3>Overflow: Scroll</h3>
    <div class="w-300">
      <p class="hint">Constrained width (300px) — scroll overflow</p>
      <ui-tab-group>
        <ui-tab-item label="Data Grid" selected></ui-tab-item>
        <ui-tab-item label="Table"></ui-tab-item>
        <ui-tab-item label="Pie Chart"></ui-tab-item>
        <ui-tab-item label="Bar Chart"></ui-tab-item>
        <ui-tab-item label="Line Chart"></ui-tab-item>
        <ui-tab-item label="Scatter Plot"></ui-tab-item>
      </ui-tab-group>
    </div>

    <h3>Overflow: Menu</h3>
    <div class="w-300">
      <p class="hint">Constrained width (300px) — menu overflow with ⋮ button</p>
      <ui-tab-group overflow="menu">
        <ui-tab-item label="Data Grid" selected></ui-tab-item>
        <ui-tab-item label="Table"></ui-tab-item>
        <ui-tab-item label="Pie Chart"></ui-tab-item>
        <ui-tab-item label="Bar Chart"></ui-tab-item>
        <ui-tab-item label="Line Chart"></ui-tab-item>
        <ui-tab-item label="Scatter Plot"></ui-tab-item>
      </ui-tab-group>
    </div>

    <h3>Overflow: Menu (Vertical)</h3>
    <div class="h-120">
      <p class="hint">Constrained height (120px) — vertical menu overflow</p>
      <ui-tab-group orientation="vertical" overflow="menu" class="h-100">
        <ui-tab-item label="Data Grid" selected></ui-tab-item>
        <ui-tab-item label="Table"></ui-tab-item>
        <ui-tab-item label="Pie Chart"></ui-tab-item>
        <ui-tab-item label="Bar Chart"></ui-tab-item>
        <ui-tab-item label="Line Chart"></ui-tab-item>
      </ui-tab-group>
    </div>
  `,
});
