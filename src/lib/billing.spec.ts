import { describe, expect, it } from "vitest";
import { BILLING_MIN_GOLFERS, getLeagueBillableGolfers } from "./billing";

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
});
