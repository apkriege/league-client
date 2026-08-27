import { describe, expect, it } from "vitest";
import { calculateStrokeplayPops } from "./util";
import {
  getEventScoringHoles,
  getPlayerCourseHandicap,
  getPlayerHandicapIndex,
} from "./scoringSetup";

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

  it("keeps the displayed Handicap Index separate from the Course Handicap", () => {
    expect(getPlayerHandicapIndex({ handicapIndex: 4, courseHandicap: 2 })).toBe(4);
    expect(getPlayerHandicapIndex({ player: { handicap: 3 }, courseHandicap: 1 })).toBe(3);
  });

  it("allocates plus Course Handicaps as strokes given back", () => {
    expect([...calculateStrokeplayPops(-2, holes).entries()]).toEqual([
      [1, -1],
      [2, -1],
    ]);
  });
});
