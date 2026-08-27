import { describe, expect, it } from "vitest";
import { calculatePlayerRoundAverages } from "./playerRoundAverages";
import type { PlayerRound } from "./playerTypes";

const round = (holesPlayed: 9 | 18, gross: number, net: number): PlayerRound => ({
  eventId: `${holesPlayed}-${gross}`,
  date: "2026-08-01",
  holesPlayed,
  gross,
  net,
  points: holesPlayed === 9 ? 2 : 4,
  putts: holesPlayed === 9 ? 15 : 30,
});

describe("calculatePlayerRoundAverages", () => {
  it("calculates 9-hole and 18-hole averages independently", () => {
    const averages = calculatePlayerRoundAverages([
      round(9, 40, 36),
      round(9, 44, 38),
      round(18, 82, 74),
      round(18, 86, 76),
    ]);

    expect(averages[9]).toMatchObject({
      rounds: 2,
      avgGross: 42,
      avgNet: 37,
      avgPutts: 15,
      lowGross: 40,
      lowNet: 36,
    });
    expect(averages[18]).toMatchObject({
      rounds: 2,
      avgGross: 84,
      avgNet: 75,
      avgPutts: 30,
      lowGross: 82,
      lowNet: 74,
    });
  });

  it("returns an empty state when a round length has not been played", () => {
    expect(calculatePlayerRoundAverages([round(9, 40, 36)])[18]).toBeNull();
  });

  it("returns empty averages when no rounds have been completed", () => {
    expect(calculatePlayerRoundAverages([])).toEqual({ 9: null, 18: null });
  });
});
