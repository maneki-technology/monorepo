import type { Route } from "../router.js";

export const aboutRoute: Route = {
  id: "about",
  meta: { title: "About", description: "Senior Software Engineer with 14+ years of experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization." },
  render: () => `
    <h1 class="heading-02 mb-4">About</h1>

    <div class="post-content">
      <p>Senior Software Engineer with 14+ years of hands-on experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization. Comfortable owning systems end-to-end \u2014 from API design and data modeling to CI/CD pipelines and observability.</p>

      <p>Currently at Xendit, building mission-critical authorization services and leading frontend development for cross-border financial products across Southeast Asia.</p>

      <h2>What I work with</h2>
      <div class="row gap-1" style="flex-wrap:wrap;">
        ${["Go", "TypeScript", "Java", "Python", "React", "Web Components", "Kafka", "PostgreSQL", "Redis", "OpenFGA", "Docker/K8s"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h2>Areas of focus</h2>
      <div class="row gap-1" style="flex-wrap:wrap;">
        ${["Distributed Systems", "Micro-Frontends", "Event-Driven Architecture", "DDD", "Fine-Grained Authorization", "Design Systems", "API Design"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h2>Get in touch</h2>
      <p>
        Find me on <ui-link href="https://github.com/kiennt23" external>GitHub</ui-link>
        and <ui-link href="https://linkedin.com/in/kiennt23" external>LinkedIn</ui-link>,
        or drop me an email at <ui-link href="mailto:kien@maneki.tech">kien@maneki.tech</ui-link>.
      </p>
    </div>
  `,
};
