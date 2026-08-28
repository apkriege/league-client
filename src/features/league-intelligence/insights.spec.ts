import { describe, expect, it } from "vitest";
import type { TeamEventResult, TeamProfile } from "@api/teams/types";
import { buildCommissionerInsights } from "./commissionerInsights";
import { buildEventRecap } from "./eventRecap";
import { buildLeaguePulse } from "./leaguePulse";
import { buildSchedulePreview } from "./schedulePreview";
import { buildTeamIntelligence } from "./teamIntelligence";

const teamEvent = (
  id: number,
  totalPoints: number,
  opponentPoints: number,
  playerPoints: [number, number],
): TeamEventResult => ({
  id,
  name: `Week ${id}`,
  startsAt: `2026-06-${String(id).padStart(2, "0")}T22:00:00.000Z`,
  timeZone: "America/Indiana/Indianapolis",
  format: "head-to-head",
  scoringFormat: "match",
  type: "regular",
  status: "completed",
  isComplete: true,
  holes: 9,
  courseName: "River Bend",
  flightId: id,
  flightStartsAt: null,
  isAssigned: true,
  opponents: [{
    id: 9,
    name: "Pin Seekers",
    playerPoints: opponentPoints,
    teamPoints: 0,
    totalPoints: opponentPoints,
  }],
  playerPoints: totalPoints,
  teamPoints: 0,
  totalPoints,
  playerRounds: [
    {
      id: id * 10 + 1,
      playerId: 1,
      playerName: "Avery Green",
      date: null,
      gross: 40,
      net: 35,
      points: playerPoints[0],
      eagles: 0,
      birdies: 1,
      pars: 5,
      bogeys: 3,
    },
    {
      id: id * 10 + 2,
      playerId: 2,
      playerName: "Blake Fairway",
      date: null,
      gross: 42,
      net: 36,
      points: playerPoints[1],
      eagles: 0,
      birdies: 0,
      pars: 4,
      bogeys: 5,
    },
  ],
});

describe("league intelligence", () => {
  it("builds a league pulse from participation, standings, and improvement", () => {
    const pulse = buildLeaguePulse({
      now: new Date("2026-06-15T12:00:00.000Z"),
      roster: [
        { id: 1, firstName: "Avery", lastName: "Green", type: "player" },
        { id: 2, firstName: "Blake", lastName: "Fairway", type: "player" },
        { id: 3, firstName: "Casey", lastName: "Links", type: "player" },
        { id: 4, firstName: "Sam", lastName: "Sub", type: "substitute" },
      ],
      events: [
        { id: 1, name: "Opening Night", startsAt: "2026-06-01T22:00:00.000Z", status: "completed" },
        { id: 2, name: "Week Two", startsAt: "2026-06-20T22:00:00.000Z", status: "upcoming" },
      ],
      metrics: {
        standings: [
          { playerId: 1, name: "Avery Green", points: 12, rounds: 3, avgGross: 40, avgNet: 35, handicapChange: -1.8 },
          { playerId: 2, name: "Blake Fairway", points: 10.5, rounds: 2, avgGross: 42, avgNet: 36, handicapChange: 0.2 },
          { playerId: 3, name: "Casey Links", points: 0, rounds: 0, avgGross: 0, avgNet: 0, handicapChange: null },
        ],
      },
    });

    expect(pulse.participation).toBe(67);
    expect(pulse.rosterSize).toBe(3);
    expect(pulse.leadGap).toBe(1.5);
    expect(pulse.mostImproved?.name).toBe("Avery Green");
    expect(pulse.behindParticipation.map((player) => player.id)).toEqual([3]);
    expect(pulse.nextEvent?.name).toBe("Week Two");
  });

  it("finds team contributors, pairings, form, and rivalry records", () => {
    const team: TeamProfile = {
      id: 3,
      name: "Birdie Makers",
      leagueId: 1,
      seasonPoints: 19,
      seasonRank: 1,
      players: [],
      teamEventPoints: [],
      teamLeaderboard: [],
      eventResults: [teamEvent(1, 10, 7, [6, 4]), teamEvent(2, 9, 11, [7, 2])],
    };

    const insight = buildTeamIntelligence(team);

    expect(insight.record).toEqual({ wins: 1, losses: 1, ties: 0, matches: 2 });
    expect(insight.rivalries[0]).toMatchObject({ name: "Pin Seekers", wins: 1, losses: 1 });
    expect(insight.contributions[0]).toMatchObject({ name: "Avery Green", points: 13 });
    expect(insight.pairings[0]).toMatchObject({ events: 2, winRate: 50 });
    expect(insight.totals).toEqual({ birdies: 2, pars: 18, bogeys: 16 });
  });

  it("recaps the leader, closing stretch, and event turning point", () => {
    const recap = buildEventRecap({
      name: "Championship Night",
      pointsEnabled: true,
      metrics: {
        scores: [
          {
            playerId: 1,
            player: { firstName: "Avery", lastName: "Green" },
            gross: 39,
            net: 34,
            preHandicap: 8,
            pointsEarned: 8,
            matchPoints: 2,
            scores: [
              { hole: 1, gross: 4, net: 4, par: 4 },
              { hole: 2, gross: 4, net: 3, par: 4 },
              { hole: 3, gross: 4, net: 4, par: 4 },
            ],
          },
          {
            playerId: 2,
            player: { firstName: "Blake", lastName: "Fairway" },
            gross: 42,
            net: 37,
            preHandicap: 4,
            pointsEarned: 6,
            matchPoints: 1,
            scores: [
              { hole: 1, gross: 5, net: 5, par: 4 },
              { hole: 2, gross: 7, net: 6, par: 4 },
              { hole: 3, gross: 5, net: 5, par: 4 },
            ],
          },
        ],
      },
    });

    expect(recap?.winner).toMatchObject({ name: "Avery Green", points: 10 });
    expect(recap?.clutch).toMatchObject({ playerName: "Avery Green", toPar: -1 });
    expect(recap?.separationHole).toMatchObject({ hole: 2, spread: 3 });
    expect(recap?.relativeToPar).toMatchObject({ playerName: "Avery Green", netToPar: -1 });
  });

  it("previews assigned matches with form, history, and course context", () => {
    const preview = buildSchedulePreview({
      now: new Date("2026-06-01T12:00:00.000Z"),
      events: [{
        id: 8,
        name: "Rivalry Night",
        startsAt: "2026-06-10T22:00:00.000Z",
        status: "upcoming",
        courseId: 4,
        flights: [{
          id: 1,
          players: [
            { playerId: 1, opponentId: 2, player: { firstName: "Avery", lastName: "Green", handicap: 8 } },
            { playerId: 2, opponentId: 1, player: { firstName: "Blake", lastName: "Fairway", handicap: 10 } },
          ],
        }],
      }],
      metrics: {
        playerWeeklyTrends: {
          labels: ["One", "Two"],
          players: [
            { playerId: 1, name: "Avery Green", avgGross: [40, 39], avgNet: [35, 34] },
            { playerId: 2, name: "Blake Fairway", avgGross: [42, 41], avgNet: [37, 36] },
          ],
        },
        headToHead: [{ playerId: 1, playerName: "Avery Green", opponentId: 2, opponentName: "Blake Fairway", wins: 3, losses: 1, ties: 1 }],
        playerCourseHistory: [
          { playerId: 1, playerName: "Avery Green", courseId: 4, rounds: 3, avgGross: 40, avgNet: 34 },
          { playerId: 2, playerName: "Blake Fairway", courseId: 4, rounds: 2, avgGross: 42, avgNet: 37 },
        ],
      },
    });

    expect(preview?.assignmentsReady).toBe(true);
    expect(preview?.playerMatchups).toHaveLength(1);
    expect(preview?.playerMatchups[0]).toMatchObject({
      handicapGap: 2,
      recentNet: 34.5,
      opponentRecentNet: 36.5,
      courseEdge: -3,
      courseSamples: 5,
    });
    expect(preview?.playerMatchups[0].history).toMatchObject({ wins: 3, losses: 1, ties: 1 });
  });

  it("prioritizes commissioner issues without billing exempt leagues", () => {
    const input = {
      now: new Date("2026-06-01T12:00:00.000Z"),
      league: {
        endDate: "2026-06-30T00:00:00.000Z",
        billingPaidGolfers: 1,
        numPlayers: 3,
        players: [
          { id: 1, firstName: "A", lastName: "One", type: "player" },
          { id: 2, firstName: "B", lastName: "Two", type: "player" },
          { id: 3, firstName: "C", lastName: "Three", type: "player" },
        ],
      },
      events: [{
        id: 1,
        name: "Score Check",
        startsAt: "2026-05-20T22:00:00.000Z",
        status: "active",
        scoringFormat: "match",
        _count: { rounds: 1 },
        flights: [{
          id: 1,
          players: [
            { playerId: 1, opponentId: 2 },
            { playerId: 2, opponentId: null },
          ],
        }],
      }],
      metrics: {
        standings: [
          { playerId: 1, name: "A One", points: 10, rounds: 3, avgGross: 40, avgNet: 35, handicapChange: 0 },
          { playerId: 2, name: "B Two", points: 4, rounds: 1, avgGross: 44, avgNet: 38, handicapChange: 6 },
          { playerId: 3, name: "C Three", points: 0, rounds: 0, avgGross: 0, avgNet: 0, handicapChange: null },
        ],
      },
    };

    const insight = buildCommissionerInsights(input);
    expect(insight.items.map((item) => item.key)).toEqual(
      expect.arrayContaining(["billing", "scores", "flights", "participation", "handicap", "renewal"]),
    );
    expect(buildCommissionerInsights({
      ...input,
      league: { ...input.league, billingExempt: true },
    }).items.map((item) => item.key)).not.toContain("billing");
  });
});
