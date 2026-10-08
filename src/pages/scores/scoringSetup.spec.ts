import { describe, expect, it } from "vitest";
import { calculateStrokeplayPops } from "./util";
import {
  getEventScoringHoles,
  getPlayerHandicapIndex,
  getPreviewHandicap,
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

describe("first-round handicap preview", () => {
  const card = Array.from({length:9}, () => ({par:4}));
  const entry = { handicapIndex:null, firstRoundHandicap:{ handicapHoleBasis:9 as const, handicapHoleLimit:"handicap-adjusted", rating:36, slope:113 } };
  it("keeps missing event snapshots unknown even if the player has a later handicap", () => {
    expect(getPlayerHandicapIndex({handicapIndex:null,player:{handicap:12}})).toBeNaN();
    expect(getPlayerHandicapIndex({handicapIndex:0})).toBe(0);
    expect(getPreviewHandicap(entry,card,[5])).toBeNaN();
  });
  it("uses the first full round for same-event scoring and normalizes either basis", () => {
    expect(getPreviewHandicap(entry,card,Array(9).fill(5))).toBe(9);
    expect(getPreviewHandicap({...entry,handicapIndex:9},card,Array(9).fill(4))).toBe(0);
    expect(getPreviewHandicap({...entry, firstRoundHandicap:{...entry.firstRoundHandicap,handicapHoleBasis:18}},card,Array(9).fill(5))).toBe(18);
  });
  it("applies the league multiplier to first-event scoring once", () => {
    expect(getPreviewHandicap({...entry,firstRoundHandicap:{...entry.firstRoundHandicap,handicapMultiplier:0.96}},card,Array(9).fill(5))).toBe(8.64);
    expect(getPreviewHandicap({handicapIndex:8.64},card,Array(9).fill(5))).toBe(8.64);
  });
  it("applies unknown fallback before deriving the handicap", () => {
    expect(getPreviewHandicap(entry,card,[15,...Array(8).fill(4)])).toBe(5);
    expect(getPreviewHandicap({...entry,firstRoundHandicap:{...entry.firstRoundHandicap,handicapHoleLimit:"none"}},card,[15,...Array(8).fill(4)])).toBe(11);
    expect(getPreviewHandicap({handicapIndex:0},card,Array(9).fill(5))).toBe(0);
  });
});
