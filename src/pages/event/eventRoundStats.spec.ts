import { describe, expect, it } from "vitest";
import { calculateRoundScoreStats } from "./eventRoundStats";

describe("calculateRoundScoreStats", () => {
  const scores = [
    { gross: 4, net: 3, par: 4 },
    { gross: 5, net: 4, par: 4 },
    { gross: 4, net: 4, par: 4 },
    { gross: 3, net: 2, par: 4 },
  ];

  it("counts gross outcomes", () => {
    expect(calculateRoundScoreStats(scores, "gross")).toEqual({
      eagles: 0,
      birdies: 1,
      pars: 2,
      bogeys: 1,
    });
  });

  it("recalculates outcomes from net scores", () => {
    expect(calculateRoundScoreStats(scores, "net")).toEqual({
      eagles: 1,
      birdies: 1,
      pars: 2,
      bogeys: 0,
    });
  });
});
