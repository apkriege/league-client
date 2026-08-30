import {
  Activity,
  BrainCircuit,
  Flame,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { buildLeaguePulse, type LeaguePulseSpotlightKind } from "../leaguePulse";
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

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

function SpotlightIcon({ kind }: { kind: LeaguePulseSpotlightKind }) {
  if (kind === "hot") return <Flame size={14} strokeWidth={2.5} />;
  if (kind === "rivalry") return <Swords size={14} strokeWidth={2.5} />;
  if (kind === "team") return <Users size={14} strokeWidth={2.5} />;
  if (kind === "birdies") return <Target size={14} strokeWidth={2.5} />;
  if (kind === "improvement") return <TrendingUp size={14} strokeWidth={2.5} />;
  if (kind === "participation") return <Activity size={14} strokeWidth={2.5} />;
  return <Trophy size={14} strokeWidth={2.5} />;
}

export default function LeaguePulse({
  metrics,
  events,
  roster,
  periodLabel = "Overall",
  leagueId,
}: {
  metrics?: LeagueIntelligenceMetrics;
  events: IntelligenceEvent[];
  roster: LeagueRosterPlayer[];
  periodLabel?: string;
  leagueId: number;
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
  const storyGridClass =
    pulse.spotlights.length === 1
      ? ""
      : pulse.spotlights.length === 2
        ? "md:grid-cols-2"
        : pulse.spotlights.length === 3
          ? "md:grid-cols-3"
          : "sm:grid-cols-2 xl:grid-cols-4";

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
          <h2
            id="league-intelligence-heading"
            className="mt-2 text-2xl font-black tracking-tight sm:text-3xl"
          >
            League Pulse
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
            {periodLabel} competition, participation, and season-defining performances.
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:w-120 lg:justify-self-end xl:w-135">
          <HeaderMetric
            label="Who's hot"
            value={pulse.hotPlayer?.name ?? "Performance building"}
            detail={
              pulse.hotPlayer
                ? pulse.hotPlayer.improvement > 0
                  ? `${formatNumber(pulse.hotPlayer.improvement)} strokes better recently`
                  : `${formatNumber(pulse.hotPlayer.recentAverage)} recent net average`
                : "Two results unlock performance insights"
            }
            tone={pulse.hotPlayer ? "text-orange-300" : "text-white"}
          />
          <HeaderMetric
            label="Race leader"
            value={pulse.leader?.name ?? "Building standings"}
            detail={pulse.leader ? `${pulse.leader.points} points` : "No scored events"}
            tone={pulse.leader ? "text-amber-300" : "text-white"}
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
          <div
            key={metric.label}
            className="border-b border-r border-white/10 px-4 py-3 last:border-r-0 lg:border-b-0"
          >
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-1 text-sm font-black tabular-nums text-white">{metric.value}</p>
            <p className="mt-0.5 truncate text-[9px] text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10">
        <div
          className={`grid gap-px bg-white/10 ${storyGridClass}`}
        >
          {pulse.spotlights.map((spotlight) => {
            const destination = spotlight.playerId
              ? `/league/${leagueId}/player/${spotlight.playerId}`
              : spotlight.teamId
                ? `/league/${leagueId}/team/${spotlight.teamId}`
                : null;
            return (
              <article
                key={`${spotlight.kind}-${spotlight.title}`}
                className="bg-slate-950/70 px-5 py-4"
              >
                <div
                  className={`flex items-center justify-between gap-2 ${toneClass[spotlight.tone]}`}
                >
                  <div className="flex items-center gap-2">
                    <SpotlightIcon kind={spotlight.kind} />
                    <p className="text-[9px] font-black uppercase tracking-[0.12em]">
                      {spotlight.label}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[8px] font-bold text-slate-300 ring-1 ring-white/10">
                    {spotlight.stat}
                  </span>
                </div>
                {destination ? (
                  <Link
                    to={destination}
                    className={`mt-3 block text-[13px] font-black leading-5 transition hover:text-white ${toneClass[spotlight.tone]}`}
                  >
                    {spotlight.title}
                  </Link>
                ) : (
                  <h4
                    className={`mt-3 text-[13px] font-black leading-5 ${toneClass[spotlight.tone]}`}
                  >
                    {spotlight.title}
                  </h4>
                )}
                <p className="mt-1 text-[10px] leading-4 text-slate-400">{spotlight.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
