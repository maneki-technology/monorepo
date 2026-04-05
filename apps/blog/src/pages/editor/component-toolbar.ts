/**
 * Component toolbar — second toolbar row for inserting design system components.
 * Each button inserts an HTML snippet at the cursor with sensible default attributes.
 */

import { insertAtCursor } from "./toolbar.js";

interface ComponentSnippet {
  label: string;
  icon: string;
  snippet: string;
}

const COMPONENTS: ComponentSnippet[] = [
  {
    label: "Info",
    icon: "ℹ️",
    snippet: `<div class="callout callout-info">\nYour message here\n</div>`,
  },
  {
    label: "Tip",
    icon: "💡",
    snippet: `<div class="callout callout-tip">\nPro tip: your tip here\n</div>`,
  },
  {
    label: "Warning",
    icon: "⚠️",
    snippet: `<div class="callout callout-warning">\nWarning: your warning here\n</div>`,
  },
  {
    label: "Error",
    icon: "🚫",
    snippet: `<div class="callout callout-error">\nError: your error message here\n</div>`,
  },
  {
    label: "Badge",
    icon: "🏷️",
    snippet: `<ui-badge size="s" emphasis="subtle">label</ui-badge>`,
  },
  {
    label: "Card",
    icon: "🃏",
    snippet: `<ui-card size="m" bordered>\n  <div style="padding:20px;">\n    <h4>Card Title</h4>\n    <p>Card content here</p>\n  </div>\n</ui-card>`,
  },
  {
    label: "Accordion",
    icon: "📂",
    snippet: `<ui-accordion-group>\n  <ui-accordion-item label="Section 1">\n    Content for section 1\n  </ui-accordion-item>\n  <ui-accordion-item label="Section 2">\n    Content for section 2\n  </ui-accordion-item>\n</ui-accordion-group>`,
  },
  {
    label: "Details",
    icon: "▶",
    snippet: `<details>\n  <summary>Click to expand</summary>\n  Hidden content here\n</details>`,
  },
  {
    label: "Table",
    icon: "📊",
    snippet: `| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |`,
  },
  {
    label: "Divider",
    icon: "─",
    snippet: `\n---\n`,
  },
];

export function setupComponentToolbar(textarea: HTMLTextAreaElement): void {
  const toolbar = document.getElementById("admin-component-toolbar");
  if (!toolbar) return;

  for (const comp of COMPONENTS) {
    const btn = document.createElement("ui-button");
    btn.setAttribute("action", "secondary");
    btn.setAttribute("emphasis", "minimal");
    btn.setAttribute("size", "s");
    btn.title = comp.label;
    btn.textContent = `${comp.icon} ${comp.label}`;
    btn.onclick = () => {
      insertAtCursor(textarea, "\n" + comp.snippet + "\n");
      textarea.focus();
    };
    toolbar.appendChild(btn);
  }
}
