import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type DataToolbarSize = "xs" | "s" | "m";
export type DataToolbarDensity = "ultra-compact" | "compact" | "standard";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const BORDER_MODERATE = semanticVar("border", "moderate");
const SP_1 = spaceVar("1");
const SP_1_5 = spaceVar("1.5");
const SP_0_25 = spaceVar("0.25");
const SP_0_5 = spaceVar("0.5");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  :host {
    display: flex;
    align-items: center;
    background: var(--ui-toolbar-bg, ${SURFACE_SECONDARY});
    box-shadow: 0px 1px 0px 0px var(--ui-toolbar-border, ${BORDER_MODERATE});
    box-sizing: border-box;
    width: 100%;
  }

  .inner {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .fields {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
  }

  .actions {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
  }

  /* ─── Size: XS ─── */
  :host([size="xs"]) {
    padding: ${SP_0_5} ${SP_1};
    gap: ${SP_1};
  }
  :host([size="xs"]) .fields {
    gap: ${SP_1};
  }
  :host([size="xs"]) .actions {
    gap: ${SP_1};
  }

  /* ─── Size: S (default) ─── */
  :host,
  :host([size="s"]) {
    padding: ${SP_0_5} ${SP_1};
    gap: ${SP_1};
  }
  :host .fields,
  :host([size="s"]) .fields {
    gap: ${SP_1};
  }
  :host .actions,
  :host([size="s"]) .actions {
    gap: ${SP_1};
  }

  /* ─── Size: M ─── */
  :host([size="m"]) {
    padding: ${SP_1};
    gap: ${SP_1_5};
  }
  :host([size="m"]) .fields {
    gap: ${SP_1_5};
  }
  :host([size="m"]) .actions {
    gap: ${SP_1_5};
  }

  /* ─── Density: ultra-compact (overrides vertical padding) ─── */
  :host([density="ultra-compact"]) {
    padding-top: ${SP_0_25};
    padding-bottom: ${SP_0_25};
  }

  /* ─── Density: compact (default — no override needed for xs/s, override M) ─── */

  /* ─── Density: standard — same as compact for this component ─── */
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiDataToolbar extends HTMLElement {
  static readonly observedAttributes = ["size", "density"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${STYLES}</style><div class="inner"><div class="fields"><slot></slot></div><div class="actions"><slot name="actions"></slot></div></div>`;
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "toolbar");
    }
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "s");
    }
    if (!this.hasAttribute("density")) {
      this.setAttribute("density", "compact");
    }
    this._propagateSize();
    this.shadowRoot!.querySelector("slot")!.addEventListener(
      "slotchange",
      () => this._propagateSize(),
    );
    this.shadowRoot!.querySelector('slot[name="actions"]')!.addEventListener(
      "slotchange",
      () => this._propagateSize(),
    );
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "size") {
      this._propagateSize();
    }
  }

  // ─── Property accessors ──────────────────────────────────────────────────

  get size(): DataToolbarSize {
    return (this.getAttribute("size") as DataToolbarSize) || "s";
  }

  set size(value: DataToolbarSize) {
    this.setAttribute("size", value);
  }

  get density(): DataToolbarDensity {
    return (this.getAttribute("density") as DataToolbarDensity) || "compact";
  }

  set density(value: DataToolbarDensity) {
    this.setAttribute("density", value);
  }

  // ─── Size propagation ────────────────────────────────────────────────────

  private _propagateSize(): void {
    const size = this.size;
    const slottedSize = this._mapSlottedSize(size);
    const defaultSlot = this.shadowRoot!.querySelector("slot:not([name])")!;
    const actionsSlot = this.shadowRoot!.querySelector(
      'slot[name="actions"]',
    )!;

    const allElements = [
      ...(defaultSlot as HTMLSlotElement).assignedElements({ flatten: true }),
      ...(actionsSlot as HTMLSlotElement).assignedElements({ flatten: true }),
    ];

    for (const el of allElements) {
      if (el instanceof HTMLElement) {
        el.setAttribute("size", slottedSize);
      }
    }
  }

  /** Map toolbar size to child component size (xs/s → "s", m → "m") */
  private _mapSlottedSize(size: DataToolbarSize): string {
    if (size === "xs" || size === "s") return "s";
    return "m";
  }
}

customElements.define("ui-data-toolbar", UiDataToolbar);
