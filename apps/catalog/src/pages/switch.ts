import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-switch.js";
import "@maneki/ui-components/components/ui-label.js";

registerPage("switch", {
  title: "Switch",
  section: "Form Controls",
  render: () => `
    <h3>Variant</h3>
    <div class="variant-row gap-40">
      <div class="variant-col items-center">
        <span class="variant-label">S</span>
        <ui-switch size="s" checked></ui-switch>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">M</span>
        <ui-switch size="m" checked></ui-switch>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">L</span>
        <ui-switch size="l" checked></ui-switch>
      </div>
    </div>

    <h3>State</h3>
    <div class="variant-row gap-60">
      <div class="stack-m items-center">
        <span class="variant-label">Enabled</span>
        <ui-switch size="m" checked></ui-switch>
        <ui-switch size="m"></ui-switch>
      </div>
      <div class="stack-m items-center">
        <span class="variant-label">Disabled</span>
        <ui-switch size="m" checked disabled></ui-switch>
        <ui-switch size="m" disabled></ui-switch>
      </div>
    </div>

    <h3>Status</h3>
    <div class="variant-row gap-60">
      <div class="stack-m items-center">
        <span class="variant-label">None</span>
        <ui-switch size="m" checked></ui-switch>
        <ui-switch size="m"></ui-switch>
      </div>
      <div class="stack-m items-center">
        <span class="variant-label">Error</span>
        <ui-switch size="m" checked status="error"></ui-switch>
        <ui-switch size="m" status="error"></ui-switch>
      </div>
    </div>

    <h3>Label</h3>
    <div class="variant-row gap-60">
      <div class="variant-col items-center">
        <span class="variant-label">None</span>
        <ui-switch size="m" checked></ui-switch>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Left</span>
        <ui-switch size="m" label-position="left" checked><ui-label slot="label">Label</ui-label></ui-switch>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Right</span>
        <ui-switch size="m" label-position="right" checked><ui-label slot="label">Label</ui-label></ui-switch>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Top</span>
        <ui-switch size="m" label-position="top" checked><ui-label slot="label">Label</ui-label></ui-switch>
      </div>
    </div>

    <h3>Interactive (click to toggle)</h3>
    <div class="stack-m">
      <ui-switch size="l" label-position="right"><ui-label slot="label">Enable feature</ui-label></ui-switch>
      <ui-switch size="m" label-position="right" checked><ui-label slot="label">Auto-save</ui-label></ui-switch>
      <ui-switch size="s" label-position="right"><ui-label slot="label">Compact mode</ui-label></ui-switch>
    </div>
  `,
});
