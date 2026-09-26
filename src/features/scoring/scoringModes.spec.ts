import { describe, expect, it } from "vitest";
import {
  deriveScoringMode,
  getScoringFamily,
  getScoringModesForModel,
  getRequiredTeamPlayers,
  getTeamSizeError,
  hasPlacementPoints,
  isSharedTeamScoringMode,
} from "./scoringModes";

describe("scoring modes", () => {
  it("uses the explicit scoring mode for team events", () => {
    expect(deriveScoringMode({ format: "team", scoringMode: "stroke-play" })).toBe("stroke-play");
  });

  it("exposes shared-ball modes only for team events", () => {
    expect(getScoringModesForModel("individual").map((mode) => mode.id)).not.toContain("scramble");
    expect(isSharedTeamScoringMode("alternate-shot")).toBe(true);
  });

  it("maps explicit modes to the scoring family", () => {
    expect(getScoringFamily("four-ball-match")).toBe("match");
    expect(getScoringFamily("stableford")).toBe("stroke");
  });

  it("distinguishes blank placement settings from an explicit zero", () => {
    expect(hasPlacementPoints("")).toBe(false);
    expect(hasPlacementPoints([])).toBe(false);
    expect(hasPlacementPoints([0])).toBe(true);
    expect(hasPlacementPoints("10,8")).toBe(true);
  });

  it("requires at least two players for best ball", () => {
    expect(getRequiredTeamPlayers("best-ball", 1)).toBe(2);
    expect(getTeamSizeError("best-ball", 1)).toMatch(/at least two/i);
    expect(getTeamSizeError("best-ball", 2)).toBeNull();
  });
});
