import { useState } from "react";
import { buildHoleDifficultyRows, type buildEventDashboard } from "@/features/league-intelligence/eventDashboard";
import { EventInsightEmpty, EventInsightSection } from "./EventInsightPrimitives";

type EventDashboard = ReturnType<typeof buildEventDashboard>;
const labels = {
  birdies: "Birdie or better",
  pars: "Par",
  bogeys: "Bogey",
  doubleBogeys: "Double bogey or worse",
};
const scoringColors = {
  birdies: "bg-emerald-500",
  pars: "bg-blue-500",
  bogeys: "bg-amber-400",
  doubleBogeys: "bg-red-400",
};
export function FieldScoringComparison({ metrics }: { metrics: EventDashboard["fieldComparison"] }) {
  return (
    <EventInsightSection title="Field scoring" description="Event scoring compared with the league season">
      {metrics.length === 0 ? <EventInsightEmpty>Season comparison data is still building.</EventInsightEmpty> : (
        <div>
          <dl className="grid grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.key} className="border-b border-r border-slate-100 px-4 py-3 even:border-r-0">
                <dt className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${scoringColors[metric.key]}`} />
                  {labels[metric.key]}
                </dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-base font-black tabular-nums text-slate-950">{metric.event}%</span>
                  <span className="text-[9px] tabular-nums text-slate-400">Season {metric.usual}%</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="px-4 py-2 text-[9px] text-slate-400">Gross hole scores · course and field mix vary</p>
        </div>
      )}
    </EventInsightSection>
  );
}

export function HoleDifficulty({ holes }: { holes: EventDashboard["holes"] }) {
  const [order, setOrder] = useState<"difficulty" | "hole">("difficulty");
  const [showAll, setShowAll] = useState(false);
  const rows = buildHoleDifficultyRows(holes, order);
  const visibleRows = showAll ? rows : rows.slice(0, 5);
  return (
    <EventInsightSection
      title="Hole difficulty"
      description={order === "difficulty" ? "Hardest first by average gross score" : "Average gross score in hole order"}
      action={holes.length > 0 && (
        <div className="flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5" role="group" aria-label="Hole sort order">
          {(["difficulty", "hole"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={order === value}
              onClick={() => setOrder(value)}
              className={`rounded-md px-2 py-1 text-[9px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                order === value
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {value === "difficulty" ? "Hardest" : "Hole order"}
            </button>
          ))}
        </div>
      )}
    >
      {rows.length === 0 ? <EventInsightEmpty>Scored holes unlock hole difficulty.</EventInsightEmpty> : (
        <div>
          <div className="grid grid-cols-[4rem_minmax(0,1fr)_3.5rem] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[9px] font-black uppercase tracking-wide text-slate-400">
            <span>Hole</span>
            <span>Field outcomes</span>
            <span className="text-right">Avg score</span>
          </div>
          <ol className="divide-y divide-slate-100">
            {visibleRows.map((hole) => (
              <li key={hole.hole} className="grid grid-cols-[4rem_minmax(0,1fr)_3.5rem] items-center gap-3 px-4 py-2.5 hover:bg-slate-50/70">
                <div>
                  <p className="text-xs font-black text-slate-900">Hole {hole.hole}</p>
                  <p className="text-[9px] text-slate-400">Par {hole.par}</p>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px] text-slate-500">
                  <span>
                    <strong className="font-black tabular-nums text-emerald-700">{hole.parOrBetter}/{hole.scores}</strong> par or better
                  </span>
                  <span>
                    <strong className={`font-black tabular-nums ${hole.doublesOrWorse ? "text-red-500" : "text-slate-400"}`}>
                      {hole.doublesOrWorse}/{hole.scores}
                    </strong> double+
                  </span>
                </div>
                <p className="text-right text-base font-black tabular-nums text-slate-950">{hole.averageGrossScore}</p>
              </li>
            ))}
          </ol>
          {rows.length > 5 && (
            <button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}
              className="w-full border-t border-slate-100 px-4 py-2.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
              {showAll ? "Show fewer holes" : `View all ${rows.length} holes`}
            </button>
          )}
        </div>
      )}
    </EventInsightSection>
  );
}
