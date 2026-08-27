export const calculateMatchplayPops = (p1: any, p2: any, holes: any) => {
  const p1hcp = Math.round(Number(p1.handicap));
  const p2hcp = Math.round(Number(p2.handicap));
  const hcpDiff = Math.abs(p1hcp - p2hcp);
  const sortedHoles = [...holes].sort((a: any, b: any) => a.hcp - b.hcp);

  // Map hole number to number of pops
  const p1PopsMap = new Map<number, number>();
  const p2PopsMap = new Map<number, number>();

  let remainingPops = hcpDiff;
  let holeIndex = 0;

  while (remainingPops > 0) {
    const hole = sortedHoles[holeIndex % sortedHoles.length];
    const currentPops = (p1hcp > p2hcp ? p1PopsMap.get(hole.num) : p2PopsMap.get(hole.num)) || 0;

    if (p1hcp > p2hcp) {
      p1PopsMap.set(hole.num, currentPops + 1);
    } else if (p2hcp > p1hcp) {
      p2PopsMap.set(hole.num, currentPops + 1);
    }

    remainingPops--;
    holeIndex++;
  }

  return [p1PopsMap, p2PopsMap];
};

export const calculateStrokeplayPops = (hcp: number, holes: any) => {
  hcp = Math.round(Number(hcp));
  const sortedHoles = [...holes].sort((a, b) => a.hcp - b.hcp);
  const popsMap = new Map<number, number>();
  const direction = hcp < 0 ? -1 : 1;
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
    const courseHandicap = Number(playerEntry?.courseHandicap);
    if (Number.isFinite(courseHandicap)) {
      return courseHandicap;
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
  getTeamPlayerPointsTotal,
}: any) => {
  const getTeamPointsForHole = (team: 1 | 2, hole: any, holeIdx: number) => {
    const pointsPerMatchup = Number(event?.ptsPerHole) || 0;
    let teamPoints = 0;

    for (let i = 0; i < matchupCount; i++) {
      const p1 = team1[i];
      const p2 = team2[i];

      const p1Score = getScoreAtHole(p1, holeIdx);
      const p2Score = getScoreAtHole(p2, holeIdx);
      if (!p1Score || !p2Score || pointsPerMatchup <= 0) continue;

      const p1Net = p1Score - popsForHole(p1.playerId, hole.num);
      const p2Net = p2Score - popsForHole(p2.playerId, hole.num);

      if (p1Net === p2Net) {
        teamPoints += pointsPerMatchup / 2;
      } else if (team === 1 && p1Net < p2Net) {
        teamPoints += pointsPerMatchup;
      } else if (team === 2 && p2Net < p1Net) {
        teamPoints += pointsPerMatchup;
      }
    }

    return teamPoints;
  };

  const getTeamNetTotal = (team: 1 | 2) => {
    const players = team === 1 ? team1 : team2;
    let netTotal = 0;

    players.forEach((player: any) => {
      holes.forEach((hole: any, holeIdx: number) => {
        const score = getScoreAtHole(player, holeIdx);
        if (!score) return;
        netTotal += score - popsForHole(player.playerId, hole.num);
      });
    });

    return netTotal;
  };

  const getTeamWinBonus = (team: 1 | 2) => {
    const bonus = Number(event?.ptsPerTeamWin) || 0;
    if (bonus <= 0) return 0;

    const team1Net = getTeamNetTotal(1);
    const team2Net = getTeamNetTotal(2);

    if (team1Net === 0 && team2Net === 0) return 0;
    if (team1Net === team2Net) return bonus / 2;

    const winner = team1Net < team2Net ? 1 : 2;
    return team === winner ? bonus : 0;
  };

  const getTeamMatchBonusTotal = (team: 1 | 2) => {
    const pointsPerMatch = Number(event?.ptsPerMatch) || 0;
    if (pointsPerMatch <= 0) return 0;

    let total = 0;

    for (let i = 0; i < matchupCount; i++) {
      const p1 = team1[i];
      const p2 = team2[i];

      let p1NetTotal = 0;
      let p2NetTotal = 0;
      let playedHoles = 0;

      holes.forEach((hole: any, holeIdx: number) => {
        const p1Score = getScoreAtHole(p1, holeIdx);
        const p2Score = getScoreAtHole(p2, holeIdx);

        if (!p1Score || !p2Score) return;

        p1NetTotal += p1Score - popsForHole(p1.playerId, hole.num);
        p2NetTotal += p2Score - popsForHole(p2.playerId, hole.num);
        playedHoles++;
      });

      if (playedHoles === 0) continue;

      if (p1NetTotal === p2NetTotal) {
        total += pointsPerMatch / 2;
      } else if (
        (team === 1 && p1NetTotal < p2NetTotal) ||
        (team === 2 && p2NetTotal < p1NetTotal)
      ) {
        total += pointsPerMatch;
      }
    }

    return total;
  };

  const getTeamMedalPoints = (team: 1 | 2) => {
    return getTeamMatchBonusTotal(team) + getTeamWinBonus(team);
  };

  const getTeamTotalPoints = (team: 1 | 2) => {
    return getTeamPlayerPointsTotal(team) + getTeamWinBonus(team);
  };

  return {
    getTeamPointsForHole,
    getTeamWinBonus,
    getTeamMedalPoints,
    getTeamTotalPoints,
  };
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
