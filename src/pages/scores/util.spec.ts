import { describe, expect, it } from "vitest";
import {
  calculateMatchPlayHolePoints,
  calculateMatchplayPops,
  calculateStrokeplayPops,
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
});
