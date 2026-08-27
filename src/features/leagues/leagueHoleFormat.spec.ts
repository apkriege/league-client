import { describe, expect, it } from "vitest";
import {
  getFixedEventHoleCount,
  getHandicapHoleCount,
  getLeagueHoleFormatLabel,
  normalizeLeagueHoleFormat,
} from "./leagueHoleFormat";

describe("league hole format", () => {
  it("uses 9-hole handicaps only for 9-hole leagues", () => {
    expect(getHandicapHoleCount("9")).toBe(9);
    expect(getHandicapHoleCount("18")).toBe(18);
    expect(getHandicapHoleCount("mixed")).toBe(18);
  });

  it("provides clear labels and safely defaults old leagues to 18 holes", () => {
    expect(getLeagueHoleFormatLabel("mixed")).toBe("Mixed 9/18 holes");
    expect(normalizeLeagueHoleFormat(undefined)).toBe("18");
  });

  it("locks fixed leagues but leaves mixed event lengths selectable", () => {
    expect(getFixedEventHoleCount("9")).toBe(9);
    expect(getFixedEventHoleCount("18")).toBe(18);
    expect(getFixedEventHoleCount("mixed")).toBeNull();
  });
});
