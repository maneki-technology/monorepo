/**
 * StreamingChatPanel — abstract Lit base class for AI chat side panels.
 * Extracts shared streaming, typing animation, markdown rendering, persistence,
 * and UI logic from review-panel and brainstorm-panel.
 *
 * Subclasses implement abstract getters/methods for panel-specific behavior.
 */

import { LitElement, html, css, nothing } from "lit";
import { state as litState, property } from "lit/decorators.js";
import MarkdownIt from "markdown-it";

import "@maneki/ui-components/components/ui-side-panel.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-select.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-skeleton.js";

/** Truncate history sent to API to avoid hitting context window limits. */
const MAX_HISTORY_MESSAGES = 20;
const TRUNCATED_HISTORY_KEEP = 16;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PostData {
  title: string;
  content: string;
  excerpt: string;
  tags: string;
}

export abstract class StreamingChatPanel extends LitElement {
  @property({ attribute: false }) declare getPostData: (() => PostData) | null;
  @property({ attribute: false }) declare slug: string;
  @property({ attribute: false }) declare contentType: "post" | "project";

  @litState() protected _messages: ChatMessage[] = [];
  @litState() protected _streaming = false;
  @litState() protected _streamBuffer = "";
  @litState() protected _followUpText = "";
  @litState() protected _error = "";
  @litState() protected _canRetry = false;
  @litState() protected _loaded = false;
  @litState() protected _loading = false;
  @litState() protected _fullscreen = false;

  private _abortController: AbortController | null = null;
  private _saveDebounce: ReturnType<typeof setTimeout> | null = null;
  private _lastSlug = "";
  private _typeQueue = "";
  private _typeRaf: number | null = null;
  private _md: MarkdownIt | null = null;

  // ── Abstract getters — subclasses must implement ──────────────────────────

  abstract get panelId(): string;
  abstract get panelTitle(): string;
  abstract get toggleEventName(): string;
  abstract get apiEndpoint(): string;
  abstract get conversationEndpoint(): string;
  abstract get emptyStateIcon(): string;
  abstract get emptyStateText(): string;
  abstract get startButtonText(): string;
  abstract get inputPlaceholder(): string;
  abstract get errorFallback(): string;

  /** Build the JSON body for the streaming fetch request. */
  protected abstract _buildRequestBody(history: Array<{ role: string; content: string }>): Record<string, unknown>;

  /** Render selector bars (audience, focus, etc.) above the messages area. */
  protected abstract _renderSelectors(): unknown;

  /** Restore subclass-specific state from loaded conversation data. */
  protected abstract _loadConversationData(data: Record<string, unknown>): void;

  /** Return subclass-specific data to persist alongside messages. */
  protected abstract _getPersistedData(): Record<string, unknown>;

  // ── Styles ────────────────────────────────────────────────────────────────

  static styles = css`
    :host { display: contents; }

    .panel-host {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      z-index: 10;
      width: 420px;
      --ui-sp-width: 100%;
      --ui-sp-bg: var(--fd-surface-primary);
      transition: width 0.2s ease;
    }

    :host([fullscreen]) .panel-host {
      width: 100%;
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .selector-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7);
      flex-shrink: 0;
    }

    .selector-bar ui-label { white-space: nowrap; }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }

    .message {
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .message-assistant {
      background: var(--fd-surface-secondary, #f4f4f5);
      color: var(--fd-text-primary, #27272a);
      position: relative;
    }

    .message-user {
      background: #2680eb;
      color: #fff;
      align-self: flex-end;
      max-width: 85%;
    }

    .message-assistant :first-child { margin-top: 0; }
    .message-assistant :last-child { margin-bottom: 0; }

    /* Markdown rendering in assistant messages */
    .message-assistant h1,
    .message-assistant h2 { font-size: 15px; font-weight: 600; margin: 12px 0 6px; }
    .message-assistant h3 { font-size: 14px; font-weight: 600; margin: 10px 0 4px; }
    .message-assistant p { margin: 0 0 8px; }
    .message-assistant ul, .message-assistant ol { margin: 0 0 8px; padding-left: 20px; }
    .message-assistant li { margin-bottom: 2px; }
    .message-assistant strong { font-weight: 600; }
    .message-assistant em { font-style: italic; }
    .message-assistant code {
      font-family: "Roboto Mono", monospace;
      font-size: 12px;
      background: var(--fd-surface-primary, #fff);
      padding: 1px 4px;
      border-radius: 3px;
    }
    .message-assistant pre {
      background: var(--fd-surface-primary, #fff);
      border: 1px solid var(--fd-border-minimal, #e4e4e7);
      border-radius: 6px;
      padding: 8px;
      overflow-x: auto;
      margin: 4px 0 8px;
    }
    .message-assistant pre code { background: none; padding: 0; }
    .message-assistant blockquote {
      border-left: 3px solid var(--fd-border-moderate, #a1a1aa);
      padding-left: 10px;
      margin: 4px 0 8px;
      color: var(--fd-text-secondary, #71717a);
    }

    .copy-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .message-assistant:hover .copy-btn { opacity: 1; }

    .streaming-indicator {
      display: inline-block;
      width: 6px;
      height: 14px;
      background: var(--fd-text-secondary, #71717a);
      animation: blink 0.8s infinite;
      vertical-align: text-bottom;
      margin-left: 2px;
    }

    .message-pending {
      padding: 6px 10px;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .input-bar {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid var(--fd-border-minimal, #e4e4e7);
      flex-shrink: 0;
      align-items: flex-end;
    }

    .input-bar textarea {
      flex: 1;
      resize: none;
      border: 1px solid var(--fd-border-minimal, #e4e4e7);
      border-radius: 6px;
      padding: 8px 10px;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.4;
      background: var(--fd-surface-primary, #fff);
      color: var(--fd-text-primary, #27272a);
      outline: none;
      min-height: 36px;
      max-height: 120px;
      field-sizing: content;
    }

    .input-bar textarea:focus {
      border-color: var(--fd-border-focus, #186ade);
    }

    .input-bar textarea::placeholder {
      color: var(--fd-text-secondary, #71717a);
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      text-align: center;
      color: var(--fd-text-secondary, #71717a);
    }

    .empty-state p {
      font-size: 13px;
      line-height: 1.5;
      max-width: 280px;
    }

    .error-msg {
      padding: 8px 12px;
      margin: 0 12px;
      background: var(--fd-status-bg-error, #fef2f2);
      color: var(--fd-status-text-error, #d91f11);
      border-radius: 6px;
      font-size: 12px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .error-msg span { flex: 1; }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  protected override firstUpdated(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel");
    panel?.addEventListener("close", () => {
      this.dispatchEvent(new CustomEvent(this.toggleEventName, { detail: { open: false }, bubbles: true, composed: true }));
    });
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("slug") && this.slug && this.slug !== this._lastSlug) {
      const oldSlug = this._lastSlug;
      this._lastSlug = this.slug;
      if (oldSlug && this._messages.length > 0) {
        // Slug changed due to title edit — server cascades rename on save, keep messages in memory
      } else {
        // Switching posts or first load — clear and reload
        this._loaded = false;
        this._messages = [];
        this._streamBuffer = "";
        this._error = "";
        this._followUpText = "";
        const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement | null;
        if (panel?.hasAttribute("open")) this.loadConversation();
      }
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  show(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement & { show(): void } | null;
    panel?.show();
    this.dispatchEvent(new CustomEvent(this.toggleEventName, { detail: { open: true, fullscreen: this._fullscreen }, bubbles: true, composed: true }));
    if (!this._loaded && this.slug) this.loadConversation();
  }

  hide(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement & { hide(): void } | null;
    panel?.hide();
    this.dispatchEvent(new CustomEvent(this.toggleEventName, { detail: { open: false, fullscreen: false }, bubbles: true, composed: true }));
  }

  toggle(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement | null;
    if (panel?.hasAttribute("open")) {
      this.hide();
    } else {
      this.show();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  protected render(): unknown {
    return html`
      <ui-side-panel class="panel-host" position="right" no-collapse dismissible>
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <span>${this.panelTitle}</span>
          <div class="header-actions">
            <ui-button action="secondary" emphasis="minimal" size="s" icon="icon-only" aria-label="Toggle fullscreen" @click=${this._toggleFullscreen}>
              <ui-icon name=${this._fullscreen ? "close_fullscreen" : "open_in_full"} size="s" slot="icon-start"></ui-icon>
            </ui-button>
            ${this._messages.length > 0 ? html`
              <ui-button action="secondary" emphasis="minimal" size="s" icon="icon-only" aria-label="Clear conversation" @click=${this._clearConversation}>
                <ui-icon name="delete_sweep" size="s" slot="icon-start"></ui-icon>
              </ui-button>
            ` : nothing}
            <ui-button action="secondary" emphasis="minimal" size="s" icon="icon-only" aria-label="Close panel" @click=${this._closePanel}>
              <ui-icon name="close" size="s" slot="icon-start"></ui-icon>
            </ui-button>
          </div>
        </div>
        <div class="panel-content">
          ${this._renderSelectors()}
          ${this._error ? html`<div class="error-msg"><span>${this._error}</span>${this._canRetry ? html`<ui-button action="secondary" emphasis="minimal" size="s" @click=${this._retry}>Retry</ui-button>` : nothing}</div>` : nothing}
          ${this._loading ? this._renderLoading() : this._messages.length === 0 && !this._streaming ? this._renderEmptyState() : this._renderMessages()}
          ${this._renderInputBar()}
        </div>
      </ui-side-panel>
    `;
  }

  private _renderLoading(): unknown {
    return html`
      <div class="messages" style="gap:16px;padding:16px 12px;">
        <ui-skeleton variant="text" width="60%" height="14"></ui-skeleton>
        <ui-skeleton variant="text" width="100%" height="14"></ui-skeleton>
        <ui-skeleton variant="text" width="90%" height="14"></ui-skeleton>
        <ui-skeleton variant="text" width="75%" height="14"></ui-skeleton>
        <ui-skeleton variant="text" width="40%" height="14"></ui-skeleton>
      </div>
    `;
  }

  private _renderEmptyState(): unknown {
    return html`
      <div class="empty-state">
        <ui-icon name=${this.emptyStateIcon} size="l" style="opacity:0.4;"></ui-icon>
        <p>${this.emptyStateText}</p>
        <ui-button action="primary" size="s" @click=${this._startSession}>
          <ui-icon name=${this.emptyStateIcon} size="s" slot="icon-start"></ui-icon>
          ${this.startButtonText}
        </ui-button>
      </div>
    `;
  }

  protected _renderMessages(): unknown {
    return html`
      <div class="messages">
        ${this._messages.map((m) => html`
          <div class="message message-${m.role}">
            ${m.role === "assistant" ? html`
              <span class="copy-btn">
                <ui-button action="secondary" emphasis="minimal" size="s" @click=${(e: Event) => this._copyMessage(m.content, e)}>Copy</ui-button>
              </span>
              ${this._renderMarkdown(m.content)}
            ` : m.content}
          </div>
        `)}
        ${this._streaming ? html`
          <div class="message message-assistant ${!this._streamBuffer ? 'message-pending' : ''}">
            ${this._streamBuffer ? this._renderMarkdown(this._streamBuffer) : nothing}<span class="streaming-indicator"></span>
          </div>
        ` : nothing}
      </div>
    `;
  }

  protected _renderInputBar(): unknown {
    return html`
      <div class="input-bar">
        <textarea
          placeholder=${this._messages.length === 0 ? this.inputPlaceholder : "Continue the conversation..."}
          .value=${this._followUpText}
          ?disabled=${this._streaming}
          @input=${(e: Event) => { this._followUpText = (e.target as HTMLTextAreaElement).value; }}
          @keydown=${this._onInputKeydown}
        ></textarea>
        ${this._streaming ? html`
          <ui-button action="secondary" size="s" icon="icon-only" aria-label="Stop" @click=${this._stopStreaming}>
            <ui-icon name="stop" size="s" slot="icon-start"></ui-icon>
          </ui-button>
        ` : html`
          <ui-button action="primary" size="s" icon="icon-only" aria-label="Send" ?disabled=${!this._followUpText.trim() && this._messages.length === 0} @click=${this._onSend}>
            <ui-icon name="send" size="s" slot="icon-start"></ui-icon>
          </ui-button>
        `}
      </div>
    `;
  }

  /** Render markdown using markdown-it */
  protected _renderMarkdown(text: string): unknown {
    if (!this._md) {
      this._md = new MarkdownIt({ html: false, linkify: true, breaks: true });
    }
    const rendered = this._md.render(text);
    const el = document.createElement("span");
    el.innerHTML = rendered;
    return html`${el}`;
  }

  /** Copy assistant message content to clipboard with visual feedback. */
  private _copyMessage(content: string, e: Event): void {
    const btn = (e.target as HTMLElement).closest("ui-button") as HTMLElement | null;
    navigator.clipboard.writeText(content).then(() => {
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = `<ui-icon name="check" size="s" slot="icon-start"></ui-icon>`;
        btn.setAttribute("icon", "icon-only");
        setTimeout(() => {
          btn.innerHTML = original;
          btn.removeAttribute("icon");
        }, 1500);
      }
    });
  }

  // ── Input handling ────────────────────────────────────────────────────────

  private _onInputKeydown(e: Event): void {
    const ke = e as KeyboardEvent;
    if (ke.key === "Enter" && !ke.shiftKey) {
      ke.preventDefault();
      this._onSend();
    }
  }

  private _onSend(): void {
    if (this._streaming) return;
    if (this._followUpText.trim()) {
      this._messages = [...this._messages, { role: "user", content: this._followUpText.trim() }];
      this._followUpText = "";
      this._streamResponse();
    } else if (this._messages.length === 0) {
      this._startSession();
    }
  }

  private _startSession(): void {
    if (this._streaming) return;
    this._messages = [];
    this._error = "";
    this._canRetry = false;
    this._streamResponse();
  }

  private _toggleFullscreen(): void {
    this._fullscreen = !this._fullscreen;
    if (this._fullscreen) {
      this.setAttribute("fullscreen", "");
    } else {
      this.removeAttribute("fullscreen");
    }
    // Notify FABs about fullscreen state change
    this.dispatchEvent(new CustomEvent(this.toggleEventName, { detail: { open: true, fullscreen: this._fullscreen }, bubbles: true, composed: true }));
  }

  private _closePanel(): void {
    if (this._fullscreen) {
      this._fullscreen = false;
      this.removeAttribute("fullscreen");
    }
    this.hide();
  }

  private _retry(): void {
    this._error = "";
    this._canRetry = false;
    this._streamResponse();
  }

  protected _clearConversation(): void {
    if (this._streaming) this._stopStreaming();
    this._messages = [];
    this._streamBuffer = "";
    this._error = "";
    this._followUpText = "";
    this._deleteConversation();
  }

  protected _stopStreaming(): void {
    this._abortController?.abort();
    this._abortController = null;
    if (this._streamBuffer) {
      this._messages = [...this._messages, { role: "assistant", content: this._streamBuffer }];
      this._streamBuffer = "";
    }
    this._streaming = false;
  }

  // ── Streaming ─────────────────────────────────────────────────────────────

  /**
   * Hook for subclasses to validate post data before streaming.
   * Return an error string to abort, or empty string to proceed.
   */
  protected _validateBeforeStream(_postData: PostData | undefined): string {
    return "";
  }

  private async _streamResponse(): Promise<void> {
    const postData = this.getPostData?.();

    const validationError = this._validateBeforeStream(postData);
    if (validationError) {
      this._error = validationError;
      return;
    }

    this._streaming = true;
    this._streamBuffer = "";
    this._error = "";

    // Truncate history sent to API if too long to avoid context window limits.
    // Full history remains in UI (_messages), only the API payload is trimmed.
    const allHistory = this._messages.map((m) => ({ role: m.role, content: m.content }));
    const history = allHistory.length > MAX_HISTORY_MESSAGES
      ? allHistory.slice(-TRUNCATED_HISTORY_KEEP)
      : allHistory;

    this._abortController = new AbortController();

    try {
      const res = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        signal: this._abortController.signal,
        body: JSON.stringify(this._buildRequestBody(history)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        this._error = (data as { error?: string }).error ?? `HTTP ${res.status}`;
        this._streaming = false;
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        this._error = "No response stream";
        this._streaming = false;
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as { type: string; data?: string; message?: string };
            if (event.type === "content" && event.data) {
              this._typeQueue += event.data;
              this._startTyping();
            } else if (event.type === "error" && event.message) {
              // Only show error if we haven't received content yet
              if (!this._streamBuffer && this._typeQueue.length === 0) {
                this._error = event.message;
              }
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      this._flushTypeQueue();
      if (this._streamBuffer) {
        this._messages = [...this._messages, { role: "assistant", content: this._streamBuffer }];
        this._streamBuffer = "";
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        this._flushTypeQueue();
        if (this._streamBuffer) {
          this._messages = [...this._messages, { role: "assistant", content: this._streamBuffer }];
          this._streamBuffer = "";
        }
        // Only show error if we got nothing at all
        if (this._messages.length === 0 || this._messages[this._messages.length - 1]?.role !== "assistant") {
          this._error = (err as Error).message || "Network error";
          this._canRetry = true;
        }
      }
    } finally {
      this._streaming = false;
      this._abortController = null;
      this._scrollToBottom();
      this._persistConversation();
    }
  }

  // ── Typing animation ─────────────────────────────────────────────────────

  private _scrollToBottom(): void {
    const messagesEl = this.renderRoot.querySelector(".messages");
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  private _startTyping(): void {
    if (this._typeRaf !== null) return;
    const charsPerFrame = 1;
    const tick = () => {
      if (this._typeQueue.length === 0) {
        this._typeRaf = null;
        return;
      }
      const chunk = this._typeQueue.slice(0, charsPerFrame);
      this._typeQueue = this._typeQueue.slice(charsPerFrame);
      this._streamBuffer += chunk;
      this._scrollToBottom();
      this._typeRaf = requestAnimationFrame(tick);
    };
    this._typeRaf = requestAnimationFrame(tick);
  }

  private _flushTypeQueue(): void {
    if (this._typeRaf !== null) {
      cancelAnimationFrame(this._typeRaf);
      this._typeRaf = null;
    }
    if (this._typeQueue) {
      this._streamBuffer += this._typeQueue;
      this._typeQueue = "";
    }
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  async loadConversation(): Promise<void> {
    if (!this.slug) return;
    this._loading = true;
    try {
      const res = await fetch(`${this.conversationEndpoint}/${this.contentType}/${this.slug}`, {
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const data = await res.json() as Record<string, unknown>;
      this._messages = (data.messages as ChatMessage[]) ?? [];
      this._loadConversationData(data);
      this._loaded = true;
    } catch {
      // Silently fail — panel works without persistence
    } finally {
      this._loading = false;
    }
  }

  protected _persistConversation(): void {
    if (!this.slug) return;
    if (this._saveDebounce) clearTimeout(this._saveDebounce);
    this._saveDebounce = setTimeout(() => {
      fetch(`${this.conversationEndpoint}/${this.contentType}/${this.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...this._getPersistedData(),
          messages: this._messages,
        }),
      }).catch(() => { /* silent */ });
    }, 500);
  }

  private _deleteConversation(): void {
    if (!this.slug) return;
    fetch(`${this.conversationEndpoint}/${this.contentType}/${this.slug}`, {
      method: "DELETE",
      credentials: "same-origin",
    }).catch(() => { /* silent */ });
  }
}
