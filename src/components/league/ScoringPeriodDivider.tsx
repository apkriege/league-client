import type { LeagueScoringPeriod } from "@/types/league";
import { formatEventDate } from "@/utils/eventDate";

export default function ScoringPeriodDivider({ period }: { period: LeagueScoringPeriod }) {
  const startDate = formatEventDate(period.startDate, { month: "short", day: "numeric" });

  return (
    <div
      className="flex items-center gap-3 py-1"
      role="separator"
      aria-label={`${period.name} starts ${startDate}`}
    >
      <div className="h-px flex-1 bg-emerald-200" />
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <span>{period.name} starts</span>
        <span className="text-emerald-600/70">{startDate}</span>
      </div>
      <div className="h-px flex-1 bg-emerald-200" />
    </div>
  );
}
