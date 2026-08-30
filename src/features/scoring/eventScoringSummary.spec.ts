import { describe, expect, it } from "vitest";
import { getEventScoringSummary } from "./eventScoringSummary";

describe("event scoring summary", () => {
  it("describes match points without exposing unused rules", () => {
    expect(getEventScoringSummary({
      format: "team",
      scoringMode: "match-play",
      ptsPerHole: 1,
      ptsPerMatch: 2,
      ptsPerTeamWin: 3,
    })).toEqual({
      format: "Team · Match Play",
      points: "1 per hole · 2 per player match · 3 per team win",
    });
  });

  it("describes placement points and disabled points", () => {
    expect(getEventScoringSummary({
      format: "individual",
      scoringMode: "stroke-play",
      strokePoints: [10, 8, 6, 4],
    }).points).toBe("Placement points · 10 / 8 / 6 / 4");
    expect(getEventScoringSummary({
      format: "team",
      scoringMode: "scramble",
      pointsEnabled: false,
    }).points).toBe("Season points disabled");
  });
});
