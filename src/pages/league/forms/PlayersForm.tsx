import type { ImportedPlayer } from "@/features/leagues/rosterImport";
import { lazy, Suspense, useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";

import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import { SquarePen, Trash2 } from "lucide-react";
import { useToast } from "@/context/useToast";
import Table from "@/components/Table";
import Card from "@/components/layout/Card";
import SectionKicker from "@/components/layout/SectionKicker";
import { formatPhone } from "@/utils/format";
import Button from "@/components/layout/Button";
import Chip from "@mui/material/Chip";
import PageHeader from "@/components/layout/PageHeader";
import { getHandicapHoleCount } from "@/features/leagues/leagueHoleFormat";
import { formatHandicap } from "@/utils/handicap";

const RosterImportDialog = lazy(() => import("@/features/leagues/components/RosterImportDialog"));

const defaultPlayer = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: "player", // "player" or "sub"
  gender: "",
  handicap: "",
};

export default function PlayersForm() {
  const { show } = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { watch, setValue } = useFormContext();
  const players = watch("players") || [];
  const teams = watch("teams") || [];
  const leagueType = String(watch("type") || "").toLowerCase();
  const leagueFormat = String(watch("format") || "").toLowerCase();
  const handicapHoleCount = getHandicapHoleCount(watch("holeFormat"));
  const hasTeamsStep = leagueType === "season" && leagueFormat === "team";

  const playerForm = useForm({
    defaultValues: defaultPlayer,
  });

  const onSubmit = (data: any) => {
    const playerData = {
      ...data,
      firstName: String(data.firstName).trim(),
      lastName: String(data.lastName).trim(),
      email: String(data.email || "").trim(),
      phone: String(data.phone || "").trim(),
      type: String(data.type || "player").trim().toLowerCase(),
      gender: String(data.gender).trim().toLowerCase(),
      handicap: Number(data.handicap),
    };

    if (isEdit) {
      const updatedPlayers = players.map((p: any) =>
        p.id === playerData.id ? { ...p, ...playerData } : p
      );
      setValue("players", updatedPlayers);
      setIsEdit(false);
    } else {
      const newPlayerId = players.length > 0 ? Math.max(...players.map((p: any) => p.id)) + 1 : 1;
      playerData.id = newPlayerId;
      setValue("players", [...watch("players"), playerData]);
    }

    playerForm.reset(defaultPlayer);
  };

  const editPlayer = (player: any) => {
    playerForm.reset({ ...player, handicap: String(player.handicap ?? "") });
    setIsEdit(true);
  };

  const removePlayer = (playerId: number) => {
    const playersOnTeams = teams.flatMap((t: any) => t.players.map((p: any) => p));
    if (playersOnTeams.includes(playerId)) {
      show(
        "Cannot remove player who is assigned to a team. You must remove the team before removing the player.",
        "error",
        5000
      );
      return;
    }

    const updatedPlayers = players.filter((p: any) => p.id !== playerId);
    setValue("players", updatedPlayers);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      width: "6%",
      render: (value: any) => <p className="text-xs text-gray-500">{value}</p>,
    },
    {
      key: "firstName",
      label: "Name",
      width: "65%",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white rounded-lg w-8 h-8 flex items-center justify-center text-xs uppercase">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <p className="mb-0.5 text-sm font-semibold text-slate-900">
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
        </div>
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
      render: (value: any) => <p className="text-sm font-bold">{formatHandicap(value)}</p>,
    },
    {
      key: "gender",
      label: "Gender",
      render: (value: any) => (
        <p className="text-xs font-semibold capitalize">{value}</p>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <button type="button" aria-label={`Edit ${row.firstName} ${row.lastName}`} onClick={() => editPlayer(row)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-600">
            <SquarePen size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label={`Delete ${row.firstName} ${row.lastName}`} onClick={() => removePlayer(row.id)} className="flex h-11 w-11 items-center justify-center rounded-xl text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600">
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Add Players"
        subTitle={`Build your roster of competitors and substitutes.${
          hasTeamsStep
            ? " Add players to your league and assign them to teams in the next step."
            : " Add players to your league and continue to review."
        } Enter each player's ${handicapHoleCount}-hole handicap.`}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Start with at least one player. Add more later from Players; team leagues also need at least one team.</p>
        <Button type="button" onClick={() => setImportOpen(true)}>Import players</Button>
      </div>
      {importOpen && <Suspense fallback={<p role="status">Loading import…</p>}><RosterImportDialog players={players} handicapHoleCount={handicapHoleCount} onClose={() => setImportOpen(false)} onImport={(imported: ImportedPlayer[]) => {
        const firstId = Math.max(0, ...players.map((player: { id: number }) => Number(player.id))) + 1;
        setValue("players", [...players, ...imported.map((player, index) => ({ ...player, id: firstId + index }))], { shouldDirty: true });
        show(`${imported.length} players added.`, "success");
      }} /></Suspense>}
      <Card className="mt-6">
        <SectionKicker className="mb-3">
          {isEdit ? "Edit Player" : "Add Player"}
        </SectionKicker>
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
          <Controller
            name="firstName"
            rules={{ validate: value => value.trim() ? true : "First name is required." }}
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <Input error={fieldState.error?.message} label="First Name" placeholder="Enter first name" {...field} />
            )}
          />
          <Controller
            name="lastName"
            rules={{ validate: value => value.trim() ? true : "Last name is required." }}
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <Input error={fieldState.error?.message} label="Last Name" placeholder="Enter last name" {...field} />
            )}
          />
          <Controller
            name="email"
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <Input error={fieldState.error?.message} label="Email (optional)" placeholder="Enter email" {...field} />
            )}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Controller
            name="phone"
            control={playerForm.control}
            render={({ field, fieldState }) => <Input error={fieldState.error?.message} label="Phone" placeholder="Enter phone" {...field} />}
          />
          <Controller
            name="type"
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <Select
                error={fieldState.error?.message}
                label="Type"
                options={[
                  { label: "Player", value: "player" },
                  { label: "Sub", value: "sub" },
                ]}
                placeholder="Select type"
                {...field}
              />
            )}
          />
          <Controller
            name="handicap"
            rules={{ validate: value => String(value ?? "").trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= -10 && Number(value) <= 54 ? true : "Enter a handicap from -10 to 54." }}
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <Input
                error={fieldState.error?.message}
                label={`${handicapHoleCount}-Hole Handicap`}
                placeholder={`Enter ${handicapHoleCount}-hole handicap`}
                type="number"
                step="0.1"
                {...field}
              />
            )}
          />
          <Controller
            name="gender"
            rules={{ validate: value => ["male", "female"].includes(value) ? true : "Select a gender." }}
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <Select
                error={fieldState.error?.message}
                label="Gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                placeholder="Select gender"
                {...field}
              />
            )}
          />
          <Button
            type="button"
            variant="primary"
            size="md"
            className="mb-1 min-h-11"
            onClick={playerForm.handleSubmit(onSubmit)}
          >
            {isEdit ? "Update Player" : "Save Player"}
          </Button>
        </div>
      </Card>

      <div className="mt-4">
        <Table
          heading={`Roster · ${players.length} ${players.length === 1 ? "player" : "players"}`}
          data={players}
          columns={columns}
          size="sm"
        />
      </div>
    </div>
  );
}
