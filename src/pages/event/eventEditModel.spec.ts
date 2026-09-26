import { describe, expect, it } from "vitest";
import { transformEventFlights } from "./eventEditModel";

describe("event edit flight transformation", () => {
  it("reconstructs team lineups from event assignments instead of permanent rosters", () => {
    const result = transformEventFlights({
      format: "team",
      scoringMode: "stroke-play",
      flights: [{
        teams: [
          { teamId: 10, team: { id: 10, name: "A", players: [{ id: 1 }, { id: 2 }, { id: 3 }] } },
          { teamId: 20, team: { id: 20, name: "B", players: [{ id: 4 }, { id: 5 }, { id: 6 }] } },
        ],
        players: [
          { playerId: 1, teamId: 10 },
          { playerId: 3, teamId: 10 },
          { playerId: 4, teamId: 20 },
          { playerId: 6, teamId: 20 },
        ],
      }],
    });
    expect(result.teamLineups).toEqual([
      { teamId: 10, playerIds: [1, 3] },
      { teamId: 20, playerIds: [4, 6] },
    ]);
  });

  it("preserves both individual matchups using opponent assignments", () => {
    const result = transformEventFlights({
      format: "individual",
      scoringMode: "match-play",
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
      scoringMode: "match-play",
      flights: [{ players: [{ playerId: 21 }, { playerId: 22 }, { playerId: 23 }, { playerId: 24 }] }],
    });

    expect(result.flights).toEqual([[[21, 22], [23, 24]]]);
  });
});
