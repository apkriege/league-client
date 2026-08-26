import { formatEventDate, getEventLocalDate } from "@/utils/eventDate";
import type { PlayerRound } from "./playerTypes";

type PlayerRoundDate = Pick<PlayerRound, "date" | "startsAt" | "timeZone">;

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export const getPlayerRoundTimestamp = (round: PlayerRoundDate) => {
  const value = round.startsAt ?? round.date;
  const timestamp = new Date(String(value ?? "")).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const formatPlayerRoundDate = (round: PlayerRoundDate) => {
  if (round.startsAt) {
    return formatEventDate(round.startsAt, DATE_OPTIONS, "en-US", round.timeZone ?? undefined);
  }

  const date = getEventLocalDate(round.date);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-US", DATE_OPTIONS);
};
