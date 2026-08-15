import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useParams } from "react-router";
import { SquarePen, Trash2, Users, X } from "lucide-react";

import { Input, MultiSelect } from "@/components/form";
import Card from "@/components/layout/Card";
import { useToast } from "@/context/useToast";
import { useLeaguePlayers } from "@api/league/queries";
import Button from "@/components/layout/Button";

type Team = {
  id: number;
  name: string;
  players: number[];
};

type Draft = {
  id: number;
  name: string;
  players: number[];
};

const emptyDraft: Draft = {
  id: 0,
  name: "",
  players: [],
};

const normalizeTeam = (team: any): Team => ({
  id: Number(team.id),
  name: String(team.name || ""),
  players: Array.isArray(team.players) ? team.players.map(Number) : [],
});

export default function TeamsForm() {
  const { leagueId } = useParams();
  const { show } = useToast();
  const { control, setValue } = useFormContext();
  const { data: players = [] } = useLeaguePlayers(Number(leagueId));

  const rawTeams = useWatch({ control, name: "teams", defaultValue: [] });
  const rawFlights = useWatch({ control, name: "flights", defaultValue: [] });
  const teams: Team[] = useMemo(() => rawTeams.map(normalizeTeam), [rawTeams]);

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [teamNameError, setTeamNameError] = useState("");

  const isEditing = draft.id !== 0;

  const selectedDraftPlayerIds = useMemo(() => new Set(draft.players.map(Number)), [draft.players]);

  const assignedOutsideDraft = useMemo(() => {
    const ids = new Set<number>();

    for (const team of teams) {
      if (isEditing && team.id === draft.id) continue;
      for (const playerId of team.players) ids.add(Number(playerId));
    }

    return ids;
  }, [teams, isEditing, draft.id]);

  const availablePlayers = useMemo(
    () =>
      players.filter(
        (p: any) =>
          !assignedOutsideDraft.has(Number(p.id)) || selectedDraftPlayerIds.has(Number(p.id))
      ),
    [players, assignedOutsideDraft, selectedDraftPlayerIds]
  );

  const playerOptions = useMemo(
    () =>
      availablePlayers
        .map((p: any) => ({
          value: Number(p.id),
          label: `${p.firstName} ${p.lastName} (HCP ${p.handicap ?? "-"})`,
        }))
        .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label)),
    [availablePlayers]
  );

  const remainingCount = useMemo(() => {
    const assignedIds = new Set<number>(teams.flatMap((team) => team.players.map(Number)));
    return players.filter((p: any) => !assignedIds.has(Number(p.id))).length;
  }, [teams, players]);

  const resetDraft = () => {
    setDraft(emptyDraft);
    setTeamNameError("");
  };

  const getNextTeamId = () => {
    const existing = new Set(teams.map((team) => Number(team.id)));
    let id = Date.now();
    while (existing.has(id)) id += 1;
    return id;
  };

  const syncFlightsForTeams = (nextTeams: Team[]) => {
    const validTeamIds = new Set(nextTeams.map((team) => team.id));
    const nextFlights = (Array.isArray(rawFlights) ? rawFlights : []).filter((flight: any) => {
      if (!Array.isArray(flight)) return false;
      return flight.every((teamId: any) => validTeamIds.has(Number(teamId)));
    });

    if (nextFlights.length !== (Array.isArray(rawFlights) ? rawFlights.length : 0)) {
      setValue("flights", nextFlights, { shouldDirty: true });
    }
  };

  const validateDraft = () => {
    const name = draft.name.trim();

    if (!name) {
      setTeamNameError("Team name is required");
      show("Please enter a team name.", "error");
      return false;
    }

    if (draft.players.length === 0) {
      show("Please select at least one player.", "error");
      return false;
    }

    const duplicateName = teams.some(
      (team) => team.id !== draft.id && team.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicateName) {
      setTeamNameError("Team name already exists");
      show("Choose a unique team name.", "error");
      return false;
    }

    return true;
  };

  const handleSaveTeam = () => {
    if (!validateDraft()) return;

    const payload: Team = {
      id: isEditing ? draft.id : getNextTeamId(),
      name: draft.name.trim(),
      players: draft.players.map(Number),
    };

    const nextTeams = isEditing
      ? teams.map((team) => (team.id === draft.id ? payload : team))
      : [...teams, payload];

    setValue("teams", nextTeams, { shouldDirty: true, shouldTouch: true });
    syncFlightsForTeams(nextTeams);
    show(isEditing ? "Team updated." : "Team added.", "success");
    resetDraft();
  };

  const handleEditTeam = (team: Team) => {
    setDraft({
      id: team.id,
      name: team.name,
      players: team.players.map(Number),
    });
    setTeamNameError("");
  };

  const handleDeleteTeam = (teamId: number) => {
    const nextTeams = teams.filter((team) => team.id !== teamId);
    setValue("teams", nextTeams, { shouldDirty: true, shouldTouch: true });
    syncFlightsForTeams(nextTeams);
    if (draft.id === teamId) resetDraft();
    show("Team deleted.", "success");
  };

  const removePlayerFromTeam = (teamId: number, playerId: number) => {
    const nextTeams = teams.map((team) =>
      team.id === teamId
        ? { ...team, players: team.players.filter((id) => Number(id) !== Number(playerId)) }
        : team
    );

    setValue("teams", nextTeams, { shouldDirty: true, shouldTouch: true });
  };

  const getPlayerById = (id: number) => players.find((p: any) => Number(p.id) === Number(id));

  return (
    <div>
      <Card className="mb-4 p-2! !bg-white">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-end">
            <Input
              label="Team Name"
              placeholder="Enter team name"
              value={draft.name}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, name: e.target.value }));
                if (teamNameError) setTeamNameError("");
              }}
              error={teamNameError}
              className="w-full min-w-0"
            />

            <div className="w-full min-w-0">
              <MultiSelect
                label={`Players (${remainingCount} remaining)`}
                options={playerOptions}
                value={draft.players}
                placeholder={
                  playerOptions.length ? "Select available players" : "No players available"
                }
                onChange={(selected) => {
                  setDraft((prev) => ({
                    ...prev,
                    players: selected.map(Number),
                  }));
                }}
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:w-auto sm:min-w-[240px]">
            <Button
              type="button"
              onClick={handleSaveTeam}
              variant="primary"
              size="md"
              className="w-full min-w-0 px-3 text-center leading-tight"
            >
              {isEditing ? "Update Team" : "Add Team"}
            </Button>
            <Button
              type="button"
              onClick={resetDraft}
              variant="secondary"
              size="md"
              className="w-full min-w-0 px-3 text-center leading-tight"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 mt-10 justify-center text-slate-900/60">
          <Users size={18} />
          <p className="text-sm">No teams created yet. Please create a team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{team.name}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {team.players.length} {team.players.length === 1 ? "player" : "players"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditTeam(team)}
                    aria-label={`Edit ${team.name}`}
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    <SquarePen size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTeam(team.id)}
                    aria-label={`Delete ${team.name}`}
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5 p-2.5">
                {team.players.map((playerId) => {
                  const player = getPlayerById(Number(playerId));
                  if (!player) return null;

                  return (
                    <div
                      key={`${team.id}-${player.id}`}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-xs">
                          {player.firstName} {player.lastName}
                        </span>
                        <span className="text-[10px] text-slate-900/80">
                          HCP: {player.handicap ?? "-"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlayerFromTeam(team.id, Number(player.id))}
                        aria-label={`Remove ${player.firstName} ${player.lastName} from ${team.name}`}
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
