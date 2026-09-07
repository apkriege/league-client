export const calculateScrambleHandicap = (playerHandicaps: number[]) => {
  const allowances: Record<number, number[]> = {
    2: [0.35, 0.15],
    3: [0.3, 0.2, 0.1],
    4: [0.25, 0.2, 0.15, 0.1],
  };
  const weights = allowances[playerHandicaps.length];
  if (!weights) return 0;
  return Math.round(
    [...playerHandicaps]
      .sort((left, right) => left - right)
      .reduce((total, handicap, index) => total + handicap * weights[index], 0),
  );
};

export const calculateAlternateShotHandicap = (playerHandicaps: number[]) =>
  playerHandicaps.length === 2
    ? Math.round((playerHandicaps[0] + playerHandicaps[1]) * 0.5)
    : 0;
