/**
 * Proportional scroll sync between textarea and preview panes.
 * Scrolling one pane scrolls the other to the same percentage position.
 */

let syncing = false;

function getScrollPercent(el: HTMLElement): number {
  const max = el.scrollHeight - el.clientHeight;
  return max > 0 ? el.scrollTop / max : 0;
}

function setScrollPercent(el: HTMLElement, percent: number): void {
  const max = el.scrollHeight - el.clientHeight;
  el.scrollTop = max * percent;
}

function syncScroll(source: HTMLElement, target: HTMLElement): void {
  if (syncing) return;
  syncing = true;
  setScrollPercent(target, getScrollPercent(source));
  requestAnimationFrame(() => { syncing = false; });
}

/**
 * Find the actual scrollable element inside a ui-scrollbar wrapper.
 * ui-scrollbar uses a shadow DOM .viewport div.
 */
function getScrollable(wrapper: HTMLElement): HTMLElement | null {
  const shadow = wrapper.shadowRoot;
  if (shadow) {
    const container = shadow.querySelector(".container") as HTMLElement;
    if (container) return container;
  }
  return wrapper;
}

export function setupScrollSync(
  textareaWrap: HTMLElement,
  previewWrap: HTMLElement,
): void {
  const textareaScrollable = getScrollable(textareaWrap);
  const previewScrollable = getScrollable(previewWrap);

  if (!textareaScrollable || !previewScrollable) return;

  textareaScrollable.addEventListener("scroll", () => {
    syncScroll(textareaScrollable, previewScrollable);
  }, { passive: true });

  previewScrollable.addEventListener("scroll", () => {
    syncScroll(previewScrollable, textareaScrollable);
  }, { passive: true });
}
