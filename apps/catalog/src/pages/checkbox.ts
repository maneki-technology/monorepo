import { registerPage } from "../registry.js";

registerPage("checkbox", {
  title: "Checkbox",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">S</span><ui-checkbox-item size="s" checked label="right">Small</ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">M</span><ui-checkbox-item size="m" checked label="right">Medium</ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">L</span><ui-checkbox-item size="l" checked label="right">Large</ui-checkbox-item></div>
    </div>

    <h3>Check States</h3>
    <div class="variant-row">
      <ui-checkbox-item label="right">Unchecked</ui-checkbox-item>
      <ui-checkbox-item checked label="right">Checked</ui-checkbox-item>
      <ui-checkbox-item indeterminate label="right">Indeterminate</ui-checkbox-item>
    </div>

    <h3>Label Positions</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">None</span><ui-checkbox-item checked aria-label="No label checkbox">No label</ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">Right</span><ui-checkbox-item checked label="right">Label right</ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">Left</span><ui-checkbox-item checked label="left">Label left</ui-checkbox-item></div>
    </div>

    <h3>States</h3>
    <div class="variant-row">
      <ui-checkbox-item label="right">Enabled</ui-checkbox-item>
      <ui-checkbox-item disabled label="right">Disabled</ui-checkbox-item>
      <ui-checkbox-item disabled checked label="right">Disabled checked</ui-checkbox-item>
      <ui-checkbox-item error label="right">Error</ui-checkbox-item>
      <ui-checkbox-item error checked label="right">Error checked</ui-checkbox-item>
    </div>

    <h3>With Label (Sizes)</h3>
    <div class="stack-m">
      <ui-checkbox-item size="s" label="right">I agree to the terms and conditions</ui-checkbox-item>
      <ui-checkbox-item size="m" label="right">Subscribe to newsletter</ui-checkbox-item>
      <ui-checkbox-item size="l" label="right">Remember my preferences</ui-checkbox-item>
    </div>

    <h3>Group Sizes</h3>
    <div class="grid-3">
      <div>
        <span class="variant-label">S</span>
        <ui-checkbox-group size="s" orientation="vertical">
          <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <span class="variant-label">M</span>
        <ui-checkbox-group size="m" orientation="vertical">
          <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <span class="variant-label">L</span>
        <ui-checkbox-group size="l" orientation="vertical">
          <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 2</ui-checkbox-item>
          <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        </ui-checkbox-group>
      </div>
    </div>

    <h3>Checkbox Group — Vertical</h3>
    <div class="variant-row">
      <ui-checkbox-group orientation="vertical" size="m">
        <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
        <ui-checkbox-item label="right" checked>Option 2</ui-checkbox-item>
        <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        <ui-checkbox-item label="right">Option 4</ui-checkbox-item>
      </ui-checkbox-group>
    </div>

    <h3>Checkbox Group — Horizontal</h3>
    <div class="variant-row">
      <ui-checkbox-group orientation="horizontal" size="m">
        <ui-checkbox-item label="right">Option 1</ui-checkbox-item>
        <ui-checkbox-item label="right" checked>Option 2</ui-checkbox-item>
        <ui-checkbox-item label="right">Option 3</ui-checkbox-item>
        <ui-checkbox-item label="right">Option 4</ui-checkbox-item>
      </ui-checkbox-group>
    </div>
  `,
});
