import { registerRoute } from "../router.js";

registerRoute({
  id: "about",
  meta: { title: "About", description: "Fullstack developer who cares about the craft — from pixel-perfect UIs to well-structured backends." },
  render: () => `
    <h1 class="heading-02 mb-4">About</h1>

    <div class="post-content">
      <p>I'm a fullstack developer who cares about the craft — from pixel-perfect UIs to well-structured backends. I build with TypeScript, Web Components, Node.js, and whatever else gets the job done.</p>

      <p>Currently focused on design systems, developer tooling, and making the web platform work without heavy frameworks.</p>

      <h2>What I work with</h2>
      <div class="row gap-1" style="flex-wrap:wrap;">
        ${["TypeScript", "Web Components", "Node.js", "PostgreSQL", "Rust", "Vite", "Playwright", "Figma"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h2>Get in touch</h2>
      <p>
        Find me on <ui-link href="https://github.com" external>GitHub</ui-link>
        and <ui-link href="https://linkedin.com" external>LinkedIn</ui-link>,
        or drop me an email at <ui-link href="mailto:hello@example.com">hello@example.com</ui-link>.
      </p>
    </div>
  `,
});
