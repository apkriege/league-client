import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Modal from "@/components/layout/Modal";
import { useToast } from "@/context/ToastContext";
import { formatPhone } from "@/utils/format";
import { useLeague } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useCreatePlayer, useDeletePlayer, useUpdatePlayer } from "@api/players/mutations";
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import Table from "@/components/Table";
import { useAppStore } from "@/stores/appStore";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: "player",
  handicap: "0",
};

export default function Players() {
  const { user } = useAppStore();
  const { show } = useToast();
  const { leagueId } = useParams();
  const numericLeagueId = Number(leagueId);
  const { data: league, isLoading, isError, error } = useLeague(numericLeagueId);
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={status === 404 ? "League Not Found" : status === 403 ? "Access Denied" : "Unable to Load Players"}
        message={getApiErrorMessage(error, "The players page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
      />
    );
  }

  if (!league) {
    return (
      <PageState
        title="League Not Found"
        message="The players page could not be loaded because the league was not found."
        variant="notFound"
      />
    );
  }

  const p = [...league.players].sort((a: any, b: any) => {
    if (a.type === b.type) {
      return a.firstName.localeCompare(b.firstName);
    }
    return a.type === "player" ? -1 : 1;
  });

  const submitting = createPlayer.isPending || updatePlayer.isPending;

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPlayerId(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setIsEditMode(false);
    setEditingPlayerId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (player: any) => {
    setIsEditMode(true);
    setEditingPlayerId(Number(player.id));
    setForm({
      firstName: player.firstName || "",
      lastName: player.lastName || "",
      email: player.email || "",
      phone: player.phone || "",
      type: String(player.type || "player"),
      handicap:
        player.handicap != null && !Number.isNaN(Number(player.handicap))
          ? String(player.handicap)
          : "0",
    });
    setIsModalOpen(true);
  };

  const onChange = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handicapNum = Number(form.handicap);
  const validateForm =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    Number.isFinite(handicapNum);

  const savePlayer = async () => {
    if (!validateForm) {
      show("Please fill out required fields.", "warning");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      type: String(form.type || "player").toLowerCase(),
      handicap: Number(form.handicap),
    };

    try {
      if (isEditMode && editingPlayerId) {
        await updatePlayer.mutateAsync({
          id: editingPlayerId,
          data: payload,
        });
        show("Player updated", "success");
      } else {
        await createPlayer.mutateAsync({
          leagueId: numericLeagueId,
          data: {
            ...payload,
            startingHandicap: Number(form.handicap),
          },
        });
        show("Player added", "success");
      }
      resetAndCloseModal();
    } catch (error) {
      console.error(error);
      show("Unable to save player.", "error");
    }
  };

  const removePlayer = async (player: any) => {
    const confirm = window.confirm(
      `Soft remove ${player.firstName} ${player.lastName}? They can be restored manually in the database.`
    );
    if (!confirm) return;

    try {
      await deletePlayer.mutateAsync(Number(player.id));
      show("Player removed", "success");
    } catch (error) {
      console.error(error);
      show("Unable to remove player.", "error");
    }
  };

  let columns: any = [
    {
      key: "firstName",
      label: "Name",
      width: "65%",
      render: (_value: any, row: any) => (
        <Link
          to={`/league/${leagueId}/player/${row.id}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary text-primary-content rounded-lg w-7 h-7 flex items-center justify-center text-xs uppercase">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div className="">
            <p className="text-xs font-semibold text-primary mb-0">
              {row.firstName} {row.lastName}
            </p>
            <p className="font-light text-[10px] text-gray-500 flex items-center gap-1.5">
              <span>{row.email}</span>
              <span>/</span>
              <span>{formatPhone(row.phone)}</span>
            </p>
          </div>
        </Link>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: any) => (
        <div
          className={`badge badge-${value === "player" ? "secondary" : "accent"} text-[9px] rounded-xl font-semibold`}
        >
          {value.toUpperCase()}
        </div>
      ),
    },
    {
      key: "handicap",
      label: "HCP",
      render: (value: any) => <p className="text-xs font-bold">{value}</p>,
    },
  ];

  if (String(user.role).toUpperCase() !== "USER") {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <SquarePen
            size={14}
            className="cursor-pointer text-blue-400"
            onClick={() => openEdit(row)}
          />
          <Trash2
            size={16}
            className="cursor-pointer text-red-400"
            onClick={() => removePlayer(row)}
          />
        </div>
      ),
    });
  }

  return (
    <div>
      <PageHeader
        title="Players"
        subTitle="Manage your players, their profiles, and stats"
        icon={<></>}
        iconText="PLAYERS"
      />

      <div className="mt-5">
        <Table
          heading={`Total Players: ${league.players.length}`}
          data={p}
          columns={columns}
          size="sm"
          headerActions={
            String(user.role).toUpperCase() !== "USER" ? (
              <button className="btn btn-primary btn-sm" onClick={openCreate}>
                Add Player
              </button>
            ) : null
          }
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title={isEditMode ? "Edit Player" : "Add Player"}
        onClose={resetAndCloseModal}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">First Name</label>
            <input
              className="input input-sm input-bordered w-full"
              value={form.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Last Name</label>
            <input
              className="input input-sm input-bordered w-full"
              value={form.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input
              className="input input-sm input-bordered w-full"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Phone</label>
            <input
              className="input input-sm input-bordered w-full"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Type</label>
            <select
              className="select select-sm select-bordered w-full"
              value={form.type}
              onChange={(e) => onChange("type", e.target.value)}
            >
              <option value="player">Player</option>
              <option value="sub">Sub</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Handicap</label>
            <input
              type="number"
              step="0.1"
              className="input input-sm input-bordered w-full"
              value={form.handicap}
              onChange={(e) => onChange("handicap", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button className="btn btn-sm" onClick={resetAndCloseModal}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={savePlayer}
            disabled={!validateForm || submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
