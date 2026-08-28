import { ArrowDownRight, ArrowUpRight, Flag, MapPinned } from "lucide-react";
import type { PlayerIntelligence, PlayerIntelligenceHole } from "@api/players/types";
import { comparisonLabel, formatSigned, valueTone } from "../format";
import { EmptyInsight, InsightSection, SampleBadge } from "./InsightPrimitives";

function ParCard({ split }: { split: PlayerIntelligence["parSplits"][number] }) {
  const playerWidth = Math.min(100, Math.max(8, ((split.averageToPar ?? 0) + 1) * 24));
  const leagueWidth = Math.min(100, Math.max(8, ((split.leagueAverageToPar ?? 0) + 1) * 24));
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Par {split.par}
          </p>
          <p className={`mt-1 text-2xl font-black tabular-nums ${valueTone(split.versusLeague)}`}>
            {formatSigned(split.averageToPar)}
          </p>
          <p className="text-[10px] text-slate-500">average per hole</p>
        </div>
        <SampleBadge>{split.holes} holes</SampleBadge>
      </div>
      <div className="mt-4 space-y-2" aria-label={`Par ${split.par} player and league comparison`}>
        <div className="grid grid-cols-[42px_1fr_30px] items-center gap-2 text-[9px] font-semibold text-slate-500">
          <span>You</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <span className="block h-full rounded-full bg-slate-900" style={{ width: `${playerWidth}%` }} />
          </span>
          <span className="text-right tabular-nums">{formatSigned(split.averageToPar)}</span>
        </div>
        <div className="grid grid-cols-[42px_1fr_30px] items-center gap-2 text-[9px] font-semibold text-slate-500">
          <span>League</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <span className="block h-full rounded-full bg-slate-400" style={{ width: `${leagueWidth}%` }} />
          </span>
          <span className="text-right tabular-nums">{formatSigned(split.leagueAverageToPar)}</span>
        </div>
      </div>
      <p className={`mt-3 text-[10px] font-bold ${valueTone(split.versusLeague)}`}>
        {comparisonLabel(split.versusLeague)}
      </p>
    </div>
  );
}

function HoleRow({ hole, kind }: { hole: PlayerIntelligenceHole; kind: "strength" | "focus" }) {
  const Icon = kind === "strength" ? ArrowDownRight : ArrowUpRight;
  const tone = kind === "strength"
    ? "border-emerald-100 bg-emerald-50/60 text-emerald-700"
    : "border-amber-100 bg-amber-50/60 text-amber-800";
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${tone}`}>
        <Icon size={16} strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-xs font-bold text-slate-900">
            {hole.courseName} · Hole {hole.hole}
          </p>
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Par {hole.par} · {hole.teeName}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">
          {formatSigned(hole.averageToPar)} avg · {hole.samples} {hole.samples === 1 ? "round" : "rounds"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-black tabular-nums ${valueTone(hole.versusLeague)}`}>
          {formatSigned(hole.versusLeague)}
        </p>
        <p className="text-[9px] text-slate-400">vs league</p>
      </div>
    </div>
  );
}

export default function ImprovePanel({ intelligence }: { intelligence: PlayerIntelligence }) {
  const { strengths, opportunities } = intelligence.holeInsights;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div className="space-y-4">
        <InsightSection
          title="Scoring fingerprint"
          description="Gross strokes relative to par, compared with every recorded league hole"
          action={<SampleBadge>{intelligence.sample.holes} holes</SampleBadge>}
        >
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {intelligence.parSplits.map((split) => <ParCard key={split.par} split={split} />)}
          </div>
        </InsightSection>

        <InsightSection
          title="Course & tee splits"
          description="Like-for-like scoring only; different tees and round lengths stay separate"
          action={<MapPinned size={16} className="text-slate-400" />}
        >
          {intelligence.courseSplits.length === 0 ? (
            <EmptyInsight>Course patterns appear after the first completed round.</EmptyInsight>
          ) : (
            <div className="divide-y divide-slate-100">
              {intelligence.courseSplits.slice(0, 6).map((course) => (
                <div
                  key={`${course.courseId}-${course.teeName}-${course.holesPlayed}`}
                  className="grid grid-cols-[minmax(0,1fr)_repeat(3,52px)] items-center gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_repeat(4,70px)] sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">{course.courseName}</p>
                    <p className="text-[10px] text-slate-500">
                      {course.teeName} · {course.holesPlayed}H · {course.rounds} rounds
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black tabular-nums text-slate-900">{course.averageGross}</p>
                    <p className="text-[8px] uppercase text-slate-400">Avg</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-black tabular-nums text-slate-900">{course.averageNet}</p>
                    <p className="text-[8px] uppercase text-slate-400">Net</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black tabular-nums text-slate-900">{course.bestGross}</p>
                    <p className="text-[8px] uppercase text-slate-400">Best</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black tabular-nums text-slate-900">{formatSigned(course.averageToPar)}</p>
                    <p className="text-[8px] uppercase text-slate-400">Vs par</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InsightSection>
      </div>

      <div className="space-y-4">
        <InsightSection
          title="Stroke map"
          description="Uses repeat samples when available and always shows the sample size"
          action={<Flag size={16} className="text-slate-400" />}
        >
          {strengths.length === 0 && opportunities.length === 0 ? (
            <EmptyInsight>More completed hole scores are needed for a reliable comparison.</EmptyInsight>
          ) : (
            <div>
              {strengths.length > 0 && (
                <>
                  <div className="border-b border-slate-100 bg-emerald-50/40 px-4 py-2 sm:px-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">Lean into</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {strengths.map((hole) => (
                      <HoleRow key={`strength-${hole.courseId}-${hole.teeName}-${hole.hole}`} hole={hole} kind="strength" />
                    ))}
                  </div>
                </>
              )}
              {opportunities.length > 0 && (
                <>
                  <div className="border-y border-slate-100 bg-amber-50/40 px-4 py-2 sm:px-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-800">Best place to gain</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {opportunities.map((hole) => (
                      <HoleRow key={`focus-${hole.courseId}-${hole.teeName}-${hole.hole}`} hole={hole} kind="focus" />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </InsightSection>
      </div>
    </div>
  );
}
