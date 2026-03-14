import { registerPage } from "../registry.js";

registerPage("radio", {
  title: "Radio",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">S</span><ui-radio-item size="s" checked label="right">Small</ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">M</span><ui-radio-item size="m" checked label="right">Medium</ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">L</span><ui-radio-item size="l" checked label="right">Large</ui-radio-item></div>
    </div>

    <h3>Check States</h3>
    <div class="variant-row">
      <ui-radio-item label="right">Unchecked</ui-radio-item>
      <ui-radio-item checked label="right">Checked</ui-radio-item>
    </div>

    <h3>Label Positions</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">None</span><ui-radio-item checked aria-label="No label radio">No label</ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">Right</span><ui-radio-item checked label="right">Label right</ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">Left</span><ui-radio-item checked label="left">Label left</ui-radio-item></div>
    </div>

    <h3>States</h3>
    <div class="variant-row">
      <ui-radio-item label="right">Enabled</ui-radio-item>
      <ui-radio-item disabled label="right">Disabled</ui-radio-item>
      <ui-radio-item disabled checked label="right">Disabled checked</ui-radio-item>
      <ui-radio-item error label="right">Error</ui-radio-item>
      <ui-radio-item error checked label="right">Error checked</ui-radio-item>
    </div>

    <h3>With Label (Sizes)</h3>
    <div class="stack-m">
      <ui-radio-item size="s" label="right">I agree to the terms and conditions</ui-radio-item>
      <ui-radio-item size="m" label="right">Subscribe to newsletter</ui-radio-item>
      <ui-radio-item size="l" label="right">Remember my preferences</ui-radio-item>
    </div>

    <h3>Group Sizes</h3>
    <div class="grid-3">
      <div>
        <span class="variant-label">S</span>
        <ui-radio-group size="s" orientation="vertical">
          <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
          <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
          <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <span class="variant-label">M</span>
        <ui-radio-group size="m" orientation="vertical">
          <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
          <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
          <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <span class="variant-label">L</span>
        <ui-radio-group size="l" orientation="vertical">
          <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
          <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
          <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
        </ui-radio-group>
      </div>
    </div>

    <h3>Radio Group — Vertical (Preselected)</h3>
    <div class="variant-row">
      <ui-radio-group orientation="vertical" size="m">
        <ui-radio-item label="right" value="a">Option A</ui-radio-item>
        <ui-radio-item label="right" value="b" checked>Option B (preselected)</ui-radio-item>
        <ui-radio-item label="right" value="c">Option C</ui-radio-item>
        <ui-radio-item label="right" value="d">Option D</ui-radio-item>
      </ui-radio-group>
    </div>

    <h3>Radio Group — Horizontal</h3>
    <div class="variant-row">
      <ui-radio-group orientation="horizontal" size="m">
        <ui-radio-item label="right" value="1">Option 1</ui-radio-item>
        <ui-radio-item label="right" value="2">Option 2</ui-radio-item>
        <ui-radio-item label="right" value="3">Option 3</ui-radio-item>
        <ui-radio-item label="right" value="4">Option 4</ui-radio-item>
      </ui-radio-group>
    </div>
  `,
});
