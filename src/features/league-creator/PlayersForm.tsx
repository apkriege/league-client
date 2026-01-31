import { useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";

import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { SquarePen, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Table from "@/components/Table";

const defaultPlayer = {
  firstName: "",
  lastName: "",
  email: "",
  type: "", // "player" or "sub"
  handicap: "",
};

export default function PlayersForm() {
  const { show } = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const { watch, setValue } = useFormContext();
  const players = watch("players") || [];
  const teams = watch("teams") || [];

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
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "type", label: "Type" },
    { key: "handicap", label: "Handicap" },
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
      <div className="players-form">
        <div className="grid grid-cols-6 items-end gap-2">
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
          <div className="btn btn-primary mb-1 btn-md" onClick={playerForm.handleSubmit(onSubmit)}>
            Save Player
          </div>
        </div>
      </div>
      <div className="player-table mt-4">
        <Table
          heading={`Total Players: ${players.length}`}
          data={players}
          columns={columns}
          size="sm"
        />
      </div>
    </div>
  );
}
