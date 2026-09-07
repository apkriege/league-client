export type EventLeaderboardSort = "points" | "lowGross" | "lowNet";

export type EventLeaderboardEntry = {
  rank: number;
  tied: boolean;
  playerId: number;
  teamId?: number;
  name: string;
  handicap: number | null;
  points: number;
  gross: number | null;
  net: number | null;
};

type EventRound = {
  playerId?: unknown;
  teamId?: unknown;
  player?: {
    firstName?: unknown;
    lastName?: unknown;
  };
  preHandicap?: unknown;
  postHandicap?: unknown;
  pointsEarned?: unknown;
  matchPoints?: unknown;
  gross?: unknown;
  net?: unknown;
  competitionGross?: unknown;
  competitionNet?: unknown;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const compareAscendingWithNullsLast = (left: number | null, right: number | null) => {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return left - right;
};

const compareNames = (left: EventLeaderboardEntry, right: EventLeaderboardEntry) =>
  left.name.localeCompare(right.name, undefined, { sensitivity: "base" });

const compareLeaderboardEntries = (
  left: EventLeaderboardEntry,
  right: EventLeaderboardEntry,
  sortBy: EventLeaderboardSort
) => {
  if (sortBy === "points") {
    return (
      right.points - left.points ||
      compareAscendingWithNullsLast(left.net, right.net) ||
      compareAscendingWithNullsLast(left.gross, right.gross) ||
      compareNames(left, right)
    );
  }

  if (sortBy === "lowGross") {
    return (
      compareAscendingWithNullsLast(left.gross, right.gross) ||
      compareAscendingWithNullsLast(left.net, right.net) ||
      right.points - left.points ||
      compareNames(left, right)
    );
  }

  return (
    compareAscendingWithNullsLast(left.net, right.net) ||
    compareAscendingWithNullsLast(left.gross, right.gross) ||
    right.points - left.points ||
    compareNames(left, right)
  );
};

export const buildEventLeaderboard = (
  rounds: EventRound[],
  sortBy: EventLeaderboardSort
): EventLeaderboardEntry[] => {
  const entries = rounds
    .map((round) => {
      const firstName = String(round.player?.firstName || "").trim();
      const lastName = String(round.player?.lastName || "").trim();
      const pointsEarned = toFiniteNumber(round.pointsEarned) ?? 0;
      const matchPoints = toFiniteNumber(round.matchPoints) ?? 0;

      return {
        rank: 0,
        tied: false,
        playerId: Number(round.playerId),
        teamId: toFiniteNumber(round.teamId) ?? undefined,
        name: `${firstName} ${lastName}`.trim() || "Unknown Player",
        handicap: toFiniteNumber(round.preHandicap ?? round.postHandicap),
        points: pointsEarned + matchPoints,
        gross: toFiniteNumber(round.competitionGross ?? round.gross),
        net: toFiniteNumber(round.competitionNet ?? round.net),
      };
    })
    .filter((entry) => Number.isFinite(entry.playerId) && entry.playerId > 0)
    .sort((left, right) => compareLeaderboardEntries(left, right, sortBy));
  const value = (entry: EventLeaderboardEntry) =>
    sortBy === "points" ? entry.points : sortBy === "lowGross" ? entry.gross : entry.net;
  return entries.map((entry, index) => {
    const first = entries.findIndex((other) => value(other) === value(entry));
    return { ...entry, rank: first + 1, tied: entries.some((other, otherIndex) => otherIndex !== index && value(other) === value(entry)) };
  });
};
