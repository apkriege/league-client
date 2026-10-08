import {
  ChevronRight,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";

type PlayerProfileSummaryProps = {
  playerType?: string;
  teamName?: string;
  rounds: number;
  rank?: number | null;
  handicap: string;
  handicapHoleCount: number;
  handicapChange: number | null;
  handicapStatus: "unknown" | "provisional" | "calculated" | "manual";
  onOpenHandicap: () => void;
};

export function PlayerProfileSummary({
  playerType,
  teamName,
  rounds,
  rank,
  handicap,
  handicapHoleCount,
  handicapChange,
  handicapStatus,
  onOpenHandicap,
}: PlayerProfileSummaryProps) {
  const delta = handicapChange ?? 0;
  const ChangeIcon = delta < 0 ? TrendingDown : delta > 0 ? TrendingUp : Minus;
  const changeColor = delta < 0 ? "text-emerald-600" : delta > 0 ? "text-red-500" : "text-slate-500";
  const change = handicapChange == null ? "—" : Math.abs(handicapChange) < 0.005 ? "0.00" : `${delta > 0 ? "+" : ""}${handicapChange.toFixed(2)}`;
  const cellClass = "flex min-w-0 items-start gap-3 px-4 py-3";
  const iconClass = "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-emerald-300";
  const labelClass = "text-[9px] font-black uppercase tracking-[0.12em] text-slate-400";

  return (
    <dl className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">
      <div className={`${cellClass} border-b border-slate-200 md:border-b-0 md:border-r`}>
        <span className={iconClass}><User size={13} strokeWidth={2.5} /></span>
        <div className="min-w-0">
          <dt className={labelClass}>Player &amp; team</dt>
          <dd className="mt-1 text-xs font-bold capitalize text-slate-900">{playerType || "Player"}</dd>
          <dd className="mt-0.5 break-words text-[10px] leading-4 text-slate-500">{teamName || "No team assigned"}</dd>
        </div>
      </div>
      <div className={`${cellClass} border-b border-slate-200 md:border-b-0 md:border-r`}>
        <span className={iconClass}><Trophy size={13} strokeWidth={2.5} /></span>
        <div className="min-w-0">
          <dt className={labelClass}>Season results</dt>
          <dd className="mt-1 text-xs font-bold text-slate-900">{rounds} {rounds === 1 ? "round" : "rounds"} played</dd>
          <dd className="mt-0.5 text-[10px] text-slate-500">{rank ? `Rank #${rank}` : "Not ranked yet"}</dd>
        </div>
      </div>
      <div className={`${cellClass} group relative justify-between transition hover:bg-emerald-50/40 focus-within:bg-emerald-50/40`}>
        <button
          type="button"
          onClick={onOpenHandicap}
          className="absolute inset-0 cursor-pointer rounded-r-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600"
          aria-label="View handicap calculation"
        />
        <span className={iconClass}><Target size={13} strokeWidth={2.5} /></span>
        <div className="pointer-events-none min-w-0 flex-1">
          <dt className={labelClass}>{handicapHoleCount}-hole handicap</dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-2 text-sm font-black tabular-nums text-slate-900">
            {handicap}
            {handicapStatus !== "calculated" && <span className="text-[9px] font-semibold capitalize text-slate-500">{handicapStatus === "unknown" ? "Not established" : handicapStatus === "manual" ? "Assigned" : "Establishing"}</span>}
          </dd>
          <dd className={`mt-0.5 flex items-center gap-1 text-[10px] ${changeColor}`}>
            <ChangeIcon size={11} aria-hidden="true" />{change} this season
          </dd>
        </div>
        <ChevronRight
          size={14}
          className="pointer-events-none self-center text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600 group-focus-within:text-emerald-600"
          aria-hidden="true"
        />
      </div>
    </dl>
  );
}
