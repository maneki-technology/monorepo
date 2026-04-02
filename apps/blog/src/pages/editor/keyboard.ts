import { saveCurrent } from "./api.js";
import { insertAtCursor } from "./toolbar.js";

export function setupKeyboard(textarea: HTMLTextAreaElement): void {
  // Tab key in textarea (insert 2 spaces instead of changing focus)
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor(textarea, "  ");
    }
  });

  // Ctrl+S to save
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      saveCurrent(true, document.getElementById("admin-save-btn"));
    }
  });
}
