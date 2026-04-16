import Card from "@/components/layout/Card";

export default function Teams({ league }: { league: any }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th className="text-xs">Team Name</th>
              <th className="text-xs">Players</th>
              <th className="text-xs text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {league.teams?.map((team: any) => (
              <tr key={team.id}>
                <td className="text-sm">{team.name}</td>
                <td className="text-sm">
                  {team.players.map((player: any) => (
                    <div key={player.id}>
                      {player.firstName} {player.lastName}
                    </div>
                  ))}
                </td>
                <td className="text-sm text-right font-semibold">{team.seasonPoints || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
