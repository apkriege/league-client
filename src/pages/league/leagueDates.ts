import dayjs from "dayjs";
import { addCalendarYear } from "@/features/leagues/seasonDates";

const getDateOnlyKey = (value: unknown) => {
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const parsed = new Date(value as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

export const parseLeagueDateInput = (value: string) =>
  new Date(`${value}T00:00:00.000Z`);

export const getLeagueDateInputValue = (value: unknown) => getDateOnlyKey(value);

export const getMaximumLeagueEndDate = (startDate: unknown) => {
  const startDateKey = getDateOnlyKey(startDate);
  if (!startDateKey) return "";
  return addCalendarYear(parseLeagueDateInput(startDateKey)).toISOString().slice(0, 10);
};

export const clampLeagueEndDate = (startDate: unknown, endDate: unknown) => {
  const startDateKey = getDateOnlyKey(startDate);
  if (!startDateKey) return endDate;
  const parsedStartDate = dayjs(startDateKey);

  const endDateKey = getDateOnlyKey(endDate);
  const parsedEndDate = dayjs(endDateKey);
  const maximumEndDate = dayjs(getMaximumLeagueEndDate(startDateKey));

  if (!parsedEndDate.isValid() || parsedEndDate.isBefore(parsedStartDate, "day")) {
    return parseLeagueDateInput(startDateKey);
  }

  if (parsedEndDate.isAfter(maximumEndDate, "day")) {
    return parseLeagueDateInput(maximumEndDate.format("YYYY-MM-DD"));
  }

  return parseLeagueDateInput(endDateKey);
};
