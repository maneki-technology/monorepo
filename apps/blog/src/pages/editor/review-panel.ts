/**
 * AI Review Panel — side panel for streaming editorial feedback from Claude.
 * Extends StreamingChatPanel with review-specific audience selector and request body.
 */

import { html } from "lit";
import { customElement, state as litState } from "lit/decorators.js";

import { StreamingChatPanel, type PostData } from "./streaming-chat-panel.js";

@customElement("editor-review-panel")
export class EditorReviewPanel extends StreamingChatPanel {
  @litState() private _audience: "developers" | "photographers" | "lifestyle" | "general" = "general";

  // ── Abstract implementations ──────────────────────────────────────────────

  get panelId(): string { return "review-panel"; }
  get panelTitle(): string { return "AI Review"; }
  get toggleEventName(): string { return "review-panel-toggle"; }
  get apiEndpoint(): string { return "/api/review"; }
  get conversationEndpoint(): string { return "/api/review-conversations"; }
  get emptyStateIcon(): string { return "rate_review"; }
  get emptyStateText(): string { return "Get AI-powered editorial feedback on your draft. Select your target audience and click \"Review\" to start."; }
  get startButtonText(): string { return "Review Draft"; }
  get inputPlaceholder(): string { return "Or ask a specific question about your draft..."; }
  get errorFallback(): string { return "Review failed"; }

  protected override _validateBeforeStream(postData: PostData | undefined): string {
    if (!postData) return "No post data available. Open a post first.";
    if (!postData.content.trim() && !postData.title.trim()) return "Write some content before requesting a review.";
    return "";
  }

  protected _buildRequestBody(history: Array<{ role: string; content: string }>): Record<string, unknown> {
    const postData = this.getPostData?.();
    return {
      title: postData?.title ?? "",
      content: postData?.content ?? "",
      excerpt: postData?.excerpt ?? "",
      tags: postData?.tags ?? "",
      audience: this._audience,
      slug: this.slug,
      type: this.contentType,
      history,
    };
  }

  protected _renderSelectors(): unknown {
    return html`
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
    this._audience = (data.audience as typeof this._audience) || "general";
  }

  protected _getPersistedData(): Record<string, unknown> {
    return { audience: this._audience };
  }

  // ── Review-specific handlers ──────────────────────────────────────────────

  private _onAudienceChange(e: Event): void {
    this._audience = (e.target as HTMLElement & { value: string }).value as typeof this._audience;
    this._persistConversation();
  }
}
