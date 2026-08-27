import { describe, expect, it } from "vitest";
import { formatPlayerRoundDate, getPlayerRoundTimestamp } from "./playerRoundDate";

describe("player round dates", () => {
  it("formats the event date in the event time zone", () => {
    expect(
      formatPlayerRoundDate({
        date: null,
        startsAt: "2026-08-25T00:30:00.000Z",
        timeZone: "America/Indiana/Indianapolis",
      }),
    ).toBe("Aug 24, 2026");
  });

  it("preserves a database date without shifting it to the prior day", () => {
    expect(formatPlayerRoundDate({ date: "2026-08-24T00:00:00.000Z" })).toBe(
      "Aug 24, 2026",
    );
  });

  it("uses the event timestamp for chronological sorting", () => {
    expect(
      getPlayerRoundTimestamp({
        date: "2026-08-20",
        startsAt: "2026-08-24T22:00:00.000Z",
      }),
    ).toBe(new Date("2026-08-24T22:00:00.000Z").getTime());
  });
});
