import { describe, expect, it } from "vitest";
import { buildEmptyTee } from "./courseAdminForm";
import {
  applyUsgaRatingRows,
  parseUsgaRatingTable,
  suggestUsgaTeeMatches,
} from "./usgaRatingImport";

const pastedTable = [
  "Tee Name\tGender\tPar\tCourse Rating™\tBogey Rating™\tSlope Rating®\tRatingF9\tRatingB9\tFront (9)\tBack (9)\tBogey Rating (F9)\tBogey Rating (B9)\tSlope (F9)\tSlope (B9)\tTeeID\tLength",
  "Blue\tM\t72\t71.6\t94.9\t126\t35.8\t35.8\t35.8 / 130\t35.8 / 121\t47.9\t47.0\t130\t121\t541230\t6638",
  "Blue\tF\t72\t77.2\t109.0\t136\t38.5\t38.7\t38.5 / 135\t38.7 / 137\t54.1\t54.9\t135\t137\t541231\t6638",
].join("\n");

const currentUsgaClipboardTable = [
  "Tee Name\tGender\tPar\tCourse Rating™\tBogey Rating™\tSlope Rating®\tFront (9)\tBack (9)\t \tCH",
  "BROWN\tM\t72\t73.6\t99.8\t140\t36.5 / 135\t37.1 / 145\t\t",
  "GREEN\tF\t72\t74.6\t106.3\t134\t37.2 / 133\t37.4 / 135\t\t",
].join("\n");

describe("USGA rating import", () => {
  it("parses copied USGA rows including gender-specific nine-hole values", () => {
    expect(parseUsgaRatingTable(pastedTable)).toEqual([
      expect.objectContaining({
        teeId: 541230,
        teeName: "Blue",
        gender: "male",
        rating: 71.6,
        slope: 126,
        frontRating: 35.8,
        frontSlope: 130,
        backRating: 35.8,
        backSlope: 121,
      }),
      expect.objectContaining({
        teeId: 541231,
        gender: "female",
        frontSlope: 135,
        backSlope: 137,
      }),
    ]);
  });

  it("matches rows and applies ratings to the imported local tee", () => {
    const blue = { ...buildEmptyTee(18), name: "Blue", color: "blue", distance: "6638" };
    const rows = parseUsgaRatingTable(pastedTable);
    const matches = suggestUsgaTeeMatches(rows, [blue]);
    const [updated] = applyUsgaRatingRows([blue], rows, matches);

    expect(matches).toEqual([0, 0]);
    expect(updated).toMatchObject({
      ratingMen: "71.6",
      slopeFrontMen: "130",
      ratingWomen: "77.2",
      slopeBackWomen: "137",
    });
  });

  it("accepts the current USGA clipboard format without Tee ID or Length columns", () => {
    const rows = parseUsgaRatingTable(currentUsgaClipboardTable);

    expect(rows).toEqual([
      expect.objectContaining({
        teeId: null,
        teeName: "BROWN",
        gender: "male",
        rating: 73.6,
        slope: 140,
        frontRating: 36.5,
        frontSlope: 135,
        backRating: 37.1,
        backSlope: 145,
      }),
      expect.objectContaining({
        teeId: null,
        teeName: "GREEN",
        gender: "female",
        frontRating: 37.2,
        backSlope: 135,
      }),
    ]);
  });

  it("leaves rows with no safe name match unassigned", () => {
    const red = { ...buildEmptyTee(18), name: "Red", color: "red" };
    expect(suggestUsgaTeeMatches(parseUsgaRatingTable(pastedTable), [red])).toEqual([-1, -1]);
  });
});
