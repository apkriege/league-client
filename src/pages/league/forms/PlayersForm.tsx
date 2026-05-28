import { useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";

import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import { SquarePen, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Table from "@/components/Table";
import Card from "@/components/layout/Card";
import { formatPhone } from "@/utils/format";

const defaultPlayer = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: "", // "player" or "sub"
  handicap: "",
};

export default function PlayersForm() {
  const { show } = useToast();
  const [isEdit, setIsEdit] = useState(false);

  const { watch, setValue } = useFormContext();
  const players = watch("players") || [];
  const teams = watch("teams") || [];
  const leagueType = String(watch("type") || "").toLowerCase();
  const leagueFormat = String(watch("format") || "").toLowerCase();
  const hasTeamsStep = leagueType === "season" && leagueFormat === "team";

  const playerForm = useForm({
    defaultValues: defaultPlayer,
  });

  const onSubmit = (data: any) => {
    if (isEdit) {
      const updatedPlayers = players.map((p: any) => (p.id === data.id ? { ...p, ...data } : p));
      setValue("players", updatedPlayers);
      setIsEdit(false);
    } else {
      const newPlayerId = players.length > 0 ? Math.max(...players.map((p: any) => p.id)) + 1 : 1;
      data.id = newPlayerId;
      setValue("players", [...watch("players"), data]);
    }

    playerForm.reset(defaultPlayer);
  };

  const editPlayer = (player: any) => {
    playerForm.reset(player);
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
      render: (value: any) => <p className="text-sm text-gray-500">{value}</p>,
    },
    {
      key: "firstName",
      label: "Name",
      width: "65%",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-content rounded-lg w-8 h-8 flex items-center justify-center text-xs uppercase">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div className="">
            <p className="text-md font-semibold text-primary mb-0.5">
              {row.firstName} {row.lastName}
            </p>
            <p className="font-light text-[10px] text-gray-500 flex items-center gap-1.5">
              <span>{row.email}</span>
              <span>/</span>
              <span>{formatPhone(row.phone)}</span>
            </p>
          </div>
        </div>
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
      render: (value: any) => <p className="text-md font-bold">{value}</p>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <SquarePen
            size={16}
            className="cursor-pointer text-blue-400"
            onClick={() => editPlayer(row)}
          />
          <Trash2
            size={18}
            className="cursor-pointer text-red-400"
            onClick={() => removePlayer(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="badge badge-secondary mb-1.5 font-semibold rounded-full text-[10px]">
        <UserPlus size={14} />
        <span>PLAYERS</span>
      </div>
      <h1 className="text-4xl font-bold mb-1">Add Players</h1>
      <p className="text-sm text-gray-500 mb-6 w-3/5">
        Build your roster of competitors and substitutes.
        {hasTeamsStep
          ? " Add players to your league and assign them to teams in the next step."
          : " Add players to your league and continue to review."}
      </p>

      <Card>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          {isEdit ? "Edit Player" : "Add Player"}
        </p>
        <div className="grid grid-cols-3 items-end gap-2">
          <Controller
            name="firstName"
            control={playerForm.control}
            render={({ field }) => (
              <Input label="First Name" placeholder="Enter first name" {...field} />
            )}
          />
          <Controller
            name="lastName"
            control={playerForm.control}
            render={({ field }) => (
              <Input label="Last Name" placeholder="Enter last name" {...field} />
            )}
          />
          <Controller
            name="email"
            control={playerForm.control}
            render={({ field }) => <Input label="Email" placeholder="Enter email" {...field} />}
          />
        </div>
        <div className="grid grid-cols-4 items-end gap-2">
          <Controller
            name="phone"
            control={playerForm.control}
            render={({ field }) => <Input label="Phone" placeholder="Enter phone" {...field} />}
          />
          <Controller
            name="type"
            control={playerForm.control}
            render={({ field }) => (
              <Select
                label="Type"
                className="w-full"
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
            control={playerForm.control}
            render={({ field }) => (
              <Input label="Handicap" placeholder="Enter handicap" {...field} />
            )}
          />
          <button
            type="button"
            className="btn btn-primary btn-md mb-1"
            onClick={playerForm.handleSubmit(onSubmit)}
          >
            {isEdit ? "Update Player" : "Save Player"}
          </button>
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
