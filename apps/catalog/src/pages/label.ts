import { registerPage } from "../registry.js";

registerPage("label", {
  title: "Label",
  section: "Primitives",
  render: () => `
    <h3>Variants (Size × Emphasis)</h3>
    <div class="stack-l">
      <div>
        <h4 class="section-label">Bold (default)</h4>
        <div class="variant-row gap-32">
          <div class="variant-col"><span class="variant-label">S</span><ui-label size="s">Label</ui-label></div>
          <div class="variant-col"><span class="variant-label">M</span><ui-label size="m">Label</ui-label></div>
          <div class="variant-col"><span class="variant-label">L</span><ui-label size="l">Label</ui-label></div>
        </div>
      </div>
      <div>
        <h4 class="section-label">Subtle</h4>
        <div class="variant-row gap-32">
          <div class="variant-col"><span class="variant-label">S</span><ui-label size="s" emphasis="subtle">Label</ui-label></div>
          <div class="variant-col"><span class="variant-label">M</span><ui-label size="m" emphasis="subtle">Label</ui-label></div>
          <div class="variant-col"><span class="variant-label">L</span><ui-label size="l" emphasis="subtle">Label</ui-label></div>
        </div>
      </div>
    </div>

    <h3>States</h3>
    <div class="variant-row gap-32">
      <div class="variant-col"><span class="variant-label">Enabled</span><ui-label>Label</ui-label></div>
      <div class="variant-col"><span class="variant-label">Disabled</span><ui-label disabled>Label</ui-label></div>
    </div>

    <h3>Required</h3>
    <div class="variant-row gap-32">
      <div class="variant-col"><span class="variant-label">Not required</span><ui-label>Username</ui-label></div>
      <div class="variant-col"><span class="variant-label">Required</span><ui-label required>Username</ui-label></div>
      <div class="variant-col"><span class="variant-label">Required + Disabled</span><ui-label required disabled>Username</ui-label></div>
    </div>

    <h3>Emphasis + Disabled</h3>
    <div class="variant-row gap-32">
      <div class="variant-col"><span class="variant-label">Bold</span><ui-label emphasis="bold">Label</ui-label></div>
      <div class="variant-col"><span class="variant-label">Subtle</span><ui-label emphasis="subtle">Label</ui-label></div>
      <div class="variant-col"><span class="variant-label">Bold + Disabled</span><ui-label emphasis="bold" disabled>Label</ui-label></div>
      <div class="variant-col"><span class="variant-label">Subtle + Disabled</span><ui-label emphasis="subtle" disabled>Label</ui-label></div>
    </div>
  `,
});
