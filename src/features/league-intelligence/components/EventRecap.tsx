import { BrainCircuit } from "lucide-react";
import { buildEventRecap } from "../eventRecap";
import { buildEventStory } from "../eventStory";
import type { EventInsightInput } from "../types";
import EventRoundStory from "./EventRoundStory";

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

type EventOverview = {
  players: number;
  grossSkins: number;
  netSkins: number;
  holes: number;
  startSide: "front" | "back";
};

export default function EventRecap({
  event,
  overview,
}: {
  event: EventInsightInput;
  overview: EventOverview;
}) {
  const recap = buildEventRecap(event);
  if (!recap) return null;
  const story = buildEventStory(event, recap);
  const overviewMetrics = [
    { label: "Players", value: overview.players, detail: "scored players" },
    { label: "Gross skins", value: overview.grossSkins, detail: "winning holes" },
    { label: "Net skins", value: overview.netSkins, detail: "winning holes" },
    { label: "Holes", value: overview.holes, detail: `${overview.startSide} start` },
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

      {story && <EventRoundStory story={story} />}
    </section>
  );
}
