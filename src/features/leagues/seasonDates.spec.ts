import { describe, expect, it } from "vitest";
import { addCalendarYear } from "./seasonDates";

describe("season dates", () => {
  it("adds one calendar year and clamps leap day to February 28", () => {
    expect(addCalendarYear(new Date("2026-05-01T00:00:00.000Z")).toISOString()).toBe(
      "2027-05-01T00:00:00.000Z"
    );
    expect(addCalendarYear(new Date("2024-02-29T00:00:00.000Z")).toISOString()).toBe(
      "2025-02-28T00:00:00.000Z"
    );
  });
});
