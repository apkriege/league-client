import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Button from "@/components/layout/Button";
import { Input, MultiSelect } from "@/components/form";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import Modal from "@/components/layout/Modal";
import { useToast } from "@/context/useToast";
import { useAppStore } from "@/stores/appStore";
import { useLeague } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useCreateTeam, useDeleteTeam, useUpdateTeam } from "@api/teams/mutations";
import { ShieldHalf, SquarePen, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { formatHandicap } from "@/utils/handicap";

type TeamPlayer = {
  id: number | string;
  firstName?: string | null;
  lastName?: string | null;
  handicap?: number | null;
};

type TeamItem = {
  id: number | string;
  name?: string | null;
  players?: TeamPlayer[];
};

const TEAM_COLOR = {
  header: "bg-gray-50 border-gray-100",
  icon: "text-gray-400",
  badge: "bg-white text-gray-500 border border-gray-200",
  avatar: "bg-slate-900/10 text-slate-900",
};

const EMPTY_FORM = {
  name: "",
  players: [] as number[],
};

export default function Teams() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
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
      await deleteTeam.mutateAsync({ id: Number(team.id), leagueId: numericLeagueId } as any);
      show("Team removed", "success");
    } catch (error) {
      show(getApiErrorMessage(error, "Unable to remove team."), "error");
    }
  };

  const getInitials = (player: TeamPlayer) => {
    const firstInitial = (player.firstName || "").trim().charAt(0);
    const lastInitial = (player.lastName || "").trim().charAt(0);
    return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
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
    <div>
      <PageHeader
        title="Teams"
        subTitle="Manage team rosters for this league"
      />

      <div className="mt-2">
        {isLoading ? (
          <div className="flex items-center justify-center text-gray-400 text-sm">
            Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <Users size={36} strokeWidth={1.5} className="mb-3 opacity-40" />
            <p className="font-medium text-gray-500">No teams yet</p>
            <p className="text-sm mt-1">
              {isReadOnly
                ? "Teams will appear here once created."
                : "Create a team to get started."}
            </p>
            {!isReadOnly && (
              <Button variant="primary" className="mt-4" onClick={openCreate}>
                Add Team
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between mb-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {teams.length} {teams.length === 1 ? "Team" : "Teams"}
              </h2>
              {!isReadOnly && (
                <div className="flex justify-end">
                  <Button variant="primary" size="xs" onClick={openCreate}>
                    Add Team
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {teams.map((team) => {
                const color = TEAM_COLOR;
                return (
                  <SurfaceCard
                    key={team.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/league/${numericLeagueId}/team/${team.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/league/${numericLeagueId}/team/${team.id}`);
                      }
                    }}
                    className="cursor-pointer transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/10"
                  >
                    <PanelBar className={`border-b ${color.header}`}>
                      <ShieldHalf size={14} className={color.icon} strokeWidth={2} />
                      <h3 className="text-sm font-semibold text-gray-800">{team.name}</h3>
                      <span
                        className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${color.badge}`}
                      >
                        {team.players?.length ?? 0} players
                      </span>
                      {!isReadOnly ? (
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            type="button"
                            className="rounded-md p-1 text-blue-400 transition hover:bg-blue-50 hover:text-blue-700"
                            aria-label={`Edit ${team.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              openEdit(team);
                            }}
                          >
                            <SquarePen size={14} />
                          </button>
                          <button
                            type="button"
                            className="rounded-md p-1 text-red-400 transition hover:bg-red-50 hover:text-red-700"
                            aria-label={`Remove ${team.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeTeam(team);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : null}
                    </PanelBar>
                    <div className="px-4 py-3 flex flex-col gap-2.5">
                      {team.players?.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No players assigned</p>
                      )}
                      {[...(team.players ?? [])]
                        .sort((left, right) => {
                          const leftName = `${left.firstName || ""} ${left.lastName || ""}`.trim();
                          const rightName =
                            `${right.firstName || ""} ${right.lastName || ""}`.trim();
                          return leftName.localeCompare(rightName);
                        })
                        .map((player) => (
                          <div key={player.id} className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold uppercase shrink-0 ${color.avatar}`}
                            >
                              {getInitials(player)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">
                                {`${player.firstName || ""} ${player.lastName || ""}`.trim() ||
                                  "Unnamed player"}
                              </p>
                              {player.handicap != null && (
                                <p className="text-[10px] text-gray-400">
                                  HCP {formatHandicap(player.handicap)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </SurfaceCard>
                );
              })}
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
          <Button
            variant="primary"
            onClick={saveTeam}
            disabled={!validateForm || submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
