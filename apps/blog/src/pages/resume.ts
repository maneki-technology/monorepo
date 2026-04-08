import type { Route } from "../router.js";

export const resumeRoute: Route = {
  id: "resume",
  meta: { title: "Resume", description: "Senior Software Engineer with 14+ years of experience. Go, TypeScript, Java, Python. Distributed systems, micro-frontends, fine-grained authorization." },
  showProgress: true,
  render: () => `
    <h1 class="heading-02 mb-2">Kien Nguyen Trung</h1>
    <p class="body-01 text-secondary">Senior Software Engineer</p>
    <div class="row gap-2 mt-1" style="flex-wrap:wrap;">
      <ui-link href="mailto:kien@maneki.tech" size="s">kien@maneki.tech</ui-link>
      <ui-link href="https://github.com/kiennt23" size="s" external>GitHub</ui-link>
      <ui-link href="https://linkedin.com/in/kiennt23" size="s" external>LinkedIn</ui-link>
    </div>

    <div class="post-content mt-4">
      <p>Senior Software Engineer with 14+ years of hands-on experience across the full stack. Polyglot engineer (Go, TypeScript, Java, Python) specializing in distributed systems, micro-frontend architecture, and fine-grained authorization.</p>

      <h2>Skills</h2>
      <div class="stack gap-2 reveal">
        <div>
          <p class="heading-05 mb-1">System Design</p>
          <div class="row gap-1" style="flex-wrap:wrap;">
            ${["Microservices", "Event-Driven Architecture", "DDD", "Fine-Grained Authorization (OpenFGA)", "API Design (REST, GraphQL)"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
          </div>
        </div>
        <div>
          <p class="heading-05 mb-1">Frontend Architecture</p>
          <div class="row gap-1" style="flex-wrap:wrap;">
            ${["React", "Web Components (Lit)", "Micro-Frontends (Module Federation)", "Atomic State Management", "Component-Driven Development", "Multi-Brand White-Labeling"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
          </div>
        </div>
        <div>
          <p class="heading-05 mb-1">Distributed Systems</p>
          <div class="row gap-1" style="flex-wrap:wrap;">
            ${["Kafka", "Redis", "Elasticsearch", "PostgreSQL", "SQL & NoSQL"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
          </div>
        </div>
        <div>
          <p class="heading-05 mb-1">Languages</p>
          <div class="row gap-1" style="flex-wrap:wrap;">
            ${["Go", "TypeScript", "Java", "Python"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
          </div>
        </div>
      </div>

      <h2>Experience</h2>

      <h3>Xendit Pte Ltd \u2014 Senior Software Engineer</h3>
      <p class="body-02 text-secondary">March 2021 \u2013 Present</p>
      <p class="body-02 text-secondary mb-2">Southeast Asian fintech providing payment infrastructure across Indonesia, the Philippines, Hong Kong, Mexico, and beyond.</p>

      <h4>Auth Platform <span class="body-02 text-secondary">| Engineer | Team of 2</span></h4>
      <p>Designed and built a mission-critical fine-grained authorization service using OpenFGA \u2014 a single point of dependency for all product APIs and the merchant dashboard. Handles dynamic permission overrides across 5 product types and 140+ currency pairs with P99 latency under 40ms.</p>
      <ul>
        <li>Architected an FGA system using OpenFGA to replace legacy Postgres-based permission checks, supporting real-time blocklist/whitelist overrides across 5 financial products and 140+ currency pairs</li>
        <li>Implemented smart override resolution that checks default permissions before writing, reducing write operations by ~40%</li>
        <li>Parallelized all FGA read paths achieving P99 &lt;40ms across 11 concurrent FGA calls in the hot path of every API request</li>
        <li>Designed a modular FGA model with source/destination/pair-level granularity, enabling country-office-level currency restrictions without downtime</li>
      </ul>
      <div class="row gap-1 mb-3" style="flex-wrap:wrap;">
        ${["Go 1.24", "Echo v4", "OpenFGA", "PostgreSQL", "Redis", "Kafka"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h4>Regional Dashboard <span class="body-02 text-secondary">| Frontend Lead | Team of 6</span></h4>
      <p>Led frontend development for Xendit's global expansion, shipping 5 cross-border products in under 6 months \u2014 Xendit's highest-margin product line.</p>
      <ul>
        <li>Delivered cross-border payments, balance conversion, cross-border payouts, withdrawals, and FX management \u2014 5 products in &lt;6 months</li>
        <li>Modernized the frontend tech stack through the strangler pattern \u2014 no major rewrites, zero downtime</li>
        <li>Built a scalable authorization layer ensuring compliance with local and global regulatory requirements across new markets</li>
        <li>Optimized frontend performance, reducing initial load time by ~30%</li>
      </ul>
      <div class="row gap-1 mb-3" style="flex-wrap:wrap;">
        ${["React 18", "TypeScript", "Module Federation", "React Compiler", "Jotai", "Radix UI"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h4>Transaction Monitoring System <span class="body-02 text-secondary">| Senior Software Engineer | Team of 6</span></h4>
      <p>Built a compliance-driven transaction monitoring platform from the ground up.</p>
      <ul>
        <li>Developed a rule management UI for risk and compliance teams</li>
        <li>Built the core rule engine to evaluate transactions in real-time and generate alerts</li>
        <li>Integrated a third-party case management system for investigation workflows</li>
        <li>Designed ETL pipelines to consolidate transaction data from multiple upstream sources</li>
      </ul>
      <div class="row gap-1 mb-3" style="flex-wrap:wrap;">
        ${["React 18", "TypeScript", "Go", "Kafka"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h4>Merchant Dashboard <span class="body-02 text-secondary">| Senior Software Engineer | Team of 5</span></h4>
      <p>Maintained and evolved a Module Federation monorepo hosting 14 micro-frontends, 3 BFF gateways, and 3 shared libraries serving multi-brand fintech dashboards.</p>
      <ul>
        <li>Developed a TUI launcher for local development handling submodule management across 21 git submodules</li>
        <li>Supported multi-brand white-labeling across 4 fintech brands with shared infrastructure</li>
        <li>Leading migration of the authentication layer to SuperTokens</li>
      </ul>
      <div class="row gap-1 mb-3" style="flex-wrap:wrap;">
        ${["React 18", "Module Federation", "Redux", "Jotai", "Node.js/Express", "Nx", "Vite"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h3>Hearti Lab Pte Ltd \u2014 Product Developer Lead</h3>
      <p class="body-02 text-secondary">October 2019 \u2013 February 2021</p>

      <h4>CYBERhythm <span class="body-02 text-secondary">| Lead | Team of 6</span></h4>
      <p>Led development of a multi-cloud cybersecurity platform for SMEs, providing unified security monitoring across AWS, Azure, GCP, and Alibaba Cloud.</p>
      <ul>
        <li>Led a cross-functional team from architecture through delivery</li>
        <li>Designed and built the CI/CD pipeline on Azure DevOps with Docker/AKS</li>
        <li>Integrated 4 cloud providers, open threat intelligence feeds, and a payment gateway</li>
        <li>Built ETL pipelines with Airflow to consolidate security events into a unified dashboard</li>
      </ul>
      <div class="row gap-1 mb-3" style="flex-wrap:wrap;">
        ${["Django", "React/Redux", "Spring Cloud", "Airflow", "PostgreSQL", "Elasticsearch", "Docker/AKS"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h3>Helius Technologies \u2014 Senior Application Developer</h3>
      <p class="body-02 text-secondary">May 2018 \u2013 October 2019</p>

      <h4>DBS Digimarkets</h4>
      <p>Built an FX trading platform for DBS enabling traders to request quotes and book deals, with data-driven analytics.</p>
      <ul>
        <li>Designed and developed the platform end-to-end, from Polymer/LitElement frontend to Spring Cloud backend with GraphQL APIs</li>
        <li>Built a business rule engine service using OpenL Tablets</li>
      </ul>
      <div class="row gap-1 mb-3" style="flex-wrap:wrap;">
        ${["Polymer/LitElement", "Spring Cloud", "GraphQL", "Kafka", "Elasticsearch", "Docker/OpenShift"].map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>

      <h3>FPT Software Limited \u2014 Software Engineer</h3>
      <p class="body-02 text-secondary">June 2014 \u2013 May 2018</p>
      <p>Built retail and configuration systems for Starhub (AngularJS, Spring Boot, Neo4j) and a high-availability program guide web service for DirecTV/AT&T (Java/Spring Boot, Couchbase, Elasticsearch).</p>

      <h3>VietSoftware International \u2014 Software Engineer</h3>
      <p class="body-02 text-secondary">May 2012 \u2013 June 2014</p>
      <p>Built an enterprise service bus for Alliance Bernstein (UK) and a foreign exchange management system for BIDV bank.</p>

      <h2>Education</h2>
      <div class="reveal">
      <p><strong>Bachelor of Engineering, Information Technology</strong></p>
      <p class="body-02 text-secondary">Post and Telecommunication Institute of Technology, Hanoi</p>
      </div>


      <h2>Training</h2>
      <p>Essential DDD \u2014 Paul Rayner</p>
    </div>
  `,
};
