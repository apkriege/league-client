import { describe, expect, it } from "vitest";
import { buildSwappedPlayerEntry } from "./playerSwapUtils";

describe("buildSwappedPlayerEntry", () => {
  it("uses the replacement's stored handicap for score-entry setup", () => {
    const entry = buildSwappedPlayerEntry(
      { id: 1, playerId: 10, teamId: 3, courseHandicap: 4 },
      { id: 20, firstName: "AA", handicap: 12.34 },
    );

    expect(entry.handicapIndex).toBe(12.34);
    expect(entry.courseHandicap).toBe(12);
    expect(entry.player.handicap).toBe(12.34);
  });
});
