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
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
    // Load page modules directly for prerendering (routes.ts uses lazy loading for browser)
    const { homeRoute } = await vite.ssrLoadModule("/src/pages/home.ts") as any;
    const { blogRoute } = await vite.ssrLoadModule("/src/pages/blog.ts") as any;
    const { postRoutes } = await vite.ssrLoadModule("/src/pages/post.ts") as any;
    const { portfolioRoute } = await vite.ssrLoadModule("/src/pages/portfolio.ts") as any;
    const { projectRoutes } = await vite.ssrLoadModule("/src/pages/project.ts") as any;
    const { resumeRoute } = await vite.ssrLoadModule("/src/pages/resume.ts") as any;
    const { aboutRoute } = await vite.ssrLoadModule("/src/pages/about.ts") as any;

    const allRoutes: Array<{
      id: string;
      render: () => string;
      meta?: { title?: string; description?: string };
    }> = [
      homeRoute,
      blogRoute,
      ...postRoutes,
      portfolioRoute,
      ...projectRoutes,
      resumeRoute,
      aboutRoute,
    ];

    // Generate foundation token CSS to inline in <head>
    const tokens = await vite.ssrLoadModule("@maneki/foundation") as {
      colorsToCssProperties: () => string;
      semanticToCssProperties: () => string;
      elevationToCssProperties: () => string;
      typographyToCssProperties: () => string;
      spacingToCssProperties: () => string;
      radiusToCssProperties: () => string;
      borderWidthToCssProperties: () => string;
      darkSemanticToCssProperties: () => string;
      darkElevationToCssProperties: () => string;
    };

    const tokenCss = [
      tokens.colorsToCssProperties(),
      tokens.semanticToCssProperties(),
      tokens.elevationToCssProperties(),
      tokens.typographyToCssProperties(),
      tokens.spacingToCssProperties(),
      tokens.radiusToCssProperties(),
      tokens.borderWidthToCssProperties(),
    ].join("\n");
    const darkTokenCss = [
      tokens.darkSemanticToCssProperties(),
      tokens.darkElevationToCssProperties(),
    ].join("\n");
    const tokenStyle = `<style id="maneki-foundation-all">:root {\n${tokenCss}\n}\n\n[data-theme="dark"] {\n${darkTokenCss}\n}</style>`;

    // Find font asset URLs in the built output
    const distDir = resolve(root, "dist/assets");
    const geistFile = readdirSync(distDir).find((f) => f.startsWith("Geist-Variable") && f.endsWith(".woff2"));
    const geistUrl = geistFile ? `/assets/${geistFile}` : "";
    const iconsFile = readdirSync(distDir).find((f) => f.startsWith("material-symbols-outlined-subset") && f.endsWith(".woff2"));
    const iconsUrl = iconsFile ? `/assets/${iconsFile}` : "";

    // Inject tokens + preload + @font-face into <head>
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
    shell = shell.replace("<head>", `<head>\n${gaScript}`);
    shell = shell.replace("</head>", `${fontPreload}\n${tokenStyle}\n${fontFaceStyle}\n</head>`);

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
  } finally {
    await vite.close();
  }
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
