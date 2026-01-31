import { useLeagueEventScores } from "@api/league/queries";
import { useParams } from "react-router";

const getHoles = (holes: any, numHoles: number, startSide: string) => {
  const startingHole = startSide === "front" ? 1 : holes.length - numHoles + 1;
  return holes.slice(startingHole - 1, startingHole + numHoles - 1);
};

export default function Scores() {
  const { leagueId, eventId } = useParams();
  const { data } = useLeagueEventScores(Number(leagueId), Number(eventId));

  if (!data) {
    return <div>Loading...</div>;
  }

  const holes = getHoles(data.tee.holes, data.holes, data.startSide);

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold">Scores Page</h1>
      <div className="">
        {data.flights.map((flight: any, idx: number) => (
          <div key={idx} className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Flight {idx + 1}</h2>
            <Flight flight={flight} holes={holes} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Flight({ flight, holes }: any) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold mb-2">
        Teams: {flight.teams[0].team.name} vs {flight.teams[1].team.name}
      </h3>
      <div className="flex flex-col gap-4">
        <table className="table w-full">
          <tbody className="text-xs">
            <tr>
              <td>Hole</td>
              {holes.map((hole: any) => (
                <td key={hole.id}>{hole.num}</td>
              ))}
            </tr>
            <tr>
              <td>Hcp / Par</td>
              {holes.map((hole: any) => (
                <td key={hole.id}>
                  {hole.hcp}/{hole.par}
                </td>
              ))}
            </tr>
            <TeamMatchView teams={flight.teams} />
            {/* <TeamMatchView team={flight.teams[0].team} />
            <TeamMatchView team={flight.teams[1].team} /> */}
          </tbody>
        </table>
        {/* <TeamMatchView team={flight.teams[0].team} />
        <TeamMatchView team={flight.teams[1].team} /> */}
      </div>
    </div>
  );
}

function TeamMatchView({ teams }: any) {
  // sort by handicap
  // const sPlayers = team.players.sort((a: any, b: any) => a.handicap - b.handicap);
  // const numHoles = sPlayers[0].scores[0].scores.length;

  // const getPops = (score: number, net: number) => {
  //   const x = score - net;

  //   return Array.from({ length: x }).map((_, i) => (
  //     <div key={i} className="w-1 h-1 bg-white/80 rounded-full" />
  //   ));
  // };

  // const numHoles = teams[0].players[0].scores[0].scores.length;
  const numHoles = 9;

  const xTeams = teams.reduce((acc: any, team: any) => {
    console.log("team", team);
    const sortedPlayers = team.team.players.sort((a: any, b: any) => a.handicap - b.handicap);
    acc.push({ team: team, players: sortedPlayers });
    return acc;
  }, []);

  const getPoints = (p1Score: any, p2Score: any) => {
    return p1Score.points + p2Score.points;
  };

  const getTotalPoints = (p1Scores: any, p2Scores: any) => {
    const p1Total = p1Scores.reduce((acc: number, score: any) => acc + score.points, 0);
    const p2Total = p2Scores.reduce((acc: number, score: any) => acc + score.points, 0);
    return p1Total + p2Total;
  };

  return xTeams.map((team: any, idx: number) => (
    <>
      <tr key={idx}>
        <td>{team.name}</td>
        <td colSpan={numHoles}></td>
        <td>Total</td>
        <td>Hcp</td>
        <td>Net</td>
        <td>Points</td>
      </tr>
      {team.players.map((player: any) => {
        const score = player.scores[0];

        return (
          <tr key={player.id}>
            <td>
              {player.firstName} {player.lastName}
            </td>
            {score.scores.map((score: any) => (
              <td key={score.holeId} className="relative text-center">
                {score.score}
              </td>
            ))}
            <td>{score.score}</td>
            <td>{score.preHandicap}</td>
            <td>{score.net}</td>
            <td>{score.pointsEarned}</td>
          </tr>
        );
      })}
      <tr>
        <td>Points</td>
        {team.players[0].scores[0].scores.map((score: any, idx: number) => (
          <td key={score.id} className="relative text-center">
            {getPoints(score, team.players[1].scores[0].scores[idx])}
          </td>
        ))}
        <td>
          {getTotalPoints(team.players[0].scores[0].scores, team.players[1].scores[0].scores)}
        </td>
        <td className="flex flex-col"></td>
      </tr>
    </>
  ));
}
