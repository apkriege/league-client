import { describe, expect, it } from "vitest";
import {
  clampLeagueEndDate,
  getLeagueDateInputValue,
  getMaximumLeagueEndDate,
  parseLeagueDateInput,
} from "./leagueDates";

describe("league date helpers", () => {
  it("keeps an existing shorter end date when the start date changes", () => {
    const endDate = clampLeagueEndDate("2026-05-01", "2026-09-01");

    expect(getLeagueDateInputValue(endDate)).toBe("2026-09-01");
  });

  it("moves an end date forward when it falls before the start date", () => {
    const endDate = clampLeagueEndDate("2026-05-01", "2026-04-30");

    expect(getLeagueDateInputValue(endDate)).toBe("2026-05-01");
  });

  it("caps an end date at one year after the start date", () => {
    const endDate = clampLeagueEndDate("2026-05-01", "2027-06-01");

    expect(getLeagueDateInputValue(endDate)).toBe("2027-05-01");
    expect(getMaximumLeagueEndDate("2026-05-01")).toBe("2027-05-01");
  });

  it("keeps API and input dates as calendar dates instead of shifting them by local timezone", () => {
    expect(getLeagueDateInputValue("2026-01-01T00:00:00.000Z")).toBe("2026-01-01");
    expect(parseLeagueDateInput("2026-01-01").toISOString()).toBe(
      "2026-01-01T00:00:00.000Z"
    );
  });
});
