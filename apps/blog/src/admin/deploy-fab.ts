/**
 * <deploy-fab> — Floating action button for triggering site deploys.
 * Shared across all admin pages (hub, editor, gallery).
 * Lit component with deploy trigger + status polling.
 */

import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import { api } from "../lib/api.js";

@customElement("deploy-fab")
export class DeployFab extends LitElement {
  @state() private _status: "idle" | "building" | "deploying" | "success" | "failure" = "idle";
  @state() private _expanded = false;
  private _pollTimer: ReturnType<typeof setInterval> | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._checkStatus();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._pollTimer) clearInterval(this._pollTimer);
  }

  private async _checkStatus(): Promise<void> {
    try {
      const res = await api.api.deploy.status.$get();
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "building" || data.status === "deploying") {
        this._status = data.status;
        this._startPolling();
      }
    } catch {
      /* ignore */
    }
  }

  private async _triggerDeploy(): Promise<void> {
    if (this._loading) return;
    this._status = "building";
    this._expanded = false;
    try {
      const res = await api.api.deploy.$post();
      if (!res.ok) {
        this._status = "failure";
        return;
      }
      this._startPolling();
    } catch {
      this._status = "failure";
    }
  }

  private _startPolling(): void {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._pollTimer = setInterval(async () => {
      try {
        const res = await api.api.deploy.status.$get();
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "success" || data.status === "failure") {
          this._status = data.status;
          if (this._pollTimer) clearInterval(this._pollTimer);
          this._pollTimer = null;
          setTimeout(() => {
            this._status = "idle";
          }, 3000);
        } else if (data.status === "building" || data.status === "deploying") {
          this._status = data.status;
        }
      } catch {
        /* ignore */
      }
    }, 5000);
  }

  private get _loading(): boolean {
    return this._status === "building" || this._status === "deploying";
  }

  private get _icon(): string {
    switch (this._status) {
      case "building":
      case "deploying":
        return "progress_activity";
      case "success":
        return "check_circle";
      case "failure":
        return "error";
      default:
        return "upload";
    }
  }

  private get _label(): string {
    switch (this._status) {
      case "building":
        return "Building...";
      case "deploying":
        return "Deploying...";
      case "success":
        return "Deployed ✓";
      case "failure":
        return "Failed";
      default:
        return "Deploy";
    }
  }

  private get _color(): string {
    switch (this._status) {
      case "success":
        return "var(--fd-success, #22c55e)";
      case "failure":
        return "var(--fd-error, #ef4444)";
      default:
        return "var(--fd-interactive-primary, #18181b)";
    }
  }

  static styles = css`
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fab {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: var(--fab-bg);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.3s ease;
    }

    .fab:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }

    .fab:active {
      transform: scale(0.95);
    }

    .fab[data-loading] {
      cursor: default;
    }

    .fab[data-loading] ui-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .label {
      background: var(--fd-surface-primary, #fff);
      color: var(--fd-text-primary, #18181b);
      font-family: Geist, sans-serif;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
      white-space: nowrap;
      opacity: 0;
      transform: translateX(8px);
      transition:
        opacity 0.2s ease,
        transform 0.2s ease;
      pointer-events: none;
    }

    :host(:hover) .label,
    .label[data-visible] {
      opacity: 1;
      transform: translateX(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .fab,
      .fab[data-loading] ui-icon,
      .label {
        transition: none;
        animation: none;
      }
    }
  `;

  render() {
    return html`
      <span class="label" ?data-visible=${this._loading || this._status === "success" || this._status === "failure"}
        >${this._label}</span
      >
      <button
        class="fab"
        style="--fab-bg:${this._color}"
        ?data-loading=${this._loading}
        aria-label=${this._label}
        title=${this._label}
        @click=${() => this._triggerDeploy()}
      >
        <ui-icon name=${this._icon} size="m" style="color:#fff;"></ui-icon>
      </button>
    `;
  }
}
