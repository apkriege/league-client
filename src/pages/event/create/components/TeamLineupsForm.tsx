import { MultiSelect, Select } from "@/components/form";
import SurfaceCard from "@/components/layout/SurfaceCard";
import { useToast } from "@/context/useToast";
import { deriveScoringMode, getRequiredTeamPlayers } from "@/features/scoring/scoringModes";
import { useLeague } from "@api/league/queries";
import { Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useParams } from "react-router";

type TeamLineup = { teamId: number; playerIds: number[] };

const playerName = (player: any) =>
  `${player?.firstName || ""} ${player?.lastName || ""}`.trim() || `Player ${player?.id}`;

export default function TeamLineupsForm() {
  const { leagueId } = useParams();
  const { data: league } = useLeague(Number(leagueId));
  const { control, getValues, setValue } = useFormContext();
  const { show } = useToast();
  const format = useWatch({ control, name: "format" });
  const scoringModeValue = useWatch({ control, name: "scoringMode" });
  const scoringMode = deriveScoringMode({ scoringMode: scoringModeValue });
  const teams = useWatch({ control, name: "teams", defaultValue: [] }) as any[];
  const rawLineups = useWatch({ control, name: "teamLineups", defaultValue: [] }) as TeamLineup[];
  const requestedCount = useWatch({ control, name: "teamPlayersPerEvent" });
  const requiredPlayers = getRequiredTeamPlayers(
    scoringMode,
    requestedCount,
    league?.teamPlayersPerEvent,
  );
  const isFixedAtTwo = scoringMode === "four-ball-match" || scoringMode === "alternate-shot";
  const countOptions = isFixedAtTwo
    ? [2]
    : scoringMode === "match-play" || scoringMode === "scramble" || scoringMode === "best-ball"
      ? [2, 3, 4]
      : [1, 2, 3, 4];

  useEffect(() => {
    if (format !== "team") return;
    if (Number(getValues("teamPlayersPerEvent")) !== requiredPlayers) {
      setValue("teamPlayersPerEvent", requiredPlayers, { shouldDirty: false });
    }
  }, [format, getValues, requiredPlayers, setValue]);

  useEffect(() => {
    if (format !== "team" || teams.length === 0) return;
    const current = new Map(rawLineups.map((lineup) => [Number(lineup.teamId), lineup.playerIds.map(Number)]));
    const next = teams.map((team) => {
      const teamId = Number(team.id);
      const rosterIds = (team.players || []).map((player: any) =>
        Number(typeof player === "object" ? player.id : player),
      );
      const selected = current.get(teamId);
      return {
        teamId,
        playerIds: selected
          ? selected.slice(0, requiredPlayers)
          : rosterIds.length === requiredPlayers
            ? rosterIds
            : [],
      };
    });
    if (JSON.stringify(next) !== JSON.stringify(rawLineups)) {
      setValue("teamLineups", next, { shouldDirty: rawLineups.length > 0 });
    }
  }, [format, rawLineups, requiredPlayers, setValue, teams]);

  const allPlayers = useMemo(() => Array.isArray(league?.players) ? league.players : [], [league]);
  const selectedByOtherTeams = (teamId: number) => new Set(
    rawLineups
      .filter((lineup) => Number(lineup.teamId) !== teamId)
      .flatMap((lineup) => lineup.playerIds.map(Number)),
  );

  if (format !== "team") return null;

  return (
    <SurfaceCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-950 text-emerald-300">
              <Users size={14} />
            </span>
            <h3 className="text-sm font-black text-slate-900">Event lineups</h3>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Select exactly {requiredPlayers} golfers for each team. Substitutes apply only to this event.
          </p>
        </div>
        <div className="w-52">
          <Select
            label="Golfers playing per team"
            value={requiredPlayers}
            options={countOptions.map((value) => ({ value, label: String(value) }))}
            onChange={(event) => {
              setValue("teamPlayersPerEvent", Number(event.target.value), { shouldDirty: true });
            }}
          />
          {isFixedAtTwo ? (
            <p className="mt-1 text-[10px] text-slate-500">This scoring format always requires two.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {teams.map((team) => {
          const teamId = Number(team.id);
          const rosterIds = new Set(
            (team.players || []).map((player: any) => Number(typeof player === "object" ? player.id : player)),
          );
          const blocked = selectedByOtherTeams(teamId);
          const eligible = allPlayers.filter((player: any) => {
            const type = String(player.type || "").toLowerCase();
            return (rosterIds.has(Number(player.id)) || type === "sub" || type === "substitute") &&
              !blocked.has(Number(player.id));
          });
          const lineup = rawLineups.find((entry) => Number(entry.teamId) === teamId);
          const selected = lineup?.playerIds ?? [];
          return (
            <div key={teamId} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">{team.name}</p>
                <span className={`text-xs font-bold ${selected.length === requiredPlayers ? "text-emerald-700" : "text-amber-700"}`}>
                  {selected.length} / {requiredPlayers}
                </span>
              </div>
              <MultiSelect
                label="Playing this event"
                variant="dropdown"
                value={selected}
                options={eligible.map((player: any) => {
                  const type = String(player.type || "").toLowerCase();
                  const suffix = type === "sub" || type === "substitute" ? " · Substitute" : "";
                  return { value: Number(player.id), label: `${playerName(player)}${suffix}` };
                })}
                onChange={(values) => {
                  const playerIds = values.map(Number);
                  if (playerIds.length > requiredPlayers) {
                    show(`Select exactly ${requiredPlayers} golfers for ${team.name}.`, "warning");
                    return;
                  }
                  const next = rawLineups.filter((entry) => Number(entry.teamId) !== teamId);
                  setValue("teamLineups", [...next, { teamId, playerIds }], { shouldDirty: true });
                }}
              />
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
