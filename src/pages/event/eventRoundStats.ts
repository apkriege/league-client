export type HoleScoreMode = "gross" | "net";

export type RoundHoleScore = {
  gross: number;
  net: number;
  par: number;
};

export type RoundScoreStats = {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
};

export const calculateRoundScoreStats = (
  scores: RoundHoleScore[],
  mode: HoleScoreMode,
): RoundScoreStats =>
  scores.reduce<RoundScoreStats>(
    (stats, score) => {
      const scoreToPar = Number(score[mode]) - Number(score.par);
      if (!Number.isFinite(scoreToPar)) return stats;

      if (scoreToPar <= -2) stats.eagles += 1;
      else if (scoreToPar === -1) stats.birdies += 1;
      else if (scoreToPar === 0) stats.pars += 1;
      else if (scoreToPar === 1) stats.bogeys += 1;

      return stats;
    },
    { eagles: 0, birdies: 0, pars: 0, bogeys: 0 },
  );
