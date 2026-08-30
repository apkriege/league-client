import { describe, expect, it } from "vitest";
import {
  deriveScoringMode,
  getScoringFamily,
  getScoringModesForModel,
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
});
