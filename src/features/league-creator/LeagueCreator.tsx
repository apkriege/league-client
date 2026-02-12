import Info from "./InfoForm";
import Players from "./PlayersForm";
import Teams from "./TeamsForm";
import { FormProvider, useForm } from "react-hook-form";
import { useCreateLeague } from "@api/league/mutations";
import { useNavigate } from "react-router";
import { SectionTitleStacked } from "@/components/layout/SectionTitle";
import { Icon } from "@/components/layout/Icon";
import { Shield, ShieldHalf, Users } from "lucide-react";
import Card from "@/components/layout/Card";

const currPlayers = [
  {
    id: 1,
    firstName: "Adam",
    lastName: "Ant",
    email: "adam@ant.com",
    type: "player",
    handicap: 2,
  },
  {
    id: 2,
    firstName: "Brent",
    lastName: "Boston",
    email: "brent@boston.com",
    type: "player",
    handicap: 4,
  },
  {
    id: 3,
    firstName: "Derrick",
    lastName: "Door",
    email: "derrick@door.com",
    type: "player",
    handicap: 2,
  },
  {
    id: 4,
    firstName: "Carl",
    lastName: "Calvin",
    email: "carl@calvin.com",
    type: "player",
    handicap: 8,
  },
  {
    id: 5,
    firstName: "Ethan",
    lastName: "Edwards",
    email: "ethan@edwards.com",
    type: "sub",
    handicap: 3,
  },
  {
    id: 6,
    firstName: "Fred",
    lastName: "Franklin",
    email: "fred@franklin.com",
    type: "player",
    handicap: 10,
  },
  {
    id: 7,
    firstName: "Garret",
    lastName: "Garage",
    email: "garret@garage.com",
    type: "player",
    handicap: 2,
  },
  {
    id: 8,
    firstName: "Hilary",
    lastName: "Hiles",
    email: "hilary@hiles.com",
    type: "player",
    handicap: 7,
  },
];

const currTeams = [
  {
    id: 1,
    name: "Team 1",
    players: [1, 2],
  },
  {
    id: 2,
    name: "Team 2",
    players: [3, 4],
  },
  {
    id: 3,
    name: "Team 3",
    players: [5, 6],
  },
  {
    id: 4,
    name: "Team 4",
    players: [7, 8],
  },
  // {
  //   id: 5,
  //   name: "Team 5",
  //   players: [9, 10],
  // },
  // {
  //   id: 6,
  //   name: "Team 6",
  //   players: [11, 12],
  // },
];

const defaultLeagueData = {
  adminId: 1,
  name: "Bomb League",
  description: "This is a simple description that will describe the league.",
  numPlayers: 10,
  access: "public",
  contactFirstName: "Adam",
  contactLastName: "Krieger",
  contactEmail: "adamkrieger@gmail.com",
  contactPhone: "1234567890",
  startDate: new Date(),
  endDate: new Date(),
  players: currPlayers,
  teams: currTeams,
};

const modelLeagueData = (league: any) => {
  const { players, teams, ...info } = league;

  if (teams.length === 0) {
    return {
      ...info,
      players: players.map((player: any) => {
        const { id, ...playerData } = player;
        return playerData;
      }),
    };
  } else {
    return {
      ...info,
      teams: teams.map((team: any) => ({
        name: team.name,
        players: team.players.map((playerId: number) => {
          const player = players.find((p: any) => p.id === playerId);
          const { id, ...playerData } = player;
          return playerData;
        }),
      })),
    };
  }
};

export default function LeagueCreator() {
  const createLeague = useCreateLeague();
  const navigate = useNavigate();

  const leagueForm = useForm({
    defaultValues: defaultLeagueData,
  });

  const handleSubmit = () => {
    const data = leagueForm.getValues();
    const modeledData = modelLeagueData(data);

    createLeague.mutate(modeledData, {
      onSuccess: (league) => {
        console.log("League created:", league);
        navigate(`/admin/league/${league.id}`);
      },
      onError: (error) => {
        console.error("Failed to create league:", error);
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">League Creator</h1>
        <button onClick={handleSubmit} className="btn btn-primary">
          Save League
        </button>
      </div>
      <div className="flex flex-col gap-8">
        <FormProvider {...leagueForm}>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <SectionTitleStacked
                title="League Information"
                description="Provide the basic information about your league, including name, description, contact details, and dates."
                icon={<Icon icon={Shield} size={22} className="mr-2 p-1" />}
              />
              <Info />
            </Card>
            <Card className="col-span-2">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <Icon icon={Users} size={24} className="mr-2 p-1" />
                  <h3 className="text-lg font-bold">Players</h3>
                </div>
                <Players />
              </div>
              <div className="">
                <div className="flex items-center mb-2">
                  <Icon icon={ShieldHalf} size={24} className="mr-2 p-1" />
                  <h3 className="text-lg font-bold">Teams</h3>
                </div>
                <Teams />
              </div>
            </Card>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}
