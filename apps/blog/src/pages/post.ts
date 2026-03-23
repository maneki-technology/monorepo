import { posts } from "virtual:posts";
import { registerRoute } from "../router.js";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Register a route for each post
for (const post of posts) {
  registerRoute({
    id: `post/${post.slug}`,
    render: () => `
      <article>
        <a href="#blog" class="body-02 text-link" style="text-decoration:none;">← Back to blog</a>
        <h1 class="heading-02 mt-3">${post.title}</h1>
        <div class="post-meta mt-1">${formatDate(post.date)} · ${post.readTime}</div>
        <div class="tags mt-2">
          ${post.tags.map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
        </div>
        <div class="post-content mt-4">
          ${post.content}
        </div>
        <div style="border-top:1px solid var(--fd-border-minimal,#e4e4e7);padding-top:24px;margin-top:48px;">
          <a href="#blog" class="body-02 text-link" style="text-decoration:none;">← Back to all posts</a>
        </div>
      </article>
    `,
    meta: {
      title: post.title,
      description: post.excerpt,
    },
  });
}
