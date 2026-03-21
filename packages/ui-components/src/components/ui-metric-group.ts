
import {
  BORDER_MODERATE,
  BW_SM,
  SP_0_5,
  SP_1,
  SP_1_5,
  SP_2,
  SP_2_5,
  SP_3,
  SP_4,
  TEXT_SECONDARY,
  TYPE_HEADING_07,
} from "@maneki/foundation";
import type { MetricSize } from "./ui-metric.js";
// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    align-items: center;
  }

  .wrapper {
    display: flex;
    gap: ${SP_1};
    align-items: stretch;
    height: 100%;
  }

  /* ── Separator ───────────────────────────────────────────────────────────── */

  .separator {
    width: ${BW_SM};
    align-self: stretch;
    background: ${BORDER_MODERATE};
    flex-shrink: 0;
  }

  /* ── Group container ─────────────────────────────────────────────────────── */

  .group {
    display: flex;
    flex-direction: column;
    gap: ${SP_0_5};
    align-items: flex-start;
    padding-top: ${SP_1};
  }

  /* ── Title ───────────────────────────────────────────────────────────────── */

  .title {
    display: none;
    ${TYPE_HEADING_07}
    text-transform: uppercase;
    color: ${TEXT_SECONDARY};
    white-space: nowrap;
  }

  :host([title]) .title {
    display: flex;
  }

  /* ── Metric container ────────────────────────────────────────────────────── */

  .metrics {
    display: flex;
    align-items: flex-start;
  }

  /* ── Size-dependent gaps and title padding ────────────────────────────────── */

  :host .metrics,
  :host([size="s"]) .metrics {
    gap: ${SP_2_5};
  }

  :host .title,
  :host([size="s"]) .title {
    padding-left: ${SP_1};
  }

  :host([size="xs"]) .metrics {
    gap: ${SP_2};
  }

  :host([size="xs"]) .title {
    padding-left: ${SP_1};
  }

  :host([size="m"]) .metrics {
    gap: ${SP_3};
  }

  :host([size="m"]) .title {
    padding-left: ${SP_1_5};
  }

  :host([size="l"]) .metrics {
    gap: ${SP_4};
  }

  :host([size="l"]) .title {
    padding-left: ${SP_2};
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiMetricGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "title"];

  #titleEl!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    // Separator
    const separator = document.createElement("div");
    separator.className = "separator";

    // Group container
    const group = document.createElement("div");
    group.className = "group";

    // Title
    this.#titleEl = document.createElement("div");
    this.#titleEl.className = "title";

    // Metrics slot
    const metrics = document.createElement("div");
    metrics.className = "metrics";
    const slot = document.createElement("slot");
    metrics.appendChild(slot);

    group.appendChild(this.#titleEl);
    group.appendChild(metrics);

    wrapper.appendChild(separator);
    wrapper.appendChild(group);

    shadow.appendChild(wrapper);
  }

  connectedCallback(): void {
    this.shadowRoot!.querySelector("slot")!.addEventListener(
      "slotchange",
      () => this._propagateSize(),
    );
    this._propagateSize();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "title":
        this.#titleEl.textContent = newValue ?? "";
        break;
      case "size":
        this._propagateSize();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): MetricSize {
    return (this.getAttribute("size") as MetricSize) ?? "s";
  }
  set size(v: MetricSize) {
    this.setAttribute("size", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _propagateSize(): void {
    const size = this.getAttribute("size");
    if (!size) return;
    const slot = this.shadowRoot!.querySelector("slot")!;
    for (const node of slot.assignedElements()) {
      if (node.tagName === "UI-METRIC") {
        node.setAttribute("size", size);
      }
    }
  }
}

customElements.define("ui-metric-group", UiMetricGroup);
