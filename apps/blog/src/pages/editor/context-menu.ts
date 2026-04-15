/**
 * Circular context menu — appears on text selection in the textarea.
 * Actions arranged in a ring around the selection point.
 *
 * Stays imperative — appends to document.body to avoid shadow DOM
 * boundary issues with textarea selection. See ADR-028.
 */

import { wrapSelection } from "./toolbar.js";
import { uploadFile } from "./upload.js";

interface MenuAction {
  label: string;
  icon: string;
  action: (textarea: HTMLTextAreaElement) => void;
}

const ACTIONS: MenuAction[] = [
  { label: "Bold", icon: "B", action: (ta) => wrapSelection(ta, "**", "**") },
  { label: "Italic", icon: "I", action: (ta) => wrapSelection(ta, "*", "*") },
  { label: "Heading 2", icon: "H2", action: (ta) => wrapSelection(ta, "\n## ", "\n") },
  { label: "Heading 3", icon: "H3", action: (ta) => wrapSelection(ta, "\n### ", "\n") },
  { label: "Link", icon: "🔗", action: (ta) => wrapSelection(ta, "[", "](url)") },
  { label: "Code", icon: "</>", action: (ta) => wrapSelection(ta, "`", "`") },
  { label: "Code block", icon: "▤", action: (ta) => wrapSelection(ta, "\n```ts\n", "\n```\n") },
  { label: "Quote", icon: '"', action: (ta) => wrapSelection(ta, "\n> ", "\n") },
  { label: "Image", icon: "🖼", action: (ta) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (!input.files) return;
      for (const file of input.files) {
        uploadFile(file, ta);
      }
    };
    input.click();
  }},
];

const RADIUS = 48;

let menuEl: HTMLElement | null = null;
let textareaRef: HTMLTextAreaElement | null = null;
let outsideHandler: ((e: MouseEvent) => void) | null = null;

function createMenu(): HTMLElement {
  const menu = document.createElement("div");
  menu.style.cssText = "position:fixed;z-index:10000;width:0;height:0;pointer-events:none;opacity:0;transform:scale(0.3);transition:opacity 0.15s ease,transform 0.15s ease;";

  const angleStep = (2 * Math.PI) / ACTIONS.length;

  for (let i = 0; i < ACTIONS.length; i++) {
    const a = ACTIONS[i];
    const angle = angleStep * i - Math.PI / 2;
    const x = Math.cos(angle) * RADIUS;
    const y = Math.sin(angle) * RADIUS;

    const btn = document.createElement("button");
    btn.style.cssText = `position:absolute;width:28px;height:28px;border-radius:50%;border:var(--fd-border-width-sm) solid var(--fd-border-minimal);background:var(--fd-surface-primary);color:var(--fd-text-primary);font-size:11px;font-weight:600;font-family:var(--fd-type-body-03-font-family);cursor:pointer;display:flex;align-items:center;justify-content:center;margin-left:-14px;margin-top:-14px;box-shadow:var(--fd-elevation-01);transform:translate(${x}px,${y}px);`;
    btn.setAttribute("aria-label", a.label);
    btn.title = a.label;
    btn.textContent = a.icon;

    btn.onmousedown = (e) => e.preventDefault();
    btn.onclick = (e) => {
      e.stopPropagation();
      if (textareaRef) {
        a.action(textareaRef);
        textareaRef.focus();
      }
      hideMenu();
    };

    menu.appendChild(btn);
  }

  return menu;
}

function showMenu(x: number, y: number): void {
  if (!menuEl) {
    menuEl = createMenu();
    document.body.appendChild(menuEl);
  }

  menuEl.style.left = `${x}px`;
  menuEl.style.top = `${y}px`;
  menuEl.style.pointerEvents = "auto";
  menuEl.style.opacity = "1";
  menuEl.style.transform = "scale(1)";

  setTimeout(() => {
    outsideHandler = (e: MouseEvent) => {
      if (menuEl && !menuEl.contains(e.target as Node)) {
        hideMenu();
      }
    };
    document.addEventListener("mousedown", outsideHandler);
  }, 0);
}

function hideMenu(): void {
  if (!menuEl) return;
  menuEl.style.pointerEvents = "none";
  menuEl.style.opacity = "0";
  menuEl.style.transform = "scale(0.3)";
  if (outsideHandler) {
    document.removeEventListener("mousedown", outsideHandler);
    outsideHandler = null;
  }
}

export function setupContextMenu(textarea: HTMLTextAreaElement): void {
  textareaRef = textarea;

  textarea.addEventListener("contextmenu", (e) => {
    const { selectionStart, selectionEnd } = textarea;
    if (selectionStart === selectionEnd) return;
    e.preventDefault();
    showMenu(e.clientX, e.clientY);
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuEl?.classList.contains("open")) {
      hideMenu();
    }
  });
}
