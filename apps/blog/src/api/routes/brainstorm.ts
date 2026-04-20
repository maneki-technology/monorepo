/**
 * AI brainstorm route — streams Claude ideation/discussion on blog post topics.
 * POST /brainstorm — accepts post content + topic focus + conversation history, streams NDJSON response.
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

const brainstormSchema = z.object({
  title: z.string().optional().default(""),
  content: z.string().optional().default(""),
  excerpt: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  focus: z.enum(["structure", "hooks", "angles", "audience", "seo", "open"]).default("open"),
  audience: z.enum(["developers", "photographers", "lifestyle", "general"]).default("general"),
  history: z.array(messageSchema).optional().default([]),
});

const SYSTEM_PROMPT = `You are a creative writing partner and brainstorming collaborator for a personal tech blog. Your role is to help the writer think through ideas, explore angles, and develop their posts — NOT to critique or review.

Your personality: curious, enthusiastic, generative. You ask provocative questions, suggest unexpected connections, and help the writer find their unique voice.

Depending on the focus area:

**Structure** — Help organize thoughts into a compelling narrative arc. Suggest section breakdowns, transitions, and pacing. Ask "what's the one thing you want readers to walk away with?"

**Hooks** — Brainstorm opening lines, titles, and attention-grabbing intros. Generate 5-10 options ranging from conventional to bold. Think about what would make someone click.

**Angles** — Explore different perspectives on the topic. What's the contrarian take? The personal story angle? The "here's what everyone gets wrong" angle? The tutorial angle vs the opinion piece?

**Audience** — Help think about who this is for and what they care about. What questions would they have? What's their context? What would make them share this?

**SEO** — Brainstorm keywords, related topics, title variations, and meta descriptions. Think about search intent and what people actually Google.

**Open** — Freeform discussion. Help develop half-formed ideas, explore tangents, play devil's advocate, or just riff on the topic.

Keep responses energetic and generative. Use bullet points, numbered lists, and bold text for scanability. Ask follow-up questions to dig deeper. Never be prescriptive — offer options and let the writer choose.`;

function buildFocusContext(focus: string): string {
  switch (focus) {
    case "structure":
      return "The writer wants help with post structure and organization. Focus on narrative arc, section flow, and pacing.";
    case "hooks":
      return "The writer wants help with hooks and openings. Generate creative title options, opening lines, and attention-grabbing intros.";
    case "angles":
      return "The writer wants to explore different angles on their topic. Suggest contrarian takes, personal story angles, and fresh perspectives.";
    case "audience":
      return "The writer wants to think about their audience. Help them understand who they're writing for and what would resonate.";
    case "seo":
      return "The writer wants SEO brainstorming. Suggest keywords, title variations, meta descriptions, and related topics people search for.";
    default:
      return "Open brainstorming session. Help the writer develop their ideas freely.";
  }
}

function buildAudienceContext(audience: string): string {
  switch (audience) {
    case "developers":
      return "Target audience: software developers and engineers. They appreciate technical depth, code examples, and practical takeaways.";
    case "photographers":
      return "Target audience: photography enthusiasts. They value visual storytelling, technical camera/editing details, and creative inspiration.";
    case "lifestyle":
      return "Target audience: general lifestyle readers. They prefer accessible language, personal stories, and relatable content.";
    default:
      return "Target audience: general readers with mixed technical backgrounds.";
  }
}

export const brainstorm = new Hono<Env>().post(
  "/",
  zValidator("json", brainstormSchema),
  async (c) => {
    const apiKey = c.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return c.json({ error: "ANTHROPIC_API_KEY not configured" }, 500);
    }

    const { title, content, excerpt, tags, focus, audience, history } = c.req.valid("json");


    const postContext = [
      title ? `**Title:** ${title}` : "",
      excerpt ? `**Excerpt:** ${excerpt}` : "",
      tags ? `**Tags:** ${tags}` : "",
      content ? `\n## Draft content (if any)\n${content.slice(0, 5000)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const focusContext = buildFocusContext(focus);

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (history.length === 0) {
      messages.push({
        role: "user",
        content: `${focusContext}\n\n${buildAudienceContext(audience)}\n\n${postContext ? `Here's what I have so far:\n\n${postContext}\n\n` : ""}Let's brainstorm!`,
      });
    } else {
      messages.push({
        role: "user",
        content: `${focusContext}\n\n${buildAudienceContext(audience)}\n\n${postContext ? `Context — current draft:\n\n${postContext}\n\n` : ""}(Continuing our brainstorm session)`,
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
          await stream.writeln(JSON.stringify({ type: "error", message: error instanceof Error ? error.message : "Brainstorm failed" }));
        } catch { /* stream disconnected */ }
      }
    });
  },
);
