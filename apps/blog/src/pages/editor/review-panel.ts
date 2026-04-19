/**
 * AI Review Panel — side panel for streaming editorial feedback from Claude.
 * Uses <ui-side-panel> for slide-in, renders markdown feedback + chat input.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, state as litState, property } from "lit/decorators.js";

import "@maneki/ui-components/components/ui-side-panel.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-select.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-skeleton.js";

interface ReviewMessage {
  role: "user" | "assistant";
  content: string;
}

interface PostData {
  title: string;
  content: string;
  excerpt: string;
  tags: string;
}

@customElement("editor-review-panel")
export class EditorReviewPanel extends LitElement {
  @property({ attribute: false }) declare getPostData: (() => PostData) | null;
  @property({ attribute: false }) declare slug: string;
  @property({ attribute: false }) declare contentType: "post" | "project";

  @litState() private _messages: ReviewMessage[] = [];
  @litState() private _streaming = false;
  @litState() private _streamBuffer = "";
  @litState() private _audience: "developers" | "photographers" | "lifestyle" | "general" = "general";
  @litState() private _followUpText = "";
  @litState() private _error = "";
  @litState() private _loaded = false;
  @litState() private _loading = false;

  private _abortController: AbortController | null = null;
  private _saveDebounce: ReturnType<typeof setTimeout> | null = null;
  private _lastSlug = "";
  private _typeQueue = "";
  private _typeRaf: number | null = null;

  static styles = css`
    :host { display: contents; }

    #review-panel {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      z-index: 10;
      --ui-sp-width: 420px;
      --ui-sp-bg: var(--fd-surface-primary);
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .audience-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7);
      flex-shrink: 0;
    }

    .audience-bar ui-label { white-space: nowrap; }

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
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `;


  protected override firstUpdated(): void {
    // Listen for side panel's own close event (e.g. dismissible outside click)
    const panel = this.renderRoot.querySelector("ui-side-panel");
    panel?.addEventListener("close", () => {
      this.dispatchEvent(new CustomEvent("review-panel-toggle", { detail: { open: false }, bubbles: true, composed: true }));
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

  show(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement & { show(): void } | null;
    panel?.show();
    this.dispatchEvent(new CustomEvent("review-panel-toggle", { detail: { open: true }, bubbles: true, composed: true }));
    if (!this._loaded && this.slug) this.loadConversation();
  }

  hide(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement & { hide(): void } | null;
    panel?.hide();
    this.dispatchEvent(new CustomEvent("review-panel-toggle", { detail: { open: false }, bubbles: true, composed: true }));
  }

  toggle(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement | null;
    if (panel?.hasAttribute("open")) {
      this.hide();
    } else {
      this.show();
    }
  }

  protected render(): unknown {
    return html`
      <ui-side-panel id="review-panel" position="right" no-collapse dismissible>
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <span>AI Review</span>
          <div class="header-actions">
            ${this._messages.length > 0 ? html`
              <ui-button action="secondary" emphasis="minimal" size="s" icon="icon-only" aria-label="Clear conversation" @click=${this._clearConversation}>
                <ui-icon name="delete_sweep" size="s" slot="icon-start"></ui-icon>
              </ui-button>
            ` : nothing}
          </div>
        </div>
        <div class="panel-content">
          <div class="audience-bar">
            <ui-label size="s">Audience</ui-label>
            <ui-select size="s" .value=${this._audience} style="flex:1;" @change=${this._onAudienceChange}>
              <ui-dropdown-item value="general">General</ui-dropdown-item>
              <ui-dropdown-item value="developers">Developers</ui-dropdown-item>
              <ui-dropdown-item value="photographers">Photographers</ui-dropdown-item>
              <ui-dropdown-item value="lifestyle">Lifestyle</ui-dropdown-item>
            </ui-select>
          </div>
          ${this._error ? html`<div class="error-msg">${this._error}</div>` : nothing}
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
        <ui-icon name="rate_review" size="l" style="opacity:0.4;"></ui-icon>
        <p>Get AI-powered editorial feedback on your draft. Select your target audience and click "Review" to start.</p>
        <ui-button action="primary" size="s" @click=${this._startReview}>
          <ui-icon name="rate_review" size="s" slot="icon-start"></ui-icon>
          Review Draft
        </ui-button>
      </div>
    `;
  }

  private _renderMessages(): unknown {
    return html`
      <div class="messages">
        ${this._messages.map((m) => html`
          <div class="message message-${m.role}">
            ${m.role === "assistant" ? this._renderMarkdown(m.content) : m.content}
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

  private _renderInputBar(): unknown {
    return html`
      <div class="input-bar">
        <textarea
          placeholder=${this._messages.length === 0 ? "Or ask a specific question about your draft..." : "Ask a follow-up question..."}
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

  /** Minimal markdown → HTML for assistant messages */
  private _renderMarkdown(text: string): unknown {
    // Convert markdown to basic HTML for display
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const converted = escaped
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Headers
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Blockquotes
      .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
      // Unordered lists
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Wrap consecutive <li> in <ul>
      .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>")
      // Paragraphs (double newline)
      .replace(/\n\n/g, "</p><p>")
      // Single newlines within paragraphs
      .replace(/\n/g, "<br>");

    const wrapped = `<p>${converted}</p>`
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, "")
      // Don't wrap block elements in <p>
      .replace(/<p>(<h[1-3]>)/g, "$1")
      .replace(/(<\/h[1-3]>)<\/p>/g, "$1")
      .replace(/<p>(<pre>)/g, "$1")
      .replace(/(<\/pre>)<\/p>/g, "$1")
      .replace(/<p>(<ul>)/g, "$1")
      .replace(/(<\/ul>)<\/p>/g, "$1")
      .replace(/<p>(<blockquote>)/g, "$1")
      .replace(/(<\/blockquote>)<\/p>/g, "$1");

    const template = document.createElement("template");
    template.innerHTML = wrapped;
    const fragment = template.content;

    const container = document.createElement("div");
    container.appendChild(fragment);
    return html`${this._unsafeHTML(container.innerHTML)}`;
  }

  /** Render raw HTML string (trusted content from our markdown converter only) */
  private _unsafeHTML(htmlStr: string): unknown {
    const template = document.createElement("template");
    template.innerHTML = htmlStr;
    const el = document.createElement("span");
    el.appendChild(template.content.cloneNode(true));
    return html`${el}`;
  }

  private _onAudienceChange(e: Event): void {
    this._audience = (e.target as HTMLElement & { value: string }).value as typeof this._audience;
    this._persistConversation();
  }

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
      // Follow-up question
      this._messages = [...this._messages, { role: "user", content: this._followUpText.trim() }];
      this._followUpText = "";
      this._streamReview();
    } else if (this._messages.length === 0) {
      // Initial review
      this._startReview();
    }
  }

  private _startReview(): void {
    if (this._streaming) return;
    this._messages = [];
    this._error = "";
    this._streamReview();
  }

  private _clearConversation(): void {
    if (this._streaming) this._stopStreaming();
    this._messages = [];
    this._streamBuffer = "";
    this._error = "";
    this._followUpText = "";
    this._deleteConversation();
  }

  private _stopStreaming(): void {
    this._abortController?.abort();
    this._abortController = null;
    if (this._streamBuffer) {
      this._messages = [...this._messages, { role: "assistant", content: this._streamBuffer }];
      this._streamBuffer = "";
    }
    this._streaming = false;
  }

  private async _streamReview(): Promise<void> {
    const postData = this.getPostData?.();
    if (!postData) {
      this._error = "No post data available. Open a post first.";
      return;
    }

    if (!postData.content.trim() && !postData.title.trim()) {
      this._error = "Write some content before requesting a review.";
      return;
    }

    this._streaming = true;
    this._streamBuffer = "";
    this._error = "";

    // Build conversation history (exclude the system's initial review request)
    const history = this._messages.map((m) => ({ role: m.role, content: m.content }));

    this._abortController = new AbortController();

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        signal: this._abortController.signal,
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          tags: postData.tags,
          audience: this._audience,
          slug: this.slug,
          type: this.contentType,
          history,
        }),
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
            } else if (event.type === "error") {
              this._error = event.message ?? "Review failed";
            } else if (event.type === "done") {
              // Stream complete
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Finalize: flush typing queue and move buffer to messages
      this._flushTypeQueue();
      if (this._streamBuffer) {
        this._messages = [...this._messages, { role: "assistant", content: this._streamBuffer }];
        this._streamBuffer = "";
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        // Save whatever content we received before the disconnect
        this._flushTypeQueue();
        if (this._streamBuffer) {
          this._messages = [...this._messages, { role: "assistant", content: this._streamBuffer }];
          this._streamBuffer = "";
        }
        // Only show error if we got nothing at all
        if (this._messages.length === 0 || this._messages[this._messages.length - 1]?.role !== "assistant") {
          this._error = (err as Error).message || "Network error";
        }
      }
    } finally {
      this._streaming = false;
      this._abortController = null;
      this._scrollToBottom();
      // Persist after stream completes
      this._persistConversation();
    }
  }

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

  // ── Persistence ──────────────────────────────────────────────────────────

  async loadConversation(): Promise<void> {
    if (!this.slug) return;
    this._loading = true;
    try {
      const res = await fetch(`/api/review-conversations/${this.contentType}/${this.slug}`, {
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const data = await res.json() as { messages: ReviewMessage[]; audience: string };
      this._messages = data.messages ?? [];
      this._audience = (data.audience as typeof this._audience) || "general";
      this._loaded = true;
    } catch {
      // Silently fail — panel works without persistence
    } finally {
      this._loading = false;
    }
  }

  private _persistConversation(): void {
    if (!this.slug) return;
    if (this._saveDebounce) clearTimeout(this._saveDebounce);
    this._saveDebounce = setTimeout(() => {
      fetch(`/api/review-conversations/${this.contentType}/${this.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          audience: this._audience,
          messages: this._messages,
        }),
      }).catch(() => { /* silent */ });
    }, 500);
  }

  private _deleteConversation(): void {
    if (!this.slug) return;
    fetch(`/api/review-conversations/${this.contentType}/${this.slug}`, {
      method: "DELETE",
      credentials: "same-origin",
    }).catch(() => { /* silent */ });
  }

  }
