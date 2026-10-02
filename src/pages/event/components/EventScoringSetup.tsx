import { MapPin, Medal, Trophy } from "lucide-react";
import {
  getEventScoringSummary,
  type EventScoringInput,
} from "@/features/scoring/eventScoringSummary";

type EventScoringSetupProps = {
  event: EventScoringInput;
  date: string;
  time: string;
  course: string;
  tee?: string;
};

const formatTeeLabel = (tee?: string) =>
  tee
    ?.split(" → ")
    .map((name) => (/\btees?$/i.test(name.trim()) ? name.trim() : `${name.trim()} tees`))
    .join(" → ");

export default function EventScoringSetup({
  event,
  date,
  time,
  course,
  tee,
}: EventScoringSetupProps) {
  const summary = getEventScoringSummary(event);
  const formattedTee = formatTeeLabel(tee);

  return (
    <dl className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">
      <div className="flex min-w-0 items-start gap-3 border-b border-slate-200 px-4 py-3 md:border-b-0 md:border-r">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-emerald-300">
          <MapPin size={13} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Where &amp; when
          </dt>
          <dd className="mt-1 truncate text-xs font-bold text-slate-900" title={course}>
            {course}{formattedTee ? ` · ${formattedTee}` : ""}
          </dd>
          <dd className="mt-0.5 text-[10px] text-slate-500">
            {date} at {time}
          </dd>
        </div>
      </div>

      <div className="flex min-w-0 items-start gap-3 border-b border-slate-200 px-4 py-3 md:border-b-0 md:border-r">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-emerald-300">
          <Medal size={13} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Scoring format
          </dt>
          <dd className="mt-1 text-xs font-bold text-slate-900">{summary.format}</dd>
        </div>
      </div>

      <div className="flex min-w-0 items-start gap-3 px-4 py-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-emerald-300">
          <Trophy size={13} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Points configuration
          </dt>
          <dd className="mt-1 text-xs font-bold leading-5 text-slate-900">{summary.points}</dd>
        </div>
      </div>
    </dl>
  );
}
