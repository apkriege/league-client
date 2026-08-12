import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Modal from "@/components/layout/Modal";
import Button from "@/components/layout/Button";
import { Input, Select } from "@/components/form";
import { useToast } from "@/context/ToastContext";
import { formatPhone } from "@/utils/format";
import { useLeague } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useCreatePlayers, useDeletePlayer, useUpdatePlayer } from "@api/players/mutations";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { useStripeState } from "@api/payments/queries";
import { useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import Table from "@/components/Table";
import { useAppStore } from "@/stores/appStore";
import Chip from "@mui/material/Chip";
import Divider from "@/components/layout/Divider";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: "player",
  gender: "",
  handicap: "",
};

const pendingPlayerKey = (leagueId: number) => `league-night:pending-player:${leagueId}`;

type PlayerForm = typeof EMPTY_FORM;
type PendingPlayerCheckout = {
  form?: PlayerForm;
  isEditMode?: boolean;
  editingPlayerId?: number | null;
  players?: PlayerForm[];
};

const normalizePlayerForm = (playerForm: PlayerForm) => ({
  firstName: playerForm.firstName.trim(),
  lastName: playerForm.lastName.trim(),
  email: playerForm.email.trim() || null,
  phone: playerForm.phone.trim() || null,
  type:
    String(playerForm.type || "player").toLowerCase() === "sub"
      ? "substitute"
      : String(playerForm.type || "player").toLowerCase(),
  gender: playerForm.gender,
  handicap: Number(playerForm.handicap),
});

const getMissingRequiredFields = (form: typeof EMPTY_FORM) => {
  const missing: string[] = [];
  const handicapNum = Number(form.handicap);

  if (!form.firstName.trim()) missing.push("first name");
  if (!form.lastName.trim()) missing.push("last name");
  if (!['male', 'female'].includes(form.gender)) missing.push("gender");
  if (!form.handicap.trim() || !Number.isFinite(handicapNum)) missing.push("handicap");

  return missing;
};

export default function Players() {
  const { user } = useAppStore();
  const role = String(user?.role || "").toUpperCase();
  const canManagePlayers = role === "ADMIN" || role === "SUPER";
  const { show } = useToast();
  const { leagueId } = useParams();
  const numericLeagueId = Number(leagueId);
  const { data: league, isLoading, isError, error } = useLeague(numericLeagueId);
  const createPlayers = useCreatePlayers();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const createCheckoutSession = useCreateCheckoutSession();
  const { refetch: reconcileStripePayment } = useStripeState(false);
  const queryClient = useQueryClient();
  const checkoutHandled = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingPlayers, setPendingPlayers] = useState<(typeof EMPTY_FORM)[]>([]);

  useEffect(() => {
    if (checkoutHandled.current || !numericLeagueId) return;
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    if (checkoutStatus !== "capacity_success" && checkoutStatus !== "capacity_cancel") return;
    checkoutHandled.current = true;

    const pendingPlayer = window.localStorage.getItem(pendingPlayerKey(numericLeagueId));
    let pendingCheckout: PendingPlayerCheckout | null = null;
    try {
      pendingCheckout = pendingPlayer ? JSON.parse(pendingPlayer) : null;
    } catch {
      window.localStorage.removeItem(pendingPlayerKey(numericLeagueId));
    }

    const restorePendingPlayers = () => {
      if (!pendingCheckout) return;
      setForm({ ...EMPTY_FORM, ...(pendingCheckout.form || {}) });
      setIsEditMode(Boolean(pendingCheckout.isEditMode));
      setEditingPlayerId(
        pendingCheckout.editingPlayerId ? Number(pendingCheckout.editingPlayerId) : null
      );
      setPendingPlayers(Array.isArray(pendingCheckout.players) ? pendingCheckout.players : []);
      setIsModalOpen(true);
    };

    const finishReturn = async () => {
      if (checkoutStatus === "capacity_success") {
        const result = await reconcileStripePayment();
        if (result.isError || !pendingCheckout) {
          restorePendingPlayers();
          show(
            "Payment completed, but the players could not be saved automatically. Please try again.",
            "warning"
          );
        } else {
          try {
            await queryClient.invalidateQueries({ queryKey: ["league", numericLeagueId] });
            if (pendingCheckout.isEditMode && pendingCheckout.editingPlayerId) {
              await updatePlayer.mutateAsync({
                id: Number(pendingCheckout.editingPlayerId),
                data: normalizePlayerForm({ ...EMPTY_FORM, ...(pendingCheckout.form || {}) }),
              });
              show("Payment completed and player updated.", "success");
            } else {
              const players = Array.isArray(pendingCheckout.players)
                ? pendingCheckout.players.map(normalizePlayerForm)
                : [];
              if (players.length === 0) throw new Error("No pending players were found");
              await createPlayers.mutateAsync({ leagueId: numericLeagueId, players });
              show(
                `Payment completed and ${players.length} ${players.length === 1 ? "player was" : "players were"} added.`,
                "success"
              );
            }
            window.localStorage.removeItem(pendingPlayerKey(numericLeagueId));
            setForm(EMPTY_FORM);
            setPendingPlayers([]);
            setIsEditMode(false);
            setEditingPlayerId(null);
            setIsModalOpen(false);
          } catch (saveError) {
            console.error(saveError);
            restorePendingPlayers();
            show(
              getApiErrorMessage(
                saveError,
                "Payment completed, but the players could not be saved automatically."
              ),
              "error"
            );
          }
        }
      } else {
        restorePendingPlayers();
        show("Additional-player checkout was canceled.", "warning");
      }

      params.delete("checkout");
      const query = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
      );
    };

    void finishReturn();
  }, [createPlayers, numericLeagueId, queryClient, reconcileStripePayment, show, updatePlayer]);

  if (isLoading) {
    return <div>Loading...</div>;
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
              : "Unable to Load Players"
        }
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

  const submitting =
    createPlayers.isPending || updatePlayer.isPending || createCheckoutSession.isPending;

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPlayerId(null);
    setForm(EMPTY_FORM);
    setPendingPlayers([]);
    window.localStorage.removeItem(pendingPlayerKey(numericLeagueId));
  };

  const openCreate = () => {
    setIsEditMode(false);
    setEditingPlayerId(null);
    setForm(EMPTY_FORM);
    setPendingPlayers([]);
    setIsModalOpen(true);
  };

  const openEdit = (player: any) => {
    setIsEditMode(true);
    setPendingPlayers([]);
    setEditingPlayerId(Number(player.id));
    setForm({
      firstName: player.firstName || "",
      lastName: player.lastName || "",
      email: player.email || "",
      phone: player.phone || "",
      type:
        String(player.type || "player").toLowerCase() === "substitute"
          ? "sub"
          : String(player.type || "player"),
      gender: String(player.gender || "male").toLowerCase(),
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

  const missingRequiredFields = getMissingRequiredFields(form);
  const validateForm = missingRequiredFields.length === 0;
  const hasCurrentPlayer = [
    form.firstName,
    form.lastName,
    form.email,
    form.phone,
    form.gender,
    form.handicap,
  ].some((value) => value.trim() !== "");

  const addPlayerToBatch = () => {
    if (!validateForm) {
      show(`Required: ${missingRequiredFields.join(", ")}.`, "warning");
      return;
    }
    setPendingPlayers((players) => [...players, { ...form }]);
    setForm(EMPTY_FORM);
  };

  const savePlayer = async () => {
    try {
      const regularPlayerCount = league.players.filter(
        (player: any) => player.type === "player"
      ).length;
      const paidCapacity = Math.max(0, Number(league.numPlayers || 0));

      if (isEditMode && editingPlayerId) {
        if (!validateForm) {
          show(`Required: ${missingRequiredFields.join(", ")}.`, "warning");
          return;
        }
        const payload = normalizePlayerForm(form);
        const existingPlayer = league.players.find(
          (player: any) => Number(player.id) === editingPlayerId
        );
        const addsRegularPlayer = payload.type === "player" && existingPlayer?.type !== "player";
        if (addsRegularPlayer && regularPlayerCount >= paidCapacity) {
          window.localStorage.setItem(
            pendingPlayerKey(numericLeagueId),
            JSON.stringify({ form, isEditMode, editingPlayerId, players: [] })
          );
          const checkout = await createCheckoutSession.mutateAsync({
            purpose: "league_capacity",
            leagueId: numericLeagueId,
            requestedGolfers: Math.max(paidCapacity, regularPlayerCount) + 1,
            successUrl: `${window.location.origin}/league/${numericLeagueId}/players?checkout=capacity_success`,
            cancelUrl: `${window.location.origin}/league/${numericLeagueId}/players?checkout=capacity_cancel`,
          });
          if (!checkout.alreadyCovered) {
            if (!checkout.url) throw new Error("Could not start additional-player checkout.");
            window.location.href = checkout.url;
            return;
          }
        }
        await updatePlayer.mutateAsync({
          id: editingPlayerId,
          data: payload,
        });
        show("Player updated", "success");
      } else {
        if (hasCurrentPlayer && !validateForm) {
          show(`Required: ${missingRequiredFields.join(", ")}.`, "warning");
          return;
        }
        const playerForms = [...pendingPlayers, ...(hasCurrentPlayer ? [{ ...form }] : [])];
        if (playerForms.length === 0) {
          show("Add at least one player.", "warning");
          return;
        }
        const payloads = playerForms.map(normalizePlayerForm);
        const incomingRegularPlayers = payloads.filter((player) => player.type === "player").length;
        const additionalRegularPlayers = Math.max(
          0,
          regularPlayerCount + incomingRegularPlayers - paidCapacity
        );
        if (additionalRegularPlayers > 0) {
          window.localStorage.setItem(
            pendingPlayerKey(numericLeagueId),
            JSON.stringify({
              form: EMPTY_FORM,
              isEditMode: false,
              editingPlayerId: null,
              players: playerForms,
            })
          );
          const checkout = await createCheckoutSession.mutateAsync({
            purpose: "league_capacity",
            leagueId: numericLeagueId,
            requestedGolfers: paidCapacity + additionalRegularPlayers,
            successUrl: `${window.location.origin}/league/${numericLeagueId}/players?checkout=capacity_success`,
            cancelUrl: `${window.location.origin}/league/${numericLeagueId}/players?checkout=capacity_cancel`,
          });
          if (!checkout.alreadyCovered) {
            if (!checkout.url) throw new Error("Could not start additional-player checkout.");
            window.location.href = checkout.url;
            return;
          }
        }
        await createPlayers.mutateAsync({
          leagueId: numericLeagueId,
          players: payloads,
        });
        show(`${payloads.length} ${payloads.length === 1 ? "player" : "players"} added`, "success");
      }
      resetAndCloseModal();
    } catch (error) {
      console.error(error);
      show(getApiErrorMessage(error, "Unable to save player."), "error");
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

  const columns: any = [
    {
      key: "firstName",
      label: "Name",
      width: "65%",
      render: (_value: any, row: any) => (
        <Link
          to={`/league/${leagueId}/player/${row.id}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-slate-900 text-white rounded-lg w-7 h-7 flex items-center justify-center text-xs uppercase">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 mb-0">
              {row.firstName} {row.lastName}
            </p>
            {(row.email || row.phone) && (
              <p className="font-light text-[10px] text-gray-500 flex items-center gap-1.5">
                {row.email && <span>{row.email}</span>}
                {row.email && row.phone && <span>/</span>}
                {row.phone && <span>{formatPhone(row.phone)}</span>}
              </p>
            )}
          </div>
        </Link>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: any) => (
        <Chip
          label={value.toUpperCase()}
          color={value === "player" ? "secondary" : "primary"}
          size="small"
          sx={{ height: 24, fontSize: "0.5625rem" }}
        />
      ),
    },
    {
      key: "handicap",
      label: "HCP",
      render: (value: any) => <p className="text-xs font-bold">{value}</p>,
    },
    {
      key: "gender",
      label: "Gender",
      render: (value: any) => (
        <p className="text-xs font-semibold capitalize">{value || "male"}</p>
      ),
    },
  ];

  if (canManagePlayers) {
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
      />

      <div className="mt-5">
        <Table
          heading={`Total Players: ${league.players.length}`}
          data={p}
          columns={columns}
          size="sm"
          headerActions={
            canManagePlayers ? (
              <Button variant="primary" onClick={openCreate}>
                Add Player
              </Button>
            ) : null
          }
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title={isEditMode ? "Edit Player" : "Add Players"}
        onClose={resetAndCloseModal}
      >
        <div className="grid grid-cols-2 gap-y-2 gap-x-3">
          <Input
            label="First Name"
            value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
          <Input
            label="Last Name"
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
          <Input
            label="Email (optional)"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
          <Select
            label="Type"
            value={form.type}
            placeholder="Select type"
            options={[
              { value: "player", label: "Player" },
              { value: "sub", label: "Sub" },
            ]}
            onChange={(e) => onChange("type", e.target.value)}
          />
          <Select
            label="Gender"
            value={form.gender}
            placeholder="Select gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            onChange={(e) => onChange("gender", e.target.value)}
          />
          <Input
            label="Handicap"
            type="number"
            step="0.1"
            value={form.handicap}
            onChange={(e) => onChange("handicap", e.target.value)}
          />
        </div>

        {!isEditMode && (
          <div className="mt-4">
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={addPlayerToBatch}
                disabled={!validateForm || submitting}
              >
                Add Player
              </Button>
            </div>
            {pendingPlayers.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                {pendingPlayers.map((player, index) => (
                  <div
                    key={`${player.firstName}-${player.lastName}-${index}`}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {player.type === "sub" ? "Substitute" : "Regular player"} ·{" "}
                        {player.gender === "female" ? "Women’s" : "Men’s"} ratings · HCP{" "}
                        {player.handicap}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${player.firstName} ${player.lastName}`}
                      className="text-red-500 hover:text-red-700"
                      onClick={() =>
                        setPendingPlayers((players) =>
                          players.filter((_player, playerIndex) => playerIndex !== index)
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <Divider className="my-2!" />
        <div className="flex items-center justify-end gap-2">
          <Button variant="default" onClick={resetAndCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={savePlayer}
            disabled={
              submitting ||
              (isEditMode ? !validateForm : pendingPlayers.length === 0 && !validateForm)
            }
          >
            {submitting
              ? "Saving..."
              : isEditMode
                ? "Save"
                : `Save ${pendingPlayers.length + (validateForm ? 1 : 0)} ${pendingPlayers.length + (validateForm ? 1 : 0) === 1 ? "Player" : "Players"}`}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
