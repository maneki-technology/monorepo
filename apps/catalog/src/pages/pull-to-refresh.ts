import { registerPage } from "../registry.js";

registerPage("pull-to-refresh", {
  title: "Pull to Refresh",
  section: "Data Display",
  render: () => `
    <h3>Sizes — Light</h3>
    <div class="stack-l" style="gap: 16px;">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <div style="border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px;">
          <ui-pull-to-refresh active size="s"></ui-pull-to-refresh>
        </div>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <div style="border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px;">
          <ui-pull-to-refresh active size="m"></ui-pull-to-refresh>
        </div>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <div style="border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px;">
          <ui-pull-to-refresh active size="l"></ui-pull-to-refresh>
        </div>
      </div>
    </div>

    <h3>Sizes — Dark</h3>
    <div class="stack-l" style="gap: 16px;">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <div style="background: #11294d; border-radius: 4px;">
          <ui-pull-to-refresh active size="s" variant="dark"></ui-pull-to-refresh>
        </div>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <div style="background: #11294d; border-radius: 4px;">
          <ui-pull-to-refresh active size="m" variant="dark"></ui-pull-to-refresh>
        </div>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <div style="background: #11294d; border-radius: 4px;">
          <ui-pull-to-refresh active size="l" variant="dark"></ui-pull-to-refresh>
        </div>
      </div>
    </div>

    <h3>Custom Text</h3>
    <div style="border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px;">
      <ui-pull-to-refresh active text="Loading data..."></ui-pull-to-refresh>
    </div>

    <h3>Inactive (Hidden)</h3>
    <div style="border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; min-height: 60px;">
      <ui-pull-to-refresh></ui-pull-to-refresh>
      <p style="text-align: center; color: var(--fd-text-tertiary, #7a909e); font-size: 14px; padding: 20px;">Component is hidden when not active</p>
    </div>
  `,
});
