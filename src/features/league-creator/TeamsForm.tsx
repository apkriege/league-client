import { useState } from "react";
import { RotateCcw, SquarePen, Trash2 } from "lucide-react";
import { Input, MultiSelect } from "../../components/form";
import { Controller, useForm, useFormContext } from "react-hook-form";
import Table from "@/components/Table";

const defaultValues = {
  id: 0,
  name: "",
  players: [],
};

export default function TeamsForm() {
  const { watch, setValue } = useFormContext();
  const players = watch("players") || [];
  const teams = watch("teams") || [];

  const [isEditTeam, setIsEditTeam] = useState(false);

  const teamForm = useForm({
    defaultValues: defaultValues,
  });

  const getTeams = () => {
    return teams.sort((a: any, b: any) => a.name.localeCompare(b.name));
  };

  const handleSelectPlayers = (player: any) => {
    teamForm.setValue("players", player);
  };

  const handleEditTeamClick = (team: any) => {
    console.log("Editing team:", team);

    teamForm.reset(team);
    setIsEditTeam(true);
  };

  const saveTeam = () => {
    const data = teamForm.getValues();

    if (isEditTeam) {
      const updatedTeams = teams.map((t: any) => (t.id === data.id ? { ...t, ...data } : t));
      setValue("teams", updatedTeams);
      setIsEditTeam(false);
    } else {
      const newTeamId = teams.length > 0 ? Math.max(...teams.map((t: any) => t.id)) + 1 : 1;
      data.id = newTeamId;
      setValue("teams", [...watch("teams"), data]);
    }

    teamForm.reset(defaultValues);
  };

  const removeTeam = (teamId: number) => {
    const updatedTeams = teams.filter((t: any) => t.id !== teamId);
    setValue("teams", updatedTeams);
  };

  const resetTeam = () => {
    teamForm.reset(defaultValues);
    setIsEditTeam(false);
  };

  const columns = [
    {
      key: "name",
      label: "Team Name",
    },
    {
      key: "teams",
      label: "Players",
      render: (_value: any, row: any) => {
        const ps = players.filter((p: any) => row.players.includes(p.id));
        return ps.map((p: any, idx: number) => (
          <span key={p.id} className="mr-1">
            {p.firstName} {p.lastName}
            {idx < ps.length - 1 && ","}
          </span>
        ));
      },
    },
    {
      key: "teams",
      label: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex items-center">
          <SquarePen
            size={16}
            className="cursor-pointer mr-3 text-blue-400"
            onClick={() => handleEditTeamClick(row)}
          />
          <Trash2
            size={18}
            className="cursor-pointer text-red-400"
            onClick={() => removeTeam(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="teams-form">
        <div className="grid grid-cols-6 items-end gap-2 mb-2">
          <div className="col-span-2">
            <Controller
              name="name"
              control={teamForm.control}
              render={({ field }) => (
                <Input label="Team Name" placeholder="Enter team name" {...field} />
              )}
            />
          </div>
          <div className="col-span-3">
            <MultiSelect
              label="Select Players"
              options={players.map((p: any) => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName}`,
              }))}
              value={teamForm.watch("players")}
              onChange={handleSelectPlayers}
              placeholder="Select players..."
            />
          </div>
          <div className="col-span-1 flex gap-2 mb-1.5">
            <button className="btn btn-primary btn-sm" onClick={saveTeam}>
              Save
            </button>
            <button className="btn btn-secondary w-fit btn-sm" onClick={resetTeam}>
              <RotateCcw size="14" />
            </button>
          </div>
        </div>
      </div>
      <div className="teams-table">
        <Table
          heading={`Total Teams: ${teams.length}`}
          data={getTeams()}
          columns={columns}
          size="sm"
        />
      </div>
    </div>
  );
}
