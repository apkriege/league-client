import { describe, expect, it } from "vitest";
import type { LeagueScoringPeriod } from "@/types/league";
import { getScoringPeriodBoundariesBeforeEvent } from "./scoringPeriodBoundaries";

const periods: LeagueScoringPeriod[] = [
  { id: 1, name: "1st Half", position: 1, startDate: "2026-05-01", endDate: "2026-06-30" },
  { id: 2, name: "2nd Half", position: 2, startDate: "2026-07-01", endDate: "2026-09-01" },
];

describe("scoring period schedule boundaries", () => {
  it("returns the second half before the first event on or after its start date", () => {
    const events = [
      { startsAt: "2026-06-25T22:00:00.000Z", timeZone: "America/Detroit" },
      { startsAt: "2026-07-02T22:00:00.000Z", timeZone: "America/Detroit" },
    ];

    expect(getScoringPeriodBoundariesBeforeEvent(events, 1, periods)).toEqual([periods[1]]);
  });

  it("does not repeat a boundary between events in the same half", () => {
    const events = [
      { startsAt: "2026-07-02T22:00:00.000Z", timeZone: "America/Detroit" },
      { startsAt: "2026-07-09T22:00:00.000Z", timeZone: "America/Detroit" },
    ];

    expect(getScoringPeriodBoundariesBeforeEvent(events, 1, periods)).toEqual([]);
  });

  it("does not add a divider before the first event because there is no between-event boundary", () => {
    const events = [{ startsAt: "2026-07-02T22:00:00.000Z" }];

    expect(getScoringPeriodBoundariesBeforeEvent(events, 0, periods)).toEqual([]);
  });
});
