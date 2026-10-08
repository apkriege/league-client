import { buildPlayerHighlights } from "./playerHighlights";
import type { LeagueIntelligenceMetrics } from "./types";

export type LeagueFormStatus = "hot" | "steady" | "cooling";

export type LeagueFormRow = {
  playerId: number;
  name: string;
  recentAverage: number;
  priorAverage: number;
  change: number;
  improvingStreak: number;
  status: LeagueFormStatus;
};

export type LeagueRecentWinner = {
  eventName: string;
  playerId: number | null;
  playerName: string;
  net: number;
};

export type LeagueRaceRow = {
  rank: number;
  id: number;
  name: string;
  points: number;
  gap: number;
  appearances: number;
  entity: "player" | "team";
};

export type LeagueCategoryBoard = {
  id: string;
  title: string;
  description: string;
  tone: "emerald" | "amber" | "blue" | "violet";
  rows: Array<{
    id: number;
    name: string;
    value: string;
    detail: string;
  }>;
};

export type LeagueRivalry = {
  playerId: number;
  playerName: string;
  opponentId: number;
  opponentName: string;
  wins: number;
  losses: number;
  ties: number;
  meetings: number;
  label: "Instant classic" | "Heating up" | "New matchup";
};

const roundOne = (value: number) => Math.round(value * 10) / 10;
const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

function buildForm(metrics?: LeagueIntelligenceMetrics) {
  const trends = metrics?.playerWeeklyTrends;
  const rows = (trends?.players ?? []).flatMap<LeagueFormRow>((player) => {
    const scores = player.avgNet.flatMap((score, index) => {
      if (score == null || !Number.isFinite(score)) return [];
      const holes = Number(trends?.holes?.[index] || 18);
      return [roundOne(score * (18 / Math.max(1, holes)))];
    });
    if (scores.length < 2) return [];

    const recentCount = Math.min(3, scores.length - 1);
    const recent = scores.slice(-recentCount);
    const prior = scores.slice(0, -recentCount).slice(-3);
    const recentAverage = roundOne(average(recent));
    const priorAverage = roundOne(average(prior));
    const change = roundOne(recentAverage - priorAverage);
    let improvingStreak = 1;

    for (let index = scores.length - 1; index > 0; index -= 1) {
      if (scores[index] >= scores[index - 1]) break;
      improvingStreak += 1;
    }

    return [{
      playerId: player.playerId,
      name: player.name,
      recentAverage,
      priorAverage,
      change,
      improvingStreak,
      status: change <= -0.75 ? "hot" : change >= 0.75 ? "cooling" : "steady",
    }];
  });

  rows.sort((left, right) => left.change - right.change || left.recentAverage - right.recentAverage);

  const recentWinners = (trends?.labels ?? []).flatMap<LeagueRecentWinner>((eventName, index) => {
    const results = (trends?.players ?? []).flatMap((player) => {
      const net = player.avgNet[index];
      return net != null && Number.isFinite(net)
        ? [{ playerId: player.playerId, playerName: player.name, net }]
        : [];
    });
    if (results.length === 0) return [];
    const lowNet = Math.min(...results.map((result) => result.net));
    const winners = results.filter((result) => Math.abs(result.net - lowNet) < 0.001);
    return [{
      eventName,
      playerId: winners.length === 1 ? winners[0].playerId : null,
      playerName: winners.map((winner) => winner.playerName).join(" & "),
      net: lowNet,
    }];
  }).slice(-4).reverse();

  return { rows, recentWinners };
}

function buildRace(
  standings: Array<{
    name: string;
    points: number;
    playerId?: number;
    teamId?: number;
    rounds?: number;
    eventsPlayed?: number;
  }>,
  entity: "player" | "team",
) {
  const sorted = [...standings].sort((left, right) => right.points - left.points);
  const leaderPoints = Number(sorted[0]?.points || 0);
  let previousPoints: number | null = null;
  let previousRank = 0;
  const rows: LeagueRaceRow[] = sorted.map((standing, index) => {
    const points = roundOne(Number(standing.points || 0));
    const rank = previousPoints != null && Math.abs(points - previousPoints) < 0.001
      ? previousRank
      : index + 1;
    previousPoints = points;
    previousRank = rank;
    return {
      rank,
      id: entity === "team" ? Number(standing.teamId || 0) : Number(standing.playerId || 0),
      name: standing.name,
      points,
      gap: roundOne(Math.max(0, leaderPoints - points)),
      appearances: entity === "team"
        ? Number(standing.eventsPlayed || 0)
        : Number(standing.rounds || 0),
      entity,
    };
  });
  const contenderThreshold = Math.max(2, roundOne(leaderPoints * 0.15));

  return {
    rows,
    contenders: rows.filter((row) => row.gap <= contenderThreshold).length,
    contenderThreshold,
    leadGap: rows[1]?.gap ?? null,
  };
}

function buildCategoryBoards(metrics?: LeagueIntelligenceMetrics): LeagueCategoryBoard[] {
  const players = (metrics?.standings ?? []).filter((player) => player.rounds > 0);
  const playerRows = (
    id: string,
    title: string,
    description: string,
    tone: LeagueCategoryBoard["tone"],
    sorted: typeof players,
    value: (player: (typeof players)[number]) => string,
    detail: (player: (typeof players)[number]) => string,
  ): LeagueCategoryBoard => ({
    id,
    title,
    description,
    tone,
    rows: sorted.slice(0, 5).map((player) => ({
      id: player.playerId,
      name: player.name,
      value: value(player),
      detail: detail(player),
    })),
  });

  const boards: LeagueCategoryBoard[] = [];
  if (metrics?.standingsMode === "team") {
    const teams = (metrics.teamStandings ?? []).filter((team) => team.eventsPlayed > 0);
    boards.push({
      id: "team-points",
      title: "Team power ranking",
      description: "Total points earned",
      tone: "amber",
      rows: teams.sort((a, b) => b.points - a.points).slice(0, 5).map((team) => ({
        id: team.teamId,
        name: team.name,
        value: formatNumber(team.points),
        detail: `${team.eventsPlayed} scored events`,
      })),
    });
  }

  boards.push(
    playerRows(
      "points",
      "Points leaders",
      "Season scoring production",
      "amber",
      [...players].sort((a, b) => b.points - a.points),
      (player) => formatNumber(player.points),
      (player) => `${formatNumber(roundOne(player.points / player.rounds))} per round`,
    ),
    playerRows(
      "net",
      "Net scoring",
      "Lowest average net",
      "emerald",
      [...players].sort((a, b) => a.avgNet - b.avgNet),
      (player) => player.avgNet.toFixed(1),
      (player) => `${player.rounds} rounds`,
    ),
    playerRows(
      "gross",
      "Gross scoring",
      "Lowest average gross",
      "blue",
      [...players].sort((a, b) => a.avgGross - b.avgGross),
      (player) => player.avgGross.toFixed(1),
      (player) => `${player.rounds} rounds`,
    ),
    playerRows(
      "birdies",
      "Birdie makers",
      "Most red numbers created",
      "violet",
      [...players].sort((a, b) => Number(b.birdies || 0) - Number(a.birdies || 0)),
      (player) => String(player.birdies || 0),
      (player) => `${formatNumber(roundOne(Number(player.birdies || 0) / player.rounds))} per round`,
    ),
    playerRows(
      "improvement",
      "Biggest movers",
      "Handicap strokes gained",
      "emerald",
      [...players]
        .filter((player) => player.rounds >= 2 && player.handicapChange != null && player.handicapChange < 0)
        .sort((a, b) => Number(a.handicapChange) - Number(b.handicapChange)),
      (player) => `${formatNumber(Math.abs(Math.min(0, Number(player.handicapChange))))}`,
      () => "handicap strokes cut",
    ),
  );

  return boards;
}

function buildRivalries(metrics?: LeagueIntelligenceMetrics): LeagueRivalry[] {
  return (metrics?.headToHead ?? [])
    .filter((matchup) => matchup.playerId < matchup.opponentId)
    .map((matchup) => {
      const meetings = matchup.wins + matchup.losses + matchup.ties;
      const margin = Math.abs(matchup.wins - matchup.losses);
      return {
        ...matchup,
        meetings,
        label: meetings >= 3 && margin <= 1
          ? "Instant classic" as const
          : meetings >= 2
            ? "Heating up" as const
            : "New matchup" as const,
      };
    })
    .filter((rivalry) => rivalry.meetings > 0)
    .sort(
      (left, right) =>
        right.meetings - left.meetings ||
        Math.abs(left.wins - left.losses) - Math.abs(right.wins - right.losses),
    );
}

export function buildLeagueDashboard(metrics?: LeagueIntelligenceMetrics) {
  const form = buildForm(metrics);
  const playerRace = buildRace(metrics?.standings ?? [], "player");
  const teamRace = buildRace(metrics?.teamStandings ?? [], "team");
  return {
    playerRace,
    teamRace,
    hasTeamRace: teamRace.rows.some((row) => row.appearances > 0 || row.points !== 0),
    formRows: form.rows,
    recentWinners: form.recentWinners,
    categoryBoards: buildCategoryBoards(metrics),
    rivalries: buildRivalries(metrics),
    playerHighlights: buildPlayerHighlights(metrics),
    formCounts: {
      hot: form.rows.filter((row) => row.status === "hot").length,
      steady: form.rows.filter((row) => row.status === "steady").length,
      cooling: form.rows.filter((row) => row.status === "cooling").length,
    },
  };
}
