import { describe, expect, it } from "vitest";
import { validateHandicapSettings, isValidStartingHandicap, parseStartingHandicap } from "./handicapSettings";
describe("league handicap settings", () => {
  it("validates the X/Y relationship and integer limits", () => {
    for (const [x, y] of [[4,4],[5,8],[20,20]]) expect(validateHandicapSettings({ handicapBestRounds:x, handicapWindow:y })).toBeNull();
    for (const [x,y] of [[3,8],[9,8],[5,21],[4.5,8],[4,8.5]]) expect(validateHandicapSettings({handicapBestRounds:x,handicapWindow:y})).not.toBeNull();
    expect(validateHandicapSettings({handicapHoleLimit:"wrong"})).not.toBeNull();
  });
  it("keeps blank separate from scratch and validates supplied starting values", () => {
    expect(parseStartingHandicap("")).toBeNull();
    expect(parseStartingHandicap("0")).toBe(0);
    for (const value of [null, undefined, "", "-2", "54"]) expect(isValidStartingHandicap(value)).toBe(true);
    for (const value of ["bad", true, -11,55]) expect(isValidStartingHandicap(value)).toBe(false);
  });
});
