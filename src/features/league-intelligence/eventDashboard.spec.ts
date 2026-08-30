import { describe, expect, it } from "vitest";
import { buildEventDashboard } from "./eventDashboard";
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
      expect.arrayContaining(["hot", "closer", "bounceback", "control", "skins", "surge"]),
    );
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
});
