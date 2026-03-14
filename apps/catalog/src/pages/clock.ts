import { registerPage } from "../registry.js";

registerPage("clock", {
  title: "Clock",
  section: "Calendar & Date",
  render: () => `
    <h3>Analog — Sizes</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"].map(size => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <ui-clock size="${size}" value="03:00"></ui-clock>
        </div>
      `).join("")}
    </div>

    <h3>24-Hour Digital — Sizes</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"].map(size => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <ui-clock size="${size}" mode="24-hour" value="14:30"></ui-clock>
        </div>
      `).join("")}
    </div>

    <h3>With Different Values</h3>
    <div class="variant-row row-start-wrap">
      <div class="variant-col">
        <span class="variant-label">03:00</span>
        <ui-clock size="m" value="03:00"></ui-clock>
      </div>
      <div class="variant-col">
        <span class="variant-label">09:00</span>
        <ui-clock size="m" value="09:00"></ui-clock>
      </div>
      <div class="variant-col">
        <span class="variant-label">14:30</span>
        <ui-clock size="m" value="14:30"></ui-clock>
      </div>
      <div class="variant-col">
        <span class="variant-label">21:45</span>
        <ui-clock size="m" value="21:45"></ui-clock>
      </div>
    </div>

    <h3>Default (No Value)</h3>
    <div class="variant-row row-start-wrap">
      <div class="variant-col">
        <span class="variant-label">Analog</span>
        <ui-clock size="m"></ui-clock>
      </div>
      <div class="variant-col">
        <span class="variant-label">24-Hour</span>
        <ui-clock size="m" mode="24-hour"></ui-clock>
      </div>
    </div>
  `,
});
