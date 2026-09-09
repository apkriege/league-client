import marketingPages from "@/pages/marketing/marketing-pages.json";

const SITE_URL = "https://leaguenightpro.com";
const SITE_NAME = "League Night Pro";
const SOCIAL_IMAGE = `${SITE_URL}/league-night-logo.png`;

export type SeoMetadata = {
  title: string;
  description: string;
  canonicalUrl: string | null;
  indexable: boolean;
};

const publicPages: Record<string, Omit<SeoMetadata, "canonicalUrl" | "indexable">> = {
  "/": {
    title: "Golf League Management Software | League Night Pro",
    description:
      "Run golf leagues with scheduling, flights, scorecards, score entry, standings, player and team insights, season history, and yearly renewal.",
  },
  "/privacy": {
    title: "Privacy Policy | League Night Pro",
    description: "Learn how League Night Pro collects, uses, and protects account and golf league information.",
  },
  "/terms": {
    title: "Terms of Service | League Night Pro",
    description: "Review the terms governing League Night Pro golf league management software.",
  },
  "/refunds": {
    title: "Refund Policy | League Night Pro",
    description: "Review refund eligibility for League Night Pro league-season golfer access purchases.",
  },
};

marketingPages.forEach((page) => {
  publicPages[`/${page.slug}`] = { title: page.title, description: page.description };
});

const appPageTitles: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/login$/, title: "Sign In" },
  { pattern: /^\/invite\/[^/]+$/, title: "Accept Invitation" },
  { pattern: /^\/forgot-password$/, title: "Forgot Password" },
  { pattern: /^\/reset-password$/, title: "Reset Password" },
  { pattern: /^\/verify-email$/, title: "Verify Email" },
  { pattern: /^\/leagues\/create$/, title: "Create League" },
  { pattern: /^\/leagues$/, title: "Leagues" },
  { pattern: /^\/courses\/[^/]+$/, title: "Course Details" },
  { pattern: /^\/courses$/, title: "Courses" },
  { pattern: /^\/support$/, title: "Contact Support" },
  { pattern: /^\/league\/[^/]+\/events\/create$/, title: "Create Event" },
  { pattern: /^\/league\/[^/]+\/events\/[^/]+\/edit$/, title: "Edit Event" },
  { pattern: /^\/league\/[^/]+\/events\/[^/]+\/scores$/, title: "Event Scoring" },
  {
    pattern: /^\/league\/[^/]+\/events\/[^/]+\/print-scorecards$/,
    title: "Print Scorecards",
  },
  { pattern: /^\/league\/[^/]+\/events\/[^/]+$/, title: "Event Details" },
  { pattern: /^\/league\/[^/]+\/player\/[^/]+$/, title: "Player Details" },
  { pattern: /^\/league\/[^/]+\/players$/, title: "Players" },
  { pattern: /^\/league\/[^/]+\/team\/[^/]+$/, title: "Team Details" },
  { pattern: /^\/league\/[^/]+\/teams$/, title: "Teams" },
  { pattern: /^\/league\/[^/]+\/schedule$/, title: "Schedule" },
  { pattern: /^\/league\/[^/]+\/edit$/, title: "Edit League" },
  { pattern: /^\/league\/[^/]+\/admin$/, title: "League Administration" },
  { pattern: /^\/league\/[^/]+$/, title: "League Overview" },
  { pattern: /^\/superadmin\/courses$/, title: "Course Administration" },
  { pattern: /^\/superadmin\/leagues$/, title: "League Administration" },
  { pattern: /^\/superadmin\/billing$/, title: "Billing Administration" },
  { pattern: /^\/superadmin\/users$/, title: "User Administration" },
];

export const resolveSeoMetadata = (pathname: string): SeoMetadata => {
  const normalizedPath = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  const publicPage = publicPages[normalizedPath];
  if (publicPage) {
    return {
      ...publicPage,
      canonicalUrl: `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath}`,
      indexable: true,
    };
  }

  const appPage = appPageTitles.find(({ pattern }) => pattern.test(normalizedPath));

  return {
    title: `${appPage?.title || "Page Not Found"} | ${SITE_NAME}`,
    description: "Secure League Night Pro account and golf league management area.",
    canonicalUrl: null,
    indexable: false,
  };
};

const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const setCanonical = (url: string | null) => {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!url) {
    existing?.remove();
    return;
  }
  const canonical = existing ?? document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = url;
  if (!existing) document.head.appendChild(canonical);
};

const setPublicStructuredData = (pathname: string, metadata: SeoMetadata) => {
  const id = "league-night-structured-data";
  document.getElementById(id)?.remove();
  if (!metadata.indexable || !metadata.canonicalUrl) return;

  const marketingPage = marketingPages.find((page) => `/${page.slug}` === pathname);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "League Night LLC",
      url: `${SITE_URL}/`,
      logo: SOCIAL_IMAGE,
      email: "support@leaguenightpro.com",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${metadata.canonicalUrl}#webpage`,
      url: metadata.canonicalUrl,
      name: metadata.title,
      description: metadata.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#software` },
    },
  ];

  if (pathname === "/" || marketingPage) {
    graph.push({
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Golf league management software",
      operatingSystem: "Web",
      description: metadata.description,
      featureList: [
        "Golf league and tournament setup",
        "Player, substitute, and team management",
        "Event scheduling, flights, and printable scorecards",
        "Eight individual and team scoring formats",
        "Gross, net, points, standings, and skins calculations",
        "League, player, team, event, and matchup intelligence",
        "Annual season renewal with historical rounds preserved",
      ],
      offers: {
        "@type": "Offer",
        price: "10.00",
        priceCurrency: "USD",
        description: "Per regular golfer for one league season; eight-golfer minimum",
        url: `${SITE_URL}/#pricing`,
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
    });
  }

  if (marketingPage) {
    graph.push(
      {
        "@type": "BreadcrumbList",
        "@id": `${metadata.canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: marketingPage.eyebrow, item: metadata.canonicalUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${metadata.canonicalUrl}#faq`,
        mainEntity: marketingPage.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    );
  }

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
  document.head.appendChild(script);
};

export const applySeoForPath = (pathname: string) => {
  const metadata = resolveSeoMetadata(pathname);
  document.title = metadata.title;
  setMeta('meta[name="description"]', "name", "description", metadata.description);
  setMeta(
    'meta[name="robots"]',
    "name",
    "robots",
    metadata.indexable
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow",
  );
  setMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
  setMeta('meta[property="og:description"]', "property", "og:description", metadata.description);
  setMeta('meta[property="og:url"]', "property", "og:url", metadata.canonicalUrl ?? SITE_URL);
  setMeta('meta[property="og:image"]', "property", "og:image", SOCIAL_IMAGE);
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", metadata.title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", metadata.description);
  setCanonical(metadata.canonicalUrl);
  setPublicStructuredData(pathname, metadata);
};
