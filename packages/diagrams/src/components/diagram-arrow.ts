/**
 * <diagram-arrow> — Declarative arrow between two diagram-box elements.
 * This is a data-only element — rendering is handled by diagram-canvas.
 *
 * Attributes:
 *   from  — box-id of the source box
 *   to    — box-id of the target box
 *   label — text label on the arrow (optional)
 */

export class DiagramArrow extends HTMLElement {
  static observedAttributes = ["from", "to", "label"];

  connectedCallback(): void {
    this.style.display = "none";
  }

  attributeChangedCallback(): void {
    // Notify parent canvas to redraw
    const canvas = this.closest("diagram-canvas");
    if (canvas) {
      canvas.dispatchEvent(new CustomEvent("arrows-changed", { bubbles: false }));
    }
  }
}

customElements.define("diagram-arrow", DiagramArrow);
