import dayjs from "dayjs";

export type ScheduleFlight = number[] | number[][];
export type ScheduleRound = { date: string; flights: ScheduleFlight[] };

/**
 * Generates Berger circle round-robin pairings. Each round is a flat list
 * where consecutive IDs form a matchup.
 */
export function generateRoundRobin(ids: number[]): number[][] {
  if (ids.length < 2) return [];

  const participants = ids.length % 2 === 0 ? [...ids] : [...ids, -1];
  const fixed = participants[0];
  const rotating = participants.slice(1);
  const rounds: number[][] = [];

  for (let round = 0; round < participants.length - 1; round++) {
    const row = [fixed, ...rotating];
    const pairs: number[] = [];
    for (let index = 0; index < participants.length / 2; index++) {
      const first = row[index];
      const second = row[participants.length - 1 - index];
      if (first !== -1 && second !== -1) pairs.push(first, second);
    }
    if (pairs.length) rounds.push(pairs);

    const tail = rotating.pop();
    if (tail !== undefined) rotating.unshift(tail);
  }

  return rounds;
}

export function buildFlights(
  pairs: number[],
  format: string,
  scoringFamily: string
): ScheduleFlight[] {
  const flights: ScheduleFlight[] = [];

  if (format === "team") {
    for (let index = 0; index < pairs.length; index += 2) {
      flights.push([pairs[index], pairs[index + 1]]);
    }
    return flights;
  }

  if (scoringFamily === "match") {
    for (let index = 0; index < pairs.length; index += 2) {
      flights.push([[pairs[index], pairs[index + 1]]]);
    }
    return flights;
  }

  for (let index = 0; index < pairs.length; index += 4) {
    flights.push(pairs.slice(index, Math.min(index + 4, pairs.length)));
  }
  return flights;
}

export function shuffleArray<T>(values: T[]): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export function buildDates(
  startDate: string,
  endDate: string,
  days: number[],
  frequency: "weekly" | "biweekly"
): string[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!days.length || !start.isValid() || !end.isValid() || end.isBefore(start, "day")) return [];

  const dates: string[] = [];
  let current = start;
  const startWeek = start.startOf("week");
  const weekInterval = frequency === "weekly" ? 1 : 2;

  while (!current.isAfter(end)) {
    const weekIndex = Math.floor(current.startOf("week").diff(startWeek, "day") / 7);
    if (weekIndex % weekInterval === 0 && days.includes(current.day())) {
      dates.push(current.format("YYYY-MM-DD"));
    }
    current = current.add(1, "day");
  }

  return dates;
}
