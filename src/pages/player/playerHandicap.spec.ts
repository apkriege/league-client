import { describe, expect, it } from "vitest";
import { buildHandicapDifferentialPool, getHandicapRule } from "./playerHandicap";

describe("getHandicapRule", () => {
  it("uses the best available differential after the first round", () => {
    expect(getHandicapRule(1)).toEqual({ count: 1, adjustment: -2 });
    expect(getHandicapRule(2)).toEqual({ count: 1, adjustment: -2 });
  });

  it("uses the lowest two differentials with a -1 adjustment for six rounds", () => {
    expect(getHandicapRule(6)).toEqual({ count: 2, adjustment: -1 });
  });

  it("removes the adjustment starting with seven rounds", () => {
    expect(getHandicapRule(7)).toEqual({ count: 2, adjustment: 0 });
  });

  it("models missing established history with the starting index", () => {
    const pool = buildHandicapDifferentialPool(
      [{ differential: 0 }],
      (row) => row.differential,
      12,
    );
    const lowestEight = [...pool]
      .sort((left, right) => left.differential - right.differential)
      .slice(0, 8);

    expect(pool).toHaveLength(20);
    expect(lowestEight.reduce((sum, entry) => sum + entry.differential, 0) / 8).toBe(10.5);
  });
});
