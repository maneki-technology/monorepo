import { registerPage } from "../registry.js";

registerPage("slider", {
  title: "Slider",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-slider size="s" value="50"></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-slider size="m" value="50"></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-slider size="l" value="50"></ui-slider>
      </div>
    </div>

    <h3>With Labels</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-slider size="s" value="50" labels></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-slider size="m" value="50" labels></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-slider size="l" value="50" labels></ui-slider>
      </div>
    </div>

    <h3>Range</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <div class="variant-col">
        <span class="variant-label">Range 0\u201350</span>
        <ui-slider size="m" range value="0" value-high="50" labels></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">Range 25\u201375</span>
        <ui-slider size="m" range value="25" value-high="75" labels></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">Range 50\u2013100</span>
        <ui-slider size="m" range value="50" value-high="100" labels></ui-slider>
      </div>
    </div>

    <h3>Steps</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <div class="variant-col">
        <span class="variant-label">Step 10</span>
        <ui-slider size="m" value="50" step="10" labels></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">Step 25</span>
        <ui-slider size="m" value="50" step="25" labels></ui-slider>
      </div>
    </div>

    <h3>Disabled</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <ui-slider size="m" value="50" labels disabled></ui-slider>
    </div>

    <h3>Interactive (drag or use arrow keys)</h3>
    <div class="stack-l" style="gap: 24px; max-width: 400px;">
      <div class="variant-col">
        <span class="variant-label">Single</span>
        <ui-slider id="slider-single" size="l" value="30" labels tooltip></ui-slider>
      </div>
      <div class="variant-col">
        <span class="variant-label">Range</span>
        <ui-slider id="slider-range" size="l" range value="20" value-high="80" labels tooltip></ui-slider>
      </div>
    </div>
  `,
});
