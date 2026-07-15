import { describe, expect, it } from "vitest";
import { validateHoleScores } from "./scoreValidation";

const players = [
  { playerId: 7, player: { firstName: "Ada", lastName: "Lovelace" } },
  { playerId: 8, player: { firstName: "Grace", lastName: "Hopper" } },
];
const holes = [{ num: 1 }, { num: 2 }, { num: 3 }];

describe("validateHoleScores", () => {
  it("accepts one whole-number score per player and hole", () => {
    expect(
      validateHoleScores({
        players,
        holes,
        watchedPlayers: {
          7: { scores: [4, 5, 3] },
          8: { scores: [5, 4, 4] },
        },
      })
    ).toBeNull();
  });

  it("identifies the player and hole with a missing score", () => {
    expect(
      validateHoleScores({
        players,
        holes,
        watchedPlayers: {
          7: { scores: [4, 5, 3] },
          8: { scores: [5, "", 4] },
        },
      })
    ).toBe("Grace Hopper needs a valid score for hole 2.");
  });

  it.each([0, -1, 4.5, 31, "not-a-score"])("rejects invalid stroke value %s", (score) => {
    expect(
      validateHoleScores({
        players: players.slice(0, 1),
        holes,
        watchedPlayers: { 7: { scores: [4, score, 3] } },
      })
    ).toBe("Ada Lovelace needs a valid score for hole 2.");
  });
});
