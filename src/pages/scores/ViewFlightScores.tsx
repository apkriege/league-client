import {
  createTeamBestBallScoringHelpers,
  calculateMatchplayPops,
  createTeamScoringHelpers,
  sortFlightTeamsByHandicap,
} from "./util";

export default function ViewFlightScores({ event, flight }: any) {
  const startingHole = event.startSide === "front" ? 1 : 10;
  const holes = event.tee.holes
    .slice(startingHole - 1, startingHole + event.holes - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

  const {
    t1Id,
    t2Id,
    team1: fallbackTeam1,
    team2: fallbackTeam2,
  } = sortFlightTeamsByHandicap(flight);

  const getSavedOpponentId = (playerEntry: any) => {
    const flightOpponentId = Number(playerEntry?.opponentId ?? 0);
    if (flightOpponentId > 0) return flightOpponentId;

    const roundOpponentId = Number(playerEntry?.player?.rounds?.[0]?.opponentId ?? 0);
    return roundOpponentId > 0 ? roundOpponentId : null;
  };

  const baseTeam1 =
    t1Id != null
      ? (flight.players || []).filter((p: any) => Number(p.teamId) === Number(t1Id))
      : [...fallbackTeam1];
  const baseTeam2 =
    t2Id != null
      ? (flight.players || []).filter((p: any) => Number(p.teamId) === Number(t2Id))
      : [...fallbackTeam2];

  const team2ByPlayerId = new Map<number, any>(baseTeam2.map((p: any) => [Number(p.playerId), p]));
  const usedTeam2Ids = new Set<number>();
  const orderedTeam2: any[] = [];

  baseTeam1.forEach((player: any) => {
    const opponentId = Number(getSavedOpponentId(player) ?? 0);
    const opponent: any = team2ByPlayerId.get(opponentId);
    if (!opponent) return;

    const opponentPlayerId = Number(opponent.playerId);
    if (usedTeam2Ids.has(opponentPlayerId)) return;

    orderedTeam2.push(opponent);
    usedTeam2Ids.add(opponentPlayerId);
  });

  const team1 = baseTeam1;
  const team2 =
    orderedTeam2.length > 0
      ? [...orderedTeam2, ...baseTeam2.filter((p: any) => !usedTeam2Ids.has(Number(p.playerId)))]
      : baseTeam2;
  const matchupCount = Math.min(team1.length, team2.length);

  const popsByPlayerId = new Map<number, Map<number, number>>();
  for (let i = 0; i < matchupCount; i++) {
    const left = team1[i];
    const right = team2[i];

    const [leftPops, rightPops] = calculateMatchplayPops(left.player, right.player, holes);
    popsByPlayerId.set(Number(left.playerId), leftPops);
    popsByPlayerId.set(Number(right.playerId), rightPops);
  }

  const popsForHole = (playerId: number, holeNum: number) => {
    return popsByPlayerId.get(Number(playerId))?.get(holeNum) || 0;
  };

  const getScoreAtHole = (player: any, holeIdx: number) => {
    return Number(player?.player?.rounds?.[0]?.scores?.[holeIdx]?.gross ?? 0);
  };

  const getTeamPlayerPointsTotal = (team: 1 | 2) => {
    const players = team === 1 ? team1 : team2;
    return players.reduce((sum: number, player: any) => {
      const round = player?.player?.rounds?.[0];
      const points = Number(round?.pointsEarned ?? 0) + Number(round?.matchPoints ?? 0);
      return sum + points;
    }, 0);
  };

  const isTeamStroke = event?.format === "team" && event?.scoringFormat === "stroke";

  const standardTeamHelpers = createTeamScoringHelpers({
    event,
    holes,
    team1,
    team2,
    matchupCount,
    popsForHole,
    getScoreAtHole,
    getTeamPlayerPointsTotal,
  });
  const teamStrokeHelpers = createTeamBestBallScoringHelpers({
    event,
    holes,
    team1,
    team2,
    popsForHole,
    getScoreAtHole,
  });

  const getTeamPointsForHole = isTeamStroke
    ? teamStrokeHelpers.getTeamPointsForHole
    : standardTeamHelpers.getTeamPointsForHole;
  const getTeamTotalPoints = isTeamStroke
    ? teamStrokeHelpers.getTeamTotalPoints
    : standardTeamHelpers.getTeamTotalPoints;
  const getTeamMedalPoints = isTeamStroke
    ? (_team: 1 | 2) => 0
    : standardTeamHelpers.getTeamMedalPoints;

  return (
    <div className="border rounded-lg">
      <div className="w-full overflow-x-auto">
        <table className="min-w-max w-full text-left table-sm table-auto">
          <thead className="">
            <tr className="text-xs text-gray-700">
              <th>Player</th>
              {holes.map((hole: any) => (
                <th key={hole.num} className="p-2 text-center">
                  {hole.num}
                </th>
              ))}
              <th className="text-center">Total</th>
              <th className="text-center">Net</th>
              <th className="text-center">Points</th>
            </tr>
          </thead>
          <tbody>
            {[...team1].map((player: any) => (
              <PlayerRow key={player.id} player={player} holes={holes} />
            ))}
            {team1.length > 0 && team2.length > 0 && (
              <TeamPointsRow
                label="Team 1 Points"
                team={1}
                holes={holes}
                getTeamPointsForHole={getTeamPointsForHole}
                getTeamMedalPoints={getTeamMedalPoints}
                getTeamTotalPoints={getTeamTotalPoints}
                isTeamStroke={isTeamStroke}
              />
            )}
            {[...team2].map((player: any) => (
              <PlayerRow key={player.id} player={player} holes={holes} />
            ))}
            {team1.length > 0 && team2.length > 0 && (
              <TeamPointsRow
                label="Team 2 Points"
                team={2}
                holes={holes}
                getTeamPointsForHole={getTeamPointsForHole}
                getTeamMedalPoints={getTeamMedalPoints}
                getTeamTotalPoints={getTeamTotalPoints}
                isTeamStroke={isTeamStroke}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PlayerRow = ({ player, holes }: any) => {
  const p = player.player;
  const round = p.rounds[0];
  const scores = round?.scores || [];

  return (
    <tr key={player.id} className="text-sm bg-slate-50/50">
      <td className="p-2 text-xs flex flex-col">
        <span className="font-semibold">
          {p.firstName} {p.lastName}
        </span>
        <span className="text-[10px]">Handicap: {Math.round(round.preHandicap)}</span>
      </td>
      {holes.map((hole: any, holeIdx: number) => {
        const score = scores[holeIdx]?.gross;
        return (
          <td key={hole.num} className="p-2">
            <div className="relative h-8 border rounded flex items-center justify-center text-xs font-semibold bg-white">
              {score ?? "-"}
            </div>
          </td>
        );
      })}
      <td className="font-bold text-center text-xs">{round?.gross ?? 0}</td>
      <td className="font-bold text-center text-xs">{round?.net ?? 0}</td>
      <td className="font-bold text-center text-xs">
        {Number(round?.pointsEarned ?? 0) + Number(round?.matchPoints ?? 0)}
      </td>
    </tr>
  );
};

const TeamPointsRow = ({
  label,
  team,
  holes,
  getTeamPointsForHole,
  getTeamMedalPoints,
  getTeamTotalPoints,
  isTeamStroke,
}: any) => {
  return (
    <tr aria-hidden="true" className="bg-gray-200">
      <td>{label}</td>
      {holes.map((hole: any, holeIdx: number) => (
        <td key={hole.num} className="p-2 font-bold text-center text-xs">
          {getTeamPointsForHole(team, hole, holeIdx)}
        </td>
      ))}
      <td />
      <td className="p-2 font-bold text-center">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-sm">{getTeamMedalPoints(team)}</span>
          <span className="text-[10px]">{isTeamStroke ? "Bonus" : "Medal"}</span>
        </div>
      </td>
      <td className="p-2 font-bold text-center">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-sm">{getTeamTotalPoints(team)}</span>
          <span className="text-[10px]">Total</span>
        </div>
      </td>
    </tr>
  );
};
