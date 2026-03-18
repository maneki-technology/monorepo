import { registerPage } from "../registry.js";

registerPage("separator", {
  title: "Separator",
  section: "Primitives",
  render: () => `
    <h3>Emphasis — Horizontal</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <div class="variant-col">
        <span class="variant-label">Minimal</span>
        <ui-separator emphasis="minimal"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Subtle</span>
        <ui-separator emphasis="subtle"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Moderate</span>
        <ui-separator emphasis="moderate"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Bold</span>
        <ui-separator emphasis="bold"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Contrast</span>
        <ui-separator emphasis="contrast"></ui-separator>
      </div>
    </div>

    <h3>Length — Horizontal</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <div class="variant-col">
        <span class="variant-label">Full</span>
        <ui-separator emphasis="bold" length="full"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Inset 04</span>
        <ui-separator emphasis="bold" length="inset-04"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Inset 08</span>
        <ui-separator emphasis="bold" length="inset-08"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Inset 16</span>
        <ui-separator emphasis="bold" length="inset-16"></ui-separator>
      </div>
      <div class="variant-col">
        <span class="variant-label">Inset 24</span>
        <ui-separator emphasis="bold" length="inset-24"></ui-separator>
      </div>
    </div>

    <h3>Vertical — Emphasis</h3>
    <div class="variant-row" style="gap: 40px; height: 80px; align-items: stretch;">
      <div class="variant-col" style="align-items: center;">
        <span class="variant-label">Minimal</span>
        <ui-separator orientation="vertical" emphasis="minimal"></ui-separator>
      </div>
      <div class="variant-col" style="align-items: center;">
        <span class="variant-label">Subtle</span>
        <ui-separator orientation="vertical" emphasis="subtle"></ui-separator>
      </div>
      <div class="variant-col" style="align-items: center;">
        <span class="variant-label">Moderate</span>
        <ui-separator orientation="vertical" emphasis="moderate"></ui-separator>
      </div>
      <div class="variant-col" style="align-items: center;">
        <span class="variant-label">Bold</span>
        <ui-separator orientation="vertical" emphasis="bold"></ui-separator>
      </div>
      <div class="variant-col" style="align-items: center;">
        <span class="variant-label">Contrast</span>
        <ui-separator orientation="vertical" emphasis="contrast"></ui-separator>
      </div>
    </div>
  `,
});
