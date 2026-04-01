import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-side-panel.js";

registerPage("side-panel", {
  title: "Side Panel",
  section: "Navigation",
  render: () => `
    <h3>Expanded</h3>
    <div style="display: flex; height: 400px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <ui-side-panel state="expanded">
        <span slot="header">Panel Title</span>
        <div style="padding: 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">
          <p style="margin: 0 0 8px;">Slotted content goes here.</p>
          <p style="margin: 0 0 8px;">This is a generic side panel container.</p>
          <p style="margin: 0;">It can hold any content — menus, filters, settings, etc.</p>
        </div>
      </ui-side-panel>
      <div style="flex: 1; padding: 24px; display: flex; align-items: center; justify-content: center; color: var(--fd-text-tertiary, #7a909e); font-size: 14px;">
        Main content area
      </div>
    </div>

    <h3>Collapsed</h3>
    <div style="display: flex; height: 400px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <ui-side-panel state="collapsed">
        <span slot="header">Panel Title</span>
        <div style="padding: 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">
          Content hidden when collapsed.
        </div>
      </ui-side-panel>
      <div style="flex: 1; padding: 24px; display: flex; align-items: center; justify-content: center; color: var(--fd-text-tertiary, #7a909e); font-size: 14px;">
        Main content area
      </div>
    </div>

    <h3>Overlay</h3>
    <div style="display: flex; height: 400px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden; position: relative;">
      <ui-side-panel state="expanded" overlay>
        <span slot="header">Panel Title</span>
        <div style="padding: 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">
          <p style="margin: 0 0 8px;">Overlay panel floats above content.</p>
          <p style="margin: 0;">Has elevation shadow instead of border.</p>
        </div>
      </ui-side-panel>
      <div style="flex: 1; padding: 24px; display: flex; align-items: center; justify-content: center; color: var(--fd-text-tertiary, #7a909e); font-size: 14px;">
        Main content area
      </div>
    </div>

    <h3>Interactive (click toggle to expand/collapse)</h3>
    <div style="display: flex; height: 400px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <ui-side-panel state="expanded">
        <span slot="header">Interactive Panel</span>
        <div style="padding: 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">
          <p style="margin: 0 0 8px;">Click the chevron to toggle.</p>
          <p style="margin: 0;">Panel animates between 300px and 40px.</p>
        </div>
      </ui-side-panel>
      <div style="flex: 1; padding: 24px; display: flex; align-items: center; justify-content: center; color: var(--fd-text-tertiary, #7a909e); font-size: 14px;">
        Main content area
      </div>
    </div>
    <h3>Right Position</h3>
    <div style="display: flex; height: 400px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <div style="flex: 1; padding: 24px; display: flex; align-items: center; justify-content: center; color: var(--fd-text-tertiary, #7a909e); font-size: 14px;">
        Main content area
      </div>
      <ui-side-panel state="expanded" position="right">
        <span slot="header">Right Panel</span>
        <div style="padding: 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">
          <p style="margin: 0 0 8px;">Panel positioned on the right side.</p>
          <p style="margin: 0;">Border renders on the left edge.</p>
        </div>
      </ui-side-panel>
    </div>

    <h3>Dismissible (click outside to close)</h3>
    <div style="display: flex; height: 400px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden; position: relative;">
      <ui-side-panel id="demo-dismissible" position="right" dismissible open no-collapse>
        <span slot="header">Dismissible</span>
        <div style="padding: 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">
          <p style="margin: 0 0 8px;">Click outside this panel to close it.</p>
          <p style="margin: 0;">Uses slide-in/out animation.</p>
        </div>
      </ui-side-panel>
      <div style="flex: 1; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--fd-text-tertiary, #7a909e); font-size: 14px;">
        Main content area
        <ui-button id="demo-dismissible-toggle" action="secondary" size="s">Toggle Panel</ui-button>
      </div>
    </div>
  `,
  setup: () => {
    requestAnimationFrame(() => {
      const panel = document.getElementById("demo-dismissible");
      const btn = document.getElementById("demo-dismissible-toggle");
      btn?.addEventListener("click", () => {
        if (panel?.hasAttribute("open")) panel.removeAttribute("open");
        else panel?.setAttribute("open", "");
      });
    });
  },
});
