import { getPage } from "virtual:pages";
import type { Route } from "../router.js";

function renderAboutPage(): string {
  const page = getPage("about");

  if (!page) {
    return `
      <h1 class="heading-02 mb-4">About</h1>
      <div class="post-content reveal">
        <p>About page coming soon.</p>
      </div>`;
  }

  const styleTag = page.styles ? `<style>${page.styles}</style>` : "";
  return `
    ${styleTag}
    <h1 class="heading-02 mb-4">${page.title || "About"}</h1>
    <div class="post-content reveal">
      ${page.content}
    </div>`;
}

export const aboutRoute: Route = {
  id: "about",
  meta: {
    title: "About",
    description:
      "Senior Software Engineer with 14+ years of experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization.",
  },
  render: renderAboutPage,
};
