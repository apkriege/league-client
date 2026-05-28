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
        title="Build Teams"
        subTitle="Create teams, assign available players, and edit or remove teams before proceeding."
        icon={<ShieldHalf size={14} />}
        iconText="TEAMS"
      />

      <Card className="mt-6 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          {isEditing ? "Edit Team" : "Add Team"}
        </p>
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

          <div className="flex gap-2 shrink-0">
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveTeam} className="btn btn-md btn-primary">
                {isEditing ? "Update Team" : "Add Team"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetDraft}
                  className="btn btn-md btn-ghost border border-base-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 mt-12 justify-center text-base-content/40">
          <div className="bg-base-200 p-4 rounded-full">
            <Users size={22} />
          </div>
          <p className="text-sm font-medium">No teams yet</p>
          <p className="text-xs text-gray-400">Use the form above to create your first team.</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Teams · {teams.length}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-auto pb-1">
            {teams.map((team) => (
              <div
                key={team.id}
                className="border border-base-300 rounded-xl w-full bg-base-100 shadow-xs overflow-hidden"
              >
                <div className="flex justify-between items-center px-3 py-2 border-b border-base-300 bg-base-200/60">
                  <div className="flex items-center gap-2">
                    <ShieldHalf size={13} className="text-primary/60" />
                    <span className="font-semibold text-sm text-primary">{team.name}</span>
                    <span className="text-[10px] text-gray-400">· {team.players.length}p</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditTeam(team)}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      <SquarePen size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1 p-2">
                  {team.players.map((playerId) => {
                    const player = getPlayerById(Number(playerId));
                    if (!player) return null;

                    return (
                      <div
                        key={`${team.id}-${player.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 bg-base-200/60 hover:bg-base-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="bg-primary text-primary-content rounded-md w-6 h-6 flex items-center justify-center text-[9px] uppercase shrink-0">
                            {player.firstName[0]}
                            {player.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-primary truncate">
                              {player.firstName} {player.lastName}
                            </p>
                            <p className="text-[9px] text-gray-400">HCP {player.handicap ?? "-"}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePlayerFromTeam(team.id, Number(player.id))}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
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
        </>
      )}
    </div>
  );
}
