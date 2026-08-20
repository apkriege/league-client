import { describe, expect, it } from "vitest";
import { getCheckoutReturn } from "./checkoutReturn";

describe("checkout return parameters", () => {
  it("reads the return status and exact Stripe session", () => {
    expect(getCheckoutReturn("?checkout=upgrade_success&session_id=cs_test_123")).toEqual({
      checkout: "upgrade_success",
      sessionId: "cs_test_123",
    });
  });

  it("returns null values for an ordinary page visit", () => {
    expect(getCheckoutReturn("?tab=players")).toEqual({
      checkout: null,
      sessionId: null,
    });
  });
});
