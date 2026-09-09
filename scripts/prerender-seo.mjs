import { readFile, writeFile } from "node:fs/promises";

const siteUrl = "https://leaguenightpro.com";
const pages = JSON.parse(await readFile("src/pages/marketing/marketing-pages.json", "utf8"));
const template = await readFile("dist/index.html", "utf8");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const replaceMeta = (html, attribute, key, content) => {
  const pattern = new RegExp(`(<meta\\s+[^>]*${attribute}=["']${key}["'][^>]*content=["'])[^"']*(["'][^>]*>)`, "i");
  return html.replace(pattern, `$1${escapeHtml(content)}$2`);
};

const software = {
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#software`,
  name: "League Night Pro",
  url: `${siteUrl}/`,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Golf league management software",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "10.00",
    priceCurrency: "USD",
    description: "Per regular golfer for one league season; eight-golfer minimum",
  },
};

const pageSchema = (page, canonical) => ({
  "@context": "https://schema.org",
  "@graph": [
    software,
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: page.title,
      description: page.description,
      about: { "@id": `${siteUrl}/#software` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: page.eyebrow, item: canonical },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
});

const snapshot = (page) => `
  <main style="max-width:72rem;margin:auto;padding:3rem 1.25rem;font-family:Manrope,sans-serif;color:#0f172a">
    <nav><a href="/">League Night Pro</a></nav>
    <p>${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.heading)}</h1>
    <p>${escapeHtml(page.intro)}</p>
    <ul>${page.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    ${page.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`).join("")}
    <section><h2>Frequently asked questions</h2>${page.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</section>
    <p><a href="/#register">Create your golf league</a></p>
    <nav>${pages.filter((item) => item.slug !== page.slug).map((item) => `<a href="/${item.slug}">${escapeHtml(item.eyebrow)}</a>`).join(" · ")}</nav>
  </main>`;

for (const page of pages) {
  const canonical = `${siteUrl}/${page.slug}`;
  let html = template.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  html = replaceMeta(html, "name", "description", page.description);
  html = replaceMeta(html, "property", "og:title", page.title);
  html = replaceMeta(html, "property", "og:description", page.description);
  html = replaceMeta(html, "name", "twitter:title", page.title);
  html = replaceMeta(html, "name", "twitter:description", page.description);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*("\s*\/>)/i, `$1${canonical}$2`);
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${snapshot(page)}</div>`);
  const schema = JSON.stringify(pageSchema(page, canonical)).replaceAll("<", "\\u003c");
  html = html.replace("</head>", `<script id="league-night-structured-data" type="application/ld+json">${schema}</script>\n  </head>`);
  await writeFile(`dist/${page.slug}.html`, html);
}

const homeSnapshot = `
  <main style="max-width:72rem;margin:auto;padding:3rem 1.25rem;font-family:Manrope,sans-serif;color:#0f172a">
    <h1>Golf league management software built for the entire season.</h1>
    <p>Run players, teams, schedules, flights, scorecards, eight scoring formats, standings, skins, player history, league intelligence, and season renewal in one web-based system.</p>
    <h2>One place for commissioners and golfers</h2>
    <p>Enter each score once to update event results, points, standings, records, team performance, and player insights. Plan 9-hole or 18-hole events and preserve every completed season.</p>
    <nav>${pages.map((page) => `<a href="/${page.slug}">${escapeHtml(page.eyebrow)}</a>`).join(" · ")}</nav>
    <p><a href="/#register">Create your golf league</a></p>
  </main>`;
const homeSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [software, { "@type": "WebSite", name: "League Night Pro", url: `${siteUrl}/` }],
}).replaceAll("<", "\\u003c");
const homeHtml = template
  .replace(/<div id="root"><\/div>/, `<div id="root">${homeSnapshot}</div>`)
  .replace("</head>", `<script id="league-night-structured-data" type="application/ld+json">${homeSchema}</script>\n  </head>`);
await writeFile("dist/index.html", homeHtml);

const serveConfig = JSON.parse(await readFile("dist/serve.json", "utf8"));
serveConfig.rewrites = [
  ...pages.map((page) => ({
    source: page.slug,
    destination: `/${page.slug}.html`,
  })),
  ...[
    "league/**",
    "leagues",
    "leagues/**",
    "courses",
    "courses/**",
    "support",
    "superadmin/**",
    "login",
    "invite/**",
    "forgot-password",
    "reset-password",
    "verify-email",
    "privacy",
    "terms",
    "refunds",
  ].map((source) => ({ source, destination: "/index.html" })),
];
await writeFile("dist/serve.json", `${JSON.stringify(serveConfig, null, 2)}\n`);
