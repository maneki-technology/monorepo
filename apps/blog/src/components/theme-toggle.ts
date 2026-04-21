import "@maneki/ui-components/components/ui-button.js";

/**
 * <theme-toggle> — shared theme toggle button.
 * Vanilla Web Component — no Lit dependency.
 * Uses <ui-button> from the design system internally.
 * Reads/writes "blog-theme" localStorage key.
 * Shows ☀️ in light mode, 🌙 in dark mode.
 */
class ThemeToggle extends HTMLElement {
  private _dark = false;
  private _observer?: MutationObserver;
  private _btn?: HTMLElement;

  connectedCallback() {
    this._dark = document.documentElement.getAttribute("data-theme") === "heroui-dark";

    if (this.hasAttribute("fab")) this._applyFabStyles();

    const btn = document.createElement("ui-button");
    btn.setAttribute("action", "secondary");
    btn.setAttribute("emphasis", "minimal");
    btn.setAttribute("size", "s");
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.textContent = this._dark ? "\u{1F319}" : "\u{2600}\u{FE0F}";
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

  private _applyFabStyles() {
    this.style.position = "fixed";
    this.style.top = "8px";
    this.style.right = "8px";
    this.style.zIndex = "1000";
    this.style.opacity = "0.3";
    this.style.transition = "opacity 0.2s ease, right 0.2s ease";
    this.addEventListener("mouseleave", () => { this.style.opacity = "0.3"; });
  }

  private _toggle() {
    this._dark = !this._dark;
    document.documentElement.setAttribute("data-theme", this._dark ? "heroui-dark" : "heroui");
    try { localStorage.setItem("blog-theme", this._dark ? "dark" : "light"); } catch {}
    this._render();
    this.dispatchEvent(new CustomEvent("theme-change", { detail: { dark: this._dark }, bubbles: true, composed: true }));
  }

  private _render() {
    if (this._btn) this._btn.textContent = this._dark ? "\u{1F319}" : "\u{2600}\u{FE0F}";
  }
}

customElements.define("theme-toggle", ThemeToggle);
