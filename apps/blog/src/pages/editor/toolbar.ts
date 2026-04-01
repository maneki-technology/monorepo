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
  textarea.focus();
  // Collapse selection to end so we don't replace selected text
  const end = textarea.selectionEnd;
  textarea.setSelectionRange(end, end);
  document.execCommand("insertText", false, text);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function setupToolbar(textarea: HTMLTextAreaElement): void {
  document.querySelector(".admin-toolbar")?.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest("[data-action]") as HTMLElement | null;
    if (!btn) return;
    const action = btn.dataset.action;
    switch (action) {
      case "bold": wrapSelection(textarea, "**", "**"); break;
      case "italic": wrapSelection(textarea, "*", "*"); break;
      case "h2": wrapSelection(textarea, "\n## ", "\n"); break;
      case "h3": wrapSelection(textarea, "\n### ", "\n"); break;
      case "link": wrapSelection(textarea, "[", "](url)"); break;
      case "code": wrapSelection(textarea, "`", "`"); break;
      case "codeblock": wrapSelection(textarea, "\n```ts\n", "\n```\n"); break;
      case "image": insertAtCursor(textarea, "![alt](/images/)"); break;
      case "ul": wrapSelection(textarea, "\n- ", "\n"); break;
      case "ol": wrapSelection(textarea, "\n1. ", "\n"); break;
      case "quote": wrapSelection(textarea, "\n> ", "\n"); break;
    }
  });
}
