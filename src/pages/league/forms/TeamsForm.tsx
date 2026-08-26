import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Users } from "lucide-react";

import { Input, MultiSelect } from "@/components/form";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import SectionKicker from "@/components/layout/SectionKicker";
import { useToast } from "@/context/useToast";
import Button from "@/components/layout/Button";
import TeamBuilderCard, {
  type TeamBuilderPlayer,
} from "@/components/league/TeamBuilderCard";
import { formatHandicap } from "@/utils/handicap";

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
  const { control, setValue } = useFormContext();
  const players = useWatch({ control, name: "players", defaultValue: [] });

  const rawTeams = useWatch({ control, name: "teams", defaultValue: [] });
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
          label: `${p.firstName} ${p.lastName} (HCP ${formatHandicap(p.handicap)})`,
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
      />

      <Card className="mt-6 mb-4">
        <SectionKicker className="mb-3">
          {isEditing ? "Edit Team" : "Add Team"}
        </SectionKicker>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(140px,1fr)_minmax(320px,3fr)_auto] lg:items-end">
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
              variant="dropdown"
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

          <div className="flex shrink-0 gap-2">
            <div className="flex gap-2">
              <Button type="button" onClick={handleSaveTeam} variant="primary" size="md">
                {isEditing ? "Update Team" : "Add Team"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  onClick={resetDraft}
                  variant="ghost"
                  outline
                  size="md"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 mt-12 justify-center text-slate-900/40">
          <div className="bg-slate-100 p-4 rounded-full">
            <Users size={22} />
          </div>
          <p className="text-sm font-medium">No teams yet</p>
          <p className="text-xs text-gray-400">Use the form above to create your first team.</p>
        </div>
      ) : (
        <>
          <SectionKicker className="mb-3">
            Teams · {teams.length}
          </SectionKicker>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamBuilderCard
                key={team.id}
                name={team.name}
                players={team.players
                  .map((playerId) => getPlayerById(Number(playerId)))
                  .filter((player): player is TeamBuilderPlayer => Boolean(player))}
                onEdit={() => handleEditTeam(team)}
                onDelete={() => handleDeleteTeam(team.id)}
                onRemovePlayer={(playerId) => removePlayerFromTeam(team.id, playerId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
