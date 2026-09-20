type RenewalEvent = {
  status?: string | null;
  type?: string | null;
  deletedAt?: unknown;
};

type RenewalSource = {
  endDate?: unknown;
  roundCount?: number;
  completedRoundCount?: number;
  events?: readonly RenewalEvent[];
};

const getDateKey = (value: unknown) => {
  if (typeof value === "string") return value.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
  const parsed = new Date(value as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const getProgress = (source: RenewalSource) => {
  if (source.events) {
    const playableEvents = source.events.filter((event) => {
      const status = String(event.status ?? "").toLowerCase();
      const type = String(event.type ?? "").toLowerCase();
      return !event.deletedAt && status !== "canceled" && type !== "off";
    });
    return {
      completed: playableEvents.filter(
        (event) => String(event.status ?? "").toLowerCase() === "completed"
      ).length,
      total: playableEvents.length,
    };
  }

  return {
    completed: Number(source.completedRoundCount ?? 0),
    total: Number(source.roundCount ?? 0),
  };
};

export type LeagueScheduleStatus = "Upcoming" | "Live" | "Completed";

export const getLeagueScheduleStatus = (
  source: RenewalSource & { startDate?: unknown },
  now = new Date()
): LeagueScheduleStatus => {
  const today = now.toISOString().slice(0, 10);
  const startDate = getDateKey(source.startDate);
  const endDate = getDateKey(source.endDate);
  const progress = getProgress(source);

  if (startDate && startDate > today) return "Upcoming";
  if (endDate && endDate < today) return "Completed";
  if (progress.total > 0 && progress.completed === progress.total) return "Completed";
  return "Live";
};

export const canCreateNextSeason = (source: RenewalSource, now = new Date()) => {
  const endDate = getDateKey(source.endDate);
  const today = now.toISOString().slice(0, 10);
  if (endDate && endDate < today) return true;

  const progress = getProgress(source);
  return progress.total > 0 && progress.completed === progress.total;
};

export const NEXT_SEASON_DISABLED_MESSAGE =
  "Available after the season ends or when all scheduled events are complete.";
