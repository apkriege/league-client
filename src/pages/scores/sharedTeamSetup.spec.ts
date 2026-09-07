import { describe, expect, it } from "vitest";
import { buildSharedTeamHandicapSetups } from "./sharedTeamSetup";

describe("shared team handicap setup", () => {
  it("uses one scorecard per team without adjusting player handicaps for par", () => {
    const setups = buildSharedTeamHandicapSetups(
      {
        format: "team",
        scoringMode: "scramble",
        scoringConfig: { handicapAllowance: 1 },
        strokePoints: [10, 8],
        scoringHoles: [{ num: 1, par: 4, hcp: 1 }],
        scoringHolesByGender: {
          male: [{ num: 1, par: 4, hcp: 1 }],
          female: [{ num: 1, par: 5, hcp: 1 }],
        },
      },
      {
        teams: [
          { teamId: 1, team: { name: "Mixed" } },
          { teamId: 2, team: { name: "Women" } },
        ],
        players: [
          { playerId: 1, teamId: 1, player: { handicap: 10, gender: "male" } },
          { playerId: 2, teamId: 1, player: { handicap: 20, gender: "female" } },
          { playerId: 3, teamId: 2, player: { handicap: 10, gender: "female" } },
          { playerId: 4, teamId: 2, player: { handicap: 20, gender: "female" } },
        ],
      },
    );

    expect(setups.map((setup) => ({
      teamId: setup.teamId,
      par: setup.holes[0].par,
      playingHandicap: setup.playingHandicap,
    }))).toEqual([
      { teamId: 1, par: 4, playingHandicap: 7 },
      { teamId: 2, par: 4, playingHandicap: 7 },
    ]);
  });

  it("uses the explicitly selected women's scorecard for every team", () => {
    const setups = buildSharedTeamHandicapSetups(
      {
        format: "team",
        scoringMode: "alternate-shot",
        scoringConfig: { handicapAllowance: 1, sharedTeamScorecard: "female" },
        scoringHoles: [{ num: 1, par: 4, hcp: 1 }],
        scoringHolesByGender: { female: [{ num: 1, par: 5, hcp: 1 }] },
      },
      {
        teams: [{ teamId: 1, team: { name: "Team" } }],
        players: [
          { playerId: 1, teamId: 1, player: { handicap: 10, gender: "male" } },
          { playerId: 2, teamId: 1, player: { handicap: 20, gender: "female" } },
        ],
      },
    );

    expect(setups[0].holes[0].par).toBe(5);
  });
});
