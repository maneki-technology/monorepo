import { posts } from "virtual:posts";
import type { Route } from "../router.js";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const postRoutes: Route[] = posts.map((post) => ({
  id: `post/${post.slug}`,
  render: () => `
    <article>
      <a href="/blog" class="inline-link body-02 arrow-link"><span class="arrow-left">←</span> <span class="link-text">Back to blog</span></a>
      <h1 class="heading-02 mt-3">${post.title}</h1>
      <div class="post-meta mt-1">${formatDate(post.date)} · ${post.readTime}</div>
      <div class="tags mt-2">
        ${post.tags.map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>
      <div class="post-content mt-4 reveal">
        ${post.content}
      </div>
      <div style="border-top:1px solid var(--fd-border-minimal,#e4e4e7);padding-top:24px;margin-top:48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <a href="/blog" class="inline-link body-02">← <span class="link-text">Back to all posts</span></a>
      </div>
      <div style="margin-top:24px;padding:20px 0;text-align:center;">
        <p class="body-02" style="margin:0 0 8px;">Enjoyed this post? Get notified when I publish new ones.</p>
        <a href="/feed.xml" class="inline-link body-02" style="display:inline-flex;align-items:center;gap:6px;font-weight:500;">Subscribe via RSS →</a>
      </div>
    </article>
  `,
  meta: {
    title: post.title,
    description: post.excerpt,
  },
  showProgress: true,
}));

/** Lookup a single post route by ID — used by lazy router. */
export function findPostRoute(id: string): Route | undefined {
  return postRoutes.find((r) => r.id === id);
}
