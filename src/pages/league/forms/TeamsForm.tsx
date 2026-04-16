import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ShieldHalf, SquarePen, Trash2, Users, X } from "lucide-react";

import { Input, MultiSelect } from "@/components/form";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/context/ToastContext";

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
  const { show } = useToast();
  const { watch, setValue } = useFormContext();
  const players = watch("players") || [];

  const rawTeams = watch("teams") || [];
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
      <PageHeader
        title="Create Teams"
        subTitle="Create teams, assign available players, and edit/remove teams before building flights."
        icon={<ShieldHalf size={14} />}
        iconText="TEAMS"
      />

      <Card className="p-2! border bg-base-100/90 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-2">
          <Input
            label="Team Name"
            placeholder="Enter team name"
            value={draft.name}
            onChange={(e) => {
              setDraft((prev) => ({ ...prev, name: e.target.value }));
              if (teamNameError) setTeamNameError("");
            }}
            error={teamNameError}
            className="w-full xl:w-1/4"
          />

          <div className="w-full lg:w-1/2">
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

          <div className="flex gap-2 xl:mb-1">
            <button type="button" onClick={handleSaveTeam} className="btn btn-md">
              {isEditing ? "Update Team" : "Add Team"}
            </button>
            <button type="button" onClick={resetDraft} className="btn btn-md btn-secondary">
              Reset
            </button>
          </div>
        </div>
      </Card>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 mt-10 justify-center text-base-content/60">
          <Users size={18} />
          <p className="text-sm">No teams created yet. Please create a team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-auto">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border border-base-300/80 rounded-lg w-full bg-base-100 shadow-xs"
            >
              <div className="flex justify-between items-center bg-primary p-2 rounded-t-lg text-white">
                <span className="font-semibold text-sm">{team.name}</span>
                <div className="flex items-center gap-2">
                  <SquarePen
                    size={14}
                    onClick={() => handleEditTeam(team)}
                    className="cursor-pointer text-blue-400"
                  />
                  <Trash2
                    size={14}
                    onClick={() => handleDeleteTeam(team.id)}
                    className="cursor-pointer text-red-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5 p-2">
                {team.players.map((playerId) => {
                  const player = getPlayerById(Number(playerId));
                  if (!player) return null;

                  return (
                    <div
                      key={`${team.id}-${player.id}`}
                      className="border  rounded-lg px-2 py-1 w-full text-sm flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-primary text-xs">
                          {player.firstName} {player.lastName}
                        </span>
                        <span className="text-[10px] text-primary/80">
                          HCP: {player.handicap ?? "-"}
                        </span>
                      </div>
                      <X
                        size={14}
                        onClick={() => removePlayerFromTeam(team.id, Number(player.id))}
                        className="cursor-pointer text-red-400"
                      />
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
