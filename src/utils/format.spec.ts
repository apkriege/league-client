import { describe, expect, it } from "vitest";
import {
  compareTimes,
  formatTime,
  formatTimeWithOffset,
  toTimeInputValue,
} from "./format";

describe("time formatting", () => {
  it.each([
    ["9:00", "9:00 AM"],
    ["10:00", "10:00 AM"],
    ["12:00", "12:00 PM"],
    ["17:30", "5:30 PM"],
    ["17:30:00", "5:30 PM"],
    ["12:00 AM", "12:00 AM"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });

  it("sorts times chronologically instead of alphabetically", () => {
    expect(["10:00", "9:00", "11:00", "8:30"].sort(compareTimes)).toEqual([
      "8:30",
      "9:00",
      "10:00",
      "11:00",
    ]);
  });

  it("normalizes values for time inputs", () => {
    expect(toTimeInputValue("9:05 AM")).toBe("09:05");
    expect(toTimeInputValue("4:00 PM")).toBe("16:00");
  });

  it("formats flight times with their interval offset", () => {
    expect(formatTimeWithOffset("9:50", 20)).toBe("10:10 AM");
  });

  it("formats UTC timestamps in the event timezone", () => {
    expect(formatTime("2026-08-01T13:00:00.000Z", "America/Detroit")).toBe("9:00 AM EDT");
    expect(toTimeInputValue("2026-08-01T13:00:00.000Z", "America/Los_Angeles")).toBe(
      "06:00",
    );
  });
});
