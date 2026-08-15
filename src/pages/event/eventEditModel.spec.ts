import { describe, expect, it } from "vitest";
import { transformEventFlights } from "./eventEditModel";

describe("event edit flight transformation", () => {
  it("preserves both individual matchups using opponent assignments", () => {
    const result = transformEventFlights({
      format: "individual",
      scoringFormat: "match",
      flights: [
        {
          players: [
            { id: 1, playerId: 11, opponentId: 12 },
            { id: 2, playerId: 13, opponentId: 14 },
            { id: 3, playerId: 12, opponentId: 11 },
            { id: 4, playerId: 14, opponentId: 13 },
          ],
        },
      ],
    });

    expect(result.flights).toEqual([[[11, 12], [13, 14]]]);
  });

  it("falls back to stable adjacent pairs for older assignments without opponents", () => {
    const result = transformEventFlights({
      format: "individual",
      scoringFormat: "match",
      flights: [{ players: [{ playerId: 21 }, { playerId: 22 }, { playerId: 23 }, { playerId: 24 }] }],
    });

    expect(result.flights).toEqual([[[21, 22], [23, 24]]]);
  });
});
