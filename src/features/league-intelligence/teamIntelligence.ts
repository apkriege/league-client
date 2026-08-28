import type { TeamIntelligenceInput } from "./types";

const resultFor = (left: number, right: number) => {
  if (Math.abs(left - right) < 0.001) return "tie" as const;
  return left > right ? "win" as const : "loss" as const;
};

export function buildTeamIntelligence(team: TeamIntelligenceInput) {
  const completed = team.eventResults.filter(
    (event) => event.isAssigned && event.totalPoints != null && event.opponents.length > 0,
  );
  const rivalries = new Map<
    number,
    { id: number; name: string; wins: number; losses: number; ties: number; meetings: number }
  >();
  const contributions = new Map<
    number,
    { playerId: number; name: string; points: number; birdies: number; pars: number; bogeys: number; events: number; recent: number[] }
  >();
  const pairings = new Map<
    string,
    { playerIds: number[]; names: string[]; events: number; wins: number; points: number }
  >();
  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const event of completed) {
    const strongestOpponent = [...event.opponents]
      .filter((opponent) => opponent.totalPoints != null)
      .sort((left, right) => Number(right.totalPoints) - Number(left.totalPoints))[0];
    if (!strongestOpponent || event.totalPoints == null || strongestOpponent.totalPoints == null) continue;
    const result = resultFor(event.totalPoints, strongestOpponent.totalPoints);
    if (result === "win") wins += 1;
    else if (result === "loss") losses += 1;
    else ties += 1;

    const rivalry = rivalries.get(strongestOpponent.id) ?? {
      id: strongestOpponent.id,
      name: strongestOpponent.name,
      wins: 0,
      losses: 0,
      ties: 0,
      meetings: 0,
    };
    rivalry[result === "win" ? "wins" : result === "loss" ? "losses" : "ties"] += 1;
    rivalry.meetings += 1;
    rivalries.set(rivalry.id, rivalry);

    for (const round of event.playerRounds) {
      const contribution = contributions.get(round.playerId) ?? {
        playerId: round.playerId,
        name: round.playerName,
        points: 0,
        birdies: 0,
        pars: 0,
        bogeys: 0,
        events: 0,
        recent: [],
      };
      contribution.points += round.points;
      contribution.birdies += round.birdies;
      contribution.pars += round.pars;
      contribution.bogeys += round.bogeys;
      contribution.events += 1;
      contribution.recent.push(round.points);
      contributions.set(round.playerId, contribution);
    }

    const eventPlayers = [...event.playerRounds].sort((left, right) => left.playerId - right.playerId);
    for (let leftIndex = 0; leftIndex < eventPlayers.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < eventPlayers.length; rightIndex += 1) {
        const left = eventPlayers[leftIndex];
        const right = eventPlayers[rightIndex];
        const key = `${left.playerId}:${right.playerId}`;
        const pairing = pairings.get(key) ?? {
          playerIds: [left.playerId, right.playerId],
          names: [left.playerName, right.playerName],
          events: 0,
          wins: 0,
          points: 0,
        };
        pairing.events += 1;
        pairing.wins += result === "win" ? 1 : 0;
        pairing.points += left.points + right.points;
        pairings.set(key, pairing);
      }
    }
  }

  const contributionRows = [...contributions.values()]
    .map((row) => ({
      ...row,
      points: Math.round(row.points * 10) / 10,
      averagePoints: Math.round((row.points / row.events) * 10) / 10,
      recentAverage: Math.round(
        (row.recent.slice(-3).reduce((sum, value) => sum + value, 0) /
          Math.max(1, row.recent.slice(-3).length)) * 10,
      ) / 10,
    }))
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name));

  return {
    record: { wins, losses, ties, matches: wins + losses + ties },
    rivalries: [...rivalries.values()].sort(
      (left, right) => right.meetings - left.meetings || left.name.localeCompare(right.name),
    ),
    contributions: contributionRows,
    pairings: [...pairings.values()]
      .map((pairing) => ({
        ...pairing,
        points: Math.round(pairing.points * 10) / 10,
        winRate: Math.round((pairing.wins / pairing.events) * 100),
      }))
      .sort((left, right) => right.events - left.events || right.winRate - left.winRate),
    formOrder: [...contributionRows].sort(
      (left, right) => right.recentAverage - left.recentAverage || left.name.localeCompare(right.name),
    ),
    totals: contributionRows.reduce(
      (totals, row) => ({
        birdies: totals.birdies + row.birdies,
        pars: totals.pars + row.pars,
        bogeys: totals.bogeys + row.bogeys,
      }),
      { birdies: 0, pars: 0, bogeys: 0 },
    ),
  };
}
