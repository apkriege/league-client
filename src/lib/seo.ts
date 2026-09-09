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

const setHomeStructuredData = (enabled: boolean) => {
  const id = "league-night-structured-data";
  document.getElementById(id)?.remove();
  if (!enabled) return;

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
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
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: publicPages["/"].description,
        featureList: [
          "Golf league and tournament setup",
          "Player, substitute, and team management",
          "Event scheduling, flights, and printable scorecards",
          "Stroke play, match play, Stableford, maximum score, best ball, four-ball, scramble, and alternate-shot scoring",
          "Configurable gross, net, handicap, placement-point, match-point, and skins calculations",
          "League, player, team, event, matchup, and commissioner intelligence",
          "Annual season renewal with historical rounds preserved",
        ],
        offers: {
          "@type": "Offer",
          price: "10.00",
          priceCurrency: "USD",
          description: "Per golfer for one league season",
          url: `${SITE_URL}/#pricing`,
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
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
  setHomeStructuredData(pathname === "/");
};
