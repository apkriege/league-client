import { MultiSelect } from "@/components/form";
import { useToast } from "@/context/useToast";
import type { ScheduleFlight } from "../multiSeriesSchedule";
import { scheduledTeamIds, type LineupPlayer, type LineupTeam, type TeamLineup } from "../seriesLineups";

type Props = {
  flights: ScheduleFlight[];
  teams: LineupTeam[];
  players: LineupPlayer[];
  lineups: TeamLineup[];
  requiredPlayers: number;
  onChange: (lineups: TeamLineup[]) => void;
};

export default function SeriesRoundLineups({ flights, teams, players, lineups, requiredPlayers, onChange }: Props) {
  const { show } = useToast();
  const scheduled = scheduledTeamIds(flights);
  const playingTeams = teams.filter((team) => scheduled.has(Number(team.id)));
  const ready = playingTeams.filter(
    (team) => lineups.find((lineup) => Number(lineup.teamId) === Number(team.id))?.playerIds.length === requiredPlayers,
  ).length;

  return (
    <details className="border-t border-slate-200 px-4 py-3">
      <summary className="cursor-pointer text-sm font-bold text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-500">
        Players playing · {ready}/{playingTeams.length} teams ready
      </summary>
      <p className="mt-2 text-xs text-slate-500">Select {requiredPlayers} golfers for each team playing this round. Teams with a bye do not need a lineup.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {playingTeams.map((team) => {
          const teamId = Number(team.id);
          const roster = new Set(team.players.map((player) => Number(typeof player === "number" ? player : player.id)));
          const selectedByOtherTeams = new Set(lineups.filter((lineup) => Number(lineup.teamId) !== teamId).flatMap((lineup) => lineup.playerIds));
          const selected = lineups.find((lineup) => Number(lineup.teamId) === teamId)?.playerIds ?? [];
          const options = players.filter((player) => {
            const type = String(player.type || "").toLowerCase();
            return (roster.has(Number(player.id)) || type === "sub" || type === "substitute") &&
              !selectedByOtherTeams.has(Number(player.id));
          }).map((player) => ({
            value: Number(player.id),
            label: `${player.firstName} ${player.lastName}${["sub", "substitute"].includes(String(player.type).toLowerCase()) ? " · Substitute" : ""}`,
          }));
          return (
            <div key={teamId} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{team.name}</p>
                <span className={`text-xs font-bold ${selected.length === requiredPlayers ? "text-emerald-700" : "text-amber-700"}`}>
                  {selected.length}/{requiredPlayers}
                </span>
              </div>
              <MultiSelect
                label="Playing this round"
                variant="dropdown"
                value={selected}
                options={options}
                onChange={(values) => {
                  const playerIds = values.map(Number);
                  if (playerIds.length > requiredPlayers) {
                    show(`Select exactly ${requiredPlayers} golfers for ${team.name}.`, "warning");
                    return;
                  }
                  onChange([...lineups.filter((lineup) => Number(lineup.teamId) !== teamId), { teamId, playerIds }]);
                }}
              />
            </div>
          );
        })}
      </div>
    </details>
  );
}
