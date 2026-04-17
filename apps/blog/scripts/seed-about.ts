/**
 * Seed about page content into Turso.
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

const title = "About";
const description =
  "Senior Software Engineer with 14+ years of experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization.";

const content = `Senior Software Engineer with 14+ years of hands-on experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization. Comfortable owning systems end-to-end — from API design and data modeling to CI/CD pipelines and observability.

Currently at Xendit, building mission-critical authorization services and leading frontend development for cross-border financial products across Southeast Asia.

## What I work with

<div class="row gap-1" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Go</ui-badge>
<ui-badge size="s" emphasis="subtle">TypeScript</ui-badge>
<ui-badge size="s" emphasis="subtle">Java</ui-badge>
<ui-badge size="s" emphasis="subtle">Python</ui-badge>
<ui-badge size="s" emphasis="subtle">React</ui-badge>
<ui-badge size="s" emphasis="subtle">Web Components</ui-badge>
<ui-badge size="s" emphasis="subtle">Kafka</ui-badge>
<ui-badge size="s" emphasis="subtle">PostgreSQL</ui-badge>
<ui-badge size="s" emphasis="subtle">Redis</ui-badge>
<ui-badge size="s" emphasis="subtle">OpenFGA</ui-badge>
<ui-badge size="s" emphasis="subtle">Docker/K8s</ui-badge>
</div>

## Areas of focus

<div class="row gap-1" style="flex-wrap:wrap;">
<ui-badge size="s" emphasis="subtle">Distributed Systems</ui-badge>
<ui-badge size="s" emphasis="subtle">Micro-Frontends</ui-badge>
<ui-badge size="s" emphasis="subtle">Event-Driven Architecture</ui-badge>
<ui-badge size="s" emphasis="subtle">DDD</ui-badge>
<ui-badge size="s" emphasis="subtle">Fine-Grained Authorization</ui-badge>
<ui-badge size="s" emphasis="subtle">Design Systems</ui-badge>
<ui-badge size="s" emphasis="subtle">API Design</ui-badge>
</div>

## Outside of work

Amateur photographer — mostly street, travel, and landscapes. You can see some of my shots on the [photography page](/photography).

## Get in touch

Find me on [GitHub](https://github.com/kiennt23) and [LinkedIn](https://linkedin.com/in/kiennt23), or drop me an email at [kien@maneki.tech](mailto:kien@maneki.tech).
`;

const styles = `
.row { display: flex; flex-wrap: wrap; }
.gap-1 { gap: var(--fd-space-1); }
.gap-2 { gap: var(--fd-space-2); }
.text-secondary { color: var(--fd-text-secondary, #52525b); }
`;


console.log("Seeding about page...");

await db.execute({
  sql: `INSERT INTO pages (slug, title, content, description, styles, status, updated_at)
        VALUES (?, ?, ?, ?, ?, 'published', datetime('now'))
        ON CONFLICT (slug) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          description = excluded.description,
          styles = excluded.styles,
          status = excluded.status,
          updated_at = excluded.updated_at`,
  args: ["about", title, content, description, styles],
});

console.log("Done — about page seeded.");
