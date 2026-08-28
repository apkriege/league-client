import type {
  InsightTone,
  IntelligenceEvent,
  LeagueIntelligenceMetrics,
  LeagueRosterPlayer,
} from "./types";

const playerName = (player: LeagueRosterPlayer) =>
  `${player.firstName} ${player.lastName}`.trim();

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
  const completedEvents = events.filter(
    (event) => event.isComplete || ["complete", "completed"].includes(String(event.status)),
  );
  const upcomingEvents = events
    .filter(
      (event) =>
        !event.isComplete &&
        !["complete", "completed", "canceled", "cancelled"].includes(String(event.status)) &&
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
  const leader = sortedStandings[0];
  const runnerUp = sortedStandings[1];
  const leadGap = leader && runnerUp ? Math.round((leader.points - runnerUp.points) * 10) / 10 : null;
  const mostImproved = [...playerStandings]
    .filter(
      (standing) =>
        standing.handicapChange != null && standing.handicapChange < 0 && standing.rounds >= 2,
    )
    .sort((left, right) => Number(left.handicapChange) - Number(right.handicapChange))[0];
  const maxRounds = Math.max(0, ...playerStandings.map((standing) => standing.rounds));
  const standingById = new Map(playerStandings.map((standing) => [standing.playerId, standing]));
  const behindParticipation = regularRoster.filter((player) => {
    const standing = standingById.get(player.id);
    return maxRounds >= 2 && Number(standing?.rounds || 0) <= maxRounds - 2;
  });

  const takeaways: Array<{ tone: InsightTone; title: string; detail: string }> = [];
  if (leader && runnerUp && leadGap != null) {
    takeaways.push({
      tone: leadGap <= 2 ? "attention" : "neutral",
      title: leadGap <= 2 ? "The standings race is tight" : `${leader.name} controls the lead`,
      detail: `${leadGap} points separate ${leader.name} and ${runnerUp.name}.`,
    });
  }
  if (mostImproved) {
    takeaways.push({
      tone: Number(mostImproved.handicapChange) < 0 ? "positive" : "neutral",
      title: `${mostImproved.name} is the most improved`,
      detail: `Handicap movement: ${Number(mostImproved.handicapChange) > 0 ? "+" : ""}${mostImproved.handicapChange}.`,
    });
  }
  if (behindParticipation.length > 0) {
    const names = behindParticipation.slice(0, 2).map(playerName).join(" and ");
    takeaways.push({
      tone: "attention",
      title: `${behindParticipation.length} ${behindParticipation.length === 1 ? "golfer is" : "golfers are"} falling behind`,
      detail: `${names}${behindParticipation.length > 2 ? ` and ${behindParticipation.length - 2} more` : ""} trail the participation pace by at least two rounds.`,
    });
  }
  if (takeaways.length === 0) {
    takeaways.push({
      tone: "neutral",
      title: "League baseline is building",
      detail: "Standings, participation, and improvement signals will strengthen as rounds are completed.",
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
    mostImproved: mostImproved
      ? { name: mostImproved.name, handicapChange: Number(mostImproved.handicapChange) }
      : null,
    nextEvent: upcomingEvents[0] ?? null,
    behindParticipation,
    takeaways,
  };
}
