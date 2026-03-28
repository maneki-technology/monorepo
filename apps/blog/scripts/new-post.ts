#!/usr/bin/env node

/**
 * CLI script to scaffold a new blog post.
 *
 * Usage: npm run new-post "My Post Title"
 *    or: npx tsx scripts/new-post.ts "My Post Title"
 */

import { writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsDir = resolve(__dirname, "../content/posts");

const title = process.argv[2];

if (!title) {
  console.error("Usage: npm run new-post \"My Post Title\"");
  process.exit(1);
}

const today = new Date().toISOString().split("T")[0];
const slug = title
  .toLowerCase()
  .replace(/[^\w\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/(^-|-$)/g, "");

const filename = `${today}-${slug}.md`;
const filepath = resolve(postsDir, filename);

if (existsSync(filepath)) {
  console.error(`Post already exists: ${filename}`);
  process.exit(1);
}

const content = `---
title: ${title}
date: ${today}
excerpt: ""
tags: []
draft: true
---

Write your post here.
`;

writeFileSync(filepath, content);
console.log(`Created: content/posts/${filename}`);
console.log(`Draft mode — set "draft: false" to publish.`);
