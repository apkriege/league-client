import { Medal, Trophy } from "lucide-react";
import {
  getEventScoringSummary,
  type EventScoringInput,
} from "@/features/scoring/eventScoringSummary";

export default function EventScoringSetup({ event }: { event: EventScoringInput }) {
  const summary = getEventScoringSummary(event);

  return (
    <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2">
      <div className="flex min-w-0 items-start gap-3 border-b border-slate-200 px-4 py-3 sm:border-b-0 sm:border-r">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-emerald-300">
          <Medal size={13} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Scoring format
          </p>
          <p className="mt-1 text-xs font-bold text-slate-900">{summary.format}</p>
        </div>
      </div>
      <div className="flex min-w-0 items-start gap-3 px-4 py-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <Trophy size={13} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Points configuration
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-900">{summary.points}</p>
        </div>
      </div>
    </div>
  );
}
