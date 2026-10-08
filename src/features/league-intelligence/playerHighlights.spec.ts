import { describe, expect, it } from "vitest";
import { buildPlayerHighlights } from "./playerHighlights";

const highlights = (scores: Array<number | null>, holes = scores.map(() => 18)) =>
  buildPlayerHighlights({ playerWeeklyTrends: {
    labels: scores.map((_, index) => `Round ${index + 1}`), holes,
    players: [{ playerId: 1, name: "Avery Green", avgGross: [], avgNet: scores }],
  } });

describe("personal scoring highlights", () => {
  it.each([
    [[76, 74, 72], "improvement"],
    [[74, 76, 72], "personal-best"],
    [[74, 80, 74], "recovery"],
    [[74, 75, 74], "consistency"],
  ] as const)("recognizes %j as %s", (scores, kind) => {
    expect(highlights([...scores])).toMatchObject([{ playerId: 1, kind }]);
  });

  it("requires three valid rounds and omits results without a meaningful pattern", () => {
    expect(highlights([74, null, 72])).toEqual([]);
    expect(highlights([74, 78, 80])).toEqual([]);
    expect(highlights([74, 75, 76])).toEqual([]);
    expect(buildPlayerHighlights()).toEqual([]);
  });

  it("compares mixed-length rounds on an 18-hole equivalent", () => {
    expect(highlights([38, 74, 36], [9, 18, 9])).toMatchObject([
      { kind: "improvement", detail: expect.stringContaining("76 → 74 → 72") },
    ]);
  });
});
