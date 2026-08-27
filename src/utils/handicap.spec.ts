import { describe, expect, it } from "vitest";
import { formatHandicap, formatWholeHandicap } from "./handicap";

describe("handicap formatting", () => {
  it("displays stored handicaps to the hundredths place", () => {
    expect(formatHandicap(12)).toBe("12.00");
    expect(formatHandicap(10.375)).toBe("10.38");
  });

  it("uses a whole number for score-entry handicaps", () => {
    expect(formatWholeHandicap(10.49)).toBe("10");
    expect(formatWholeHandicap(10.5)).toBe("11");
  });
});
