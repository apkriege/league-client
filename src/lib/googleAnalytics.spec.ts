import { describe, expect, it } from "vitest";
import { isGoogleAnalyticsMeasurementId } from "./googleAnalytics";

describe("Google Analytics configuration", () => {
  it("accepts GA4 measurement IDs", () => {
    expect(isGoogleAnalyticsMeasurementId("G-ABC123XYZ")).toBe(true);
    expect(isGoogleAnalyticsMeasurementId("  G-ABC123XYZ  ")).toBe(true);
  });

  it("rejects missing and malformed measurement IDs", () => {
    expect(isGoogleAnalyticsMeasurementId(undefined)).toBe(false);
    expect(isGoogleAnalyticsMeasurementId("UA-12345-1")).toBe(false);
    expect(isGoogleAnalyticsMeasurementId("G-")).toBe(false);
  });
});
