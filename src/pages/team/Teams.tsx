import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import LoadingState from "@/components/layout/LoadingState";
import Button from "@/components/layout/Button";
import { Input, MultiSelect } from "@/components/form";
import SurfaceCard from "@/components/layout/SurfaceCard";
import Modal from "@/components/layout/Modal";
import { useToast } from "@/context/useToast";
import { useAppStore } from "@/stores/appStore";
import { useLeague } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useCreateTeam, useDeleteTeam, useUpdateTeam } from "@api/teams/mutations";
import { Plus, ShieldHalf, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { formatHandicap } from "@/utils/handicap";
import TeamDirectoryCard, {
  type TeamDirectoryItem as TeamItem,
  type TeamDirectoryPlayer as TeamPlayer,
} from "./components/TeamDirectoryCard";

const EMPTY_FORM = {
  name: "",
  players: [] as number[],
};

export default function Teams() {
  const { leagueId } = useParams();
  const numericLeagueId = Number(leagueId);
  const hasValidLeagueId = Number.isFinite(numericLeagueId) && numericLeagueId > 0;
  const { user } = useAppStore();
  const role = String(user?.role || "").toUpperCase();
  const canManageTeams = role === "ADMIN" || role === "SUPER";
  const { show } = useToast();
  const { data: league, isLoading, isError, error } = useLeague(numericLeagueId, hasValidLeagueId);
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const isReadOnly = !canManageTeams;
  const teams = useMemo(
    () =>
      [...((league?.teams ?? []) as TeamItem[])].sort((left, right) =>
        String(left.name || "").localeCompare(String(right.name || ""))
      ),
    [league?.teams]
  );
  const allPlayers = useMemo(
    () =>
      [...((league?.players ?? []) as TeamPlayer[])].sort((left, right) => {
        const leftName = `${left.firstName || ""} ${left.lastName || ""}`.trim();
        const rightName = `${right.firstName || ""} ${right.lastName || ""}`.trim();
        return leftName.localeCompare(rightName);
      }),
    [league?.players]
  );

  const availablePlayerOptions = useMemo(() => {
    const assignedToOtherTeam = new Set<number>();

    for (const team of teams) {
      if (Number(team.id) === editingTeamId) continue;
      for (const player of team.players ?? []) {
        assignedToOtherTeam.add(Number(player.id));
      }
    }

    return allPlayers
      .filter(
        (player) =>
          !assignedToOtherTeam.has(Number(player.id)) || form.players.includes(Number(player.id))
      )
      .map((player) => ({
        value: Number(player.id),
        label: `${player.firstName} ${player.lastName} (HCP ${formatHandicap(player.handicap)})`,
      }));
  }, [allPlayers, editingTeamId, form.players, teams]);
  const submitting = createTeam.isPending || updateTeam.isPending;
  const validateForm = form.name.trim().length > 0;

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTeamId(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    if (isReadOnly) return;
    setIsEditMode(false);
    setEditingTeamId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (team: TeamItem) => {
    if (isReadOnly) return;
    setIsEditMode(true);
    setEditingTeamId(Number(team.id));
    setForm({
      name: String(team.name || ""),
      players: Array.isArray(team.players) ? team.players.map((player) => Number(player.id)) : [],
    });
    setIsModalOpen(true);
  };

  const onNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value }));
  };

  const onPlayersChange = (values: (string | number)[]) => {
    setForm((prev) => ({
      ...prev,
      players: values.map(Number),
    }));
  };

  const saveTeam = async () => {
    if (isReadOnly) {
      show("You do not have permission to manage teams.", "error");
      return;
    }

    if (!hasValidLeagueId) {
      show("Invalid league ID. Reload and try again.", "error");
      return;
    }

    if (!validateForm) {
      show("Please enter a team name.", "warning");
      return;
    }

    const duplicateName = teams.some(
      (team) =>
        Number(team.id) !== Number(editingTeamId) &&
        String(team.name || "")
          .trim()
          .toLowerCase() === form.name.trim().toLowerCase()
    );

    if (duplicateName) {
      show("Choose a unique team name.", "warning");
      return;
    }

    const payload = {
      name: form.name.trim(),
      players: form.players.map(Number),
      leagueId: numericLeagueId,
    };

    try {
      if (isEditMode && editingTeamId) {
        await updateTeam.mutateAsync({
          id: editingTeamId,
          data: payload,
        });
        show("Team updated", "success");
      } else {
        await createTeam.mutateAsync({
          leagueId: numericLeagueId,
          data: payload,
        });
        show("Team added", "success");
      }

      resetAndCloseModal();
    } catch (error) {
      show(getApiErrorMessage(error, "Unable to save team."), "error");
    }
  };

  const removeTeam = async (team: TeamItem) => {
    if (isReadOnly) {
      show("You do not have permission to manage teams.", "error");
      return;
    }

    if (!hasValidLeagueId) {
      show("Invalid league ID. Reload and try again.", "error");
      return;
    }

    const isConfirmed = window.confirm(
      `Soft remove ${team.name}? Current player assignments will be cleared.`
    );
    if (!isConfirmed) return;

    try {
      await deleteTeam.mutateAsync({ id: Number(team.id), leagueId: numericLeagueId });
      show("Team removed", "success");
    } catch (error) {
      show(getApiErrorMessage(error, "Unable to remove team."), "error");
    }
  };

  if (!hasValidLeagueId) {
    return (
      <PageState
        title="Invalid League"
        message="The teams page could not be loaded because the league ID is invalid."
        variant="error"
      />
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "League Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load Teams"
        }
        message={getApiErrorMessage(error, "The teams page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
      />
    );
  }

  if (!isLoading && !league) {
    return (
      <PageState
        title="League Not Found"
        message="The teams page could not be loaded because the league was not found."
        variant="notFound"
      />
    );
  }

  return (
    <div className="pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Teams" />
        {!isReadOnly ? (
          <Button variant="primary" onClick={openCreate} startIcon={<Plus size={14} />}>
            Add Team
          </Button>
        ) : null}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <LoadingState>Loading teams...</LoadingState>
        ) : teams.length === 0 ? (
          <SurfaceCard className="flex flex-col items-center justify-center border-dashed px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-emerald-300 shadow-sm">
              <Users size={20} strokeWidth={2} />
            </span>
            <p className="mt-4 text-sm font-black text-slate-800">No teams yet</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              {isReadOnly
                ? "Teams will appear here once the league administrator creates them."
                : "Create the first team, assign its roster, and it will be ready for event scheduling."}
            </p>
            {!isReadOnly ? (
              <Button
                variant="primary"
                className="mt-5"
                onClick={openCreate}
                startIcon={<Plus size={14} />}
              >
                Add Team
              </Button>
            ) : null}
          </SurfaceCard>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <ShieldHalf size={14} className="text-emerald-600" strokeWidth={2.5} />
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">
                Team directory
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teams.map((team) => (
                <TeamDirectoryCard
                  key={team.id}
                  team={team}
                  leagueId={numericLeagueId}
                  canManage={!isReadOnly}
                  onEdit={openEdit}
                  onRemove={removeTeam}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={isEditMode ? "Edit Team" : "Add Team"}
        onClose={resetAndCloseModal}
      >
        <div className="space-y-4">
          <Input
            label="Team Name"
            value={form.name}
            onChange={(event) => onNameChange(event.target.value)}
          />

          <MultiSelect
            label="Players"
            options={availablePlayerOptions}
            value={form.players}
            onChange={onPlayersChange}
            placeholder={availablePlayerOptions.length ? "Select players" : "No players available"}
          />

          <p className="text-[11px] text-gray-500">
            Players already assigned to other teams are excluded until removed from those rosters.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="default" onClick={resetAndCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveTeam} disabled={!validateForm || submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
