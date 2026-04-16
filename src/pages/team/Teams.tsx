import PageHeader from "@/components/layout/PageHeader";
import { useLeague } from "@api/league/queries";
import { Globe } from "lucide-react";
import { useParams } from "react-router";

export default function Teams() {
  const { leagueId } = useParams();
  const { data: league } = useLeague(Number(leagueId));

  console.log("League data in Teams page:", league);

  if (!league) {
    return <div>Loading...</div>;
  }

  const teams = league.teams || [];

  return (
    <div>
      <PageHeader
        title="Teams"
        subTitle="Overview of teams in the league"
        icon={<Globe size={14} />}
        iconText="LEAGUE"
      />

      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[600px] overflow-auto">
          {teams.length === 0 ? (
            <div className="flex flex-col items-center gap-3 mt-10 justify-center">
              <p className="text-sm text-gray-500">No teams created yet. Please create a team.</p>
            </div>
          ) : (
            teams.map((team: any) => (
              <div
                key={team.id}
                className="border border-base-300/80 rounded-lg p-2.5 w-full bg-base-100 shadow-xs"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">{team.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {team.players.map((player: any) => (
                    <div key={player.id} className="flex items-center gap-2">
                      <div className="bg-primary text-primary-content rounded-lg w-6 h-6 flex items-center justify-center text-xs uppercase">
                        {player.firstName[0]}
                        {player.lastName[0]}
                      </div>
                      <span className="text-sm">
                        {player.firstName} {player.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
