import { state } from "./state.js";
import { saveCurrent, saveCurrentProject } from "./api.js";
import { insertAtCursor } from "./toolbar.js";

export function setupKeyboard(textarea: HTMLTextAreaElement, root: ParentNode): void {
  // Tab key in textarea (insert 2 spaces instead of changing focus)
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor(textarea, "  ");
    }
  });

  // Ctrl+S to save — routes by activeTabType
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      const saveBtn = root.querySelector("#admin-save-btn") as HTMLElement | null;
      if (state.activeTabType === "project") {
        saveCurrentProject(true, saveBtn);
      } else {
        saveCurrent(true, saveBtn);
      }
    }
  });
}
