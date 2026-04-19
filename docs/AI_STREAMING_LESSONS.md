# AI Streaming on Cloudflare Workers — Lessons Learned

Practical lessons from building AI-powered review and brainstorm panels that stream Claude responses through CF Pages Functions.

## Anthropic SDK Doesn't Work on CF Workers

The `@anthropic-ai/sdk` npm package uses Node.js APIs internally. Even with `nodejs_compat` flag, it produces 403 "Request not allowed" errors when deployed to CF Pages/Workers — the SDK's outbound requests get blocked by Anthropic's IP restrictions on Cloudflare's edge network.

**Fix:** Use raw `fetch()` directly to the Anthropic Messages API. No SDK needed — the API is simple enough:

```ts
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({ model, max_tokens, stream: true, system, messages }),
});
```

## Anthropic Blocks Cloudflare Worker IPs

Even with raw `fetch`, Anthropic returns 403 from CF Workers IPs. This is a known restriction — Anthropic blocks requests originating from serverless/edge platforms.

**Fix:** Route through **Cloudflare AI Gateway**. It proxies the request through a different path that Anthropic allows:

```
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/anthropic/v1/messages
```

Same headers, same body — just swap the base URL. The gateway must have "Require authentication" disabled (or use `cf-aig-authorization` header).

## Streaming Requires SSE Headers to Prevent Buffering

CF's edge network buffers responses by default. Without proper headers, the entire LLM response arrives at once instead of streaming chunk-by-chunk.

**Fix:** Set `content-type: text/event-stream` and `cache-control: no-cache` before streaming:

```ts
c.header("content-type", "text/event-stream");
c.header("cache-control", "no-cache");

return streamText(c, async (stream) => {
  // Parse Anthropic SSE and relay as NDJSON
  for (const chunk of anthropicStream) {
    await stream.writeln(JSON.stringify({ type: "content", data: chunk.delta.text }));
  }
});
```

## Server-Side Catch Blocks Can't Write to Disconnected Streams

When a stream disconnects (client navigates away, network drops), `stream.writeln()` in the catch block throws again — creating an unhandled error or (worse) sending the failed content as an error message to the client.

**Fix:** Wrap error writes in a nested try-catch:

```ts
} catch (error) {
  try {
    await stream.writeln(JSON.stringify({ type: "error", message: error.message }));
  } catch { /* stream disconnected — nothing to write to */ }
}
```

## Client Must Handle Partial Streams Gracefully

LLM responses can take 10-30s. Connections drop. The client must save whatever content arrived before the disconnect, not discard it.

**Fix:** In the catch block, flush the type queue and save the buffer before showing any error:

```ts
} catch (err) {
  if (err.name !== "AbortError") {
    this._flushTypeQueue();
    if (this._streamBuffer) {
      this._messages = [...this._messages, { role: "assistant", content: this._streamBuffer }];
      this._streamBuffer = "";
    }
    // Only show error if we got nothing at all
    if (lastMessage?.role !== "assistant") {
      this._error = err.message;
    }
  }
}
```

## Typing Animation Smooths Chunky SSE Delivery

Anthropic's SSE delivers text in variable-size bursts (sometimes 1 word, sometimes a paragraph). Rendering chunks directly looks jerky.

**Fix:** Queue incoming text and drip it at a steady rate via `requestAnimationFrame`:

```ts
private _startTyping(): void {
  if (this._typeRaf !== null) return;
  const charsPerFrame = 1; // ~60 chars/sec at 60fps
  const tick = () => {
    if (this._typeQueue.length === 0) { this._typeRaf = null; return; }
    const chunk = this._typeQueue.slice(0, charsPerFrame);
    this._typeQueue = this._typeQueue.slice(charsPerFrame);
    this._streamBuffer += chunk;
    this._scrollToBottom();
    this._typeRaf = requestAnimationFrame(tick);
  };
  this._typeRaf = requestAnimationFrame(tick);
}
```

On stream end, call `_flushTypeQueue()` to immediately render any remaining queued text.

## ALTER TABLE for Existing Turso Tables

`CREATE TABLE IF NOT EXISTS` won't add new columns to an existing table. If you add a column to the schema after the table already exists in production, the migration silently does nothing.

**Fix:** Use explicit `ALTER TABLE` wrapped in try-catch (SQLite throws if column already exists):

```ts
try {
  await db.execute("ALTER TABLE brainstorm_conversations ADD COLUMN audience TEXT NOT NULL DEFAULT 'general'");
} catch { /* column already exists */ }
```

## SELECT Must Include New Columns

After adding a column, the GET endpoint's `SELECT` statement must be updated to include it. Easy to forget when the INSERT/UPDATE already handles the new column.

**Fix:** Always use `SELECT *` or explicitly verify all columns are listed after schema changes. In this codebase we prefer explicit column lists for type safety — just remember to update them.
