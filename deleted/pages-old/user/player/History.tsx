import Card from "@/components/layout/Card";
import Table from "@/components/Table";

const formatRounds = (rounds: any[]) => {
  // Group rounds by tee id and starting side
  const grouped: any = {};
  rounds.forEach((round) => {
    const key = `${round.teeId}-${round.event.startSide}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(round);
  });

  // For each group, sort rounds by event date
  for (const key in grouped) {
    grouped[key].sort(
      (a: any, b: any) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime()
    );
  }

  return grouped;
};

export default function History({ rounds }: any) {
  // console.log("History rounds:", rounds);

  const rs = formatRounds(rounds);

  console.log(rs);

  return (
    <div className="flex flex-col">
      <div className="round-history">
        <h1 className="font-bold mb-3">Round History</h1>

        <div className="flex flex-col gap-4">
          {Object.entries(rs).map(([x, rounds]) => (
            <Card className="overflow-x-auto pt-2" key={x}>
              <h2 className="font-bold mb-2">
                {rounds[0].course.name} - {rounds[0].tee.name} - {rounds[0].event.startSide}
              </h2>

              <table className="table w-full table-sm">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Handicap</th>
                    {rounds[0].scores.map((score: any) => (
                      <th key={score.id}>{score.hole}</th>
                    ))}
                    <th>Gross</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((round: any) => {
                    return (
                      <tr key={round.id}>
                        <td>{round.event.name}</td>
                        <td>{Math.round(round.preHandicap)}</td>
                        {round.scores.map((score: any) => (
                          <td key={score.id}>{score.gross}</td>
                        ))}
                        <td>{round.gross}</td>
                        <td>{round.net}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
