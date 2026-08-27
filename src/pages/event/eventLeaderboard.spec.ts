import { describe, expect, it } from "vitest";
import { buildEventLeaderboard } from "./eventLeaderboard";

const rounds = [
  {
    playerId: 1,
    player: { firstName: "Alex", lastName: "Adams" },
    preHandicap: 8.2,
    pointsEarned: 7,
    matchPoints: 1,
    gross: 80,
    net: 72,
  },
  {
    playerId: 2,
    player: { firstName: "Blake", lastName: "Brown" },
    preHandicap: 12,
    pointsEarned: 10,
    matchPoints: 0,
    gross: 84,
    net: 70,
  },
  {
    playerId: 3,
    player: { firstName: "Casey", lastName: "Clark" },
    preHandicap: 4.5,
    pointsEarned: 6,
    matchPoints: 1,
    gross: 76,
    net: 71,
  },
];

describe("buildEventLeaderboard", () => {
  it("keeps every event metric and sorts points from highest to lowest", () => {
    const leaderboard = buildEventLeaderboard(rounds, "points");

    expect(leaderboard.map((entry) => entry.playerId)).toEqual([2, 1, 3]);
    expect(leaderboard[0]).toMatchObject({ points: 10, gross: 84, net: 70 });
  });

  it("sorts low gross from lowest to highest", () => {
    expect(buildEventLeaderboard(rounds, "lowGross").map((entry) => entry.playerId)).toEqual([
      3, 1, 2,
    ]);
  });

  it("sorts low net from lowest to highest", () => {
    expect(buildEventLeaderboard(rounds, "lowNet").map((entry) => entry.playerId)).toEqual([
      2, 3, 1,
    ]);
  });

  it("puts missing gross and net scores last", () => {
    const withMissingScore = [
      ...rounds,
      {
        playerId: 4,
        player: { firstName: "Drew", lastName: "Davis" },
        pointsEarned: 8,
        matchPoints: 0,
        gross: null,
        net: null,
      },
    ];

    expect(buildEventLeaderboard(withMissingScore, "points").map((entry) => entry.playerId)).toEqual([
      2, 1, 4, 3,
    ]);
    expect(buildEventLeaderboard(withMissingScore, "lowNet").at(-1)?.playerId).toBe(4);
  });
});
