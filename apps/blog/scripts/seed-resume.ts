/**
 * Seed resume content as a markdown page into Turso.
 * Usage: TURSO_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-resume.ts
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });

const title = "Kien Nguyen Trung";
const description = "Senior Software Engineer with 14+ years of experience. Go, TypeScript, Java, Python. Distributed systems, micro-frontends, fine-grained authorization.";

const content = `<p class="body-01 text-secondary">Senior Software Engineer</p>

<div class="row gap-2 mt-1" style="flex-wrap:wrap;">
<ui-link href="mailto:kien@maneki.tech" size="s">kien@maneki.tech</ui-link>
<ui-link href="https://github.com/kiennt23" size="s" external>GitHub</ui-link>
<ui-link href="https://linkedin.com/in/kiennt23" size="s" external>LinkedIn</ui-link>
</div>

Senior Software Engineer with 14+ years of hands-on experience across the full stack. Polyglot engineer (Go, TypeScript, Java, Python) specializing in distributed systems, micro-frontend architecture, and fine-grained authorization.

## Skills

<div class="stack gap-2 reveal">
<div>
<p class="heading-05 mb-1">System Design</p>
<div class="row gap-1" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Microservices</ui-badge>
<ui-badge size="s" emphasis="subtle">Event-Driven Architecture</ui-badge>
<ui-badge size="s" emphasis="subtle">DDD</ui-badge>
<ui-badge size="s" emphasis="subtle">Fine-Grained Authorization (OpenFGA)</ui-badge>
<ui-badge size="s" emphasis="subtle">API Design (REST, GraphQL)</ui-badge>
</div>
</div>
<div>
<p class="heading-05 mb-1">Frontend Architecture</p>
<div class="row gap-1" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">React</ui-badge>
<ui-badge size="s" emphasis="subtle">Web Components (Lit)</ui-badge>
<ui-badge size="s" emphasis="subtle">Micro-Frontends (Module Federation)</ui-badge>
<ui-badge size="s" emphasis="subtle">Atomic State Management</ui-badge>
<ui-badge size="s" emphasis="subtle">Component-Driven Development</ui-badge>
<ui-badge size="s" emphasis="subtle">Multi-Brand White-Labeling</ui-badge>
</div>
</div>
<div>
<p class="heading-05 mb-1">Distributed Systems</p>
<div class="row gap-1" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Kafka</ui-badge>
<ui-badge size="s" emphasis="subtle">Redis</ui-badge>
<ui-badge size="s" emphasis="subtle">Elasticsearch</ui-badge>
<ui-badge size="s" emphasis="subtle">PostgreSQL</ui-badge>
<ui-badge size="s" emphasis="subtle">SQL & NoSQL</ui-badge>
</div>
</div>
<div>
<p class="heading-05 mb-1">Languages</p>
<div class="row gap-1" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Go</ui-badge>
<ui-badge size="s" emphasis="subtle">TypeScript</ui-badge>
<ui-badge size="s" emphasis="subtle">Java</ui-badge>
<ui-badge size="s" emphasis="subtle">Python</ui-badge>
</div>
</div>
</div>

## Experience

### Xendit Pte Ltd — Senior Software Engineer

<p class="body-02 text-secondary">March 2021 – Present</p>
<p class="body-02 text-secondary mb-2">Southeast Asian fintech providing payment infrastructure across Indonesia, the Philippines, Hong Kong, Mexico, and beyond.</p>

#### Auth Platform <span class="body-02 text-secondary">| Engineer | Team of 2</span>

Designed and built a mission-critical fine-grained authorization service using OpenFGA — a single point of dependency for all product APIs and the merchant dashboard. Handles dynamic permission overrides across 5 product types and 140+ currency pairs with P99 latency under 40ms.

- Architected an FGA system using OpenFGA to replace legacy Postgres-based permission checks, supporting real-time blocklist/whitelist overrides across 5 financial products and 140+ currency pairs
- Implemented smart override resolution that checks default permissions before writing, reducing write operations by ~40%
- Parallelized all FGA read paths achieving P99 <40ms across 11 concurrent FGA calls in the hot path of every API request
- Designed a modular FGA model with source/destination/pair-level granularity, enabling country-office-level currency restrictions without downtime

<div class="row gap-1 mb-3" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Go 1.24</ui-badge>
<ui-badge size="s" emphasis="subtle">Echo v4</ui-badge>
<ui-badge size="s" emphasis="subtle">OpenFGA</ui-badge>
<ui-badge size="s" emphasis="subtle">PostgreSQL</ui-badge>
<ui-badge size="s" emphasis="subtle">Redis</ui-badge>
<ui-badge size="s" emphasis="subtle">Kafka</ui-badge>
</div>

#### Regional Dashboard <span class="body-02 text-secondary">| Frontend Lead | Team of 6</span>

Led frontend development for Xendit's global expansion, shipping 5 cross-border products in under 6 months — Xendit's highest-margin product line.

- Delivered cross-border payments, balance conversion, cross-border payouts, withdrawals, and FX management — 5 products in <6 months
- Modernized the frontend tech stack through the strangler pattern — no major rewrites, zero downtime
- Built a scalable authorization layer ensuring compliance with local and global regulatory requirements across new markets
- Optimized frontend performance, reducing initial load time by ~30%

<div class="row gap-1 mb-3" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">React 18</ui-badge>
<ui-badge size="s" emphasis="subtle">TypeScript</ui-badge>
<ui-badge size="s" emphasis="subtle">Module Federation</ui-badge>
<ui-badge size="s" emphasis="subtle">React Compiler</ui-badge>
<ui-badge size="s" emphasis="subtle">Jotai</ui-badge>
<ui-badge size="s" emphasis="subtle">Radix UI</ui-badge>
</div>

#### Transaction Monitoring System <span class="body-02 text-secondary">| Senior Software Engineer | Team of 6</span>

Built a compliance-driven transaction monitoring platform from the ground up.

- Developed a rule management UI for risk and compliance teams
- Built the core rule engine to evaluate transactions in real-time and generate alerts
- Integrated a third-party case management system for investigation workflows
- Designed ETL pipelines to consolidate transaction data from multiple upstream sources

<div class="row gap-1 mb-3" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">React 18</ui-badge>
<ui-badge size="s" emphasis="subtle">TypeScript</ui-badge>
<ui-badge size="s" emphasis="subtle">Go</ui-badge>
<ui-badge size="s" emphasis="subtle">Kafka</ui-badge>
</div>

#### Merchant Dashboard <span class="body-02 text-secondary">| Senior Software Engineer | Team of 5</span>

Maintained and evolved a Module Federation monorepo hosting 14 micro-frontends, 3 BFF gateways, and 3 shared libraries serving multi-brand fintech dashboards.

- Developed a TUI launcher for local development handling submodule management across 21 git submodules
- Supported multi-brand white-labeling across 4 fintech brands with shared infrastructure
- Leading migration of the authentication layer to SuperTokens

<div class="row gap-1 mb-3" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">React 18</ui-badge>
<ui-badge size="s" emphasis="subtle">Module Federation</ui-badge>
<ui-badge size="s" emphasis="subtle">Redux</ui-badge>
<ui-badge size="s" emphasis="subtle">Jotai</ui-badge>
<ui-badge size="s" emphasis="subtle">Node.js/Express</ui-badge>
<ui-badge size="s" emphasis="subtle">Nx</ui-badge>
<ui-badge size="s" emphasis="subtle">Vite</ui-badge>
</div>

### Hearti Lab Pte Ltd — Product Developer Lead

<p class="body-02 text-secondary">October 2019 – February 2021</p>

#### CYBERhythm <span class="body-02 text-secondary">| Lead | Team of 6</span>

Led development of a multi-cloud cybersecurity platform for SMEs, providing unified security monitoring across AWS, Azure, GCP, and Alibaba Cloud.

- Led a cross-functional team from architecture through delivery
- Designed and built the CI/CD pipeline on Azure DevOps with Docker/AKS
- Integrated 4 cloud providers, open threat intelligence feeds, and a payment gateway
- Built ETL pipelines with Airflow to consolidate security events into a unified dashboard

<div class="row gap-1 mb-3" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Django</ui-badge>
<ui-badge size="s" emphasis="subtle">React/Redux</ui-badge>
<ui-badge size="s" emphasis="subtle">Spring Cloud</ui-badge>
<ui-badge size="s" emphasis="subtle">Airflow</ui-badge>
<ui-badge size="s" emphasis="subtle">PostgreSQL</ui-badge>
<ui-badge size="s" emphasis="subtle">Elasticsearch</ui-badge>
<ui-badge size="s" emphasis="subtle">Docker/AKS</ui-badge>
</div>

### Helius Technologies — Senior Application Developer

<p class="body-02 text-secondary">May 2018 – October 2019</p>

#### DBS Digimarkets

Built an FX trading platform for DBS enabling traders to request quotes and book deals, with data-driven analytics.

- Designed and developed the platform end-to-end, from Polymer/LitElement frontend to Spring Cloud backend with GraphQL APIs
- Built a business rule engine service using OpenL Tablets

<div class="row gap-1 mb-3" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Polymer/LitElement</ui-badge>
<ui-badge size="s" emphasis="subtle">Spring Cloud</ui-badge>
<ui-badge size="s" emphasis="subtle">GraphQL</ui-badge>
<ui-badge size="s" emphasis="subtle">Kafka</ui-badge>
<ui-badge size="s" emphasis="subtle">Elasticsearch</ui-badge>
<ui-badge size="s" emphasis="subtle">Docker/OpenShift</ui-badge>
</div>

### FPT Software Limited — Software Engineer

<p class="body-02 text-secondary">June 2014 – May 2018</p>

Built retail and configuration systems for Starhub (AngularJS, Spring Boot, Neo4j) and a high-availability program guide web service for DirecTV/AT&T (Java/Spring Boot, Couchbase, Elasticsearch).

### VietSoftware International — Software Engineer

<p class="body-02 text-secondary">May 2012 – June 2014</p>

Built an enterprise service bus for Alliance Bernstein (UK) and a foreign exchange management system for BIDV bank.

## Education

<div class="reveal">

**Bachelor of Engineering, Information Technology**

<p class="body-02 text-secondary">Post and Telecommunication Institute of Technology, Hanoi</p>

</div>

## Training

Essential DDD — Paul Rayner
`;

console.log("Seeding resume page...");

await db.execute({ sql: "DELETE FROM pages WHERE slug = ?", args: ["resume"] });
await db.execute({
  sql: `INSERT INTO pages (slug, title, content, description, status, updated_at)
        VALUES (?, ?, ?, ?, 'published', datetime('now'))`,
  args: ["resume", title, content, description],
});

console.log("Done — resume page seeded.");
