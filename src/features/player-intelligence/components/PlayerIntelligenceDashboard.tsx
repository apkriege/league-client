import { useState } from "react";
import { Activity, BrainCircuit, ChartNoAxesCombined, Crosshair, Swords } from "lucide-react";
import type { PlayerIntelligence } from "@api/players/types";
import { formatSigned } from "../format";
import CompetePanel from "./CompetePanel";
import ImprovePanel from "./ImprovePanel";
import ProgressPanel from "./ProgressPanel";

type InsightView = "improve" | "compete" | "progress";

type SeasonSnapshot = {
  totalPoints: number;
  averagePoints9: number | null;
  averagePoints18: number | null;
  averageGross9: number | null;
  averageGross18: number | null;
  lowGross9: number | null;
  lowGross18: number | null;
  averageNet9: number | null;
  averageNet18: number | null;
  lowNet9: number | null;
  lowNet18: number | null;
  rounds: number;
  rounds9: number;
  rounds18: number;
};

const views: Array<{
  id: InsightView;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Crosshair;
}> = [
  { id: "improve", label: "Where to improve", shortLabel: "Improve", description: "Par, hole, course and tee insights", icon: Crosshair },
  { id: "compete", label: "How you compete", shortLabel: "Compete", description: "Rankings, opponents and rivalries", icon: Swords },
  { id: "progress", label: "How you're progressing", shortLabel: "Progress", description: "Form, records and season history", icon: ChartNoAxesCombined },
];

const formSummary = (delta: number | null) => {
  if (delta == null) return { label: "Building baseline", tone: "text-slate-300", detail: "6 rounds needed" };
  if (delta < -0.25) return { label: "Trending better", tone: "text-emerald-300", detail: `${formatSigned(delta)} strokes` };
  if (delta > 0.25) return { label: "Needs attention", tone: "text-amber-300", detail: `${formatSigned(delta)} strokes` };
  return { label: "Holding steady", tone: "text-blue-200", detail: "Last 3 vs prior 3" };
};

const consistencySummary = (value: number | null) => {
  if (value == null) return "Building baseline";
  if (value <= 3) return "Very steady";
  if (value <= 6) return "Steady";
  return "High variance";
};

export default function PlayerIntelligenceDashboard({
  intelligence,
  teamName,
  seasonSnapshot,
}: {
  intelligence: PlayerIntelligence;
  teamName?: string | null;
  seasonSnapshot: SeasonSnapshot;
}) {
  const [view, setView] = useState<InsightView>("improve");
  const form = formSummary(intelligence.pulse.formDelta);
  const value = (metric: number | null) => metric ?? "—";
  const seasonMetrics = [
    {
      label: "Season points",
      value: seasonSnapshot.totalPoints,
      detail: `9H ${value(seasonSnapshot.averagePoints9)} avg · 18H ${value(seasonSnapshot.averagePoints18)} avg`,
    },
    {
      label: "Average gross",
      value: `9H ${value(seasonSnapshot.averageGross9)} · 18H ${value(seasonSnapshot.averageGross18)}`,
      detail: `Lows ${value(seasonSnapshot.lowGross9)} / ${value(seasonSnapshot.lowGross18)}`,
    },
    {
      label: "Average net",
      value: `9H ${value(seasonSnapshot.averageNet9)} · 18H ${value(seasonSnapshot.averageNet18)}`,
      detail: `Lows ${value(seasonSnapshot.lowNet9)} / ${value(seasonSnapshot.lowNet18)}`,
    },
    {
      label: "Rounds played",
      value: seasonSnapshot.rounds,
      detail: `${seasonSnapshot.rounds9} nine-hole · ${seasonSnapshot.rounds18} eighteen-hole`,
    },
  ];

  return (
    <section aria-labelledby="player-intelligence-heading" className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.8)]">
        <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-emerald-300">
              <BrainCircuit size={15} strokeWidth={2.5} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Player intelligence</p>
            </div>
            <h2 id="player-intelligence-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Game Pulse
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
              See what is changing, where strokes are hiding, and how your game holds up when the matchup matters.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:min-w-105 sm:grid-cols-3">
            <div className="bg-slate-950/70 px-3 py-3.5 sm:px-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Scoring pace</p>
              <p className="mt-1 text-xl font-black tabular-nums">{formatSigned(intelligence.pulse.averageToPar)}</p>
              <p className="text-[9px] text-slate-400">per 18 holes</p>
            </div>
            <div className="bg-slate-950/70 px-3 py-3.5 sm:px-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Recent form</p>
              <p className={`mt-1 truncate text-sm font-black ${form.tone}`}>{form.label}</p>
              <p className="mt-1 text-[9px] text-slate-400">{form.detail}</p>
            </div>
            <div className="bg-slate-950/70 px-3 py-3.5 sm:px-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Consistency</p>
              <p className="mt-1 text-sm font-black text-white">{consistencySummary(intelligence.pulse.consistency)}</p>
              <p className="mt-1 text-[9px] text-slate-400">
                {intelligence.pulse.consistency == null ? "Need 2 rounds" : `${intelligence.pulse.consistency} stroke spread`}
              </p>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
          {seasonMetrics.map((metric) => (
            <div
              key={metric.label}
              className="border-b border-r border-white/10 px-4 py-3 last:border-r-0 lg:border-b-0"
            >
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
              <p className="mt-1 text-sm font-black tabular-nums text-white">{metric.value}</p>
              <p className="mt-0.5 text-[9px] text-slate-400">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="relative grid border-t border-white/10 md:grid-cols-3">
          {intelligence.takeaways.slice(0, 3).map((takeaway) => {
            const tone = takeaway.tone === "positive"
              ? "text-emerald-300"
              : takeaway.tone === "attention"
                ? "text-amber-300"
                : "text-blue-200";
            return (
              <div key={takeaway.title} className="border-b border-white/10 px-5 py-3.5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <div className="flex gap-2.5">
                  <Activity size={14} className={`mt-0.5 shrink-0 ${tone}`} strokeWidth={2.5} />
                  <div>
                    <p className={`text-[11px] font-bold ${tone}`}>{takeaway.title}</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-slate-400">{takeaway.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-sm">
        <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Player intelligence views">
          {views.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`player-intelligence-${item.id}`}
                onClick={() => setView(item.id)}
                className={`group flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-left transition sm:justify-start sm:px-4 ${active ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <Icon size={15} className={active ? "text-emerald-600" : "text-slate-400"} />
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold sm:hidden">{item.shortLabel}</span>
                  <span className="hidden truncate text-xs font-bold sm:block">{item.label}</span>
                  <span className="hidden truncate text-[9px] text-slate-400 lg:block">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id={`player-intelligence-${view}`} role="tabpanel">
        {view === "improve" && <ImprovePanel intelligence={intelligence} />}
        {view === "compete" && <CompetePanel intelligence={intelligence} teamName={teamName} />}
        {view === "progress" && <ProgressPanel intelligence={intelligence} />}
      </div>

      <p className="px-1 text-[10px] leading-4 text-slate-400">
        Based on {intelligence.sample.rounds} completed {intelligence.sample.rounds === 1 ? "round" : "rounds"} and {intelligence.sample.holes} scored holes. Lower scoring metrics are better. Comparisons update as league results are recorded.
      </p>
    </section>
  );
}
