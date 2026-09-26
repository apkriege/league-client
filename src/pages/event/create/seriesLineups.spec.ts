import { describe, expect, it } from "vitest";
import { initialRoundLineups, roundLineupError } from "./seriesLineups";

const teams = [
  { id: 10, name: "A", players: [1, 2, 3] },
  { id: 20, name: "B", players: [4, 5] },
  { id: 30, name: "C", players: [6, 7] },
];
const players = [
  ...Array.from({ length: 7 }, (_, index) => ({ id: index + 1, firstName: "Player", lastName: String(index + 1), type: "player" })),
  { id: 8, firstName: "Sub", lastName: "Eight", type: "substitute" },
];

describe("series round lineups", () => {
  it("creates independent lineups only for teams playing each round", () => {
    const first = initialRoundLineups([[10, 20]], teams, [], 2);
    const second = initialRoundLineups([[20, 30]], teams, [], 2);
    expect(first).toEqual([{ teamId: 10, playerIds: [] }, { teamId: 20, playerIds: [4, 5] }]);
    expect(second).toEqual([{ teamId: 20, playerIds: [4, 5] }, { teamId: 30, playerIds: [6, 7] }]);
    first[1].playerIds[0] = 8;
    expect(second[0].playerIds).toEqual([4, 5]);
  });

  it("validates only scheduled teams and permits an event substitute", () => {
    expect(roundLineupError([[10, 20]], teams, players, [
      { teamId: 10, playerIds: [1, 8] },
      { teamId: 20, playerIds: [4, 5] },
    ], 2)).toBeNull();
    expect(roundLineupError([[10, 20]], teams, players, [
      { teamId: 10, playerIds: [1, 8] },
      { teamId: 20, playerIds: [4, 8] },
    ], 2)).toMatch(/more than one team/i);
    expect(roundLineupError([[10, 20]], teams, players, [
      { teamId: 10, playerIds: [1] },
      { teamId: 20, playerIds: [4, 5] },
    ], 2)).toMatch(/exactly 2/i);
  });
});
