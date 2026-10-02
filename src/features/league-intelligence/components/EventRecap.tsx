import { BrainCircuit } from "lucide-react";
import { buildEventRecap } from "../eventRecap";
import type { EventInsightInput } from "../types";

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

const formatted = (value: number | null) => {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

export default function EventRecap({ event }: { event: EventInsightInput }) {
  const recap = buildEventRecap(event);
  if (!recap) return null;
  const participantLabel = event.metrics?.scores?.some((round) => round.teamId)
    ? "Teams"
    : "Players";
  const participantCount = event.metrics?.scores?.length ?? 0;
  const marginUnit = recap.fieldMetrics.winningMargin === 1
    ? recap.fieldMetrics.winningMarginUnit.slice(0, -1)
    : recap.fieldMetrics.winningMarginUnit;
  const overviewMetrics = [
    {
      label: "Field avg net",
      value: formatted(recap.fieldMetrics.averageNet),
      detail: `${participantCount} scored ${participantLabel.toLowerCase()}`,
    },
    {
      label: "Winning margin",
      value: formatted(recap.fieldMetrics.winningMargin),
      detail: recap.fieldMetrics.winningMargin == null
        ? "Needs two scores"
        : recap.fieldMetrics.winningMargin === 0
          ? `Tied on ${recap.fieldMetrics.winningMarginUnit}`
          : `${marginUnit} over second`,
    },
    {
      label: "Par or better",
      value: recap.fieldMetrics.parOrBetterRate == null
        ? "—"
        : `${recap.fieldMetrics.parOrBetterRate}%`,
      detail: "gross hole scores",
    },
    {
      label: "Toughest hole",
      value: recap.fieldMetrics.toughestHole
        ? `Hole ${recap.fieldMetrics.toughestHole.hole}`
        : "—",
      detail: recap.fieldMetrics.toughestHole
        ? `${signed(recap.fieldMetrics.toughestHole.averageGrossToPar)} avg gross to par`
        : "No hole data",
    },
  ];

  return (
    <section
      aria-labelledby="event-intelligence-heading"
      className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.8)]"
    >
      <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-emerald-300">
            <BrainCircuit size={15} strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Event intelligence</p>
          </div>
          <h2 id="event-intelligence-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Event Recap
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">{recap.summary}</p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:min-w-105 sm:grid-cols-3">
          <div className="min-w-0 bg-slate-950/70 px-3 py-3.5 sm:px-4">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Event leader</p>
            <p className="mt-1 truncate text-sm font-black text-white">{recap.winner.name}</p>
            <p className="mt-1 text-[9px] text-slate-400">
              {recap.pointsUsed
                ? `${recap.winner.points} pts · ${recap.winner.net} net`
                : `${recap.winner.gross} gross · ${recap.winner.net} net`}
            </p>
          </div>
          <div className="min-w-0 bg-slate-950/70 px-3 py-3.5 sm:px-4">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Best vs handicap</p>
            <p className="mt-1 truncate text-sm font-black text-emerald-300">{recap.relativeToPar?.playerName ?? "—"}</p>
            <p className="mt-1 text-[9px] text-slate-400">
              {recap.relativeToPar ? `${signed(recap.relativeToPar.netToPar)} net to par` : "No hole data"}
            </p>
          </div>
          <div className="min-w-0 bg-slate-950/70 px-3 py-3.5 sm:px-4">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Closing stretch</p>
            <p className="mt-1 truncate text-sm font-black text-white">{recap.clutch?.playerName ?? "—"}</p>
            <p className="mt-1 text-[9px] text-slate-400">
              {recap.clutch ? `${signed(recap.clutch.toPar)} over holes ${recap.finishHoles.join("-")}` : "No closing holes"}
            </p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <div key={metric.label} className="border-b border-r border-white/10 px-4 py-3 last:border-r-0 lg:border-b-0">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="mt-1 text-sm font-black tabular-nums text-white">{metric.value}</p>
            <p className="mt-0.5 text-[9px] text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
