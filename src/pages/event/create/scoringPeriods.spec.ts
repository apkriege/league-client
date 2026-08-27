import { describe, expect, it } from "vitest";
import { buildHalfScoringPeriods, suggestFirstHalfEndDate } from "./scoringPeriods";

describe("multi-event scoring periods", () => {
  it("suggests a cutoff after the first half of generated events", () => {
    expect(
      suggestFirstHalfEndDate(
        ["2026-05-01", "2026-05-08", "2026-05-15", "2026-05-22", "2026-05-29"],
        "2026-05-01"
      )
    ).toBe("2026-05-15");
  });

  it("builds consecutive first and second half ranges", () => {
    expect(buildHalfScoringPeriods("2026-05-01", "2026-09-01", "2026-06-30")).toEqual([
      { name: "1st Half", startDate: "2026-05-01", endDate: "2026-06-30" },
      { name: "2nd Half", startDate: "2026-07-01", endDate: "2026-09-01" },
    ]);
  });

  it("rejects a cutoff on the final series date", () => {
    expect(buildHalfScoringPeriods("2026-05-01", "2026-09-01", "2026-09-01")).toBeNull();
  });
});
