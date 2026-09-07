import { expect, it } from "vitest";
import { buildTeamIntelligence } from "./teamIntelligence";
import type { TeamProfile, TeamEventResult } from "@api/teams/types";

const fieldEvent: TeamEventResult = {
  id: 1, name: "Scramble", startsAt: "2026-09-01", timeZone: "UTC", format: "team",
  scoringMode: "scramble", type: "regular", status: "completed", holes: 9,
  courseName: null, flightId: 1, flightStartsAt: null, isAssigned: true,
  opponents: [{ id: 2, name: "Flight partner", playerPoints: 0, teamPoints: 6, totalPoints: 6 }],
  playerPoints: 0, teamPoints: 8, totalPoints: 8, playerRounds: [],
  fieldRank: 2, fieldSize: 4,
  sharedRound: { teamId: 1, gross: 3, net: 3, scores: [{ hole: 1, gross: 3, net: 3, par: 4 }] },
};
const team = (event: TeamEventResult): TeamProfile => ({
  id: 1, name: "Team", leagueId: 1, seasonPoints: 8, seasonRank: 2,
  players: [], teamEventPoints: [], teamLeaderboard: [], eventResults: [event],
});

it.each(["scramble", "alternate-shot", "stroke-play", "best-ball"])("does not turn %s flight companions into match wins", (scoringMode) => {
  const result = buildTeamIntelligence(team({ ...fieldEvent, scoringMode }));
  expect(result.record.matches).toBe(0);
  expect(result.rivalries).toEqual([]);
  expect(result.field).toEqual({ events: 1, wins: 0, podiums: 1 });
});

it("includes shared team hole outcomes without inventing player contributions", () => {
  const result = buildTeamIntelligence(team(fieldEvent));
  expect(result.totals.birdies).toBe(1);
  expect(result.contributions).toEqual([]);
});

it("does not finalize a result while the event is still being scored", () => {
  const result = buildTeamIntelligence(team({ ...fieldEvent, status: "upcoming" }));
  expect(result.field.events).toBe(0);
  expect(result.overview.completedEvents).toBe(0);
});


it("uses event victories for field-format pairing win rates", () => {
  const playerRounds = [1, 2].map((id) => ({
    id, playerId: id, playerName: `Player ${id}`, date: null, gross: 36, net: 30,
    points: 0, eagles: 0, birdies: 1, pars: 7, bogeys: 1,
  }));
  const result = buildTeamIntelligence(team({
    ...fieldEvent, scoringMode: "stroke-play", fieldRank: 1, playerRounds, sharedRound: undefined,
  }));
  expect(result.pairings[0].winRate).toBe(100);
  expect(result.record.matches).toBe(0);
});
