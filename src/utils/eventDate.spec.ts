import { describe, expect, it } from "vitest";
import { getEventDateInputValue, getEventLocalDate, sortEventsByDate } from "./eventDate";

describe("event date utilities", () => {
  it("keeps an ISO date on the same local calendar day", () => {
    const date = getEventLocalDate("2026-07-15T00:00:00.000Z");
    expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual([2026, 7, 15]);
    expect(getEventDateInputValue("2026-07-15T23:59:59.000Z")).toBe("2026-07-15");
  });

  it("sorts by calendar date and then stable numeric id", () => {
    const events = [
      { id: 4, date: "2026-07-16" },
      { id: 3, date: "2026-07-15T23:00:00.000Z" },
      { id: 2, date: "2026-07-15T12:00:00.000Z" },
    ];

    expect(sortEventsByDate(events).map((event) => event.id)).toEqual([2, 3, 4]);
    expect(events.map((event) => event.id)).toEqual([4, 3, 2]);
  });
});
