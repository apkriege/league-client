import { describe, expect, it } from "vitest";
import type { AdminLeagueListItem } from "@api/admin/types";
import { getAvailablePreviousSeasons } from "./previousSeasons";

const league = (overrides: Partial<AdminLeagueListItem> = {}): AdminLeagueListItem => ({
    id: 1,
    adminId: 7,
    name: "Thursday League 2025",
    type: "season",
    completedRoundCount: 0,
    roundCount: 0,
    startDate: "2025-01-01",
    endDate: "2026-01-01",
    renewedLeague: null,
    _count: { players: 8, events: 0 },
    ...overrides,
  });

describe("previous-season choices", () => {
  it("only offers the current owner's season leagues that do not already have a successor", () => {
    expect(
      getAvailablePreviousSeasons(
        [
          league(),
          league({ id: 2, adminId: 8 }),
          league({ id: 3, type: "tournament" }),
          league({
            id: 4,
            renewedLeague: {
              id: 5,
              name: "Thursday League 2026",
              startDate: "2026-01-01",
              endDate: "2027-01-01",
            },
          }),
        ],
        7
      ).map((candidate) => candidate.id)
    ).toEqual([1]);
  });
});
