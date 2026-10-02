import type { EventInsightInput, EventInsightRound } from "./types";

const name = (round: EventInsightRound) =>
  `${round.player.firstName} ${round.player.lastName}`.trim();

const points = (round: EventInsightRound) =>
  Number(round.pointsEarned || 0) + Number(round.matchPoints || 0);

const roundOne = (value: number) => Math.round(value * 10) / 10;

const scoreToPar = (round: EventInsightRound, holes?: number[]) => {
  const scores = (round.scores ?? []).filter((score) => !holes || holes.includes(score.hole));
  if (scores.length === 0) return null;
  return scores.reduce((total, score) => total + score.net - score.par, 0);
};

export function buildEventRecap(event: EventInsightInput) {
  const rounds = event.metrics?.scores ?? [];
  if (rounds.length === 0) return null;
  const pointsEnabled = event.pointsEnabled !== false && rounds.some((round) => points(round) > 0);
  const ranked = [...rounds].sort((left, right) =>
    pointsEnabled
      ? points(right) - points(left) || left.net - right.net
      : left.net - right.net || left.gross - right.gross,
  );
  const winner = ranked[0];
  const runnerUp = ranked[1];
  const validNetScores = rounds
    .map((round) => Number(round.net))
    .filter(Number.isFinite);
  const holeScores = rounds.flatMap((round) =>
    (round.scores ?? []).filter(
      (score) =>
        Number.isFinite(Number(score.hole)) &&
        Number.isFinite(Number(score.gross)) &&
        Number.isFinite(Number(score.par)),
    ),
  );
  const grossByHole = new Map<number, { totalToPar: number; scores: number }>();
  for (const score of holeScores) {
    const hole = Number(score.hole);
    const current = grossByHole.get(hole) ?? { totalToPar: 0, scores: 0 };
    current.totalToPar += Number(score.gross) - Number(score.par);
    current.scores += 1;
    grossByHole.set(hole, current);
  }
  const toughestHole = [...grossByHole.entries()]
    .map(([hole, result]) => ({
      hole,
      averageGrossToPar: roundOne(result.totalToPar / result.scores),
    }))
    .sort(
      (left, right) =>
        right.averageGrossToPar - left.averageGrossToPar || left.hole - right.hole,
    )[0] ?? null;
  const allHoles = [...new Set(rounds.flatMap((round) => (round.scores ?? []).map((score) => score.hole)))].sort(
    (left, right) => left - right,
  );
  const separationHoles = allHoles
    .map((hole) => {
      const holeScores = rounds.flatMap((round) => {
        const score = round.scores?.find((entry) => entry.hole === hole);
        return score ? [{ playerName: name(round), net: score.net, par: score.par }] : [];
      });
      if (holeScores.length < 2) return null;
      const sorted = [...holeScores].sort((left, right) => left.net - right.net);
      return {
        hole,
        par: sorted[0].par,
        spread: sorted[sorted.length - 1].net - sorted[0].net,
        bestScore: sorted[0].net,
        bestPlayers: sorted
          .filter((entry) => entry.net === sorted[0].net)
          .map((entry) => entry.playerName),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((left, right) => right.spread - left.spread || left.hole - right.hole);
  const completedScorecardExists = rounds.some(
    (round) => (round.scores?.length ?? 0) >= Number(event.holes || allHoles.length),
  );
  const finishHoles = completedScorecardExists ? allHoles.slice(-3) : [];
  const clutch = rounds
    .flatMap((round) => {
      if (finishHoles.length === 0) return [];
      const toPar = scoreToPar(round, finishHoles);
      return toPar == null ? [] : [{ playerId: round.playerId, playerName: name(round), toPar }];
    })
    .sort((left, right) => left.toPar - right.toPar)[0];
  const relativeToPar = rounds
    .flatMap((round) => {
      const netToPar = scoreToPar(round);
      return netToPar == null
        ? []
        : [{ playerId: round.playerId, playerName: name(round), netToPar, net: round.net }];
    })
    .sort((left, right) => left.netToPar - right.netToPar)[0];
  const winnerHandicap = Number(winner.preHandicap ?? winner.postHandicap);
  const runnerUpHandicap = Number(runnerUp?.preHandicap ?? runnerUp?.postHandicap);
  const upset =
    runnerUp &&
    Number.isFinite(winnerHandicap) &&
    Number.isFinite(runnerUpHandicap) &&
    winnerHandicap - runnerUpHandicap >= 3
      ? {
          winner: name(winner),
          runnerUp: name(runnerUp),
          handicapGap: Math.round((winnerHandicap - runnerUpHandicap) * 10) / 10,
        }
      : null;

  return {
    winner: {
      playerId: winner.playerId,
      name: name(winner),
      points: points(winner),
      gross: winner.gross,
      net: winner.net,
    },
    runnerUp: runnerUp
      ? { playerId: runnerUp.playerId, name: name(runnerUp), points: points(runnerUp), net: runnerUp.net }
      : null,
    separationHole: separationHoles[0] ?? null,
    clutch,
    relativeToPar,
    upset,
    pointsUsed: pointsEnabled,
    finishHoles,
    fieldMetrics: {
      averageNet:
        validNetScores.length > 0
          ? roundOne(validNetScores.reduce((total, score) => total + score, 0) / validNetScores.length)
          : null,
      winningMargin: runnerUp
        ? roundOne(
            pointsEnabled
              ? points(winner) - points(runnerUp)
              : Number(runnerUp.net) - Number(winner.net),
          )
        : null,
      winningMarginUnit: pointsEnabled ? "points" : "strokes",
      parOrBetterRate:
        holeScores.length > 0
          ? Math.round(
              (holeScores.filter((score) => Number(score.gross) <= Number(score.par)).length /
                holeScores.length) *
                100,
            )
          : null,
      toughestHole,
    },
    summary: `${name(winner)} led ${event.name}${pointsEnabled ? ` with ${points(winner)} points` : ` at ${winner.net} net`}.${clutch ? ` ${clutch.playerName} produced the best closing stretch.` : ""}`,
  };
}
