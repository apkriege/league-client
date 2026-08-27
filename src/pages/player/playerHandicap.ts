export type HandicapRule = {
  count: number;
  adjustment: number;
};

export type HandicapDifferentialEntry<T> = {
  differential: number;
  row: T | null;
  isStartingIndex: boolean;
};

export const getHandicapRule = (roundCount: number): HandicapRule | null => {
  if (roundCount < 1) return null;
  // Mirrors the server's provisional-index rule for the first two rounds.
  if (roundCount <= 2) return { count: 1, adjustment: -2 };
  if (roundCount === 3) return { count: 1, adjustment: -2 };
  if (roundCount === 4) return { count: 1, adjustment: -1 };
  if (roundCount === 5) return { count: 1, adjustment: 0 };
  if (roundCount === 6) return { count: 2, adjustment: -1 };
  if (roundCount <= 8) return { count: 2, adjustment: 0 };
  if (roundCount <= 11) return { count: 3, adjustment: 0 };
  if (roundCount <= 14) return { count: 4, adjustment: 0 };
  if (roundCount <= 16) return { count: 5, adjustment: 0 };
  if (roundCount <= 18) return { count: 6, adjustment: 0 };
  if (roundCount === 19) return { count: 7, adjustment: 0 };
  return { count: 8, adjustment: 0 };
};

export const buildHandicapDifferentialPool = <T>(
  rows: T[],
  getDifferential: (row: T) => number,
  startingIndex: number,
): HandicapDifferentialEntry<T>[] => {
  const actualEntries = rows.slice(-20).map((row) => ({
    differential: getDifferential(row),
    row,
    isStartingIndex: false,
  }));

  if (!Number.isFinite(startingIndex) || actualEntries.length >= 20) {
    return actualEntries;
  }

  return [
    ...actualEntries,
    ...Array.from({ length: 20 - actualEntries.length }, () => ({
      differential: startingIndex,
      row: null,
      isStartingIndex: true,
    })),
  ];
};
