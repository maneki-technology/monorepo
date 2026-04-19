import "@maneki/ui-components/components/ui-button.js";

/**
 * <mute-toggle> — contrast mute toggle button.
 * Vanilla Web Component — no Lit dependency.
 * Uses <ui-button> from the design system internally.
 * Toggles data-muted attribute on :root, persisted to localStorage.
 * Shows ◐ when normal, ◑ when muted.
 */
class MuteToggle extends HTMLElement {
  private _muted = false;
  private _btn?: HTMLElement;
  private _observer?: MutationObserver;

  connectedCallback() {
    this._muted = document.documentElement.hasAttribute("data-muted");

    const btn = document.createElement("ui-button");
    btn.setAttribute("action", "secondary");
    btn.setAttribute("emphasis", "minimal");
    btn.setAttribute("size", "s");
    btn.setAttribute("aria-label", "Toggle muted colors");
    btn.textContent = this._muted ? "\u25D1" : "\u25D0";
    btn.style.opacity = this._muted ? "0.7" : "0.4";
    btn.addEventListener("click", () => this._toggle());
    this._btn = btn;
    this.appendChild(btn);

    this._observer = new MutationObserver(() => {
      this._muted = document.documentElement.hasAttribute("data-muted");
      this._render();
    });
    this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-muted"] });
  }

  disconnectedCallback() {
    this._observer?.disconnect();
  }

  private _toggle() {
    this._muted = !this._muted;
    if (this._muted) {
      document.documentElement.setAttribute("data-muted", "");
      localStorage.setItem("blog-muted", "true");
    } else {
      document.documentElement.removeAttribute("data-muted");
      localStorage.removeItem("blog-muted");
    }
    this._render();
  }

  private _render() {
    if (this._btn) {
      this._btn.textContent = this._muted ? "\u25D1" : "\u25D0";
      this._btn.style.opacity = this._muted ? "0.7" : "0.4";
    }
  }
}

customElements.define("mute-toggle", MuteToggle);
