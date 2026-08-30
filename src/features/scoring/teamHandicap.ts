export const calculateScrambleHandicap = (courseHandicaps: number[]) => {
  const allowances: Record<number, number[]> = {
    2: [0.35, 0.15],
    3: [0.3, 0.2, 0.1],
    4: [0.25, 0.2, 0.15, 0.1],
  };
  const weights = allowances[courseHandicaps.length];
  if (!weights) return 0;
  return Math.round(
    [...courseHandicaps]
      .sort((left, right) => left - right)
      .reduce((total, handicap, index) => total + handicap * weights[index], 0),
  );
};

export const calculateAlternateShotHandicap = (courseHandicaps: number[]) =>
  courseHandicaps.length === 2
    ? Math.round((courseHandicaps[0] + courseHandicaps[1]) * 0.5)
    : 0;
