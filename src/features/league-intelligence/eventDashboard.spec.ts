import { describe, expect, it } from "vitest";
import { buildEventDashboard, buildHoleDifficultyRows } from "./eventDashboard";
import type { EventInsightInput } from "./types";

const event: EventInsightInput = {
  name: "Rivalry Night",
  holes: 6,
  format: "individual",
  scoringMode: "match-play",
  pointsEnabled: true,
  flights: [{
    players: [
      { playerId: 1, opponentId: 2 },
      { playerId: 2, opponentId: 1 },
    ],
  }],
  metrics: {
    scores: [
      {
        playerId: 1,
        player: { firstName: "Avery", lastName: "Green" },
        gross: 25,
        net: 20,
        pointsEarned: 8,
        scores: [
          { hole: 1, gross: 6, net: 5, par: 4 },
          { hole: 2, gross: 4, net: 3, par: 4 },
          { hole: 3, gross: 3, net: 3, par: 4 },
          { hole: 4, gross: 5, net: 4, par: 4 },
          { hole: 5, gross: 4, net: 3, par: 4 },
          { hole: 6, gross: 3, net: 2, par: 4 },
        ],
      },
      {
        playerId: 2,
        player: { firstName: "Blake", lastName: "Fairway" },
        gross: 28,
        net: 25,
        pointsEarned: 7,
        scores: [
          { hole: 1, gross: 4, net: 4, par: 4 },
          { hole: 2, gross: 5, net: 4, par: 4 },
          { hole: 3, gross: 4, net: 4, par: 4 },
          { hole: 4, gross: 3, net: 3, par: 4 },
          { hole: 5, gross: 7, net: 6, par: 4 },
          { hole: 6, gross: 5, net: 4, par: 4 },
        ],
      },
    ],
    skins: {
      playerSkins: [{ playerId: 1, name: "Avery Green", hole: 3 }],
      playerNetSkins: [{ playerId: 1, name: "Avery Green", hole: 6 }],
    },
    scoreDistribution: {
      thisEvent: { eagles: 0, birdies: 3, pars: 5, bogeys: 3, doubleBogeys: 1, tripleBogeys: 0 },
      seasonAvg: { eagles: 0.2, birdies: 2, pars: 6, bogeys: 4, doubleBogeys: 2, tripleBogeys: 0.5 },
    },
  },
};

describe("event intelligence dashboard", () => {
  it("derives event impact, defining holes, awards, and assigned matchups", () => {
    const dashboard = buildEventDashboard(event);

    expect(dashboard.players[0]).toMatchObject({
      name: "Avery Green",
      redNumbers: 2,
      bounceBacks: 2,
      longestControlStreak: 2,
      openingToPar: -1,
      closingToPar: -3,
      finishSwing: 2,
    });
    expect(dashboard.hardestHole).toMatchObject({ hole: 5, averageGrossToPar: 1.5 });
    expect(dashboard.opportunityHole).toMatchObject({ hole: 3, birdiesOrBetter: 1 });
    expect(dashboard.chaosHole).toMatchObject({ hole: 5, grossRange: 3 });
    expect(dashboard.mostDoubleBogeys).toMatchObject({ hole: 1, doublesOrWorse: 1, scores: 2 });
    expect(dashboard.mostParOrBetter).toMatchObject({ hole: 3, parOrBetter: 2, scores: 2 });
    expect(dashboard.decisiveSwing).toMatchObject({
      hole: 5,
      strokes: 3,
      winner: "Avery Green",
    });
    expect(dashboard.matchups[0]).toMatchObject({
      left: { playerId: 1, holesWon: 4 },
      right: { playerId: 2, holesWon: 2 },
      leadChanges: 1,
      label: "Back-and-forth",
    });
    expect(dashboard.awards.map((award) => award.id)).toEqual(
      ["bounceback", "control"],
    );
    expect(dashboard.players[0]).toMatchObject({ netVsField: -2.5, parOrBetterRate: 67, recoveryOpportunities: 2 });
  });

  it("uses net scoring order when event points are disabled", () => {
    const dashboard = buildEventDashboard({ ...event, pointsEnabled: false });

    expect(dashboard.players.map((player) => player.playerId)).toEqual([1, 2]);
    expect(dashboard.decisiveSwing?.winner).toBe("Avery Green");
  });

  it("builds team matchup summaries from assigned opponents", () => {
    const dashboard = buildEventDashboard({
      ...event,
      format: "team",
      flights: [{
        teams: [
          { teamId: 10, opponentId: 20 },
          { teamId: 20, opponentId: 10 },
        ],
      }],
      metrics: {
        ...event.metrics,
        teamStandings: [
          { teamId: 10, name: "Pin Seekers", totalPoints: 9.5 },
          { teamId: 20, name: "Birdie Makers", totalPoints: 9 },
        ],
      },
    });

    expect(dashboard.teamMatchups[0]).toMatchObject({
      left: { teamId: 10, points: 9.5 },
      right: { teamId: 20, points: 9 },
      margin: 0.5,
      label: "Photo finish",
    });
  });

  it("compares par-or-better rates using each hole's actual score count", () => {
    const dashboard = buildEventDashboard({
      name: "Partial field",
      metrics: { scores: [
        { playerId: 1, player: { firstName: "A", lastName: "" }, gross: 8, net: 8, scores: [
          { hole: 1, gross: 4, net: 4, par: 4 },
          { hole: 2, gross: 4, net: 4, par: 4 },
        ] },
        { playerId: 2, player: { firstName: "B", lastName: "" }, gross: 6, net: 6, scores: [
          { hole: 1, gross: 6, net: 6, par: 4 },
        ] },
      ] },
    });
    expect(dashboard.mostParOrBetter).toMatchObject({ hole: 2, parOrBetter: 1, scores: 1 });
    expect(dashboard.mostDoubleBogeys).toMatchObject({ hole: 1, doublesOrWorse: 1, scores: 2 });
    expect(dashboard.opportunityHole).toBeNull();
  });

  it("does not imply a winner's swing when leaders are tied on event points", () => {
    const dashboard = buildEventDashboard({ ...event, metrics: {
      ...event.metrics,
      scores: event.metrics!.scores!.map((round) => ({ ...round, pointsEarned: 8 })),
    } });
    expect(dashboard.decisiveSwing).toBeNull();
  });

  it("handles an empty field without inventing defining holes", () => {
    const dashboard = buildEventDashboard({ name: "Empty" });
    expect(dashboard.mostDoubleBogeys).toBeNull();
    expect(dashboard.mostParOrBetter).toBeNull();
    expect(dashboard.opportunityHole).toBeNull();
    expect(dashboard.decisiveSwing).toBeNull();
  });

  it("counts match-play lead changes by holes won rather than cumulative strokes", () => {
    const scorecard = (playerId: number, values: number[]) => ({
      playerId, player: { firstName: String(playerId), lastName: "" },
      gross: values.reduce((sum, score) => sum + score, 0),
      net: values.reduce((sum, score) => sum + score, 0),
      scores: values.map((score, index) => ({ hole: index + 1, gross: score, net: score, par: 4 })),
    });
    const input = { ...event, metrics: { scores: [
      scorecard(1, [4, 1, 4, 4, 4, 4]),
      scorecard(2, [3, 5, 3, 4, 4, 4]),
    ] } };
    expect(buildEventDashboard(input).matchups[0].leadChanges).toBe(0);
    expect(buildEventDashboard({ ...input, scoringMode: "stroke-play" }).matchups[0].leadChanges).toBe(1);
  });

  it("excludes unfinished cards from field comparison and closing metrics", () => {
    const rounds = event.metrics!.scores!;
    const dashboard = buildEventDashboard({ ...event, holes: 9, metrics: { scores: [
      rounds[0], { ...rounds[1], net: 36, scores: Array.from({ length: 9 }, (_, index) => ({ hole: index + 1, gross: 4, net: 4, par: 4 })) },
    ] } });
    expect(dashboard.players.find((player) => player.playerId === 1)).toMatchObject({
      netVsField: null, closingToPar: null, openingToPar: null, finishSwing: null,
    });
    expect(dashboard.players.find((player) => player.playerId === 2)?.netVsField).toBe(0);
  });

  it("normalizes field distributions and includes triple bogeys in double-plus", () => {
    const dashboard = buildEventDashboard({ ...event, metrics: { ...event.metrics, scoreDistribution: {
      thisEvent: { eagles: 0, birdies: 2, pars: 4, bogeys: 0, doubleBogeys: 1, tripleBogeys: 3 },
      seasonAvg: { eagles: 0, birdies: 0.1, pars: 0.2, bogeys: 0, doubleBogeys: 0.1, tripleBogeys: 0.1 },
      seasonTotals: { eagles: 0, birdies: 4, pars: 8, bogeys: 0, doubleBogeys: 2, tripleBogeys: 6 },
    } } });
    expect(dashboard.fieldComparison.find((metric) => metric.key === "doubleBogeys")).toEqual({
      key: "doubleBogeys", event: 40, usual: 40, difference: 0,
    });
    expect(dashboard.fieldComparison.find((metric) => metric.key === "birdies")?.event).toBe(20);
  });

  it("does not count missing next holes as recovery opportunities", () => {
    const dashboard = buildEventDashboard({ name: "Gaps", metrics: { scores: [{
      ...event.metrics!.scores![0], scores: [
        { hole: 10, gross: 6, net: 5, par: 4 },
        { hole: 12, gross: 4, net: 4, par: 4 },
        { hole: 13, gross: 5, net: 5, par: 4 },
      ],
    }] } });
    expect(dashboard.players[0]).toMatchObject({ recoveryOpportunities: 0, bounceBacks: 0, netVsField: null });
  });

  it("awards recovery by success rate rather than number of bad holes", () => {
    const card = (playerId: number, values: number[]) => ({
      ...event.metrics!.scores![0], playerId,
      scores: values.map((gross, index) => ({ hole: index + 1, gross, net: gross, par: 4 })),
    });
    const dashboard = buildEventDashboard({ ...event, metrics: { scores: [
      card(1, [5, 4, 5, 4, 5, 5]),
      card(2, [4, 4, 4, 5, 4, 4]),
    ] } });
    expect(dashboard.players.find((player) => player.playerId === 1)).toMatchObject({ bounceBacks: 2, recoveryOpportunities: 3 });
    expect(dashboard.awards.find((award) => award.id === "bounceback")).toMatchObject({ playerId: 2, stat: "1/1 recovered" });
  });

  it("does not present a zero season baseline when no distribution exists", () => {
    const empty = { eagles: 0, birdies: 0, pars: 0, bogeys: 0, doubleBogeys: 0, tripleBogeys: 0 };
    const dashboard = buildEventDashboard({ ...event, metrics: { ...event.metrics, scoreDistribution: {
      thisEvent: event.metrics!.scoreDistribution!.thisEvent, seasonAvg: empty,
    } } });
    expect(dashboard.fieldComparison).toEqual([]);
  });

  it("combines eagles and birdies before calculating the scoring percentage", () => {
    const distribution = { eagles: 1, birdies: 2, pars: 4, bogeys: 2, doubleBogeys: 0, tripleBogeys: 1 };
    const dashboard = buildEventDashboard({ ...event, metrics: { ...event.metrics, scoreDistribution: {
      thisEvent: distribution, seasonAvg: distribution,
    } } });
    expect(dashboard.fieldComparison.map((metric) => metric.key)).toEqual(["birdies", "pars", "bogeys", "doubleBogeys"]);
    expect(dashboard.fieldComparison[0]).toMatchObject({ event: 30, usual: 30, difference: 0 });
  });

  it("sorts hole difficulty without mutating hole order and derives rates from actual scores", () => {
    const holes = buildEventDashboard(event).holes;
    const original = holes.map((hole) => hole.hole);
    const rows = buildHoleDifficultyRows(holes, "difficulty");
    expect(rows[0]).toMatchObject({ hole: 5, averageGrossScore: 5.5, parOrBetterRate: 50, doubleBogeyRate: 50 });
    expect(buildHoleDifficultyRows(holes, "hole").map((hole) => hole.hole)).toEqual(original);
    expect(holes.map((hole) => hole.hole)).toEqual(original);
    expect(buildHoleDifficultyRows([], "difficulty")).toEqual([]);
  });
});
