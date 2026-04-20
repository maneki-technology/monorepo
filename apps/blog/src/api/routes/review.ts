/**
 * AI editorial review route — streams Claude feedback on blog post drafts.
 * POST /review — accepts post content + audience + conversation history, streams NDJSON response.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamText } from "hono/streaming";
import type { Env } from "../index.js";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const reviewSchema = z.object({
  title: z.string(),
  content: z.string().min(1).max(100_000),
  excerpt: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  audience: z.enum(["developers", "photographers", "lifestyle", "general"]).default("general"),
  slug: z.string().optional().default(""),
  type: z.enum(["post", "project"]).optional().default("post"),
  history: z.array(messageSchema).optional().default([]),
});

const SYSTEM_PROMPT = `You are an expert editorial reviewer for a personal tech blog. Your job is to provide actionable, structured feedback on blog post drafts.

When reviewing a NEW post (no conversation history), provide a structured review covering:

1. **Clarity** — Is the writing clear and easy to follow? Are there confusing sentences or jargon that needs explanation?
2. **Structure** — Does the post flow logically? Are headings used effectively? Is the intro compelling and the conclusion satisfying?
3. **Tone** — Does the tone match the target audience? Is it engaging without being too casual or too formal?
4. **Technical accuracy** — For technical posts, are code examples correct? Are claims well-supported?
5. **SEO & discoverability** — Is the title compelling? Is the excerpt effective? Are tags appropriate?
6. **Specific suggestions** — Provide 3-5 concrete, actionable improvements with examples.

When in a FOLLOW-UP conversation, respond naturally to the user's questions about the post. You can suggest rewrites, explain your feedback, or dive deeper into specific areas.

Keep feedback concise and actionable. Use markdown formatting. Be honest but constructive — the goal is to help the writer improve, not to discourage them.`;

function buildAudienceContext(audience: string): string {
  switch (audience) {
    case "developers":
      return "The target audience is software developers and engineers. They appreciate technical depth, code examples, and practical takeaways. Avoid over-explaining basic programming concepts.";
    case "photographers":
      return "The target audience is photography enthusiasts. They value visual storytelling, technical camera/editing details, and creative inspiration. Use photography terminology naturally.";
    case "lifestyle":
      return "The target audience is general lifestyle readers. They prefer accessible language, personal stories, and relatable content. Avoid heavy jargon.";
    default:
      return "The target audience is general readers with mixed technical backgrounds. Balance accessibility with depth.";
  }
}

export const review = new Hono<Env>().post(
  "/",
  zValidator("json", reviewSchema),
  async (c) => {
    const apiKey = c.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return c.json({ error: "ANTHROPIC_API_KEY not configured" }, 500);
    }

    const { title, content, excerpt, tags, audience, slug, type, history } = c.req.valid("json");

    // Fetch brainstorm conversation for context (if any)
    let brainstormContext = "";
    if (slug) {
      try {
        const db = c.get("db");
        const result = await db.execute({
          sql: "SELECT messages FROM brainstorm_conversations WHERE slug = ? AND type = ?",
          args: [slug, type],
        });
        if (result.rows.length > 0) {
          const msgs = JSON.parse(result.rows[0].messages as string) as Array<{ role: string; content: string }>;
          if (msgs.length > 0) {
            const summary = msgs.map((m) => `${m.role === "user" ? "Writer" : "AI"}: ${m.content.slice(0, 500)}`).join("\n\n");
            brainstormContext = `\n\n## Prior brainstorm discussion\nThe writer had this brainstorm session before requesting review:\n\n${summary.slice(0, 3000)}`;
          }
        }
      } catch {
        // Silently skip if brainstorm fetch fails
      }
    }

    const postContext = [
      `# Post to Review`,
      `**Title:** ${title || "(untitled)"}`,
      excerpt ? `**Excerpt:** ${excerpt}` : "",
      tags ? `**Tags:** ${tags}` : "",
      `**Target audience:** ${audience}`,
      "",
      `## Content`,
      content,
    ]
      .filter(Boolean)
      .join("\n");

    const audienceContext = buildAudienceContext(audience);

    // Build messages: first message includes post context, then conversation history
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (history.length === 0) {
      // Initial review request
      messages.push({
        role: "user",
        content: `${audienceContext}\n\nPlease review this blog post draft:\n\n${postContext}${brainstormContext}`,
      });
    } else {
      // Conversation continuation — first message has post context, rest is history
      messages.push({
        role: "user",
        content: `${audienceContext}\n\nHere is the blog post draft for context:\n\n${postContext}${brainstormContext}`,
      });
      messages.push(...history.map((m) => ({ role: m.role, content: m.content })));
    }

    c.header("content-type", "text/event-stream");
    c.header("cache-control", "no-cache");

    return streamText(c, async (stream) => {
      try {
        const res = await fetch(`${c.env.AI_GATEWAY_URL}/anthropic/v1/messages`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            stream: true,
            system: SYSTEM_PROMPT,
            messages,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          await stream.writeln(JSON.stringify({ type: "error", message: `${res.status} ${errText}` }));
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) { await stream.writeln(JSON.stringify({ type: "error", message: "No stream" })); return; }
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const event = JSON.parse(data);
              if (event.type === "content_block_delta" && event.delta?.text) {
                await stream.writeln(JSON.stringify({ type: "content", data: event.delta.text }));
              }
            } catch { /* skip */ }
          }
        }

        await stream.writeln(JSON.stringify({ type: "done" }));
      } catch (error) {
        try {
          await stream.writeln(JSON.stringify({ type: "error", message: error instanceof Error ? error.message : "Review failed" }));
        } catch { /* stream disconnected */ }
      }
    });
  },
);
