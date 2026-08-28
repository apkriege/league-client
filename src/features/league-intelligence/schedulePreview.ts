import type {
  HeadToHeadHistory,
  IntelligenceEvent,
  LeagueIntelligenceMetrics,
  PlayerCourseHistory,
  PlayerTrend,
} from "./types";

const playerName = (player: { firstName?: string; lastName?: string }) =>
  `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() || "Golfer";

const averageRecent = (trend: PlayerTrend | undefined) => {
  const values = (trend?.avgNet ?? []).filter((value): value is number => value != null).slice(-3);
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
};

const courseRow = (
  history: PlayerCourseHistory[],
  playerId: number,
  courseId: number,
) => history.find((row) => row.playerId === playerId && row.courseId === courseId);

const headToHeadRow = (
  history: HeadToHeadHistory[],
  playerId: number,
  opponentId: number,
) => {
  const direct = history.find(
    (row) => row.playerId === playerId && row.opponentId === opponentId,
  );
  if (direct) return direct;
  const reverse = history.find(
    (row) => row.playerId === opponentId && row.opponentId === playerId,
  );
  return reverse
    ? { ...reverse, playerId, opponentId, wins: reverse.losses, losses: reverse.wins }
    : undefined;
};

export function buildSchedulePreview({
  events,
  metrics,
  now = new Date(),
}: {
  events: IntelligenceEvent[];
  metrics?: LeagueIntelligenceMetrics;
  now?: Date;
}) {
  const nextEvent = [...events]
    .filter(
      (event) =>
        !event.isComplete &&
        !["completed", "complete", "canceled", "cancelled"].includes(String(event.status)) &&
        new Date(event.startsAt).getTime() >= now.getTime(),
    )
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())[0];
  if (!nextEvent) return null;

  const trends = metrics?.playerWeeklyTrends?.players ?? [];
  const histories = metrics?.headToHead ?? [];
  const courseHistory = metrics?.playerCourseHistory ?? [];
  const players = (nextEvent.flights ?? []).flatMap((flight) => flight.players ?? []);
  const playerById = new Map(players.map((entry) => [entry.playerId, entry]));
  const processed = new Set<string>();
  const playerMatchups = players.flatMap((entry) => {
    const opponentId = Number(entry.opponentId || 0);
    if (!opponentId) return [];
    const key = [entry.playerId, opponentId].sort((left, right) => left - right).join(":");
    if (processed.has(key)) return [];
    processed.add(key);
    const opponent = playerById.get(opponentId);
    if (!opponent?.player || !entry.player) return [];
    const leftHandicap = entry.player.handicap == null ? null : Number(entry.player.handicap);
    const rightHandicap = opponent.player.handicap == null ? null : Number(opponent.player.handicap);
    const leftRecent = averageRecent(trends.find((trend) => trend.playerId === entry.playerId));
    const rightRecent = averageRecent(trends.find((trend) => trend.playerId === opponentId));
    const courseId = Number(nextEvent.courseId ?? nextEvent.course?.id ?? 0);
    const leftCourse = courseRow(courseHistory, entry.playerId, courseId);
    const rightCourse = courseRow(courseHistory, opponentId, courseId);
    const history = headToHeadRow(histories, entry.playerId, opponentId);
    const handicapGap = leftHandicap != null && rightHandicap != null
      ? Math.abs(leftHandicap - rightHandicap)
      : null;
    const closeness = (handicapGap ?? 20) +
      (leftRecent != null && rightRecent != null ? Math.abs(leftRecent - rightRecent) / 4 : 0);
    return [{
      playerId: entry.playerId,
      playerName: playerName(entry.player),
      opponentId,
      opponentName: playerName(opponent.player),
      handicapGap: handicapGap == null ? null : Math.round(handicapGap * 10) / 10,
      recentNet: leftRecent,
      opponentRecentNet: rightRecent,
      history: history ?? null,
      courseEdge:
        leftCourse && rightCourse
          ? Math.round((leftCourse.avgNet - rightCourse.avgNet) * 10) / 10
          : null,
      courseSamples: (leftCourse?.rounds ?? 0) + (rightCourse?.rounds ?? 0),
      closeness,
    }];
  }).sort((left, right) => left.closeness - right.closeness);

  const processedTeams = new Set<string>();
  const teamMatchups = (nextEvent.flights ?? []).flatMap((flight) => {
    const teams = flight.teams ?? [];
    if (teams.length < 2) return [];
    const left = teams.find((team) => team.opponentId) ?? teams[0];
    const right = teams.find((team) =>
      left.opponentId ? team.teamId === left.opponentId : team.teamId !== left.teamId,
    );
    if (!right) return [];
    const key = [left.teamId, right.teamId].sort((a, b) => a - b).join(":");
    if (processedTeams.has(key)) return [];
    processedTeams.add(key);
    return [{
      teamId: left.teamId,
      teamName: left.team?.name ?? `Team ${left.teamId}`,
      opponentId: right.teamId,
      opponentName: right.team?.name ?? `Team ${right.teamId}`,
      pointsGap: Math.round(
        Math.abs(Number(left.team?.seasonPoints || 0) - Number(right.team?.seasonPoints || 0)) * 10,
      ) / 10,
    }];
  });

  return {
    event: nextEvent,
    playerMatchups,
    teamMatchups,
    closest: playerMatchups[0] ?? null,
    assignmentsReady: playerMatchups.length > 0 || teamMatchups.length > 0,
  };
}
