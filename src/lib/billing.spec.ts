import { describe, expect, it } from "vitest";
import {
  BILLING_MIN_GOLFERS,
  getLeagueBillingStatus,
  getLeagueBillableGolfers,
  getLeagueCapacity,
} from "./billing";

describe("league billing", () => {
  it("applies the minimum independently of roster size", () => {
    expect(getLeagueBillableGolfers([])).toBe(BILLING_MIN_GOLFERS);
    expect(getLeagueBillableGolfers([{ type: "player" }, { type: "sub" }])).toBe(
      BILLING_MIN_GOLFERS
    );
  });

  it("counts only regular players above the minimum", () => {
    expect(
      getLeagueBillableGolfers([
        ...Array.from({ length: 9 }, () => ({ type: "player" })),
        { type: "substitute" },
      ])
    ).toBe(9);
  });

  it("uses the season entitlement as the only capacity and payment source", () => {
    expect(getLeagueBillingStatus({ entitlement: null })).toBe("payment_due");
    const activeLeague = {
      entitlement: {
        requiredGolfers: 10,
        paidGolfers: 10,
        refundedGolfers: 0,
        status: "consumed",
      },
    };
    expect(getLeagueCapacity(activeLeague)).toBe(10);
    expect(getLeagueBillingStatus(activeLeague)).toBe("active");
    expect(getLeagueBillingStatus({
      entitlement: { ...activeLeague.entitlement, refundedGolfers: 1 },
    })).toBe("payment_due");
    expect(getLeagueBillingStatus({
      entitlement: {
        requiredGolfers: 10,
        paidGolfers: 0,
        refundedGolfers: 0,
        status: "bypassed",
      },
    })).toBe("exempt");
  });
});
