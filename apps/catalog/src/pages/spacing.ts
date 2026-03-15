import { registerPage } from "../registry.js";
import { spacing } from "@maneki/foundation";

registerPage("spacing", {
  title: "Spacing",
  section: "Foundation",
  render: () => {
    const steps = Object.entries(spacing).sort((a, b) => (a[1] as number) - (b[1] as number)) as [string, number][];
    let html = `<style>
      .spacing-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .spacing-label { width: 48px; text-align: right; font-size: 12px; font-weight: 500; color: #3e5463; }
      .spacing-bar { height: 24px; background: #186ade; border-radius: 2px; opacity: 0.6; }
      .spacing-value { font-size: 11px; color: #7a909e; }
      .spacing-var { font-size: 10px; color: #9fb1bd; font-family: monospace; }
    </style><div class="variant-group">`;

    for (const [step, val] of steps) {
      const cssKey = step.replace(".", "-");
      html += `<div class="spacing-row">
        <span class="spacing-label">${step}</span>
        <div class="spacing-bar" style="width:${val}px"></div>
        <span class="spacing-value">${val}px</span>
        <span class="spacing-var">--fd-space-${cssKey}</span>
      </div>`;
    }
    html += `</div>`;
    return html;
  },
});
