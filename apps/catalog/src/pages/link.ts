import { registerPage } from "../registry.js";

registerPage("link", {
  title: "Link",
  section: "Primitives",
  render: () => `
    <h3>Sizes × Emphases</h3>
    <div class="stack-l">
      <div>
        <h4 class="section-label">Bold</h4>
        <div class="variant-row gap-32">
          <div class="variant-col"><span class="variant-label">S</span><ui-link size="s" emphasis="bold" href="#">Small</ui-link></div>
          <div class="variant-col"><span class="variant-label">M</span><ui-link size="m" emphasis="bold" href="#">Medium</ui-link></div>
          <div class="variant-col"><span class="variant-label">L</span><ui-link size="l" emphasis="bold" href="#">Large</ui-link></div>
        </div>
      </div>
      <div>
        <h4 class="section-label">Subtle</h4>
        <div class="variant-row gap-32">
          <div class="variant-col"><span class="variant-label">S</span><ui-link size="s" emphasis="subtle" href="#">Small</ui-link></div>
          <div class="variant-col"><span class="variant-label">M</span><ui-link size="m" emphasis="subtle" href="#">Medium</ui-link></div>
          <div class="variant-col"><span class="variant-label">L</span><ui-link size="l" emphasis="subtle" href="#">Large</ui-link></div>
        </div>
      </div>
      <div>
        <h4 class="section-label">Disabled</h4>
        <div class="variant-row gap-32">
          <div class="variant-col"><span class="variant-label">S</span><ui-link size="s" href="#" disabled>Small</ui-link></div>
          <div class="variant-col"><span class="variant-label">M</span><ui-link size="m" href="#" disabled>Medium</ui-link></div>
          <div class="variant-col"><span class="variant-label">L</span><ui-link size="l" href="#" disabled>Large</ui-link></div>
        </div>
      </div>
    </div>

    <h3>Inline</h3>
    <p style="font-family:Inter,sans-serif;font-size:14px;color:#1c2b36;max-width:480px;line-height:1.6">
      This is a paragraph with an <ui-link href="#" size="m">inline link</ui-link> embedded
      in the text. Links can also be <ui-link href="#" emphasis="subtle" size="m">subtle emphasis</ui-link>
      to blend more naturally with surrounding content.
    </p>

    <h3>With Target</h3>
    <div class="variant-row gap-32">
      <ui-link href="#" target="_self">Same window</ui-link>
      <ui-link href="#" target="_blank" rel="noopener noreferrer">New window</ui-link>
    </div>
  `,
});
