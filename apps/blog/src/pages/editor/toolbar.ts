/**
 * Toolbar text manipulation utilities.
 * Uses document.execCommand("insertText") for native browser undo support.
 */

export function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const replacement = `${before}${selected || "text"}${after}`;

  textarea.focus();
  textarea.setSelectionRange(start, end);
  document.execCommand("insertText", false, replacement);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function insertAtCursor(textarea: HTMLTextAreaElement, text: string): void {
  const pos = textarea.selectionEnd;
  textarea.focus();
  textarea.setSelectionRange(pos, pos);
  document.execCommand("insertText", false, text);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}
