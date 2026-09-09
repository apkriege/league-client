import { describe, expect, it } from "vitest";
import { resolveMarketingPage } from "./marketingPageData";

describe("resolveMarketingPage", () => {
  it("resolves the product guide from its explicit route pathname", () => {
    expect(resolveMarketingPage("/golf-league-software-for-commissioners")?.slug).toBe(
      "golf-league-software-for-commissioners",
    );
  });

  it("does not resolve an unknown route", () => {
    expect(resolveMarketingPage("/not-a-product-page")).toBeNull();
  });
});
