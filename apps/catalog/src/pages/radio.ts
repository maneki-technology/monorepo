import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-radio-group.js";
import "@maneki/ui-components/components/ui-radio-item.js";
import "@maneki/ui-components/components/ui-label.js";

registerPage("radio", {
  title: "Radio",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">S</span><ui-radio-item size="s" checked label-position="right"><ui-label slot="label">Small</ui-label></ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">M</span><ui-radio-item size="m" checked label-position="right"><ui-label slot="label">Medium</ui-label></ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">L</span><ui-radio-item size="l" checked label-position="right"><ui-label slot="label">Large</ui-label></ui-radio-item></div>
    </div>

    <h3>Check States</h3>
    <div class="variant-row">
      <ui-radio-item label-position="right"><ui-label slot="label">Unchecked</ui-label></ui-radio-item>
      <ui-radio-item checked label-position="right"><ui-label slot="label">Checked</ui-label></ui-radio-item>
    </div>

    <h3>Label Positions</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">None</span><ui-radio-item checked aria-label="No label radio">No label</ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">Right</span><ui-radio-item checked label-position="right"><ui-label slot="label">Label right</ui-label></ui-radio-item></div>
      <div class="variant-col"><span class="variant-label">Left</span><ui-radio-item checked label-position="left"><ui-label slot="label">Label left</ui-label></ui-radio-item></div>
    </div>

    <h3>States</h3>
    <div class="variant-row">
      <ui-radio-item label-position="right"><ui-label slot="label">Enabled</ui-label></ui-radio-item>
      <ui-radio-item disabled label-position="right"><ui-label slot="label">Disabled</ui-label></ui-radio-item>
      <ui-radio-item disabled checked label-position="right"><ui-label slot="label">Disabled checked</ui-label></ui-radio-item>
      <ui-radio-item error label-position="right"><ui-label slot="label">Error</ui-label></ui-radio-item>
      <ui-radio-item error checked label-position="right"><ui-label slot="label">Error checked</ui-label></ui-radio-item>
    </div>

    <h3>With Label (Sizes)</h3>
    <div class="stack-m">
      <ui-radio-item size="s" label-position="right"><ui-label slot="label">I agree to the terms and conditions</ui-label></ui-radio-item>
      <ui-radio-item size="m" label-position="right"><ui-label slot="label">Subscribe to newsletter</ui-label></ui-radio-item>
      <ui-radio-item size="l" label-position="right"><ui-label slot="label">Remember my preferences</ui-label></ui-radio-item>
    </div>

    <h3>Group Sizes</h3>
    <div class="grid-3">
      <div>
        <span class="variant-label">S</span>
        <ui-radio-group size="s" orientation="vertical">
          <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <span class="variant-label">M</span>
        <ui-radio-group size="m" orientation="vertical">
          <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
        </ui-radio-group>
      </div>
      <div>
        <span class="variant-label">L</span>
        <ui-radio-group size="l" orientation="vertical">
          <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
          <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
        </ui-radio-group>
      </div>
    </div>

    <h3>Radio Group — Vertical (Preselected)</h3>
    <div class="variant-row">
      <ui-radio-group orientation="vertical" size="m">
        <ui-radio-item label-position="right" value="a"><ui-label slot="label">Option A</ui-label></ui-radio-item>
        <ui-radio-item label-position="right" value="b" checked><ui-label slot="label">Option B (preselected)</ui-label></ui-radio-item>
        <ui-radio-item label-position="right" value="c"><ui-label slot="label">Option C</ui-label></ui-radio-item>
        <ui-radio-item label-position="right" value="d"><ui-label slot="label">Option D</ui-label></ui-radio-item>
      </ui-radio-group>
    </div>

    <h3>Radio Group — Horizontal</h3>
    <div class="variant-row">
      <ui-radio-group orientation="horizontal" size="m">
        <ui-radio-item label-position="right" value="1"><ui-label slot="label">Option 1</ui-label></ui-radio-item>
        <ui-radio-item label-position="right" value="2"><ui-label slot="label">Option 2</ui-label></ui-radio-item>
        <ui-radio-item label-position="right" value="3"><ui-label slot="label">Option 3</ui-label></ui-radio-item>
        <ui-radio-item label-position="right" value="4"><ui-label slot="label">Option 4</ui-label></ui-radio-item>
      </ui-radio-group>
    </div>
  `,
});
