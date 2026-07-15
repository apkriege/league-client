import { Fragment } from "react";
import { Link, useParams } from "react-router";
import {
  createTeamBestBallScoringHelpers,
  calculateMatchplayPops,
  createTeamScoringHelpers,
  sortFlightTeamsByHandicap,
} from "./util";

function PlayerNameLink({
  playerId,
  children,
  className = "font-semibold text-gray-800 hover:text-primary hover:underline",
}: {
  playerId?: number | string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const { leagueId } = useParams();
  const numericPlayerId = Number(playerId);

  if (!leagueId || !Number.isFinite(numericPlayerId) || numericPlayerId <= 0) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={`/league/${leagueId}/player/${numericPlayerId}`}
      className={className}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </Link>
  );
}

export default function ViewFlightScores({ event, flight }: any) {
  const startingHole = event.startSide === "front" ? 1 : 10;
  const holes = event.tee.holes
    .slice(startingHole - 1, startingHole + event.holes - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

  if (event?.format === "individual" && event?.scoringFormat === "match") {
    return <IndividualMatchView flight={flight} event={event} holes={holes} />;
  }

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
        <table className="score-table">
          <thead>
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
  const hcp = Number(round?.preHandicap ?? p?.handicap ?? 0);

  return (
    <tr key={player.id} className="text-sm bg-slate-50/50">
      <td className="p-2 text-xs">
        <PlayerNameLink playerId={player.playerId}>
          {p.firstName} {p.lastName}
        </PlayerNameLink>
        <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
          Handicap: {Math.round(hcp)}
        </div>
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

function IndividualMatchView({ flight, event, holes }: { flight: any; event: any; holes: any[] }) {
  const allPlayers: any[] = flight.players ?? [];
  const allPlayersById = new Map(
    allPlayers.map((player: any) => [Number(player.playerId), player])
  );

  const getSavedOpponentId = (playerEntry: any) => {
    const flightOpponentId = Number(playerEntry?.opponentId ?? 0);
    if (flightOpponentId > 0) return flightOpponentId;

    const roundOpponentId = Number(playerEntry?.player?.rounds?.[0]?.opponentId ?? 0);
    return roundOpponentId > 0 ? roundOpponentId : null;
  };

  const getEffectiveHandicap = (playerEntry: any) => {
    const preHandicap = Number(playerEntry?.player?.rounds?.[0]?.preHandicap);
    if (Number.isFinite(preHandicap)) return preHandicap;
    return Number(playerEntry?.player?.handicap ?? 0);
  };

  const buildPairs = () => {
    const usedIds = new Set<number>();
    const pairs: [any, any][] = [];

    for (const player of allPlayers) {
      const playerId = Number(player.playerId);
      if (usedIds.has(playerId)) continue;

      const opponentId = Number(getSavedOpponentId(player) ?? 0);
      const opponent = allPlayersById.get(opponentId);
      if (opponent && !usedIds.has(Number(opponent.playerId))) {
        pairs.push([player, opponent]);
        usedIds.add(playerId);
        usedIds.add(Number(opponent.playerId));
      }
    }

    const remaining = allPlayers.filter((player: any) => !usedIds.has(Number(player.playerId)));
    for (let i = 0; i + 1 < remaining.length; i += 2) {
      pairs.push([remaining[i], remaining[i + 1]]);
    }

    return pairs;
  };

  const pairs = buildPairs();
  const popsByPlayerId = new Map<number, Map<number, number>>();

  for (const [left, right] of pairs) {
    const [leftPops, rightPops] = calculateMatchplayPops(
      { ...left.player, handicap: getEffectiveHandicap(left) },
      { ...right.player, handicap: getEffectiveHandicap(right) },
      holes
    );
    popsByPlayerId.set(Number(left.playerId), leftPops);
    popsByPlayerId.set(Number(right.playerId), rightPops);
  }

  const popsForHole = (playerId: number, holeNum: number) =>
    popsByPlayerId.get(Number(playerId))?.get(holeNum) || 0;

  const getScoreByHole = (playerEntry: any, holeNum: number) => {
    const scores = playerEntry?.player?.rounds?.[0]?.scores ?? [];
    const score = scores.find((entry: any) => Number(entry?.hole) === Number(holeNum));
    return Number(score?.gross ?? 0);
  };

  const getMatchupPoints = (playerEntry: any) => {
    const round = playerEntry?.player?.rounds?.[0];
    return {
      holePoints: Number(round?.pointsEarned ?? 0),
      matchPoints: Number(round?.matchPoints ?? 0),
      totalPoints: Number(round?.pointsEarned ?? 0) + Number(round?.matchPoints ?? 0),
      gross: Number(round?.gross ?? 0),
      net: Number(round?.net ?? 0),
    };
  };

  const getHolePointValues = (playerEntry: any) => {
    const playerId = Number(playerEntry?.playerId);
    const opponentId = Number(getSavedOpponentId(playerEntry) ?? 0);
    const opponent = allPlayersById.get(opponentId);
    const ptsPerHole = Number(event?.ptsPerHole ?? 0);

    if (!opponent || ptsPerHole <= 0) return holes.map(() => 0);

    return holes.map((hole: any) => {
      const playerGross = getScoreByHole(playerEntry, hole.num);
      const opponentGross = getScoreByHole(opponent, hole.num);
      if (!playerGross || !opponentGross) return 0;

      const playerNet = playerGross - popsForHole(playerId, hole.num);
      const opponentNet = opponentGross - popsForHole(opponentId, hole.num);

      if (playerNet === opponentNet) return ptsPerHole / 2;
      if (playerNet < opponentNet) return ptsPerHole;
      return 0;
    });
  };

  const renderPlayerRow = (playerEntry: any) => {
    const player = playerEntry.player;
    const matchup = getMatchupPoints(playerEntry);
    const holePointValues = getHolePointValues(playerEntry);

    return (
      <Fragment key={playerEntry.playerId}>
        <tr className="text-sm bg-slate-50/50">
          <td className="p-2 text-xs">
            <PlayerNameLink playerId={playerEntry.playerId} className="block font-semibold text-gray-800 hover:text-primary hover:underline">
              {player.firstName} {player.lastName}
            </PlayerNameLink>
            <span className="block text-[10px]">
              Handicap: {Math.round(getEffectiveHandicap(playerEntry))}
            </span>
          </td>
          {holes.map((hole: any) => {
            const score = getScoreByHole(playerEntry, hole.num);
            return (
              <td key={hole.num} className="p-2">
                <div className="relative h-8 border rounded flex items-center justify-center text-xs font-semibold bg-white">
                  {score || "-"}
                  {popsForHole(Number(playerEntry.playerId), hole.num) > 0 && (
                    <span className="score-medals">
                      {Array.from({
                        length: popsForHole(Number(playerEntry.playerId), hole.num),
                      }).map((_, idx) => (
                        <span key={idx} className="h-1 w-1 rounded-full bg-black" />
                      ))}
                    </span>
                  )}
                </div>
              </td>
            );
          })}
          <td className="font-bold text-center text-xs">{matchup.gross}</td>
          <td className="font-bold text-center text-xs">{matchup.net}</td>
          <td className="font-bold text-center text-xs">{matchup.holePoints}</td>
          <td className="font-bold text-center text-xs">{matchup.matchPoints}</td>
          <td className="font-bold text-center text-xs">{matchup.totalPoints}</td>
        </tr>
        <tr className="bg-slate-50 text-[11px] text-gray-600">
          <td className="p-2 font-semibold">Hole Pts</td>
          {holePointValues.map((value: number, idx: number) => (
            <td key={holes[idx]?.num ?? idx} className="p-2 text-center font-semibold">
              {value || "-"}
            </td>
          ))}
          <td className="w-px whitespace-nowrap" />
          <td className="w-px whitespace-nowrap" />
          <td className="w-px whitespace-nowrap text-center font-bold">{matchup.holePoints}</td>
          <td className="w-px whitespace-nowrap" />
          <td className="w-px whitespace-nowrap" />
        </tr>
      </Fragment>
    );
  };

  return (
    <div className="border rounded-lg">
      <div className="w-full overflow-x-auto">
        <table className="score-table">
          <thead>
            <tr className="text-xs text-gray-700">
              <th className="p-2">Player</th>
              {holes.map((hole: any) => (
                <th key={hole.num} className="p-2 text-center">
                  {hole.num}
                </th>
              ))}
              <th className="w-px whitespace-nowrap text-center">Total</th>
              <th className="w-px whitespace-nowrap text-center">Net</th>
              <th className="w-px whitespace-nowrap text-center">Hole Pts</th>
              <th className="w-px whitespace-nowrap text-center">Match Pts</th>
              <th className="w-px whitespace-nowrap text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(([p1, p2], pairIdx) => (
              <Fragment key={pairIdx}>
                {pairIdx > 0 && (
                  <tr aria-hidden="true">
                    <td colSpan={holes.length + 6} className="h-2 bg-gray-50" />
                  </tr>
                )}
                <tr className="bg-gray-50 text-[11px] font-semibold text-gray-500">
                  <td className="p-2" colSpan={holes.length + 6}>
                    Matchup {pairIdx + 1}:{" "}
                    <PlayerNameLink playerId={p1.playerId} className="font-semibold text-gray-600 hover:text-primary hover:underline">
                      {p1.player.firstName} {p1.player.lastName}
                    </PlayerNameLink>{" "}
                    vs{" "}
                    <PlayerNameLink playerId={p2.playerId} className="font-semibold text-gray-600 hover:text-primary hover:underline">
                      {p2.player.firstName} {p2.player.lastName}
                    </PlayerNameLink>
                  </td>
                </tr>
                {renderPlayerRow(p1)}
                {renderPlayerRow(p2)}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
