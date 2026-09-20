import {
  HoleScoreHeader,
  ScorecardIdentityCell,
  ScorecardTableFrame,
  ScoreHeaderCell,
  ScoreSummaryCell,
  ScoreValueCell,
} from "./components/ScoreTableCell";
import Table from "@/components/Table";
import { Fragment, memo } from "react";
import { Link, useParams } from "react-router";
import {
  calculateMatchPlayHolePoints,
  createTeamBestBallScoringHelpers,
  calculateMatchplayPops,
  calculateStrokeplayPops,
  getPopulatedFlightTeamSlots,
  getSharedTeamPlayingHandicap,
  sortFlightTeamsByHandicap,
} from "./util";
import {
  getEventScoringHoles,
  getPlayerHandicapIndex,
  getPlayerScoringHoles,
} from "./scoringSetup";
import PlayerHandicapSummary from "./components/PlayerHandicapSummary";
import HandicapStrokeIndicator from "./components/HandicapStrokeIndicator";
import {
  deriveScoringMode,
  getScoringFamily,
  isSharedTeamScoringMode,
} from "@/features/scoring/scoringModes";

function PlayerNameLink({
  playerId,
  children,
  className = "font-semibold text-gray-800 hover:text-slate-900 hover:underline",
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

function ViewFlightScores({ event, flight }: any) {
  const holes = getEventScoringHoles(event);
  const scoringMode = deriveScoringMode(event);

  if (isSharedTeamScoringMode(scoringMode)) {
    return <SharedTeamScoreView event={event} flight={flight} holes={holes} />;
  }

  if (event?.format === "individual" && getScoringFamily(scoringMode) === "match") {
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

  const baseTeam1 = [...fallbackTeam1];
  const baseTeam2 = [...fallbackTeam2];

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
  if (scoringMode === "match-play") {
    for (let i = 0; i < matchupCount; i++) {
      const left = team1[i];
      const right = team2[i];
      const [leftPops, rightPops] = calculateMatchplayPops(
        { ...left.player, handicap: getPlayerHandicapIndex(left) },
        { ...right.player, handicap: getPlayerHandicapIndex(right) },
        holes,
        {
          p1Holes: getPlayerScoringHoles(event, left),
          p2Holes: getPlayerScoringHoles(event, right),
          allowance: Number(event?.scoringConfig?.handicapAllowance ?? 1),
        },
      );
      popsByPlayerId.set(Number(left.playerId), leftPops);
      popsByPlayerId.set(Number(right.playerId), rightPops);
    }
  } else {
    const players = [...team1, ...team2];
    const allowance = Number(
      event?.scoringConfig?.handicapAllowance ??
        (scoringMode === "four-ball-match" ? 0.9 : 1),
    );
    const playingHandicaps = new Map(
      players.map((player: any) => [
        Number(player.playerId),
        Math.round(getPlayerHandicapIndex(player) * allowance),
      ]),
    );
    const baseline =
      scoringMode === "four-ball-match" && playingHandicaps.size > 0
        ? Math.min(...playingHandicaps.values())
        : 0;
    for (const player of players) {
      const playerId = Number(player.playerId);
      popsByPlayerId.set(
        playerId,
        calculateStrokeplayPops(
          Number(playingHandicaps.get(playerId) || 0) - baseline,
          getPlayerScoringHoles(event, player),
        ),
      );
    }
  }

  const popsForHole = (playerId: number, holeNum: number) => {
    return popsByPlayerId.get(Number(playerId))?.get(holeNum) || 0;
  };

  const getScoreAtHole = (player: any, holeIdx: number) => {
    const holeNum = Number(holes[holeIdx]?.num);
    const score = (player?.player?.rounds?.[0]?.scores ?? []).find(
      (entry: any) => Number(entry?.hole) === holeNum,
    );
    return Number(score?.gross ?? 0);
  };

  const allPlayersById = new Map(
    [...team1, ...team2].map((player: any) => [Number(player.playerId), player]),
  );
  const getPlayerHolePoints = (player: any, hole: any, holeIdx: number) => {
    const opponentId = Number(getSavedOpponentId(player) ?? 0);
    const opponent: any = allPlayersById.get(opponentId);
    if (!opponent) return 0;
    return calculateMatchPlayHolePoints({
      playerGross: getScoreAtHole(player, holeIdx),
      opponentGross: getScoreAtHole(opponent, holeIdx),
      playerPops: popsForHole(Number(player.playerId), Number(hole.num)),
      opponentPops: popsForHole(opponentId, Number(hole.num)),
      pointsPerHole: Number(event?.ptsPerHole ?? 0),
    });
  };

  const teamStrokeHelpers = createTeamBestBallScoringHelpers({
    event,
    holes,
    team1,
    team2,
    popsForHole,
    getScoreAtHole,
  });

  const getTeamPointsForHole = (team: 1 | 2, hole: any, holeIdx: number) =>
    scoringMode === "match-play"
      ? (team === 1 ? team1 : team2).reduce(
          (sum: number, player: any) => sum + getPlayerHolePoints(player, hole, holeIdx),
          0,
        )
      : teamStrokeHelpers.getTeamPointsForHole(team, hole, holeIdx);
  const getTeamTotalPoints = (team: 1 | 2) => {
    const teamId = Number(team === 1 ? t1Id : t2Id);
    return Number(
      (event.teamEventPoints ?? []).find((row: any) => Number(row.teamId) === teamId)?.points ?? 0,
    );
  };
  const getTeamPlayerPoints = (team: 1 | 2) =>
    (team === 1 ? team1 : team2).reduce((total: number, player: any) => {
      const round = player?.player?.rounds?.[0];
      return total + Number(round?.pointsEarned ?? 0) + Number(round?.matchPoints ?? 0);
    }, 0);
  const showHolePoints = true;
  const showPlayerMatchDetails = scoringMode === "match-play";
  const getTeamMedalPoints = (team: 1 | 2) => {
    if (!showHolePoints) return 0;
    const holePoints = holes.reduce(
      (total: number, hole: any, holeIndex: number) =>
        total + Number(getTeamPointsForHole(team, hole, holeIndex) || 0),
      0,
    );
    if (["best-ball", "stableford", "stroke-play", "maximum-score"].includes(scoringMode)) {
      return Math.round(holePoints * 10) / 10;
    }
    return Math.round((getTeamTotalPoints(team) - holePoints) * 10) / 10;
  };

  return (
    <ScorecardTableFrame>
      <Table
        data={getPopulatedFlightTeamSlots(team1, team2)}
        search={false}
        pagination={false}
        variant="clean"
        noBorder
        tableClassName="score-table"
        renderTable={(visibleTeams) => (
          <>
            <thead>
              <tr className="text-xs text-slate-700">
                <th className="min-w-44 pl-4">Player</th>
                {holes.map((hole: any) => <HoleScoreHeader key={hole.num} hole={hole} />)}
                <ScoreHeaderCell>Total</ScoreHeaderCell>
                <ScoreHeaderCell>Net</ScoreHeaderCell>
                <ScoreHeaderCell>Pts</ScoreHeaderCell>
              </tr>
            </thead>
            <tbody>
              {visibleTeams.map((team) => (
                <Fragment key={team}>
                  {(team === 1 ? team1 : team2).map((player: any) => (
                    <PlayerRow
                      key={player.id}
                      player={player}
                      holes={holes}
                      popsForHole={popsForHole}
                    />
                  ))}
                  <TeamPointsRow
                    label={`${team === 1
                      ? flight.teams?.[0]?.team?.name || "Team 1"
                      : flight.teams?.[1]?.team?.name || "Team 2"} ${
                        scoringMode === "stroke-play" || scoringMode === "maximum-score"
                          ? "aggregate"
                          : "points"
                      }`}
                    team={team}
                    holes={holes}
                    getTeamPointsForHole={getTeamPointsForHole}
                    getTeamMedalPoints={getTeamMedalPoints}
                    getTeamTotalPoints={getTeamTotalPoints}
                    getTeamPlayerPoints={getTeamPlayerPoints}
                    showHolePoints={showHolePoints}
                    holePointTotalLabel={
                      scoringMode === "stroke-play" || scoringMode === "maximum-score"
                        ? "Net"
                        : scoringMode === "best-ball" || scoringMode === "stableford"
                          ? "Hole pts"
                          : "Match"
                    }
                    showPlayerPointBreakdown={showPlayerMatchDetails}
                  />
                </Fragment>
              ))}
            </tbody>
          </>
        )}
      />
    </ScorecardTableFrame>
  );
}

export default memo(ViewFlightScores);

function SharedTeamScoreView({ event, flight, holes }: { event: any; flight: any; holes: any[] }) {
  const rounds = (event.teamRounds ?? []).filter(
    (round: any) => Number(round.flightId) === Number(flight.id),
  );
  const roundByTeamId = new Map(rounds.map((round: any) => [Number(round.teamId), round]));
  const eventPointsByTeamId = new Map<number, number>(
    (event.teamEventPoints ?? []).map((row: any) => [Number(row.teamId), Number(row.points)]),
  );
  const teams = flight.teams ?? [];

  if (rounds.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">No team scores entered.</p>;
  }

  return (
    <ScorecardTableFrame>
      <Table
        data={teams}
        search={false}
        pagination={false}
        variant="clean"
        noBorder
        tableClassName="score-table"
        renderTable={(visibleTeams) => (
          <>
            <thead>
              <tr className="text-xs text-slate-700">
                <th className="min-w-40 pl-4">Team</th>
                {holes.map((hole: any) => <HoleScoreHeader key={hole.num} hole={hole} />)}
                <ScoreHeaderCell>Gross</ScoreHeaderCell>
                <ScoreHeaderCell>Net</ScoreHeaderCell>
                <ScoreHeaderCell>Pts</ScoreHeaderCell>
              </tr>
            </thead>
            <tbody>
              {visibleTeams.map((team: any) => {
                const round: any = roundByTeamId.get(Number(team.teamId));
                const playingHandicap = getSharedTeamPlayingHandicap(round);
                const popsByHole = calculateStrokeplayPops(playingHandicap, holes);
                const scoreByHole = new Map(
                  (round?.scores ?? []).map((score: any) => [Number(score.hole), score]),
                );
                return (
                  <tr key={team.teamId} className="text-sm">
                    <ScorecardIdentityCell
                      primary={team.team?.name || `Team ${team.teamId}`}
                      secondary={round ? `PH ${playingHandicap}` : "No score"}
                    />
                    {holes.map((hole: any) => {
                      const score: any = scoreByHole.get(Number(hole.num));
                      return (
                        <td key={hole.num} className="p-2">
                          <div className="relative flex h-8 items-center justify-center rounded border bg-white text-xs font-bold">
                            {score?.gross ?? "—"}
                            {score ? (
                              <HandicapStrokeIndicator
                                strokes={popsByHole.get(Number(hole.num)) ?? 0}
                              />
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                    <ScoreValueCell>{round?.gross ?? "—"}</ScoreValueCell>
                    <ScoreValueCell>{round?.net ?? "—"}</ScoreValueCell>
                    <ScoreValueCell>
                      {round
                        ? eventPointsByTeamId.get(Number(team.teamId)) ??
                          Number(round.pointsEarned ?? 0) + Number(round.matchPoints ?? 0)
                        : "—"}
                    </ScoreValueCell>
                  </tr>
                );
              })}
            </tbody>
          </>
        )}
      />
    </ScorecardTableFrame>
  );
}

const PlayerRow = ({
  player,
  holes,
  popsForHole,
}: any) => {
  const p = player.player;
  const round = p.rounds[0];
  const scores = round?.scores || [];

  return (
    <tr className="text-sm bg-slate-50/50">
      <ScorecardIdentityCell
        primary={
          <PlayerNameLink playerId={player.playerId} className="hover:text-slate-700 hover:underline">
            {p.firstName} {p.lastName}
          </PlayerNameLink>
        }
        secondary={<PlayerHandicapSummary entry={player} />}
      />
      {holes.map((hole: any) => {
        const score = scores.find((entry: any) => Number(entry?.hole) === Number(hole.num))?.gross;
        return (
          <td key={hole.num} className="p-2">
            <div className="relative h-8 border rounded flex items-center justify-center text-xs font-semibold bg-white">
              {score ?? "-"}
              {score != null ? (
                <HandicapStrokeIndicator
                  strokes={popsForHole(Number(player.playerId), Number(hole.num))}
                />
              ) : null}
            </div>
          </td>
        );
      })}
      <ScoreValueCell>{round?.competitionGross ?? round?.gross ?? 0}</ScoreValueCell>
      <ScoreValueCell>{round?.net ?? 0}</ScoreValueCell>
      <ScoreValueCell>
        {Number(round?.pointsEarned ?? 0) + Number(round?.matchPoints ?? 0)}
      </ScoreValueCell>
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
      { ...left.player, handicap: getPlayerHandicapIndex(left) },
      { ...right.player, handicap: getPlayerHandicapIndex(right) },
      holes,
      {
        p1Holes: getPlayerScoringHoles(event, left),
        p2Holes: getPlayerScoringHoles(event, right),
        allowance: Number(event?.scoringConfig?.handicapAllowance ?? 1),
      }
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
          <ScorecardIdentityCell
            primary={
              <PlayerNameLink playerId={playerEntry.playerId} className="hover:text-slate-700 hover:underline">
                {player.firstName} {player.lastName}
              </PlayerNameLink>
            }
            secondary={<PlayerHandicapSummary entry={playerEntry} />}
          />
          {holes.map((hole: any) => {
            const score = getScoreByHole(playerEntry, hole.num);
            return (
              <td key={hole.num} className="p-2">
                <div className="relative h-8 border rounded flex items-center justify-center text-xs font-semibold bg-white">
                  {score || "-"}
                  <HandicapStrokeIndicator
                    strokes={popsForHole(Number(playerEntry.playerId), hole.num)}
                  />
                </div>
              </td>
            );
          })}
          <ScoreValueCell>{matchup.gross}</ScoreValueCell>
          <ScoreValueCell>{matchup.net}</ScoreValueCell>
          <ScoreValueCell>{matchup.totalPoints}</ScoreValueCell>
        </tr>
        <tr className="bg-slate-100 text-[11px] text-slate-600">
          <td className="p-3 font-bold">Hole points</td>
          {holePointValues.map((value: number, idx: number) => (
            <td key={holes[idx]?.num ?? idx} className="p-2 text-center font-semibold">
              {value || "—"}
            </td>
          ))}
          <ScoreSummaryCell value={matchup.matchPoints} label="Match" colSpan={2} />
          <ScoreSummaryCell value={matchup.holePoints} label="Hole" />
        </tr>
      </Fragment>
    );
  };

  return (
    <ScorecardTableFrame>
      <Table
        data={pairs}
        search={false}
        pagination={false}
        variant="clean"
        noBorder
        tableClassName="score-table"
        renderTable={(visiblePairs) => (
          <>
            <thead>
              <tr className="text-xs text-slate-700">
                <th className="min-w-44 pl-4">Player</th>
                {holes.map((hole: any) => <HoleScoreHeader key={hole.num} hole={hole} />)}
                <ScoreHeaderCell>Total</ScoreHeaderCell>
                <ScoreHeaderCell>Net</ScoreHeaderCell>
                <ScoreHeaderCell>Pts</ScoreHeaderCell>
              </tr>
            </thead>
            <tbody>
              {visiblePairs.map((pair) => {
                const [p1, p2] = pair;
                const pairIdx = pairs.indexOf(pair);
                return (
                  <Fragment key={pairIdx}>
                    {pairIdx > 0 && (
                      <tr aria-hidden="true">
                        <td colSpan={holes.length + 4} className="h-2 bg-slate-50" />
                      </tr>
                    )}
                    <tr className="bg-gray-50 text-[11px] font-semibold text-gray-500">
                      <td className="p-2" colSpan={holes.length + 4}>
                        Matchup {pairIdx + 1}:{" "}
                        <PlayerNameLink playerId={p1.playerId} className="font-semibold text-gray-600 hover:text-slate-900 hover:underline">
                          {p1.player.firstName} {p1.player.lastName}
                        </PlayerNameLink>{" "}
                        vs{" "}
                        <PlayerNameLink playerId={p2.playerId} className="font-semibold text-gray-600 hover:text-slate-900 hover:underline">
                          {p2.player.firstName} {p2.player.lastName}
                        </PlayerNameLink>
                      </td>
                    </tr>
                    {renderPlayerRow(p1)}
                    {renderPlayerRow(p2)}
                  </Fragment>
                );
              })}
            </tbody>
          </>
        )}
      />
    </ScorecardTableFrame>
  );
}

const TeamPointsRow = ({
  label,
  team,
  holes,
  getTeamPointsForHole,
  getTeamMedalPoints,
  getTeamTotalPoints,
  getTeamPlayerPoints,
  showHolePoints,
  holePointTotalLabel,
  showPlayerPointBreakdown,
}: any) => {
  return (
    <tr className="bg-slate-100 text-slate-600">
      <td className="p-3 text-xs font-bold">{label}</td>
      {holes.map((hole: any, holeIdx: number) => (
        <ScoreValueCell key={hole.num} className="p-2">
          {showHolePoints ? getTeamPointsForHole(team, hole, holeIdx) || "—" : "—"}
        </ScoreValueCell>
      ))}
      {showPlayerPointBreakdown ? (
        <>
          <ScoreSummaryCell value={getTeamTotalPoints(team)} label="Medal" colSpan={2} />
          <ScoreSummaryCell value={getTeamPlayerPoints(team)} label="Player" />
        </>
      ) : (
        <>
        <td />
        <td className="p-2 text-center font-bold">
          {showHolePoints ? (
          <span className="flex flex-col items-center leading-tight">
            <span className="text-sm tabular-nums">{getTeamMedalPoints(team)}</span>
            <span className="text-[10px] text-slate-500">{holePointTotalLabel}</span>
          </span>
        ) : (
          <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="p-2 font-bold text-center">{getTeamTotalPoints(team)}</td>
        </>
      )}
    </tr>
  );
};
