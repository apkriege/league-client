import Table from "@/components/Table";
import { useLeagueTeams } from "@api/league/queries";
import { useParams } from "react-router";

export default function Teams() {
  const params = useParams();
  const leagueId = Number(params.leagueId);
  console.log("Teams leagueId:", leagueId);
  const { data: teams } = useLeagueTeams(leagueId);

  const columns: any[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Team Name" },
    {
      key: "players",
      label: "Players",
      render: (players: any[]) => (
        <div className="flex flex-col">
          {players.map((p: any) => (
            <span key={p.id} className="text-xs">
              {p.firstName} {p.lastName} - Hcp: {p.handicap}
            </span>
          ))}
        </div>
      ),
    },
    { key: "seasonRank", label: "Rank" },
    { key: "seasonPoints", label: "Points" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Teams</h1>
      <Table data={teams || []} columns={columns} className="rounded-lg border border-base-300" />
    </div>
  );
}
