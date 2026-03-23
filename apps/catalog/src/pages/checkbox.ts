import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-checkbox-group.js";
import "@maneki/ui-components/components/ui-checkbox-item.js";
import "@maneki/ui-components/components/ui-label.js";

registerPage("checkbox", {
  title: "Checkbox",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">S</span><ui-checkbox-item size="s" checked label-position="right"><ui-label slot="label">Small</ui-label></ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">M</span><ui-checkbox-item size="m" checked label-position="right"><ui-label slot="label">Medium</ui-label></ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">L</span><ui-checkbox-item size="l" checked label-position="right"><ui-label slot="label">Large</ui-label></ui-checkbox-item></div>
    </div>

    <h3>Check States</h3>
    <div class="variant-row">
      <ui-checkbox-item label-position="right"><ui-label slot="label">Unchecked</ui-label></ui-checkbox-item>
      <ui-checkbox-item checked label-position="right"><ui-label slot="label">Checked</ui-label></ui-checkbox-item>
      <ui-checkbox-item indeterminate label-position="right"><ui-label slot="label">Indeterminate</ui-label></ui-checkbox-item>
    </div>

    <h3>Label Positions</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">None</span><ui-checkbox-item checked aria-label="No label checkbox">No label</ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">Right</span><ui-checkbox-item checked label-position="right"><ui-label slot="label">Label right</ui-label></ui-checkbox-item></div>
      <div class="variant-col"><span class="variant-label">Left</span><ui-checkbox-item checked label-position="left"><ui-label slot="label">Label left</ui-label></ui-checkbox-item></div>
    </div>

    <h3>States</h3>
    <div class="variant-row">
      <ui-checkbox-item label-position="right"><ui-label slot="label">Enabled</ui-label></ui-checkbox-item>
      <ui-checkbox-item disabled label-position="right"><ui-label slot="label">Disabled</ui-label></ui-checkbox-item>
      <ui-checkbox-item disabled checked label-position="right"><ui-label slot="label">Disabled checked</ui-label></ui-checkbox-item>
      <ui-checkbox-item error label-position="right"><ui-label slot="label">Error</ui-label></ui-checkbox-item>
      <ui-checkbox-item error checked label-position="right"><ui-label slot="label">Error checked</ui-label></ui-checkbox-item>
    </div>

    <h3>With Label (Sizes)</h3>
    <div class="stack-m">
      <ui-checkbox-item size="s" label-position="right"><ui-label slot="label">I agree to the terms and conditions</ui-label></ui-checkbox-item>
      <ui-checkbox-item size="m" label-position="right"><ui-label slot="label">Subscribe to newsletter</ui-label></ui-checkbox-item>
      <ui-checkbox-item size="l" label-position="right"><ui-label slot="label">Remember my preferences</ui-label></ui-checkbox-item>
    </div>

    <h3>Group Sizes</h3>
    <div class="grid-3">
      <div>
        <span class="variant-label">S</span>
        <ui-checkbox-group size="s" orientation="vertical">
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <span class="variant-label">M</span>
        <ui-checkbox-group size="m" orientation="vertical">
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        </ui-checkbox-group>
      </div>
      <div>
        <span class="variant-label">L</span>
        <ui-checkbox-group size="l" orientation="vertical">
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
          <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        </ui-checkbox-group>
      </div>
    </div>

    <h3>Checkbox Group — Vertical</h3>
    <div class="variant-row">
      <ui-checkbox-group orientation="vertical" size="m">
        <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
        <ui-checkbox-item label-position="right" checked><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
        <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        <ui-checkbox-item label-position="right"><ui-label slot="label">Option 4</ui-label></ui-checkbox-item>
      </ui-checkbox-group>
    </div>

    <h3>Checkbox Group — Horizontal</h3>
    <div class="variant-row">
      <ui-checkbox-group orientation="horizontal" size="m">
        <ui-checkbox-item label-position="right"><ui-label slot="label">Option 1</ui-label></ui-checkbox-item>
        <ui-checkbox-item label-position="right" checked><ui-label slot="label">Option 2</ui-label></ui-checkbox-item>
        <ui-checkbox-item label-position="right"><ui-label slot="label">Option 3</ui-label></ui-checkbox-item>
        <ui-checkbox-item label-position="right"><ui-label slot="label">Option 4</ui-label></ui-checkbox-item>
      </ui-checkbox-group>
    </div>
  `,
});
