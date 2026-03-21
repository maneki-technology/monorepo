import { registerPage } from "../registry.js";

registerPage("tooltip", {
  title: "Tooltip",
  section: "Overlays",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row" style="gap: 80px; padding: 40px 0;">
      <div class="variant-col items-center">
        <span class="variant-label">XS</span>
        <ui-tooltip size="xs" placement="top" text="Tooltip" open>
          <ui-button size="s">Hover me</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">S</span>
        <ui-tooltip size="s" placement="top" text="Tooltip" open>
          <ui-button size="s">Hover me</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">M</span>
        <ui-tooltip size="m" placement="top" text="Tooltip" open>
          <ui-button size="m">Hover me</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">L</span>
        <ui-tooltip size="l" placement="top" text="Tooltip" open>
          <ui-button size="m">Hover me</ui-button>
        </ui-tooltip>
      </div>
    </div>

    <h3>Placements</h3>
    <div class="variant-row" style="gap: 120px; justify-content: center; padding: 60px 0;">
      <div class="variant-col items-center">
        <span class="variant-label">Top</span>
        <ui-tooltip placement="top" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Bottom</span>
        <ui-tooltip placement="bottom" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Left</span>
        <ui-tooltip placement="left" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Right</span>
        <ui-tooltip placement="right" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
    </div>

    <div class="variant-row" style="gap: 120px; justify-content: center; padding: 60px 0;">
      <div class="variant-col items-center">
        <span class="variant-label">Top Left</span>
        <ui-tooltip placement="top-left" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Top Right</span>
        <ui-tooltip placement="top-right" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Bottom Left</span>
        <ui-tooltip placement="bottom-left" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Bottom Right</span>
        <ui-tooltip placement="bottom-right" text="Tooltip" open>
          <ui-button size="s">Trigger</ui-button>
        </ui-tooltip>
      </div>
    </div>

    <h3>Dismissible</h3>
    <div class="variant-row" style="gap: 120px; padding: 60px 0;">
      <div class="variant-col items-center">
        <span class="variant-label">Off</span>
        <ui-tooltip placement="top" text="Tooltip" open>
          <ui-button size="m">Trigger</ui-button>
        </ui-tooltip>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">On</span>
        <ui-tooltip placement="top" text="Tooltip" dismissible open>
          <ui-button size="m">Trigger</ui-button>
        </ui-tooltip>
      </div>
    </div>

    <h3>Interactive (hover to show)</h3>
    <div class="variant-row gap-40" style="padding: 60px 0;">
      <ui-tooltip placement="top" text="I appear on hover">
        <ui-button size="m">Hover me</ui-button>
      </ui-tooltip>
      <ui-tooltip placement="bottom" text="Bottom tooltip">
        <ui-button size="m">Hover me</ui-button>
      </ui-tooltip>
      <ui-tooltip placement="right" text="Right tooltip" dismissible>
        <ui-button size="m">Hover me</ui-button>
      </ui-tooltip>
    </div>
  `,
});
