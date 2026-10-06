import { describe, expect, it } from "vitest";
import { buildEventStory } from "./eventStory";
import type { EventInsightInput, EventInsightRound } from "./types";

const round = (playerId: number, scores: number[], firstHole = 1): EventInsightRound => ({
  playerId,
  player: { firstName: `Player ${playerId}`, lastName: "" },
  gross: scores.reduce((sum, score) => sum + score, 0),
  net: scores.reduce((sum, score) => sum + score, 0),
  scores: scores.map((score, index) => ({ hole: firstHole + index, gross: score, net: score, par: 4 })),
});

const event = (rounds: EventInsightRound[]): EventInsightInput => ({
  name: "Round story", holes: 9, pointsEnabled: false, scoringMode: "stroke-play",
  metrics: { scores: rounds },
});

describe("event story highlights", () => {
  it("does not manufacture a matchup between unassigned players", () => {
    const story = buildEventStory(event([round(1, Array(9).fill(4)), round(2, Array(9).fill(5))]));
    expect(story?.highlights.some((highlight) => highlight.kind === "battle")).toBe(false);
    expect(story?.highlights.some((highlight) => highlight.kind === "momentum")).toBe(false);
  });

  it("uses hole wins for match play instead of the magnitude of stroke differences", () => {
    const input = event([round(1, [4, 3, 3, 4, 4, 4, 4, 4, 4]), round(2, [3, 7, 7, 4, 4, 4, 4, 4, 4])]);
    input.scoringMode = "match-play";
    input.flights = [{ players: [{ playerId: 1, opponentId: 2 }, { playerId: 2, opponentId: 1 }] }];
    const battle = buildEventStory(input)?.highlights.find((highlight) => highlight.kind === "battle");
    expect(battle?.stat).toBe("1 lead change");
    expect(battle?.detail).toContain("finished 1 hole apart");
    input.scoringMode = "stroke-play";
    expect(buildEventStory(input)?.highlights.find((highlight) => highlight.kind === "battle")?.detail)
      .toContain("finished 7 net strokes apart");
  });

  it("calculates opening and closing improvement for back-nine holes 10 through 18", () => {
    const input = event([round(1, [6, 5, 5, 4, 4, 4, 4, 3, 4], 10)]);
    const momentum = buildEventStory(input)?.highlights.find((highlight) => highlight.kind === "momentum");
    expect(momentum?.stat).toBe("5-stroke swing");
    expect(momentum?.detail).toContain("(-1 to par)");
  });

  it("omits momentum and finished-match claims for partial cards", () => {
    const input = event([round(1, [6, 6, 6, 3, 3, 3]), round(2, [4, 4, 4, 4, 4, 4])]);
    input.flights = [{ players: [{ playerId: 1, opponentId: 2 }] }];
    const story = buildEventStory(input);
    expect(story?.highlights.some((highlight) => highlight.kind === "momentum")).toBe(false);
    expect(story?.highlights.some((highlight) => highlight.kind === "battle")).toBe(false);
  });

  it("does not bridge a missing hole when calculating a closing improvement", () => {
    const input = event([round(1, [6, 6, 6, 3, 3, 3])]);
    input.holes = 6;
    input.metrics!.scores![0].scores![3].hole = 8;
    expect(buildEventStory(input)?.highlights.some((highlight) => highlight.kind === "momentum")).toBe(false);
  });

  it("excludes partial cards from the lowest-gross fallback", () => {
    const input = event([round(1, Array(9).fill(4)), round(2, [5, 5])]);
    expect(buildEventStory(input)?.highlights.find((highlight) => highlight.kind === "hot")?.stat).toBe("36 gross");
  });
});
