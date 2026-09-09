import pages from "./marketing-pages.json";

export const resolveMarketingPage = (pathname: string) => {
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  return pages.find((page) => page.slug === slug) ?? null;
};
