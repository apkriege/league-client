import Card from "@/components/layout/Card";

export default function Players({ league }: { league: any }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th className="text-xs">Name</th>
              <th className="text-xs">Email</th>
              <th className="text-xs">Handicap</th>
              <th className="text-xs">Team</th>
              <th className="text-xs text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {league.players?.map((player: any) => (
              <tr key={player.id}>
                <td className="text-sm">
                  {player.firstName} {player.lastName}
                </td>
                <td className="text-sm">
                  <a href={`mailto:${player.email}`} className="text-primary hover:underline">
                    {player.email}
                  </a>
                </td>
                <td className="text-sm text-center">{player.handicap}</td>
                <td className="text-sm">{player.team?.name || "Unassigned"}</td>
                <td className="text-sm text-right font-semibold">{player.seasonPoints || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
