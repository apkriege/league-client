import { Activity, BrainCircuit, Gauge, Trophy } from "lucide-react";
import { buildLeaguePulse } from "../leaguePulse";
import type {
  InsightTone,
  IntelligenceEvent,
  LeagueIntelligenceMetrics,
  LeagueRosterPlayer,
} from "../types";

const toneClass: Record<InsightTone, string> = {
  positive: "text-emerald-300",
  attention: "text-amber-300",
  neutral: "text-blue-200",
};

function HeaderMetric({
  label,
  value,
  detail,
  tone = "text-white",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 bg-slate-950/70 px-3 py-3.5 sm:px-4">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-sm font-black ${tone}`}>{value}</p>
      <p className="mt-1 truncate text-[9px] text-slate-400">{detail}</p>
    </div>
  );
}

const recordValue = (value: number | undefined, decimals = false) => {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const number = Number(value);
  return decimals && !Number.isInteger(number) ? number.toFixed(1) : String(number);
};

export default function LeaguePulse({
  metrics,
  events,
  roster,
  periodLabel = "Overall",
}: {
  metrics?: LeagueIntelligenceMetrics;
  events: IntelligenceEvent[];
  roster: LeagueRosterPlayer[];
  periodLabel?: string;
}) {
  const pulse = buildLeaguePulse({ metrics, events, roster });
  const recordMetrics = [
    {
      label: "Low gross",
      value: recordValue(metrics?.records?.lowGross?.value),
      detail: metrics?.records?.lowGross?.playerName ?? "No result yet",
    },
    {
      label: "Low net",
      value: recordValue(metrics?.records?.lowNet?.value),
      detail: metrics?.records?.lowNet?.playerName ?? "No result yet",
    },
    {
      label: "Most birdies",
      value: recordValue(metrics?.records?.mostBirdies?.value),
      detail: metrics?.records?.mostBirdies?.playerName ?? "No result yet",
    },
    {
      label: "Most points",
      value: recordValue(metrics?.records?.mostPoints?.value, true),
      detail: metrics?.records?.mostPoints?.playerName ?? "No result yet",
    },
  ];
  const storyGridClass = pulse.takeaways.length === 1
    ? ""
    : pulse.takeaways.length === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-3";

  return (
    <section
      aria-labelledby="league-intelligence-heading"
      className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.8)]"
    >
      <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-emerald-300">
            <BrainCircuit size={15} strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">League intelligence</p>
          </div>
          <h2 id="league-intelligence-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            League Pulse
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
            {periodLabel} competition, participation, and season-defining performances.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:min-w-105 sm:grid-cols-3">
          <HeaderMetric
            label="Race leader"
            value={pulse.leader?.name ?? "Building standings"}
            detail={pulse.leader ? `${pulse.leader.points} points` : "No scored events"}
            tone={pulse.leader ? "text-amber-300" : "text-white"}
          />
          <HeaderMetric
            label="Participation"
            value={`${pulse.participation}% active`}
            detail={`${pulse.activePlayers} of ${pulse.rosterSize} golfers`}
            tone="text-emerald-300"
          />
          <HeaderMetric
            label="Next up"
            value={pulse.nextEvent?.name ?? "Schedule complete"}
            detail={pulse.nextEvent ? "Upcoming event" : "No future events"}
          />
        </div>
      </div>

      <div className="relative grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
        {recordMetrics.map((metric) => (
          <div key={metric.label} className="border-b border-r border-white/10 px-4 py-3 last:border-r-0 lg:border-b-0">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="mt-1 text-sm font-black tabular-nums text-white">{metric.value}</p>
            <p className="mt-0.5 truncate text-[9px] text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-300">
              <Activity size={15} strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Season story</p>
              <h3 className="mt-0.5 text-sm font-black text-white">What is shaping the league</h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold text-slate-400">
            <Gauge size={11} />
            {pulse.completedEvents}/{pulse.scheduledEvents} events complete
          </span>
        </div>

        <div className={`grid gap-px border-t border-white/10 bg-white/10 ${storyGridClass}`}>
          {pulse.takeaways.slice(0, 3).map((takeaway) => (
            <article key={takeaway.title} className="bg-slate-950/70 px-5 py-4">
              <div className={`flex items-center gap-2 ${toneClass[takeaway.tone]}`}>
                {takeaway.tone === "neutral" ? (
                  <Trophy size={14} strokeWidth={2.5} />
                ) : (
                  <Activity size={14} strokeWidth={2.5} />
                )}
                <p className="text-[9px] font-black uppercase tracking-[0.12em]">League signal</p>
              </div>
              <h4 className={`mt-3 text-[13px] font-black leading-5 ${toneClass[takeaway.tone]}`}>
                {takeaway.title}
              </h4>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">{takeaway.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
