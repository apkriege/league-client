import type {
  InsightTone,
  IntelligenceEvent,
  LeagueIntelligenceMetrics,
  LeagueRosterPlayer,
} from "./types";

export type LeaguePulseSpotlightKind =
  | "hot"
  | "race"
  | "rivalry"
  | "team"
  | "birdies"
  | "improvement"
  | "participation";

export type LeaguePulseSpotlight = {
  kind: LeaguePulseSpotlightKind;
  tone: InsightTone;
  label: string;
  title: string;
  detail: string;
  stat: string;
  playerId?: number;
  teamId?: number;
};

const playerName = (player: LeagueRosterPlayer) =>
  `${player.firstName} ${player.lastName}`.trim();

const roundOne = (value: number) => Math.round(value * 10) / 10;

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const average = (values: number[]) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

function findHotPlayer(metrics?: LeagueIntelligenceMetrics) {
  const candidates = (metrics?.playerWeeklyTrends?.players ?? []).flatMap((player) => {
    const netScores = player.avgNet.flatMap((score, index) => {
      if (score == null || !Number.isFinite(score)) return [];
      const holes = Number(metrics?.playerWeeklyTrends?.holes?.[index] || 18);
      return [roundOne(score * (18 / Math.max(1, holes)))];
    });
    if (netScores.length < 2) return [];

    const recentCount = Math.min(2, netScores.length - 1);
    const recentScores = netScores.slice(-recentCount);
    const baselineScores = netScores.slice(0, -recentCount).slice(-2);
    const recentAverage = roundOne(average(recentScores));
    const improvement = roundOne(average(baselineScores) - recentAverage);
    let improvingStreak = 1;

    for (let index = netScores.length - 1; index > 0; index -= 1) {
      if (netScores[index] >= netScores[index - 1]) break;
      improvingStreak += 1;
    }

    return [{
      playerId: player.playerId,
      name: player.name,
      recentAverage,
      improvement,
      improvingStreak,
    }];
  });

  if (candidates.length === 0) return null;

  return candidates.sort((left, right) => {
    const leftIsImproving = left.improvement > 0;
    const rightIsImproving = right.improvement > 0;
    if (leftIsImproving !== rightIsImproving) return leftIsImproving ? -1 : 1;
    if (right.improvement !== left.improvement) return right.improvement - left.improvement;
    return left.recentAverage - right.recentAverage;
  })[0];
}

function findRivalry(metrics?: LeagueIntelligenceMetrics) {
  return (metrics?.headToHead ?? [])
    .filter((matchup) => matchup.playerId < matchup.opponentId)
    .map((matchup) => ({
      ...matchup,
      meetings: matchup.wins + matchup.losses + matchup.ties,
      margin: Math.abs(matchup.wins - matchup.losses),
    }))
    .filter((matchup) => matchup.meetings > 0)
    .sort((left, right) => right.meetings - left.meetings || left.margin - right.margin)[0] ?? null;
}

export function buildLeaguePulse({
  metrics,
  events,
  roster,
  now = new Date(),
}: {
  metrics?: LeagueIntelligenceMetrics;
  events: IntelligenceEvent[];
  roster: LeagueRosterPlayer[];
  now?: Date;
}) {
  const regularRoster = roster.filter(
    (player) => String(player.type || "player").toLowerCase() === "player",
  );
  const playerStandings = metrics?.standings ?? [];
  const teamStandings = metrics?.teamStandings ?? [];
  const standings = metrics?.standingsMode === "team" ? teamStandings : playerStandings;
  const completedEvents = events.filter((event) =>
    ["complete", "completed"].includes(String(event.status).toLowerCase()),
  );
  const upcomingEvents = events
    .filter(
      (event) =>
        !["complete", "completed", "canceled", "cancelled"].includes(
          String(event.status).toLowerCase(),
        ) &&
        new Date(event.startsAt).getTime() >= now.getTime(),
    )
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());
  const regularPlayerIds = new Set(regularRoster.map((player) => player.id));
  const activePlayerIds = new Set(
    playerStandings
      .filter((standing) => standing.rounds > 0 && regularPlayerIds.has(standing.playerId))
      .map((standing) => standing.playerId),
  );
  const participation = regularRoster.length > 0
    ? Math.round((activePlayerIds.size / regularRoster.length) * 100)
    : 0;
  const sortedStandings = [...standings].sort((left, right) => right.points - left.points);
  const activeStandings = sortedStandings.filter(
    (standing) =>
      Number(standing.points || 0) !== 0 ||
      ("eventsPlayed" in standing && standing.eventsPlayed > 0) ||
      ("rounds" in standing && standing.rounds > 0),
  );
  const leader = activeStandings[0];
  const runnerUp = activeStandings[1];
  const leadGap = leader && runnerUp ? roundOne(leader.points - runnerUp.points) : null;
  const mostImproved = [...playerStandings]
    .filter(
      (standing) =>
        standing.handicapChange != null && standing.handicapChange < 0 && standing.rounds >= 2,
    )
    .sort((left, right) => Number(left.handicapChange) - Number(right.handicapChange))[0];
  const birdieLeader = [...playerStandings]
    .filter((standing) => Number(standing.birdies || 0) > 0)
    .sort(
      (left, right) =>
        Number(right.birdies || 0) - Number(left.birdies || 0) || right.points - left.points,
    )[0];
  const teamPaceLeader = [...teamStandings]
    .filter((team) => team.eventsPlayed > 0)
    .map((team) => ({ ...team, pointsPerEvent: roundOne(team.points / team.eventsPlayed) }))
    .sort((left, right) => right.pointsPerEvent - left.pointsPerEvent)[0];
  const hotPlayer = findHotPlayer(metrics);
  const rivalry = findRivalry(metrics);
  const maxRounds = Math.max(0, ...playerStandings.map((standing) => standing.rounds));
  const standingById = new Map(playerStandings.map((standing) => [standing.playerId, standing]));
  const behindParticipation = regularRoster.filter((player) => {
    const standing = standingById.get(player.id);
    return maxRounds >= 2 && Number(standing?.rounds || 0) <= maxRounds - 2;
  });
  const spotlights: LeaguePulseSpotlight[] = [];

  if (hotPlayer) {
    const isImproving = hotPlayer.improvement > 0;
    spotlights.push({
      kind: "hot",
      tone: "positive",
      label: "Who's hot",
      title: isImproving ? `${hotPlayer.name} is heating up` : `${hotPlayer.name} leads recent performance`,
      detail: isImproving
        ? `Recent net scoring is ${formatNumber(hotPlayer.improvement)} strokes better than the prior sample.`
        : `A ${formatNumber(hotPlayer.recentAverage)} recent net average sets the pace.`,
      stat: hotPlayer.improvingStreak >= 2
        ? `${hotPlayer.improvingStreak} improving`
        : `${formatNumber(hotPlayer.recentAverage)} net`,
      playerId: hotPlayer.playerId,
    });
  }

  if (leader && runnerUp && leadGap != null) {
    spotlights.push({
      kind: "race",
      tone: leadGap <= 2 ? "attention" : "neutral",
      label: "Race pressure",
      title: leadGap <= 2 ? "The title race is wide open" : `${leader.name} has the inside track`,
      detail: `${runnerUp.name} sits ${formatNumber(leadGap)} points behind the lead.`,
      stat: `${formatNumber(leadGap)} pt gap`,
      ...(metrics?.standingsMode === "team"
        ? { teamId: "teamId" in leader ? leader.teamId : undefined }
        : { playerId: "playerId" in leader ? leader.playerId : undefined }),
    });
  }

  if (metrics?.standingsMode === "team" && teamPaceLeader) {
    spotlights.push({
      kind: "team",
      tone: "positive",
      label: "Team pace",
      title: `${teamPaceLeader.name} brings the pressure`,
      detail: `${formatNumber(teamPaceLeader.points)} points through ${teamPaceLeader.eventsPlayed} scored events.`,
      stat: `${formatNumber(teamPaceLeader.pointsPerEvent)} per event`,
      teamId: teamPaceLeader.teamId,
    });
  }

  if (rivalry) {
    spotlights.push({
      kind: "rivalry",
      tone: "attention",
      label: "Rivalry watch",
      title: `${rivalry.playerName} vs. ${rivalry.opponentName}`,
      detail: `${rivalry.meetings} meetings have made this the league's most established head-to-head battle.`,
      stat: `${rivalry.wins}-${rivalry.losses}${rivalry.ties ? `-${rivalry.ties}` : ""}`,
      playerId: rivalry.playerId,
    });
  }

  if (birdieLeader) {
    const birdies = Number(birdieLeader.birdies || 0);
    spotlights.push({
      kind: "birdies",
      tone: "positive",
      label: "Pin hunter",
      title: `${birdieLeader.name} is attacking`,
      detail: `${formatNumber(roundOne(birdies / Math.max(1, birdieLeader.rounds)))} birdies per round leads the scoring pressure.`,
      stat: `${birdies} birdies`,
      playerId: birdieLeader.playerId,
    });
  }

  if (mostImproved) {
    spotlights.push({
      kind: "improvement",
      tone: "positive",
      label: "Leveling up",
      title: `${mostImproved.name} is making the leap`,
      detail: "No golfer has cut more from their starting handicap this season.",
      stat: `${formatNumber(Math.abs(Number(mostImproved.handicapChange)))} HCP cut`,
      playerId: mostImproved.playerId,
    });
  }

  if (behindParticipation.length > 0) {
    const names = behindParticipation.slice(0, 2).map(playerName).join(" and ");
    spotlights.push({
      kind: "participation",
      tone: "attention",
      label: "Chasing the pack",
      title: `${behindParticipation.length} ${behindParticipation.length === 1 ? "golfer is" : "golfers are"} off the pace`,
      detail: `${names}${behindParticipation.length > 2 ? ` and ${behindParticipation.length - 2} more` : ""} trail by at least two rounds.`,
      stat: `${behindParticipation.length} behind`,
    });
  }

  if (spotlights.length === 0) {
    spotlights.push({
      kind: "race",
      tone: "neutral",
      label: "League pulse",
      title: "The season story is taking shape",
      detail: "Complete more rounds to unlock recent performance, rivalry, scoring, and momentum insights.",
      stat: "Building",
    });
  }

  return {
    participation,
    activePlayers: activePlayerIds.size,
    rosterSize: regularRoster.length,
    completedEvents: completedEvents.length,
    scheduledEvents: events.length,
    leader: leader ? { name: leader.name, points: leader.points } : null,
    leadGap,
    hotPlayer,
    mostImproved: mostImproved
      ? { name: mostImproved.name, handicapChange: Number(mostImproved.handicapChange) }
      : null,
    nextEvent: upcomingEvents[0] ?? null,
    behindParticipation,
    spotlights: spotlights.slice(0, 4),
    takeaways: spotlights.map(({ tone, title, detail }) => ({ tone, title, detail })),
  };
}
