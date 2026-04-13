import "@maneki/ui-components/components/ui-button.js";

/**
 * <theme-toggle> — shared theme toggle button.
 * Vanilla Web Component — no Lit dependency.
 * Uses <ui-button> from the design system internally.
 * Reads/writes "blog-theme" localStorage key.
 * Shows ☀️ in light mode, ☾ in dark mode.
 */
class ThemeToggle extends HTMLElement {
  private _dark = false;
  private _observer?: MutationObserver;
  private _btn?: HTMLElement;

  connectedCallback() {
    this._dark = document.documentElement.getAttribute("data-theme") === "heroui-dark";

    const btn = document.createElement("ui-button");
    btn.setAttribute("action", "secondary");
    btn.setAttribute("emphasis", "minimal");
    btn.setAttribute("size", "s");
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.textContent = this._dark ? "☾" : "☀️";
    btn.addEventListener("click", () => this._toggle());
    this._btn = btn;
    this.appendChild(btn);

    this._observer = new MutationObserver(() => {
      this._dark = document.documentElement.getAttribute("data-theme") === "heroui-dark";
      this._render();
    });
    this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  disconnectedCallback() {
    this._observer?.disconnect();
  }

  private _toggle() {
    this._dark = !this._dark;
    document.documentElement.setAttribute("data-theme", this._dark ? "heroui-dark" : "heroui");
    localStorage.setItem("blog-theme", this._dark ? "dark" : "light");
    this._render();
    this.dispatchEvent(new CustomEvent("theme-change", { detail: { dark: this._dark }, bubbles: true, composed: true }));
  }

  private _render() {
    if (this._btn) this._btn.textContent = this._dark ? "🌙" : "☀️";
  }
}

customElements.define("theme-toggle", ThemeToggle);
