import { useState } from "react";
import { ChevronDown, ChevronUp, ShieldHalf, SquarePen, Trash2, X } from "lucide-react";
import { useForm, useFormContext } from "react-hook-form";
import { Input } from "@/components/form";
import Card from "@/components/layout/Card";
import { useToast } from "@/context/ToastContext";
import PageHeader from "../../../../components/layout/PageHeader";
import { useLeaguePlayers } from "@api/league/queries";
import { useParams } from "react-router";

const defaultValues = {
  id: 0,
  name: "",
  players: [],
};

const PlayerCard = ({
  player,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  player: any;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) => {
  return (
    <div className="border border-base-300/80 rounded-lg px-2 py-1 mb-1 w-full text-sm flex items-center justify-between gap-2 bg-primary">
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-primary-content">
          <ChevronUp
            size={14}
            className={`cursor-pointer ${canMoveUp ? "text-primary-content" : "text-primary-content/50"}`}
            onClick={canMoveUp ? onMoveUp : undefined}
          />
          <ChevronDown
            size={14}
            className={`cursor-pointer ${canMoveDown ? "text-primary-content" : "text-primary-content/50"}`}
            onClick={canMoveDown ? onMoveDown : undefined}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-primary-content text-xs">
            {player.firstName} {player.lastName}
          </span>
        </div>
      </div>
      <X size={14} className="cursor-pointer text-red-400" onClick={onRemove} />
    </div>
  );
};

export default function TeamsForm() {
  const { leagueId } = useParams();
  const { show } = useToast();
  const { watch, setValue } = useFormContext();
  const teams = watch("teams") || [];

  const [playerSearch, setPlayerSearch] = useState("");
  const [dragOverTeamId, setDragOverTeamId] = useState<number | null>(null);
  const [teamNameError, setTeamNameError] = useState("");
  const [isEditTeam, setIsEditTeam] = useState(false);

  const { data: players } = useLeaguePlayers(Number(leagueId)!);

  const teamForm = useForm({
    defaultValues: defaultValues,
  });

  if (!players) {
    return (
      <div className="flex flex-col items-center gap-3 mt-10">
        <p className="text-sm text-gray-500">Loading players...</p>
      </div>
    );
  }

  const assignedPlayerIds = new Set(
    teams.flatMap((team: any) => (Array.isArray(team.players) ? team.players : []))
  );

  const availablePlayers = players.filter((p: any) => !assignedPlayerIds.has(p.id));

  const filteredPlayers = availablePlayers
    .filter((p: any) => {
      const search = playerSearch.trim().toLowerCase();
      if (!search) return true;

      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const email = String(p.email || "").toLowerCase();
      return fullName.includes(search) || email.includes(search);
    })
    .sort((a: any, b: any) => {
      const firstNameCompare = String(a.firstName || "").localeCompare(
        String(b.firstName || ""),
        undefined,
        {
          sensitivity: "base",
        }
      );

      if (firstNameCompare !== 0) return firstNameCompare;

      return String(a.lastName || "").localeCompare(String(b.lastName || ""), undefined, {
        sensitivity: "base",
      });
    });

  const teamNameField = teamForm.register("name", {
    onChange: () => {
      if (teamNameError) setTeamNameError("");
    },
  });

  const getNextTeamName = () => {
    const normalizedNames = new Set(
      teams.map((team: any) =>
        String(team.name || "")
          .trim()
          .toLowerCase()
      )
    );

    let nextTeamNumber = 1;
    while (normalizedNames.has(`team ${nextTeamNumber}`)) {
      nextTeamNumber += 1;
    }

    return `Team ${nextTeamNumber}`;
  };

  const generateTempTeamId = () => {
    const existingIds = new Set(teams.map((team: any) => Number(team.id)).filter(Number.isFinite));

    // 4-digit-ish ID for readable frontend grouping (e.g. 1111), with collision protection.
    let nextId = Number(`${Math.floor(Math.random() * 9) + 1}${Date.now().toString().slice(-3)}`);

    while (existingIds.has(nextId)) {
      nextId += 1;
    }

    return nextId;
  };

  const handleEditTeamClick = (team: any) => {
    console.log("Editing team:", team);

    teamForm.reset(team);
    setTeamNameError("");
    setIsEditTeam(true);
  };

  const saveTeam = () => {
    const data = teamForm.getValues();
    const normalizedTeamName = String(data.name || "").trim();

    if (!normalizedTeamName) {
      setTeamNameError("Team name is required.");
      show("Please enter a team name.", "error");
      return;
    }

    const hasDuplicateName = teams.some(
      (team: any) =>
        team.id !== data.id &&
        String(team.name || "")
          .trim()
          .toLowerCase() === normalizedTeamName.toLowerCase()
    );

    if (hasDuplicateName) {
      setTeamNameError("Team name already exists.");
      show("Choose a unique team name.", "error");
      return;
    }

    const teamData = {
      ...data,
      name: normalizedTeamName,
      players: Array.isArray(data.players) ? data.players : [],
    };

    if (isEditTeam) {
      const updatedTeams = teams.map((t: any) =>
        t.id === teamData.id ? { ...t, ...teamData } : t
      );
      setValue("teams", updatedTeams);
      setIsEditTeam(false);
      show("Team updated.", "success");
    } else {
      const newTeamId = generateTempTeamId();
      setValue("teams", [...teams, { ...teamData, id: newTeamId }]);
      show("Team added.", "success");
    }

    setTeamNameError("");
    teamForm.reset(defaultValues);
  };

  const autoFillTeamName = () => {
    teamForm.setValue("name", getNextTeamName(), { shouldDirty: true, shouldTouch: true });
    setTeamNameError("");
  };

  const removeTeam = (teamId: number) => {
    const updatedTeams = teams.filter((t: any) => t.id !== teamId);
    setValue("teams", updatedTeams);
  };

  const removePlayerFromTeam = (teamId: number, playerId: number) => {
    const updatedTeams = teams.map((team: any) => {
      if (team.id !== teamId) return team;
      return {
        ...team,
        players: team.players.filter((id: number) => id !== playerId),
      };
    });

    setValue("teams", updatedTeams);
  };

  const movePlayerInTeam = (teamId: number, playerIndex: number, direction: -1 | 1) => {
    const updatedTeams = teams.map((team: any) => {
      if (team.id !== teamId) return team;

      const nextIndex = playerIndex + direction;
      if (nextIndex < 0 || nextIndex >= team.players.length) return team;

      const nextPlayers = [...team.players];
      [nextPlayers[playerIndex], nextPlayers[nextIndex]] = [
        nextPlayers[nextIndex],
        nextPlayers[playerIndex],
      ];

      return {
        ...team,
        players: nextPlayers,
      };
    });

    setValue("teams", updatedTeams);
  };

  const resetTeam = () => {
    teamForm.reset(defaultValues);
    setTeamNameError("");
    setIsEditTeam(false);
  };

  const handlePlayerDragStart = (playerId: number, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", String(playerId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePlayerDropToTeam = (teamId: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverTeamId(null);

    const playerId = Number(e.dataTransfer.getData("text/plain"));
    if (!playerId) return;

    const updatedTeams = teams.map((team: any) => {
      if (team.id !== teamId) return team;
      if (team.players.includes(playerId)) return team;
      return {
        ...team,
        players: [...team.players, playerId],
      };
    });

    setValue("teams", updatedTeams);
  };

  return (
    <div>
      <PageHeader
        title="Create Teams"
        subTitle="Teams can be edited or removed at any time, so feel free to experiment and find the best fit for your league's structure."
        icon={<ShieldHalf size={14} />}
        iconText="TEAMS"
      />
      <div className="teams flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <Card className="p-2! border bg-base-100/90 ">
            <div className="flex items-center justify-between px-1">
              <Input
                label="Search Players"
                placeholder="Search players..."
                className="w-full"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
              />
            </div>
            <div className="divider my-1" />
            {players.length === 0 ? (
              <div className="flex flex-col items-center gap-3 mt-10">
                <p className="text-sm text-gray-500">
                  No players added yet. Please add players first.
                </p>
              </div>
            ) : (
              <div className="flex flex-col max-h-[600px] overflow-auto">
                {availablePlayers.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 mt-6">
                    <p className="text-sm text-gray-500">
                      All players are already assigned to teams.
                    </p>
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 mt-6">
                    <p className="text-sm text-gray-500">No players match your search.</p>
                  </div>
                ) : null}
                {filteredPlayers.map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-primary border border-base-300/80 rounded-lg p-2 mb-1 w-full text-sm flex gap-2 items-center cursor-grab active:cursor-grabbing shadow-xs"
                    draggable
                    onDragStart={(e) => handlePlayerDragStart(p.id, e)}
                  >
                    <div className="bg-secondary text-secondary-content rounded-lg w-7 h-7 flex items-center justify-center text-xs uppercase">
                      {p.firstName[0]}
                      {p.lastName[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-primary-content">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-[10px] text-gray-500">HCP: {p.handicap}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        <div className="w-full lg:w-2/3 xl:w-3/4">
          <Card className="py-2! px-2! mb-2 border-base-300/80 bg-base-100/90">
            <div className="flex gap-2 items-end">
              <Input
                label="Team Name"
                placeholder="Enter team name"
                {...teamNameField}
                error={teamNameError}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveTeam();
                  }
                }}
                className="w-full"
              />
              <button
                type="button"
                className="btn btn-outline btn-sm mb-1.5"
                onClick={autoFillTeamName}
              >
                Auto Name
              </button>
              <button type="button" className="btn btn-primary btn-sm mb-1.5" onClick={saveTeam}>
                Save Team
              </button>
              <button
                type="button"
                className="btn btn-secondary w-fit btn-sm mb-1.5"
                onClick={resetTeam}
              >
                Reset
              </button>
            </div>
          </Card>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center gap-3 mt-10 justify-center">
              <p className="text-sm text-gray-500">No teams created yet. Please create a team.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[500px] overflow-auto">
              {teams.map((team: any) => (
                <div
                  key={team.id}
                  className="border border-base-300/80 rounded-lg p-2.5 w-full bg-base-100 shadow-xs"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">{team.name}</span>
                    <div className="flex items-center gap-2">
                      <SquarePen
                        size={14}
                        className="cursor-pointer text-blue-400"
                        onClick={() => handleEditTeamClick(team)}
                      />
                      <Trash2
                        size={16}
                        className="cursor-pointer text-red-400"
                        onClick={() => removeTeam(team.id)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {team.players.map((playerId: number, playerIndex: number) => {
                      const player = players.find((p: any) => p.id === playerId);
                      return player ? (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          onRemove={() => removePlayerFromTeam(team.id, player.id)}
                          onMoveUp={() => movePlayerInTeam(team.id, playerIndex, -1)}
                          onMoveDown={() => movePlayerInTeam(team.id, playerIndex, 1)}
                          canMoveUp={playerIndex > 0}
                          canMoveDown={playerIndex < team.players.length - 1}
                        />
                      ) : null;
                    })}

                    <div
                      className={`mt-1.5 rounded-lg border-2 border-dashed p-2 text-[11px] text-center transition-colors ${
                        dragOverTeamId === team.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-base-300 text-base-content/60"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverTeamId(team.id);
                      }}
                      onDragLeave={() =>
                        setDragOverTeamId((prev) => (prev === team.id ? null : prev))
                      }
                      onDrop={(e) => handlePlayerDropToTeam(team.id, e)}
                    >
                      Drag player here to add to team
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
