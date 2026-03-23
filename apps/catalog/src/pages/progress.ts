import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-progress-bar.js";
import "@maneki/ui-components/components/ui-progress-circle.js";

registerPage("progress", {
  title: "Progress",
  section: "Data Display",
  render: () => `
    <h3>Progress Bar — Sizes</h3>
    <div class="stack-l w-400">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-progress-bar size="s" label="top-label" status="information" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-progress-bar size="m" label="top-label" status="information" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-progress-bar size="l" label="top-label" status="information" value="50" label-text="Label"></ui-progress-bar>
      </div>
    </div>

    <h3>Progress Bar — Label Modes</h3>
    <div class="stack-l w-400">
      <div class="variant-col">
        <span class="variant-label">Top Label</span>
        <ui-progress-bar size="m" label="top-label" status="information" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Inner Label</span>
        <ui-progress-bar size="m" label="inner-label" status="information" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">None</span>
        <ui-progress-bar size="m" label="none" status="information" value="50"></ui-progress-bar>
      </div>
    </div>

    <h3>Progress Bar — Statuses</h3>
    <div class="stack-m w-400">
      <div class="variant-col">
        <span class="variant-label">None</span>
        <ui-progress-bar size="m" label="top-label" status="none" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Information</span>
        <ui-progress-bar size="m" label="top-label" status="information" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Success</span>
        <ui-progress-bar size="m" label="top-label" status="success" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Warning</span>
        <ui-progress-bar size="m" label="top-label" status="warning" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Error</span>
        <ui-progress-bar size="m" label="top-label" status="error" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Open</span>
        <ui-progress-bar size="m" label="top-label" status="open" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Complete</span>
        <ui-progress-bar size="m" label="top-label" status="complete" value="100" label-text="Complete"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Suspended</span>
        <ui-progress-bar size="m" label="top-label" status="suspended" value="50" label-text="Suspended"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">Cancelled</span>
        <ui-progress-bar size="m" label="top-label" status="cancelled" value="50" label-text="Cancelled"></ui-progress-bar>
      </div>
    </div>

    <h3>Progress Bar — Amounts</h3>
    <div class="stack-m w-400">
      <div class="variant-col">
        <span class="variant-label">10%</span>
        <ui-progress-bar size="m" label="top-label" status="information" value="10" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">50%</span>
        <ui-progress-bar size="m" label="top-label" status="information" value="50" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">75%</span>
        <ui-progress-bar size="m" label="top-label" status="information" value="75" label-text="Label"></ui-progress-bar>
      </div>
      <div class="variant-col">
        <span class="variant-label">100%</span>
        <ui-progress-bar size="m" label="top-label" status="information" value="100" label-text="Label"></ui-progress-bar>
      </div>
    </div>

    <h3>Progress Circle — Sizes</h3>
    <div class="variant-row gap-40">
      <div class="variant-col items-center">
        <span class="variant-label">S</span>
        <ui-progress-circle size="s" label-position="bottom" status="information" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">M</span>
        <ui-progress-circle size="m" label-position="bottom" status="information" value="25" label-text="Label"></ui-progress-circle>
      </div>
    </div>

    <h3>Progress Circle — Label Positions</h3>
    <div class="variant-row gap-40">
      <div class="variant-col items-center">
        <span class="variant-label">Bottom</span>
        <ui-progress-circle size="m" label-position="bottom" status="information" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Right (S)</span>
        <ui-progress-circle size="s" label-position="right" status="information" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">None</span>
        <ui-progress-circle size="m" label-position="none" status="information" value="25"></ui-progress-circle>
      </div>
    </div>

    <h3>Progress Circle — Statuses</h3>
    <div class="variant-row" style="gap: 24px; flex-wrap: wrap;">
      <div class="variant-col items-center">
        <span class="variant-label">None</span>
        <ui-progress-circle size="m" status="none" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Information</span>
        <ui-progress-circle size="m" status="information" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Success</span>
        <ui-progress-circle size="m" status="success" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Warning</span>
        <ui-progress-circle size="m" status="warning" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Error</span>
        <ui-progress-circle size="m" status="error" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Open</span>
        <ui-progress-circle size="m" status="open" value="25" label-text="Open"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Complete</span>
        <ui-progress-circle size="m" status="complete" value="100" label-text="Complete"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Suspended</span>
        <ui-progress-circle size="m" status="suspended" value="25" label-text="Suspended"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Cancelled</span>
        <ui-progress-circle size="m" status="cancelled" value="25" label-text="Cancelled"></ui-progress-circle>
      </div>
    </div>

    <h3>Progress Circle — Amounts</h3>
    <div class="variant-row gap-24">
      <div class="variant-col items-center">
        <span class="variant-label">25%</span>
        <ui-progress-circle size="m" status="information" value="25" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">50%</span>
        <ui-progress-circle size="m" status="information" value="50" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">75%</span>
        <ui-progress-circle size="m" status="information" value="75" label-text="Label"></ui-progress-circle>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">100%</span>
        <ui-progress-circle size="m" status="information" value="100" label-text="Label"></ui-progress-circle>
      </div>
    </div>
  `,
});
