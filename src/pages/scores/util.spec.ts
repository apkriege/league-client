import { describe, expect, it } from "vitest";
import {
  calculateMatchPlayHolePoints,
  calculatePlayerMatchBonus,
  calculateMatchplayPops,
  calculateStrokeplayPops,
  createTeamScoringHelpers,
  createTeamBestBallScoringHelpers,
  getPopulatedFlightTeamSlots,
  getSharedTeamPlayingHandicap,
  sortFlightTeamsByHandicap,
} from "./util";

const hole = [{ num: 1, par: 4, hcp: 1 }];

describe("scorecard handicap helpers", () => {
  it("applies the allowance before rounding match-play handicaps", () => {
    const [left, right] = calculateMatchplayPops(
      { handicap: 0.51 },
      { handicap: 1.49 },
      hole,
      { allowance: 0.9 },
    );

    expect(left.size).toBe(0);
    expect(right.get(1)).toBe(1);
  });

  it("does not adjust player handicaps for tee par and allocates plus strokes", () => {
    const [lowerPar, higherPar] = calculateMatchplayPops(
      { handicap: 0 },
      { handicap: 0 },
      hole,
      { p1Holes: hole, p2Holes: [{ ...hole[0], par: 5 }] },
    );

    expect(lowerPar.size).toBe(0);
    expect(higherPar.size).toBe(0);
    expect([...calculateStrokeplayPops(-1, hole).entries()]).toEqual([[1, -1]]);
  });

  it("calculates live match-play hole points after pops", () => {
    expect(calculateMatchPlayHolePoints({
      playerGross: 5,
      opponentGross: 4,
      playerPops: 1,
      pointsPerHole: 2,
    })).toBe(1);
    expect(calculateMatchPlayHolePoints({
      playerGross: 4,
      opponentGross: 5,
      pointsPerHole: 2,
    })).toBe(2);
    expect(calculateMatchPlayHolePoints({
      playerGross: 5,
      opponentGross: 4,
      pointsPerHole: 2,
    })).toBe(0);
  });

  it("awards the player match bonus to the lower full-round net", () => {
    expect(calculatePlayerMatchBonus({
      playerNet: 34,
      opponentNet: 36,
      pointsPerMatch: 2,
    })).toBe(2);
    expect(calculatePlayerMatchBonus({
      playerNet: 36,
      opponentNet: 34,
      pointsPerMatch: 2,
    })).toBe(0);
  });

  it("orders both team match-play sides from low to high handicap", () => {
    const result = sortFlightTeamsByHandicap({
      teams: [{ teamId: 10 }, { teamId: 20 }],
      players: [
        { playerId: 1, teamId: 10, handicapIndex: 12 },
        { playerId: 2, teamId: 10, handicapIndex: 4 },
        { playerId: 3, teamId: 20, handicapIndex: 16 },
        { playerId: 4, teamId: 20, handicapIndex: 7 },
      ],
    });

    expect(result.team1.map((player: any) => player.playerId)).toEqual([2, 1]);
    expect(result.team2.map((player: any) => player.playerId)).toEqual([4, 3]);
  });

  it("keeps a one-team flight visible for its score summary", () => {
    expect(getPopulatedFlightTeamSlots([{ playerId: 1 }], [])).toEqual([1]);
  });

  it("awards the team medal bonus to the lowest combined player net", () => {
    const netByPlayerId = new Map([[1, 35], [2, 38], [3, 36], [4, 39]]);
    const helpers = createTeamScoringHelpers({
      event: { ptsPerTeamWin: 4 },
      team1: [{ playerId: 1 }, { playerId: 2 }],
      team2: [{ playerId: 3 }, { playerId: 4 }],
      getPlayerNetScore: (playerId: number) => netByPlayerId.get(playerId) ?? 0,
      isPlayerScoreComplete: () => true,
    });

    expect(helpers.getTeamWinBonus(1)).toBe(4);
    expect(helpers.getTeamWinBonus(2)).toBe(0);
  });

  it("reads a shared team's playing handicap from its saved snapshot", () => {
    expect(getSharedTeamPlayingHandicap({
      handicapSnapshot: { playingTeamHandicap: 7 },
    })).toBe(7);
  });

  it("shows best-ball Stableford points for each hole", () => {
    const helpers = createTeamBestBallScoringHelpers({
      event: { scoringMode: "best-ball" },
      holes: [{ num: 1, par: 4 }],
      team1: [{ playerId: 1 }],
      team2: [],
      popsForHole: () => 0,
      getScoreAtHole: () => 3,
    });

    expect(helpers.getTeamPointsForHole(1, { num: 1, par: 4 }, 0)).toBe(3);
  });

  it("shows the team aggregate net score for each stroke-play hole", () => {
    const helpers = createTeamBestBallScoringHelpers({
      event: { scoringMode: "stroke-play" },
      holes: [{ num: 1, par: 4 }],
      team1: [{ playerId: 1 }, { playerId: 2 }],
      team2: [],
      popsForHole: (playerId: number) => playerId === 1 ? 1 : 0,
      getScoreAtHole: (player: { playerId: number }) => player.playerId === 1 ? 5 : 4,
    });

    expect(helpers.getTeamPointsForHole(1, { num: 1, par: 4 }, 0)).toBe(8);
  });
});
