import type { ScheduleFlight } from "./multiSeriesSchedule";

export type TeamLineup = { teamId: number; playerIds: number[] };
export type LineupTeam = { id: number; name: string; players: Array<number | { id: number }> };
export type LineupPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  type?: string | null;
};

export const scheduledTeamIds = (flights: ScheduleFlight[]) =>
  new Set(flights.flatMap((flight) => (flight as number[]).map(Number)));

export const initialRoundLineups = (
  flights: ScheduleFlight[],
  teams: LineupTeam[],
  template: TeamLineup[],
  requiredPlayers: number,
): TeamLineup[] => {
  const scheduled = scheduledTeamIds(flights);
  return teams.filter((team) => scheduled.has(Number(team.id))).map((team) => {
    const rosterIds = team.players.map((player) => Number(typeof player === "number" ? player : player.id));
    const templateIds = template.find((lineup) => Number(lineup.teamId) === Number(team.id))?.playerIds;
    return {
      teamId: Number(team.id),
      playerIds: templateIds?.length === requiredPlayers
        ? [...templateIds]
        : rosterIds.length === requiredPlayers
          ? rosterIds
          : [],
    };
  });
};

export const roundLineupError = (
  flights: ScheduleFlight[],
  teams: LineupTeam[],
  players: LineupPlayer[],
  lineups: TeamLineup[],
  requiredPlayers: number,
) => {
  const byId = new Map(teams.map((team) => [Number(team.id), team]));
  const playersById = new Map(players.map((player) => [Number(player.id), player]));
  const used = new Set<number>();
  for (const teamId of scheduledTeamIds(flights)) {
    const team = byId.get(teamId);
    if (!team) return `Team ${teamId} is no longer available.`;
    const selected = lineups.find((lineup) => Number(lineup.teamId) === teamId)?.playerIds ?? [];
    if (selected.length !== requiredPlayers || new Set(selected).size !== requiredPlayers) {
      return `${team.name} must have exactly ${requiredPlayers} selected players.`;
    }
    const roster = new Set(team.players.map((player) => Number(typeof player === "number" ? player : player.id)));
    for (const playerId of selected) {
      const player = playersById.get(Number(playerId));
      const type = String(player?.type || "").toLowerCase();
      if (!player || (!roster.has(Number(playerId)) && type !== "sub" && type !== "substitute")) {
        return `${team.name} has an ineligible player selected.`;
      }
      if (used.has(Number(playerId))) return "A golfer cannot play for more than one team in the same event.";
      used.add(Number(playerId));
    }
  }
  return null;
};
