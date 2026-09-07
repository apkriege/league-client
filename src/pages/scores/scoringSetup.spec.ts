import { describe, expect, it } from "vitest";
import { calculateStrokeplayPops } from "./util";
import {
  getEventScoringHoles,
  getPlayerHandicapIndex,
  getPlayerScoringHoles,
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

  it("uses the scorecard matching the player's gender", () => {
    const male = [{ num: 1, par: 4, hcp: 1 }];
    const female = [{ num: 1, par: 5, hcp: 9 }];
    const event = { scoringHoles: male, scoringHolesByGender: { male, female } };

    expect(getPlayerScoringHoles(event, { player: { gender: "female" } })).toEqual(female);
    expect(getPlayerScoringHoles(event, { player: { gender: "male" } })).toEqual(male);
  });

  it("uses the stored player handicap directly", () => {
    expect(getPlayerHandicapIndex({ handicapIndex: 4 })).toBe(4);
    expect(getPlayerHandicapIndex({ player: { handicap: 3 } })).toBe(3);
  });

  it("allocates plus player handicaps as strokes given back", () => {
    expect([...calculateStrokeplayPops(-2, holes).entries()]).toEqual([
      [9, -1],
      [8, -1],
    ]);
  });
});
