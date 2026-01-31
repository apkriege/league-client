import { useAdminLeagues } from "@api/league/queries";

export default function Leagues() {
  const { data: leagues } = useAdminLeagues();

  return (
    <div>
      <h1>Leagues</h1>
      <div className="">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leagues?.map((league: any) => (
              <tr key={league.id}>
                <td>{league.id}</td>
                <td>{league.name}</td>
                <td>{new Date(league.startDate).toLocaleDateString()}</td>
                <td>{new Date(league.endDate).toLocaleDateString()}</td>
                <td>
                  <a href={`/leagues/${league.id}`} className="btn btn-sm btn-primary">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
