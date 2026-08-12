import { describe, expect, it } from "vitest";
import { calculateStrokeplayPops } from "./util";
import { getEventScoringHoles, getPlayerCourseHandicap } from "./scoringSetup";

const holes = Array.from({ length: 9 }, (_, index) => ({
  num: index + 1,
  hcp: index + 1,
}));

describe("event scoring setup", () => {
  it("uses the holes selected by the backend", () => {
    expect(getEventScoringHoles({ scoringHoles: holes })).toEqual(holes);
    expect(getEventScoringHoles({ tee: { holes } })).toEqual([]);
  });

  it("requires a backend-calculated Course Handicap", () => {
    expect(getPlayerCourseHandicap({ courseHandicap: 5 })).toBe(5);
    expect(() => getPlayerCourseHandicap({ player: { handicap: 10 } })).toThrow(
      "Course Handicap is missing",
    );
  });

  it("allocates plus Course Handicaps as strokes given back", () => {
    expect([...calculateStrokeplayPops(-2, holes).entries()]).toEqual([
      [1, -1],
      [2, -1],
    ]);
  });
});
