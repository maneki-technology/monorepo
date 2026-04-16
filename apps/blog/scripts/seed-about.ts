/**
 * Seed the about page into the pages table.
 * Usage: TURSO_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-about.ts
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });

const aboutContent = `Senior Software Engineer with 14+ years of hands-on experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization. Comfortable owning systems end-to-end — from API design and data modeling to CI/CD pipelines and observability.

Currently at Xendit, building mission-critical authorization services and leading frontend development for cross-border financial products across Southeast Asia.

## What I work with

Go, TypeScript, Java, Python, React, Web Components, Kafka, PostgreSQL, Redis, OpenFGA, Docker/K8s

## Areas of focus

Distributed Systems, Micro-Frontends, Event-Driven Architecture, DDD, Fine-Grained Authorization, Design Systems, API Design

## Outside of work

Amateur photographer — mostly street, travel, and landscapes. You can see some of my shots on the [photography page](/photography).

## Get in touch

Find me on [GitHub](https://github.com/kiennt23) and [LinkedIn](https://linkedin.com/in/kiennt23), or drop me an email at [kien@maneki.tech](mailto:kien@maneki.tech).`;

const meta = JSON.stringify({
  skills: [
    "Go",
    "TypeScript",
    "Java",
    "Python",
    "React",
    "Web Components",
    "Kafka",
    "PostgreSQL",
    "Redis",
    "OpenFGA",
    "Docker/K8s",
  ],
  focusAreas: [
    "Distributed Systems",
    "Micro-Frontends",
    "Event-Driven Architecture",
    "DDD",
    "Fine-Grained Authorization",
    "Design Systems",
    "API Design",
  ],
  social: {
    github: "https://github.com/kiennt23",
    linkedin: "https://linkedin.com/in/kiennt23",
    email: "kien@maneki.tech",
  },
});

await db.execute({
  sql: `INSERT INTO pages (slug, title, content, meta, status, updated_at)
        VALUES (?, ?, ?, ?, 'published', datetime('now'))
        ON CONFLICT (slug) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          meta = excluded.meta,
          status = excluded.status,
          updated_at = excluded.updated_at`,
  args: ["about", "About", aboutContent, meta],
});

console.log("✓ Seeded about page.");
