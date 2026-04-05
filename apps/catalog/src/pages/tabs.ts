import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-tab-group.js";
import "@maneki/ui-components/components/ui-tab-item.js";

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

    <h3>Closable</h3>
    <div class="variant-group stack-m">
      <div class="variant-col">
        <span class="variant-label">Closable tabs (click × to remove)</span>
        <ui-tab-group size="m" closable>
          <ui-tab-item label="Dashboard" selected></ui-tab-item>
          <ui-tab-item label="Settings"></ui-tab-item>
          <ui-tab-item label="Users"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>

    <h3>Addable</h3>
    <div class="variant-group stack-m">
      <div class="variant-col">
        <span class="variant-label">Closable + Addable (code editor style)</span>
        <ui-tab-group size="m" closable addable>
          <ui-tab-item label="index.ts" selected></ui-tab-item>
          <ui-tab-item label="styles.css"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
    <h3>Prefix Slot</h3>
    <div class="variant-group stack-m">
      <div class="variant-col">
        <span class="variant-label">Type icons + dirty indicator</span>
        <ui-tab-group size="m" closable>
          <ui-tab-item label="Building a Design System" selected>
            <span slot="prefix"><span style="color:var(--fd-surface-destructive, #d91f11)">*</span> 📝</span>
          </ui-tab-item>
          <ui-tab-item label="Grid Layout Engine">
            <span slot="prefix">📝</span>
          </ui-tab-item>
          <ui-tab-item label="Maneki Design System">
            <span slot="prefix"><span style="color:var(--fd-surface-destructive, #d91f11)">*</span> 📦</span>
          </ui-tab-item>
          <ui-tab-item label="CLI Tool">
            <span slot="prefix">📦</span>
          </ui-tab-item>
        </ui-tab-group>
      </div>
    </div>

    <h3>Secondary (Underline)</h3>
    <div class="variant-group stack-m">
      <div class="variant-col">
        <span class="variant-label">Horizontal</span>
        <ui-tab-group style="--ui-tab-group-bg:transparent;--ui-tab-group-radius:0;--ui-tab-group-padding:0;--ui-tab-group-border-shadow:inset 0 -1px 0 var(--fd-border-minimal,#dce3e8);--ui-tab-group-align:stretch;--ui-tab-radius:0;--ui-tab-unselected-radius:0;--ui-tab-selected-bg:transparent;--ui-tab-selected-shadow:none;--ui-tab-selected-inset:0;--ui-tab-highlight-color:initial;--ui-tab-padding:4px 12px 6px;--ui-tab-padding-y:initial;--ui-tab-font-size:14px;--ui-tab-font-weight:500;--ui-tab-text-color:var(--fd-text-secondary);--ui-tab-selected-color:var(--fd-text-primary)">
          <ui-tab-item label="Overview" selected></ui-tab-item>
          <ui-tab-item label="Details"></ui-tab-item>
          <ui-tab-item label="Settings"></ui-tab-item>
        </ui-tab-group>
      </div>
      <div class="variant-col">
        <span class="variant-label">Vertical</span>
        <ui-tab-group orientation="vertical" style="height:160px;--ui-tab-group-bg:transparent;--ui-tab-group-radius:0;--ui-tab-group-padding:0;--ui-tab-group-padding-v:0;--ui-tab-group-border-shadow:none;--ui-tab-group-border-shadow-v:inset 1px 0 0 var(--fd-border-minimal,#dce3e8);--ui-tab-group-align-v:stretch;--ui-tab-radius:0;--ui-tab-unselected-radius:0;--ui-tab-selected-bg:transparent;--ui-tab-selected-shadow:none;--ui-tab-selected-inset-v:0;--ui-tab-highlight-color:initial;--ui-tab-padding:12px 4px 12px 6px;--ui-tab-padding-y:initial;--ui-tab-font-size:14px;--ui-tab-font-weight:500;--ui-tab-text-color:var(--fd-text-secondary);--ui-tab-selected-color:var(--fd-text-primary)">
          <ui-tab-item label="Overview" selected></ui-tab-item>
          <ui-tab-item label="Details"></ui-tab-item>
          <ui-tab-item label="Settings"></ui-tab-item>
        </ui-tab-group>
      </div>
    </div>
  `,
});
