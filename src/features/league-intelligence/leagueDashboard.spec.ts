import { describe, expect, it } from "vitest";
import { buildLeagueDashboard } from "./leagueDashboard";
import type { LeagueIntelligenceMetrics } from "./types";

const metrics: LeagueIntelligenceMetrics = {
  standingsMode: "player",
  standings: [
    { playerId: 1, name: "Avery Green", points: 18, rounds: 3, avgGross: 40, avgNet: 35.5, birdies: 6, handicapChange: -2 },
    { playerId: 2, name: "Blake Fairway", points: 16, rounds: 3, avgGross: 41, avgNet: 37.5, birdies: 2, handicapChange: 0.5 },
    { playerId: 3, name: "Casey Links", points: 14, rounds: 3, avgGross: 42, avgNet: 35, birdies: 3, handicapChange: -0.5 },
  ],
  playerWeeklyTrends: {
    labels: ["Week 1", "Week 2", "Week 3"],
    holes: [18, 18, 18],
    players: [
      { playerId: 1, name: "Avery Green", avgGross: [43, 41, 39], avgNet: [38, 37, 34] },
      { playerId: 2, name: "Blake Fairway", avgGross: [40, 41, 42], avgNet: [36, 37, 38] },
      { playerId: 3, name: "Casey Links", avgGross: [42, 42, 42], avgNet: [35, 35, 35] },
    ],
  },
  headToHead: [
    { playerId: 1, playerName: "Avery Green", opponentId: 2, opponentName: "Blake Fairway", wins: 2, losses: 1, ties: 0 },
    { playerId: 2, playerName: "Blake Fairway", opponentId: 1, opponentName: "Avery Green", wins: 1, losses: 2, ties: 0 },
  ],
};

describe("league dashboard", () => {
  it("builds race pressure, recent form, category boards, rivalries, and earned achievements", () => {
    const dashboard = buildLeagueDashboard(metrics);

    expect(dashboard.race.rows.map((row) => [row.name, row.gap])).toEqual([
      ["Avery Green", 0],
      ["Blake Fairway", 2],
      ["Casey Links", 4],
    ]);
    expect(dashboard.race.contenders).toBe(2);
    expect(dashboard.formRows[0]).toMatchObject({
      name: "Avery Green",
      change: -2.5,
      improvingStreak: 3,
      status: "hot",
    });
    expect(dashboard.formCounts).toEqual({ hot: 1, steady: 1, cooling: 1 });
    expect(dashboard.recentWinners[0]).toMatchObject({
      eventName: "Week 3",
      playerName: "Avery Green",
      net: 34,
    });
    expect(dashboard.categoryBoards.map((board) => board.id)).toEqual([
      "points",
      "net",
      "gross",
      "birdies",
      "improvement",
    ]);
    expect(dashboard.rivalries[0]).toMatchObject({
      label: "Instant classic",
      meetings: 3,
    });
    expect(dashboard.achievements.map((achievement) => achievement.id)).toEqual([
      "iron",
      "birdies",
      "pace",
      "mover",
      "striker",
      "match",
    ]);
  });

  it("normalizes mixed-length events for form and preserves tied recent leaders", () => {
    const dashboard = buildLeagueDashboard({
      standingsMode: "player",
      standings: [
        { playerId: 1, name: "Avery Green", points: 4, rounds: 2, avgGross: 72, avgNet: 72, handicapChange: 0 },
        { playerId: 2, name: "Blake Fairway", points: 4, rounds: 2, avgGross: 72, avgNet: 72, handicapChange: 0 },
      ],
      playerWeeklyTrends: {
        labels: ["Nine-hole night", "Championship"],
        holes: [9, 18],
        players: [
          { playerId: 1, name: "Avery Green", avgGross: [40, 80], avgNet: [36, 72] },
          { playerId: 2, name: "Blake Fairway", avgGross: [41, 81], avgNet: [37, 72] },
        ],
      },
    });

    expect(dashboard.formRows.find((player) => player.playerId === 1)).toMatchObject({
      priorAverage: 72,
      recentAverage: 72,
      change: 0,
      status: "steady",
    });
    expect(dashboard.recentWinners[0]).toMatchObject({
      eventName: "Championship",
      playerId: null,
      playerName: "Avery Green & Blake Fairway",
      net: 72,
    });
  });
});
