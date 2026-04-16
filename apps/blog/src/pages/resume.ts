import { getPage } from "virtual:pages";
import type { Route } from "../router.js";

function renderResumePage(): string {
  const page = getPage("resume");

  if (!page) {
    return `
      <h1 class="heading-02 mb-4">Resume</h1>
      <div class="post-content reveal">
        <p>Resume coming soon.</p>
      </div>`;
  }

  return `
    <h1 class="heading-02 mb-2">${page.title || "Resume"}</h1>
    <div class="post-content mt-4">
      ${page.content}
    </div>`;
}

export const resumeRoute: Route = {
  id: "resume",
  meta: {
    title: "Resume",
    description:
      "Senior Software Engineer with 14+ years of experience. Go, TypeScript, Java, Python. Distributed systems, micro-frontends, fine-grained authorization.",
  },
  showProgress: true,
  render: renderResumePage,
};
