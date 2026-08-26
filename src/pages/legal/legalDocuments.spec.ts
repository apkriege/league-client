import { describe, expect, it } from "vitest";
import { getPrivacyPolicy, getRefundPolicy, getTermsOfService } from "./legalDocuments";

const documentText = (document: ReturnType<typeof getPrivacyPolicy>) =>
  document.sections
    .flatMap((section) => [...(section.paragraphs ?? []), ...(section.items ?? [])])
    .join(" ");

describe("legal documents", () => {
  it("discloses configured analytics and payment processing", () => {
    const text = documentText(getPrivacyPolicy("support@example.com"));

    expect(text).toContain("Google Analytics");
    expect(text).toContain("Stripe");
    expect(text).toContain("support@example.com");
  });

  it("describes one-time capacity purchases and league handicaps", () => {
    const text = documentText(getTermsOfService(null));

    expect(text).toContain("one-time Stripe Checkout payment");
    expect(text).toContain("not an official USGA Handicap Index");
  });

  it("limits the standard refund window to unused capacity", () => {
    const text = documentText(getRefundPolicy(null));

    expect(text).toContain("14 calendar days");
    expect(text).toContain("has not been allocated to or used by an active league");
  });
});
