import { describe, expect, it } from "vitest";
import { buildEventDashboard } from "@/features/league-intelligence/eventDashboard";
import { withSharedTeamScores } from "./sharedTeamIntelligence";

describe("shared team event intelligence", () => {
  it("models shared scorecards as team intelligence participants", () => {
    const event = withSharedTeamScores({
      name: "Scramble Night",
      holes: 2,
      format: "team",
      scoringMode: "scramble",
      pointsEnabled: true,
      teamRounds: [
        {
          teamId: 10,
          team: { name: "Pin Seekers" },
          gross: 8,
          net: 7,
          pointsEarned: 5,
          scores: [
            { hole: 1, par: 4, gross: 4, net: 3 },
            { hole: 2, par: 4, gross: 4, net: 4 },
          ],
        },
        {
          teamId: 20,
          team: { name: "Fairway Finders" },
          gross: 10,
          net: 9,
          pointsEarned: 2,
          scores: [
            { hole: 1, par: 4, gross: 5, net: 4 },
            { hole: 2, par: 4, gross: 5, net: 5 },
          ],
        },
      ],
    });

    expect(event.metrics?.scores?.[0]).toMatchObject({
      teamId: 10,
      player: { firstName: "Pin Seekers" },
      pointsEarned: 5,
    });
    expect(buildEventDashboard(event).players[0]).toMatchObject({
      teamId: 10,
      name: "Pin Seekers",
      points: 5,
    });
  });
});
