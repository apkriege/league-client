import { describe, expect, it } from "vitest";
import { resolveSeoMetadata } from "./seo";

describe("resolveSeoMetadata", () => {
  it("makes the public marketing page indexable and canonical", () => {
    expect(resolveSeoMetadata("/")).toMatchObject({
      indexable: true,
      canonicalUrl: "https://leaguenightpro.com/",
    });
  });

  it("assigns canonical metadata to public legal pages", () => {
    expect(resolveSeoMetadata("/privacy/")).toMatchObject({
      title: "Privacy Policy | League Night Pro",
      canonicalUrl: "https://leaguenightpro.com/privacy",
      indexable: true,
    });
  });

  it("prevents account and application routes from being indexed", () => {
    expect(resolveSeoMetadata("/league/42")).toMatchObject({
      canonicalUrl: null,
      indexable: false,
    });
  });
});
