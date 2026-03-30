/**
 * DiagramBoxBase — shared base class for all diagram box components.
 * Handles grid positioning, label/tech/description rendering, and shadow DOM setup.
 * Subclasses provide their own styles via `_getStyles()`.
 */

import { semanticVar, spaceVar } from "@maneki/foundation";

export const TEXT_PRIMARY = semanticVar("text", "primary");
export const TEXT_SECONDARY = semanticVar("text", "secondary");
export const TEXT_INVERSE = "#ffffff";
export const SURFACE_PRIMARY = semanticVar("surface", "primary");
export const SURFACE_ACTION = semanticVar("surface", "action");
export const SURFACE_SECONDARY = semanticVar("surface", "secondary");
export const SURFACE_TERTIARY = semanticVar("surface", "tertiary");
export const BORDER_MODERATE = semanticVar("border", "moderate");
export const BORDER_MINIMAL = semanticVar("border", "minimal");
export const RADIUS_MD = "var(--fd-radius-md, 8px)";
export const RADIUS_LG = "var(--fd-radius-lg, 12px)";
export const SP_0_5 = spaceVar("0.5");
export const SP_1 = spaceVar("1");
export const SP_1_5 = spaceVar("1.5");

export const BASE_STYLES = `
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${SP_0_5};
    padding: ${SP_1_5} ${SP_1};
    text-align: center;
    min-width: 120px;
    min-height: 80px;
    box-sizing: border-box;
    position: relative;
    transition: box-shadow 0.15s ease;
  }

  :host(:hover) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .label {
    font-family: var(--fd-type-body-02-font-family);
    font-size: var(--fd-type-body-02-font-size);
    line-height: var(--fd-type-body-02-line-height);
    font-weight: 600;
  }

  .tech {
    font-family: var(--fd-type-body-03-font-family);
    font-size: var(--fd-type-body-03-font-size);
    line-height: var(--fd-type-body-03-line-height);
    opacity: 0.7;
  }

  .description {
    font-family: var(--fd-type-body-03-font-family);
    font-size: var(--fd-type-body-03-font-size);
    line-height: var(--fd-type-body-03-line-height);
    opacity: 0.85;
    max-width: 200px;
  }
`;

export abstract class DiagramBoxBase extends HTMLElement {
  static observedAttributes = ["box-id", "label", "description", "tech", "row", "col", "row-span", "col-span"];

  protected _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this._render();
    this._applyGridPosition();
  }

  attributeChangedCallback(): void {
    this._render();
    this._applyGridPosition();
  }

  protected abstract _getStyles(): string;

  private _applyGridPosition(): void {
    const row = this.getAttribute("row");
    const col = this.getAttribute("col");
    const rowSpan = this.getAttribute("row-span") || "1";
    const colSpan = this.getAttribute("col-span") || "1";

    if (row) this.style.gridRow = `${row} / span ${rowSpan}`;
    if (col) this.style.gridColumn = `${col} / span ${colSpan}`;
  }

  protected _render(): void {
    const label = this.getAttribute("label") ?? "";
    const tech = this.getAttribute("tech") ?? "";
    const description = this.getAttribute("description") ?? "";

    this._shadow.innerHTML = `
      <style>${BASE_STYLES}\n${this._getStyles()}</style>
      ${this._renderIcon()}
      <span class="label">${label}</span>
      ${tech ? `<span class="tech">[${tech}]</span>` : ""}
      ${description ? `<span class="description">${description}</span>` : ""}
    `;
  }

  /** Override to add an icon/avatar above the label. */
  protected _renderIcon(): string {
    return "";
  }
}
