export const calculateMatchplayPops = (
  p1: any,
  p2: any,
  holes: any[],
  options: {
    p1Holes?: any[];
    p2Holes?: any[];
    allowance?: number;
  } = {}
) => {
  const p1hcp = Number(p1.handicap);
  const p2hcp = Number(p2.handicap);
  const p1Holes = options.p1Holes?.length ? options.p1Holes : holes;
  const p2Holes = options.p2Holes?.length ? options.p2Holes : holes;
  const allowance = Number(options.allowance ?? 1);
  const p1Playing = Math.round(p1hcp * allowance);
  const p2Playing = Math.round(p2hcp * allowance);
  const baseline = Math.min(p1Playing, p2Playing);

  return [
    calculateStrokeplayPops(p1Playing - baseline, p1Holes),
    calculateStrokeplayPops(p2Playing - baseline, p2Holes),
  ] as const;
};

export const calculateMatchPlayHolePoints = ({
  playerGross,
  opponentGross,
  playerPops = 0,
  opponentPops = 0,
  pointsPerHole = 0,
}: {
  playerGross: number;
  opponentGross: number;
  playerPops?: number;
  opponentPops?: number;
  pointsPerHole?: number;
}) => {
  if (playerGross <= 0 || opponentGross <= 0 || pointsPerHole <= 0) return 0;
  const playerNet = playerGross - playerPops;
  const opponentNet = opponentGross - opponentPops;
  if (playerNet === opponentNet) return pointsPerHole / 2;
  return playerNet < opponentNet ? pointsPerHole : 0;
};

export const calculateStrokeplayPops = (hcp: number, holes: any) => {
  hcp = Math.round(Number(hcp));
  const direction = hcp < 0 ? -1 : 1;
  const sortedHoles = [...holes].sort((a, b) =>
    direction < 0 ? b.hcp - a.hcp : a.hcp - b.hcp
  );
  const popsMap = new Map<number, number>();
  let remaining = Math.abs(hcp);
  let holeIndex = 0;

  while (remaining > 0 && sortedHoles.length > 0) {
    const hole = sortedHoles[holeIndex % sortedHoles.length];
    popsMap.set(hole.num, (popsMap.get(hole.num) || 0) + direction);
    remaining -= 1;
    holeIndex += 1;
  }

  return popsMap;
};

export const sortFlightTeamsByHandicap = (flight: any) => {
  const t1Id = flight.teams?.[0]?.teamId;
  const t2Id = flight.teams?.[1]?.teamId;

  const getSortHandicap = (playerEntry: any) => {
    const playerHandicap = Number(
      playerEntry?.handicapIndex ?? playerEntry?.player?.handicap,
    );
    if (Number.isFinite(playerHandicap)) {
      return playerHandicap;
    }

    return 999;
  };

  const byHandicap = (a: any, b: any) => {
    const aHcp = getSortHandicap(a);
    const bHcp = getSortHandicap(b);
    return aHcp - bHcp;
  };

  const hasTeams = t1Id !== undefined || t2Id !== undefined;
  const team1 = hasTeams
    ? (flight.players || []).filter((p: any) => p.teamId === t1Id).sort(byHandicap)
    : (flight.players || []).slice().sort(byHandicap);
  const team2 = hasTeams
    ? (flight.players || []).filter((p: any) => p.teamId === t2Id).sort(byHandicap)
    : [];

  return { t1Id, t2Id, team1, team2, matchupCount: Math.min(team1.length, team2.length) };
};

export const createTeamScoringHelpers = ({
  event,
  holes,
  team1,
  team2,
  matchupCount,
  popsForHole,
  getScoreAtHole,
}: any) => {
  const getTeamWinBonus = (team: 1 | 2) => {
    const bonus = Number(event?.ptsPerTeamWin) || 0;
    if (bonus <= 0) return 0;

    let team1HolesWon = 0;
    let team2HolesWon = 0;
    let playedHoles = 0;
    for (let i = 0; i < matchupCount; i++) {
      holes.forEach((hole: any, holeIdx: number) => {
        const p1Score = getScoreAtHole(team1[i], holeIdx);
        const p2Score = getScoreAtHole(team2[i], holeIdx);
        if (!p1Score || !p2Score) return;
        const p1Net = p1Score - popsForHole(team1[i].playerId, hole.num);
        const p2Net = p2Score - popsForHole(team2[i].playerId, hole.num);
        playedHoles++;
        if (p1Net < p2Net) team1HolesWon++;
        else if (p2Net < p1Net) team2HolesWon++;
      });
    }

    if (playedHoles === 0) return 0;
    if (team1HolesWon === team2HolesWon) return bonus / 2;

    const winner = team1HolesWon > team2HolesWon ? 1 : 2;
    return team === winner ? bonus : 0;
  };

  return { getTeamWinBonus };
};

export const createTeamBestBallScoringHelpers = ({
  event,
  holes,
  team1,
  team2,
  popsForHole,
  getScoreAtHole,
}: any) => {
  const pointsPerHole = Number(event?.ptsPerHole) || 0;

  const getBestBallAtHole = (players: any[], hole: any, holeIdx: number) => {
    let best: number | null = null;

    players.forEach((player: any) => {
      const gross = getScoreAtHole(player, holeIdx);
      if (!gross) return;

      const net = gross - popsForHole(player.playerId, hole.num);
      if (best == null || net < best) {
        best = net;
      }
    });

    return best;
  };

  const getTeamPointsForHole = (team: 1 | 2, hole: any, holeIdx: number) => {
    const left = getBestBallAtHole(team1, hole, holeIdx);
    const right = getBestBallAtHole(team2, hole, holeIdx);

    if (left == null || right == null || pointsPerHole <= 0) return 0;
    if (left === right) return pointsPerHole / 2;

    if (team === 1) return left < right ? pointsPerHole : 0;
    return right < left ? pointsPerHole : 0;
  };

  const getTeamTotalPoints = (team: 1 | 2) => {
    return holes.reduce((sum: number, hole: any, holeIdx: number) => {
      return sum + getTeamPointsForHole(team, hole, holeIdx);
    }, 0);
  };

  return {
    getTeamPointsForHole,
    getTeamTotalPoints,
  };
};
