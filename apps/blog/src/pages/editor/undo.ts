/**
 * Custom undo/redo stack for textarea.
 * Replaces deprecated document.execCommand("insertText") with setRangeText + manual history.
 * Captures state before each programmatic edit, supports Ctrl+Z/Ctrl+Y.
 */

interface UndoEntry {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const MAX_HISTORY = 100;

let undoStack: UndoEntry[] = [];
let redoStack: UndoEntry[] = [];
let textareaRef: HTMLTextAreaElement | null = null;
let programmatic = false;

function capture(): UndoEntry | null {
  if (!textareaRef) return null;
  return {
    value: textareaRef.value,
    selectionStart: textareaRef.selectionStart,
    selectionEnd: textareaRef.selectionEnd,
  };
}

function restore(entry: UndoEntry): void {
  if (!textareaRef) return;
  programmatic = true;
  textareaRef.value = entry.value;
  textareaRef.setSelectionRange(entry.selectionStart, entry.selectionEnd);
  textareaRef.dispatchEvent(new Event("input", { bubbles: true }));
  programmatic = false;
}

/** Push current state onto undo stack before a programmatic edit. */
export function pushUndo(): void {
  // Cancel pending typing checkpoint to avoid stale mid-typing entry
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
  const entry = capture();
  if (!entry) return;
  const last = undoStack[undoStack.length - 1];
  if (last && last.value === entry.value) return;
  undoStack.push(entry);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack = [];
  programmatic = true;
  requestAnimationFrame(() => { programmatic = false; });
}

export function undo(): void {
  if (undoStack.length === 0) return;
  const current = capture();
  if (current) redoStack.push(current);
  const entry = undoStack.pop()!;
  restore(entry);
}

export function redo(): void {
  if (redoStack.length === 0) return;
  const current = capture();
  if (current) undoStack.push(current);
  const entry = redoStack.pop()!;
  restore(entry);
}

/** Save a typing checkpoint periodically (on pause). */
let typingTimer: ReturnType<typeof setTimeout> | null = null;

function onInput(): void {
  if (programmatic) return;
  if (typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    const entry = capture();
    if (!entry) return;
    const last = undoStack[undoStack.length - 1];
    if (last && last.value === entry.value) return;
    undoStack.push(entry);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
  }, 500);
}

/** Reset undo stack — call when loading a new draft. */
export function resetUndoStack(): void {
  if (typingTimer) clearTimeout(typingTimer);
  undoStack = [];
  redoStack = [];
  const initial = capture();
  if (initial) undoStack.push(initial);
}

export function setupUndoStack(textarea: HTMLTextAreaElement): void {
  textareaRef = textarea;
  undoStack = [];
  redoStack = [];
  const initial = capture();
  if (initial) undoStack.push(initial);

  textarea.addEventListener("input", onInput);

  textarea.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  });
}
