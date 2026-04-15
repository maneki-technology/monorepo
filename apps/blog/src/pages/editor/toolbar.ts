import { pushUndo } from "./undo.js";

export function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string): void {
  pushUndo();
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const replacement = `${before}${selected || "text"}${after}`;
  textarea.setRangeText(replacement, start, end, "select");
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function insertAtCursor(textarea: HTMLTextAreaElement, text: string): void {
  pushUndo();
  const pos = textarea.selectionEnd;
  textarea.setRangeText(text, pos, pos, "end");
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}
