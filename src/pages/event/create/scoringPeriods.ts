import dayjs from "dayjs";

export type ScoringPeriodPayload = {
  name: string;
  startDate: string;
  endDate: string;
};

export const suggestFirstHalfEndDate = (
  eventDates: string[],
  seriesStartDate: string
): string => {
  const middleEventIndex = Math.max(0, Math.ceil(eventDates.length / 2) - 1);
  return eventDates[middleEventIndex] ?? seriesStartDate;
};

export const buildHalfScoringPeriods = (
  seriesStartDate: string,
  seriesEndDate: string,
  firstHalfEndDate: string
): ScoringPeriodPayload[] | null => {
  if (
    !seriesStartDate ||
    !seriesEndDate ||
    !firstHalfEndDate ||
    firstHalfEndDate < seriesStartDate ||
    firstHalfEndDate >= seriesEndDate
  ) {
    return null;
  }

  return [
    {
      name: "1st Half",
      startDate: seriesStartDate,
      endDate: firstHalfEndDate,
    },
    {
      name: "2nd Half",
      startDate: dayjs(firstHalfEndDate).add(1, "day").format("YYYY-MM-DD"),
      endDate: seriesEndDate,
    },
  ];
};
