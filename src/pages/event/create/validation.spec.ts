import { describe, expect, it } from "vitest";
import { validateEventForm } from "./validation";

const validEvent = {
  name: "Week 1",
  date: "2026-08-14",
  startTime: "17:30",
  interval: 10,
  courseId: 1,
  teeId: 1,
  startSide: "front",
  holes: 9,
  format: "individual",
  scoringFormat: "stroke",
  pointsEnabled: true,
  strokePoints: "10,8,6",
  flights: [[1, 2, 3, 4]],
};

describe("event form validation", () => {
  it("accepts valid flight structures", () => {
    expect(validateEventForm(validEvent, { showTeamsSection: false })).toBeNull();
    expect(
      validateEventForm(
        {
          ...validEvent,
          scoringFormat: "match",
          ptsPerHole: 1,
          ptsPerMatch: 2,
          ptsPerTeamWin: 2,
          flights: [[[1, 2], [3, 4]]],
        },
        { showTeamsSection: false },
      ),
    ).toBeNull();
  });

  it("rejects duplicate assignments and incompatible flight shapes", () => {
    expect(
      validateEventForm(
        { ...validEvent, flights: [[1, 2], [2, 3]] },
        { showTeamsSection: false },
      ),
    ).toMatch(/cannot be assigned twice/i);
    expect(
      validateEventForm(
        {
          ...validEvent,
          scoringFormat: "match",
          ptsPerHole: 1,
          ptsPerMatch: 2,
          ptsPerTeamWin: 2,
          flights: [[1, 2, 3]],
        },
        { showTeamsSection: false },
      ),
    ).toMatch(/two players/i);
  });
});
