import type { PlayerRound } from "./playerTypes";

export type HoleCount = 9 | 18;

export type PlayerRoundAverage = {
  rounds: number;
  avgPoints: number;
  avgGross: number;
  avgNet: number;
  avgPutts: number;
  lowGross: number;
  lowNet: number;
};

export type PlayerRoundAverages = Record<HoleCount, PlayerRoundAverage | null>;

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const getHoleCount = (round: PlayerRound): HoleCount | null => {
  const holeCount = Number(round.holesPlayed ?? round.scores?.length);
  return holeCount === 9 || holeCount === 18 ? holeCount : null;
};

export const calculatePlayerRoundAverages = (rounds: PlayerRound[]): PlayerRoundAverages => {
  const groupedRounds = {
    9: [] as PlayerRound[],
    18: [] as PlayerRound[],
  } satisfies Record<HoleCount, PlayerRound[]>;

  rounds.forEach((round) => {
    const holeCount = getHoleCount(round);
    if (holeCount) groupedRounds[holeCount].push(round);
  });

  const calculateAverage = (holeCount: HoleCount): PlayerRoundAverage | null => {
    const matchingRounds = groupedRounds[holeCount];
    if (matchingRounds.length === 0) return null;

    const total = (key: "points" | "gross" | "net" | "putts") =>
      matchingRounds.reduce((sum, round) => sum + Number(round[key] ?? 0), 0);
    const lowest = (key: "gross" | "net") =>
      Math.min(...matchingRounds.map((round) => Number(round[key] ?? 0)));

    return {
      rounds: matchingRounds.length,
      avgPoints: roundToOneDecimal(total("points") / matchingRounds.length),
      avgGross: roundToOneDecimal(total("gross") / matchingRounds.length),
      avgNet: roundToOneDecimal(total("net") / matchingRounds.length),
      avgPutts: roundToOneDecimal(total("putts") / matchingRounds.length),
      lowGross: lowest("gross"),
      lowNet: lowest("net"),
    };
  };

  return { 9: calculateAverage(9), 18: calculateAverage(18) };
};
