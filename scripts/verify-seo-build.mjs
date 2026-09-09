import { readFile } from "node:fs/promises";

const pages = JSON.parse(await readFile("src/pages/marketing/marketing-pages.json", "utf8"));
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const home = await readFile("dist/index.html", "utf8");
const serveConfig = JSON.parse(await readFile("dist/serve.json", "utf8"));

if (!/<div id="root">\s*<main/.test(home) || !home.includes('"@type":"SoftwareApplication"')) {
  throw new Error("Homepage SEO snapshot or software schema is missing");
}

for (const page of pages) {
  const html = await readFile(`dist/${page.slug}.html`, "utf8");
  const canonical = `https://leaguenightpro.com/${page.slug}`;
  const checks = [
    `<title>${page.title}</title>`,
    `name="description"`,
    `content="${page.description.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`,
    `rel="canonical" href="${canonical}"`,
    `<h1>${page.heading}</h1>`,
    '"@type":"FAQPage"',
    '"@type":"BreadcrumbList"',
  ];
  if (checks.some((value) => !html.includes(value))) {
    throw new Error(`SEO output is incomplete for ${page.slug}`);
  }
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
    throw new Error(`Sitemap is missing ${page.slug}`);
  }
  if (
    !serveConfig.rewrites?.some(
      (rewrite) => rewrite.source === page.slug && rewrite.destination === `/${page.slug}.html`,
    )
  ) {
    throw new Error(`Static server rewrite is missing ${page.slug}`);
  }
}

if (
  !serveConfig.rewrites?.some(
    (rewrite) => rewrite.source === "league/**" && rewrite.destination === "/index.html",
  )
) {
  throw new Error("Application route fallback is missing");
}
