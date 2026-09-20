import { describe, expect, it } from "vitest";
import { canCreateNextSeason, getLeagueScheduleStatus } from "./seasonRenewal";

const now = new Date("2026-06-15T12:00:00.000Z");

describe("next-season eligibility", () => {
  it("allows creation after the league end date", () => {
    expect(canCreateNextSeason({ endDate: "2026-06-14", roundCount: 2 }, now)).toBe(true);
  });

  it("allows creation when every playable event is complete", () => {
    expect(
      canCreateNextSeason(
        {
          endDate: "2026-12-31",
          events: [
            { status: "completed", type: "regular" },
            { status: "completed", type: "regular" },
            { status: "canceled", type: "regular" },
            { status: "upcoming", type: "off" },
          ],
        },
        now
      )
    ).toBe(true);
  });

  it("blocks creation during the season when an event remains incomplete", () => {
    expect(
      canCreateNextSeason(
        { endDate: "2026-12-31", completedRoundCount: 1, roundCount: 2 },
        now
      )
    ).toBe(false);
  });

  it("does not treat an empty schedule as completed", () => {
    expect(
      canCreateNextSeason({ endDate: "2026-12-31", completedRoundCount: 0, roundCount: 0 }, now)
    ).toBe(false);
  });
});

describe("league schedule status", () => {
  it("is upcoming before the start date", () => {
    expect(
      getLeagueScheduleStatus(
        { startDate: "2026-06-16", endDate: "2026-12-31", roundCount: 2 },
        now
      )
    ).toBe("Upcoming");
  });

  it("is live within the league dates while an event is unfinished", () => {
    expect(
      getLeagueScheduleStatus(
        {
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          completedRoundCount: 1,
          roundCount: 2,
        },
        now
      )
    ).toBe("Live");
  });

  it("is completed after the end date or when every event is complete", () => {
    expect(
      getLeagueScheduleStatus(
        { startDate: "2026-01-01", endDate: "2026-06-14", roundCount: 2 },
        now
      )
    ).toBe("Completed");
    expect(
      getLeagueScheduleStatus(
        {
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          completedRoundCount: 2,
          roundCount: 2,
        },
        now
      )
    ).toBe("Completed");
  });
});
