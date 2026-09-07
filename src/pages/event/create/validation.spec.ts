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
  scoringMode: "stroke-play",
  scoringConfig: { handicapAllowance: 1 },
  pointsEnabled: true,
  strokePoints: "10,8,6",
  flights: [[1, 2, 3, 4]],
};

describe("event form validation", () => {
  it("requires the second course and tee as a pair", () => {
    expect(validateEventForm(
      { ...validEvent, secondCourseId: 2, secondTeeId: "" },
      { showTeamsSection: false },
    )).toBe("Select both the second nine and its tee.");
  });
  it("requires a second nine when the first nine will not be repeated", () => {
    expect(validateEventForm(
      { ...validEvent, holes: 18, repeatFirstNine: false },
      { showTeamsSection: false },
    )).toBe("Select a course and tee for the second nine.");
  });
  it("accepts valid flight structures", () => {
    expect(validateEventForm(validEvent, { showTeamsSection: false })).toBeNull();
    expect(
      validateEventForm(
        {
          ...validEvent,
          scoringMode: "match-play",
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
          scoringMode: "match-play",
          ptsPerHole: 1,
          ptsPerMatch: 2,
          ptsPerTeamWin: 2,
          flights: [[1, 2, 3]],
        },
        { showTeamsSection: false },
      ),
    ).toMatch(/two players/i);
  });

  it("validates mode applicability and format-specific team sizes", () => {
    expect(
      validateEventForm(
        { ...validEvent, scoringMode: "scramble" },
        { showTeamsSection: false },
      ),
    ).toMatch(/not available for individual/i);

    expect(
      validateEventForm(
        {
          ...validEvent,
          format: "team",
          scoringMode: "alternate-shot",
          teams: [
            { id: 10, name: "A", players: [1, 2, 3] },
            { id: 20, name: "B", players: [4, 5] },
          ],
          flights: [[10, 20]],
        },
        { showTeamsSection: true },
      ),
    ).toMatch(/exactly two players/i);

    expect(
      validateEventForm(
        {
          ...validEvent,
          format: "team",
          scoringMode: "best-ball",
          teams: [
            { id: 10, name: "A", players: [1, 2] },
            { id: 20, name: "B", players: [3] },
          ],
          flights: [[10, 20]],
        },
        { showTeamsSection: true },
      ),
    ).toMatch(/equal roster sizes/i);
  });

  it("requires a valid maximum-score rule", () => {
    expect(
      validateEventForm(
        {
          ...validEvent,
          scoringMode: "maximum-score",
          scoringConfig: { handicapAllowance: 1 },
        },
        { showTeamsSection: false },
      ),
    ).toMatch(/maximum-score rule/i);
  });

  it("requires whole-number intervals and match point settings", () => {
    expect(
      validateEventForm(
        { ...validEvent, interval: 10.5 },
        { showTeamsSection: false },
      ),
    ).toMatch(/whole number/i);
    expect(
      validateEventForm(
        {
          ...validEvent,
          scoringMode: "match-play",
          ptsPerHole: 0.5,
          ptsPerMatch: 2,
          ptsPerTeamWin: 2,
          flights: [[[1, 2], [3, 4]]],
        },
        { showTeamsSection: false },
      ),
    ).toMatch(/points per hole.*whole number/i);
  });
});
