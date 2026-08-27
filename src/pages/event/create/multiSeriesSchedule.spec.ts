import { describe, expect, it } from "vitest";
import { buildDates, buildFlights, generateRoundRobin } from "./multiSeriesSchedule";

describe("multi-series schedule utilities", () => {
  it("generates every matchup once for an even field", () => {
    const rounds = generateRoundRobin([1, 2, 3, 4]);
    const matchups = rounds
      .flatMap((round) =>
        Array.from({ length: round.length / 2 }, (_, index) =>
          [round[index * 2], round[index * 2 + 1]].sort((a, b) => a - b).join("-")
        )
      )
      .sort();

    expect(rounds).toHaveLength(3);
    expect(matchups).toEqual(["1-2", "1-3", "1-4", "2-3", "2-4", "3-4"]);
  });

  it("omits bye placeholders for an odd field", () => {
    const rounds = generateRoundRobin([1, 2, 3]);

    expect(rounds).toHaveLength(3);
    expect(rounds.flat()).not.toContain(-1);
  });

  it("builds the correct flight shape for each scoring format", () => {
    expect(buildFlights([1, 2, 3, 4], "team", "match")).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(buildFlights([1, 2], "individual", "match")).toEqual([[[1, 2]]]);
    expect(buildFlights([1, 2, 3, 4, 5], "individual", "stroke")).toEqual([
      [1, 2, 3, 4],
      [5],
    ]);
  });

  it("honors selected weekdays and biweekly frequency", () => {
    expect(buildDates("2026-07-01", "2026-07-31", [3], "biweekly")).toEqual([
      "2026-07-01",
      "2026-07-15",
      "2026-07-29",
    ]);
  });
});
