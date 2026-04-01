/**
 * Circular context menu — appears on text selection in the textarea.
 * Actions arranged in a ring around the selection point.
 */

import { wrapSelection, insertAtCursor } from "./toolbar.js";

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
  { label: "Quote", icon: "\"", action: (ta) => wrapSelection(ta, "\n> ", "\n") },
  { label: "Image", icon: "🖼", action: (ta) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (!input.files) return;
      const { uploadFile } = await import("./upload.js");
      for (const file of input.files) {
        uploadFile(file, ta);
      }
    };
    input.click();
  }},
];

const RADIUS = 48;
const BTN_SIZE = 28;

let menuEl: HTMLElement | null = null;
let textareaRef: HTMLTextAreaElement | null = null;
let outsideHandler: ((e: MouseEvent) => void) | null = null;

function createMenu(): HTMLElement {
  const menu = document.createElement("div");
  menu.className = "context-ring";

  const angleStep = (2 * Math.PI) / ACTIONS.length;

  for (let i = 0; i < ACTIONS.length; i++) {
    const a = ACTIONS[i];
    const angle = angleStep * i - Math.PI / 2; // start from top
    const x = Math.cos(angle) * RADIUS;
    const y = Math.sin(angle) * RADIUS;

    const btn = document.createElement("button");
    btn.className = "context-ring-btn";
    btn.setAttribute("aria-label", a.label);
    btn.title = a.label;
    btn.textContent = a.icon;
    btn.style.transform = `translate(${x}px, ${y}px)`;

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

  // Position centered on the point
  menuEl.style.left = `${x}px`;
  menuEl.style.top = `${y}px`;
  menuEl.classList.add("open");

  // Close on outside click (delayed to avoid catching the triggering mouseup)
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
  menuEl?.classList.remove("open");
  if (outsideHandler) {
    document.removeEventListener("mousedown", outsideHandler);
    outsideHandler = null;
  }
}

export function setupContextMenu(textarea: HTMLTextAreaElement): void {
  textareaRef = textarea;

  // Show on right-click when text is selected
  textarea.addEventListener("contextmenu", (e) => {
    const { selectionStart, selectionEnd } = textarea;
    if (selectionStart === selectionEnd) return;

    e.preventDefault();
    showMenu(e.clientX, e.clientY);
  });

  // Hide on Escape
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuEl?.classList.contains("open")) {
      hideMenu();
    }
  });
}
