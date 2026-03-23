import { posts } from "virtual:posts";
import { registerRoute } from "../router.js";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

registerRoute({
  id: "blog",
  meta: { title: "Blog", description: "Posts about fullstack development, design systems, and the web." },
  render: () => `
    <h1 class="heading-02 mb-4">Blog</h1>
    <div class="stack">
      ${posts.map((post) => `
        <div class="post-card">
          <a class="post-card-title" href="#post/${post.slug}">${post.title}</a>
          <div class="post-meta">${formatDate(post.date)} · ${post.readTime}</div>
          <p class="post-excerpt">${post.excerpt}</p>
          <div class="tags">
            ${post.tags.map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `,
});
