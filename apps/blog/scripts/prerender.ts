/**
 * Post-build prerender script.
 *
 * Uses Vite's dev server in SSR mode to resolve virtual modules (virtual:posts),
 * then generates static HTML files for each route by injecting rendered content
 * into the built index.html shell.
 *
 * Run: npx vite build && npx tsx scripts/prerender.ts
 */

import { createServer } from "vite";
import { getDb } from "../plugins/db.js";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// SSR shims — photography page imports Web Components that use browser-only APIs at module level
declare global {
  // eslint-disable-next-line no-var
  var CSSStyleSheet: { new(): { replaceSync(_: string): void } };
  // eslint-disable-next-line no-var
  var HTMLElement: { new(): unknown };
  // eslint-disable-next-line no-var
  var customElements: { define(_n: string, _c: unknown): void; get(_n: string): unknown };
}
if (typeof globalThis.CSSStyleSheet === 'undefined') {
  globalThis.CSSStyleSheet = class CSSStyleSheet { replaceSync() {} } as never;
}
if (typeof globalThis.HTMLElement === 'undefined') {
  globalThis.HTMLElement = class HTMLElement {} as never;
}
if (typeof globalThis.customElements === 'undefined') {
  globalThis.customElements = { define() {}, get() {} } as never;
}


const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
// SITE_URL and SITE_TITLE loaded via Vite SSR from src/config.ts

async function prerender(): Promise<void> {
  // Create a Vite dev server in SSR mode to resolve virtual modules
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
  });

  try {
    // Load config and routes via Vite's module graph
    const { SITE_URL, SITE_TITLE } = await vite.ssrLoadModule("/src/config.ts") as {
      SITE_URL: string;
      SITE_TITLE: string;
    };
    type PrerenderRoute = { id: string; render: () => string; meta?: { title?: string; description?: string } };
    interface RouteModule {
      [key: string]: PrerenderRoute | PrerenderRoute[];
    }
    const { homeRoute } = await vite.ssrLoadModule("/src/pages/home.ts") as RouteModule;
    const { blogRoute } = await vite.ssrLoadModule("/src/pages/blog.ts") as RouteModule;
    const { postRoutes } = await vite.ssrLoadModule("/src/pages/post.ts") as RouteModule;
    const { draftRoutes } = await vite.ssrLoadModule("/src/pages/draft.ts") as RouteModule;
    const { portfolioRoute } = await vite.ssrLoadModule("/src/pages/portfolio.ts") as RouteModule;
    const { projectRoutes } = await vite.ssrLoadModule("/src/pages/project.ts") as RouteModule;
    const { resumeRoute } = await vite.ssrLoadModule("/src/pages/resume.ts") as RouteModule;
    const { aboutRoute } = await vite.ssrLoadModule("/src/pages/about.ts") as RouteModule;
    const { photographyRoute } = await vite.ssrLoadModule("/src/pages/photography.ts") as RouteModule;
    const { mapRoute } = await vite.ssrLoadModule("/src/pages/map.ts") as RouteModule;

    const allRoutes: PrerenderRoute[] = [
      homeRoute as PrerenderRoute,
      blogRoute as PrerenderRoute,
      ...(postRoutes as PrerenderRoute[]),
      portfolioRoute as PrerenderRoute,
      photographyRoute as PrerenderRoute,
      mapRoute as PrerenderRoute,
      ...(projectRoutes as PrerenderRoute[]),
      ...(draftRoutes as PrerenderRoute[]),
      resumeRoute as PrerenderRoute,
      aboutRoute as PrerenderRoute,
    ];


    // Find font asset URLs in the built output
    const distDir = resolve(root, "dist/assets");
    const geistFile = readdirSync(distDir).find((f) => f.startsWith("Geist-Variable") && f.endsWith(".woff2"));
    const geistUrl = geistFile ? `/assets/${geistFile}` : "";
    const iconsFile = readdirSync(distDir).find((f) => f.startsWith("material-symbols-outlined-subset") && f.endsWith(".woff2"));
    const iconsUrl = iconsFile ? `/assets/${iconsFile}` : "";

    // Inject font preload + @font-face into <head> (tokens already injected by Vite plugin)
    const fontPreload = [
      geistUrl ? `<link rel="preload" href="${geistUrl}" as="font" type="font/woff2" crossorigin />` : "",
      iconsUrl ? `<link rel="preload" href="${iconsUrl}" as="font" type="font/woff2" crossorigin />` : "",
    ].filter(Boolean).join("\n");
    const fontFace = [
      geistUrl ? `@font-face { font-family: 'Geist'; src: url('${geistUrl}') format('woff2'); font-weight: 100 900; font-style: normal; font-display: swap; }` : "",
      iconsUrl ? `@font-face { font-family: 'Material Symbols Outlined'; src: url('${iconsUrl}') format('woff2'); font-style: normal; font-display: swap; }` : "",
    ].filter(Boolean).join("\n");
    const fontFaceStyle = fontFace ? `<style>${fontFace}</style>` : "";

    // Google Analytics
    const gaScript = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TFK84DSH0B"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TFK84DSH0B');
</script>`;

    let shell = readFileSync(resolve(root, "dist/index.html"), "utf-8");
    shell = shell.replace("</body>", `${gaScript}\n</body>`);
    shell = shell.replace("</head>", `${fontPreload}\n${fontFaceStyle}\n</head>`);
    console.log(`Prerendering ${allRoutes.length} routes...`);

    for (const route of allRoutes) {
      const html = route.render();
      const pageTitle = route.meta?.title
        ? `${route.meta.title} \u2014 ${SITE_TITLE}`
        : SITE_TITLE;
      const pageUrl = route.id === "home"
        ? `${SITE_URL}/`
        : `${SITE_URL}/${route.id}`;

      // Inject content + meta into shell
      let page = shell
        .replace(
          /<main id="content">[\s\S]*?<\/main>/,
          `<main id="content" data-prerendered>${html}</main>`,
        )
        .replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
        .replace(
          /og:title" content="[^"]*"/,
          `og:title" content="${pageTitle}"`,
        )
        .replace(
          /og:url" content="[^"]*"/,
          `og:url" content="${pageUrl}"`,
        )
        .replace(
          /rel="canonical" href="[^"]*"/,
          `rel="canonical" href="${pageUrl}"`,
        );

      if (route.meta?.description) {
        page = page
          .replace(
            /og:description" content="[^"]*"/,
            `og:description" content="${route.meta.description}"`,
          )
          .replace(
            /name="description" content="[^"]*"/,
            `name="description" content="${route.meta.description}"`,
          );
      }

      // Preload LCP images for home page (polaroid stack photos are in Shadow DOM)
      if (route.id === "home") {
        const imgPreloads = (html.match(/src="(https:\/\/blog-images[^"]+)"/g) || [])
          .slice(0, 3)
          .map(m => m.replace(/src="([^"]+)"/, '$1'))
          .map(url => `<link rel="preload" href="${url}" as="image" fetchpriority="high" />`)
          .join("\n");
        if (imgPreloads) {
          page = page.replace("</head>", `${imgPreloads}\n</head>`);
        }
      }

      // Add wide-layout class for photography page
      if (route.id === "photography") {
        page = page.replace("<body", '<body class="wide-layout"');
      }

      // Write flat files: dist/blog.html (not dist/blog/index.html)
      // Cloudflare Pages serves blog.html for /blog without trailing slash redirect
      if (route.id === "home") {
        writeFileSync(resolve(root, "dist/index.html"), page);
      } else {
        const dir = dirname(resolve(root, "dist", `${route.id}.html`));
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(root, "dist", `${route.id}.html`), page);
      }

      console.log(`  \u2713 /${route.id === "home" ? "" : route.id}`);
    }

    // Generate 404.html — Cloudflare Pages serves this for unknown routes
    const notFoundHtml = shell
      .replace(
        /<main id="content">[\s\S]*?<\/main>/,
        `<main id="content"><p class="body-01 text-secondary">Page not found.</p></main>`,
      )
      .replace(/<title>.*?<\/title>/, `<title>Not Found \u2014 ${SITE_TITLE}</title>`);
    writeFileSync(resolve(root, "dist/404.html"), notFoundHtml);
    console.log("  \u2713 /404.html");

    console.log(`\nPrerendered ${allRoutes.length} pages + 404.`);

    // Write manifest + stamp deployed_at on all rendered slugs
    const db = getDb();
    const manifest: { slug: string; type: string }[] = [];
    for (const route of allRoutes) {
      if (route.id.startsWith("post/")) manifest.push({ slug: route.id.slice(5), type: "post" });
      else if (route.id.startsWith("project/")) manifest.push({ slug: route.id.slice(8), type: "project" });
      else if (route.id.startsWith("draft/")) manifest.push({ slug: route.id.slice(6), type: "draft" });
    }
    await db.execute({
      sql: "UPDATE deployments SET manifest = ? WHERE id = (SELECT id FROM deployments ORDER BY created_at DESC LIMIT 1)",
      args: [JSON.stringify(manifest)],
    });
    // Stamp deployed_at on all rendered posts/projects so the share button enables
    const postSlugs = manifest.filter(m => m.type === "post" || m.type === "draft").map(m => m.slug);
    const projectSlugs = manifest.filter(m => m.type === "project").map(m => m.slug);
    if (postSlugs.length) {
      await db.execute({
        sql: `UPDATE posts SET deployed_at = datetime('now') WHERE slug IN (${postSlugs.map(() => "?").join(",")})`,
        args: postSlugs,
      });
    }
    if (projectSlugs.length) {
      await db.execute({
        sql: `UPDATE projects SET deployed_at = datetime('now') WHERE slug IN (${projectSlugs.map(() => "?").join(",")})`,
        args: projectSlugs,
      });
    }
    console.log(`Wrote manifest (${manifest.length} entries) and stamped deployed_at on ${postSlugs.length} posts + ${projectSlugs.length} projects.`);
  } finally {
    await vite.close();
  }
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
