import { describe, expect, it } from "vitest";
import { buildLeaguePulse } from "./leaguePulse";
import { hasCompletedMatchPlayEvent } from "./leagueRivalryEligibility";

describe("league rivalry eligibility", () => {
  it.each([
    ["completed", "match-play", true],
    ["complete", "four-ball-match", true],
    ["completed", "stroke-play", false],
    ["completed", "best-ball", false],
    ["scheduled", "match-play", false],
    ["active", "match-play", false],
    ["canceled", "match-play", false],
  ])("gates %s %s events", (status, scoringMode, eligible) => {
    const events = [{ id: 1, name: "Opening Night", startsAt: "2026-06-01T22:00:00Z", status, scoringMode }];
    expect(hasCompletedMatchPlayEvent(events)).toBe(eligible);
    const pulse = buildLeaguePulse({
      events,
      roster: [],
      metrics: {
        headToHead: [{ playerId: 1, playerName: "Avery", opponentId: 2, opponentName: "Blake", wins: 1, losses: 0, ties: 0 }],
      },
    });
    expect(pulse.spotlights.some((spotlight) => spotlight.kind === "rivalry")).toBe(eligible);
  });

  it("hides rivalries when there are no events", () => {
    expect(hasCompletedMatchPlayEvent([])).toBe(false);
  });
});
