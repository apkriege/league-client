import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Modal from "@/components/layout/Modal";
import Button from "@/components/layout/Button";
import { Input, Select } from "@/components/form";
import { useToast } from "@/context/useToast";
import { formatPhone } from "@/utils/format";
import { useLeague } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { getLeagueCapacity } from "@/lib/billing";
import { useCreatePlayers, useDeletePlayer, useUpdatePlayer } from "@api/players/mutations";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { confirmCheckoutSession } from "@api/payments";
import { useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import Table from "@/components/Table";
import { useAppStore } from "@/stores/appStore";
import Chip from "@mui/material/Chip";
import Divider from "@/components/layout/Divider";
import PaymentReturnNotice from "@/features/payments/components/PaymentReturnNotice";
import {
  clearCheckoutReturnFromUrl,
  getCheckoutReturn,
} from "@/features/payments/checkoutReturn";
import {
  PaymentPipelineError,
  toPaymentPipelineError,
} from "@/features/payments/PaymentPipelineError";
import { getHandicapHoleCount } from "@/features/leagues/leagueHoleFormat";
import { formatHandicap } from "./playerFormatters";

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
  const queryClient = useQueryClient();
  const checkoutReturnStartedRef = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingPlayers, setPendingPlayers] = useState<(typeof EMPTY_FORM)[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState(
    () => getCheckoutReturn(window.location.search).checkout
  );
  const [checkoutReturnMessage, setCheckoutReturnMessage] = useState<string | null>(null);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const [confirmationAttempt, setConfirmationAttempt] = useState(0);
  const [paymentPipelineError, setPaymentPipelineError] = useState<PaymentPipelineError | null>(
    null
  );

  useEffect(() => {
    if (checkoutReturnStartedRef.current || !numericLeagueId) return;
    if (checkoutStatus !== "capacity_success" && checkoutStatus !== "capacity_cancel") return;
    checkoutReturnStartedRef.current = true;

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
        const { sessionId } = getCheckoutReturn(window.location.search);
        if (!sessionId) {
          setPaymentPipelineError(
            new PaymentPipelineError(
              "We could not identify the returned checkout. Your saved player changes are safe. Refresh before trying another payment."
            )
          );
          return;
        }

        setCheckoutReturnMessage(null);
        setIsConfirmingCheckout(true);
        try {
          const confirmation = await confirmCheckoutSession(sessionId);
          if (confirmation.status === "processing") {
            restorePendingPlayers();
            setCheckoutReturnMessage(
              confirmation.message || "Your payment is still processing. Check again shortly."
            );
            return;
          }

          if (confirmation.status === "failed") {
            restorePendingPlayers();
            clearCheckoutReturnFromUrl();
            setCheckoutStatus(null);
            setPaymentPipelineError(
              new PaymentPipelineError(
                confirmation.message ||
                  "The payment pipeline did not complete. Your saved player changes are safe."
              )
            );
            return;
          }

          if (!pendingCheckout) {
            throw new PaymentPipelineError(
              "Payment was confirmed, but the saved player changes could not be found. Refresh before making another payment."
            );
          }

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
            if (players.length === 0) {
              throw new PaymentPipelineError(
                "Payment was confirmed, but no saved players were available to add. Refresh before making another payment."
              );
            }
            await createPlayers.mutateAsync({ leagueId: numericLeagueId, players });
            show(
              `Payment completed and ${players.length} ${players.length === 1 ? "player was" : "players were"} added.`,
              "success"
            );
          }
          clearCheckoutReturnFromUrl();
          setCheckoutStatus(null);
          window.localStorage.removeItem(pendingPlayerKey(numericLeagueId));
          setForm(EMPTY_FORM);
          setPendingPlayers([]);
          setIsEditMode(false);
          setEditingPlayerId(null);
          setIsModalOpen(false);
        } catch (returnError: unknown) {
          restorePendingPlayers();
          setPaymentPipelineError(
            toPaymentPipelineError(
              returnError,
              "We could not safely finish the payment. Your saved player changes are safe. Refresh before trying another payment."
            )
          );
        } finally {
          setIsConfirmingCheckout(false);
        }
      } else {
        restorePendingPlayers();
        clearCheckoutReturnFromUrl();
        setCheckoutStatus(null);
        show("Additional-player checkout was canceled.", "warning");
      }
    };

    void finishReturn();
  }, [
    checkoutStatus,
    confirmationAttempt,
    createPlayers,
    numericLeagueId,
    queryClient,
    show,
    updatePlayer,
  ]);

  if (paymentPipelineError) {
    throw paymentPipelineError;
  }

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

  const handicapHoleCount = getHandicapHoleCount(league.holeFormat);

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

  const startCapacityCheckout = async (requestedGolfers: number) => {
    try {
      const checkout = await createCheckoutSession.mutateAsync({
        purpose: "league_capacity",
        leagueId: numericLeagueId,
        requestedGolfers,
        successUrl: `${window.location.origin}/league/${numericLeagueId}/players?checkout=capacity_success`,
        cancelUrl: `${window.location.origin}/league/${numericLeagueId}/players?checkout=capacity_cancel`,
      });
      if (checkout.alreadyCovered) return false;
      if (!checkout.url) {
        throw new PaymentPipelineError(
          "The payment provider did not return a checkout URL. Your saved player changes are safe."
        );
      }
      window.location.href = checkout.url;
      return true;
    } catch (error: unknown) {
      setPaymentPipelineError(
        toPaymentPipelineError(
          error,
          "The payment pipeline could not start. Your saved player changes are safe."
        )
      );
      return true;
    }
  };

  const savePlayer = async () => {
    try {
      const regularPlayerCount = league.players.filter(
        (player: any) => player.type === "player"
      ).length;
      const paidCapacity = getLeagueCapacity(league);

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
          const checkoutStarted = await startCapacityCheckout(
            Math.max(paidCapacity, regularPlayerCount) + 1
          );
          if (checkoutStarted) return;
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
          const checkoutStarted = await startCapacityCheckout(
            paidCapacity + additionalRegularPlayers
          );
          if (checkoutStarted) return;
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
      label: `${handicapHoleCount}H HCP`,
      headerClassName: "whitespace-nowrap",
      render: (value: any) => <p className="text-xs font-bold">{formatHandicap(value)}</p>,
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

      {checkoutStatus && (isConfirmingCheckout || checkoutReturnMessage) && (
        <PaymentReturnNotice
          isChecking={isConfirmingCheckout}
          message={
            isConfirmingCheckout
              ? "Confirming your payment..."
              : checkoutReturnMessage || "We could not confirm your payment."
          }
          onRetry={() => {
            checkoutReturnStartedRef.current = false;
            setConfirmationAttempt((attempt) => attempt + 1);
          }}
        />
      )}

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
            label={`${handicapHoleCount}-Hole Handicap`}
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
                        {player.gender === "female" ? "Women’s" : "Men’s"} ratings ·{" "}
                        {handicapHoleCount}H HCP {formatHandicap(player.handicap)}
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
