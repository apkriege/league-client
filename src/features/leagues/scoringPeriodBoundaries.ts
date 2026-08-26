import type { LeagueScoringPeriod } from "@/types/league";
import { getEventDateInputValue } from "@/utils/eventDate";

type ScheduledEvent = {
  startsAt?: unknown;
  date?: unknown;
  timeZone?: string | null;
};

const getScheduledEventDate = (event: ScheduledEvent) =>
  getEventDateInputValue(event.startsAt ?? event.date, event.timeZone ?? undefined);

export const getScoringPeriodBoundariesBeforeEvent = (
  events: ScheduledEvent[],
  eventIndex: number,
  scoringPeriods: LeagueScoringPeriod[]
) => {
  if (eventIndex <= 0 || eventIndex >= events.length) return [];

  const previousEventDate = getScheduledEventDate(events[eventIndex - 1]);
  const currentEventDate = getScheduledEventDate(events[eventIndex]);
  if (!previousEventDate || !currentEventDate) return [];

  return [...scoringPeriods]
    .sort((left, right) => left.position - right.position)
    .filter((period) => period.position > 1)
    .filter((period) => {
      const periodStartDate = getEventDateInputValue(period.startDate);
      return (
        Boolean(periodStartDate) &&
        previousEventDate < periodStartDate &&
        currentEventDate >= periodStartDate
      );
    });
};
