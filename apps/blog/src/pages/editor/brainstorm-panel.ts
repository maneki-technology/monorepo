/**
 * AI Brainstorm Panel — side panel for streaming ideation/discussion from Claude.
 * Extends StreamingChatPanel with focus selector + audience selector and brainstorm request body.
 */

import { html } from "lit";
import { customElement, state as litState } from "lit/decorators.js";

import { StreamingChatPanel } from "./streaming-chat-panel.js";

type Focus = "structure" | "hooks" | "angles" | "audience" | "seo" | "open";

@customElement("editor-brainstorm-panel")
export class EditorBrainstormPanel extends StreamingChatPanel {
  @litState() private _focus: Focus = "open";
  @litState() private _audience: "developers" | "photographers" | "lifestyle" | "general" = "general";

  // ── Abstract implementations ──────────────────────────────────────────────

  get panelId(): string { return "brainstorm-panel"; }
  get panelTitle(): string { return "Brainstorm"; }
  get toggleEventName(): string { return "brainstorm-panel-toggle"; }
  get apiEndpoint(): string { return "/api/brainstorm"; }
  get conversationEndpoint(): string { return "/api/brainstorm-conversations"; }
  get emptyStateIcon(): string { return "psychology"; }
  get emptyStateText(): string { return "Brainstorm ideas for your post. Pick a focus area and start a conversation with AI."; }
  get startButtonText(): string { return "Start Brainstorm"; }
  get inputPlaceholder(): string { return "Or type a specific question to brainstorm..."; }
  get errorFallback(): string { return "Brainstorm failed"; }

  protected _buildRequestBody(history: Array<{ role: string; content: string }>): Record<string, unknown> {
    const postData = this.getPostData?.();
    return {
      title: postData?.title ?? "",
      content: postData?.content ?? "",
      excerpt: postData?.excerpt ?? "",
      tags: postData?.tags ?? "",
      focus: this._focus,
      audience: this._audience,
      history,
    };
  }

  protected _renderSelectors(): unknown {
    return html`
      <div class="selector-bar">
        <ui-label size="s">Focus</ui-label>
        <ui-select size="s" .value=${this._focus} style="flex:1;" @change=${this._onFocusChange}>
          <ui-dropdown-item value="open">Open</ui-dropdown-item>
          <ui-dropdown-item value="structure">Structure</ui-dropdown-item>
          <ui-dropdown-item value="hooks">Hooks & Titles</ui-dropdown-item>
          <ui-dropdown-item value="angles">Angles</ui-dropdown-item>
          <ui-dropdown-item value="audience">Audience</ui-dropdown-item>
          <ui-dropdown-item value="seo">SEO</ui-dropdown-item>
        </ui-select>
      </div>
      <div class="selector-bar">
        <ui-label size="s">Audience</ui-label>
        <ui-select size="s" .value=${this._audience} style="flex:1;" @change=${this._onAudienceChange}>
          <ui-dropdown-item value="general">General</ui-dropdown-item>
          <ui-dropdown-item value="developers">Developers</ui-dropdown-item>
          <ui-dropdown-item value="photographers">Photographers</ui-dropdown-item>
          <ui-dropdown-item value="lifestyle">Lifestyle</ui-dropdown-item>
        </ui-select>
      </div>
    `;
  }

  protected _loadConversationData(data: Record<string, unknown>): void {
    this._focus = (data.focus as Focus) || "open";
    this._audience = (data.audience as typeof this._audience) || "general";
  }

  protected _getPersistedData(): Record<string, unknown> {
    return { focus: this._focus, audience: this._audience };
  }

  // ── Brainstorm-specific handlers ──────────────────────────────────────────

  private _onFocusChange(e: Event): void {
    this._focus = (e.target as HTMLElement & { value: string }).value as Focus;
    this._persistConversation();
  }

  private _onAudienceChange(e: Event): void {
    this._audience = (e.target as HTMLElement & { value: string }).value as typeof this._audience;
    this._persistConversation();
  }
}
