import { describe, expect, it } from "vitest";
import { calculateAlternateShotHandicap, calculateScrambleHandicap } from "./teamHandicap";

describe("shared team handicaps", () => {
  it("uses the standard two-player scramble weighting", () => {
    expect(calculateScrambleHandicap([10, 20])).toBe(7);
  });

  it("uses half of combined alternate-shot handicaps", () => {
    expect(calculateAlternateShotHandicap([10, 20])).toBe(15);
  });
});
