import { useMemo, useState } from "react";
import { Activity, ChartNoAxesCombined, ListOrdered, Swords } from "lucide-react";
import { buildLeagueDashboard } from "../leagueDashboard";
import type {
  IntelligenceEvent,
  LeagueIntelligenceMetrics,
  LeagueRosterPlayer,
} from "../types";
import LeagueFormPanel from "./LeagueFormPanel";
import LeagueLeadersPanel from "./LeagueLeadersPanel";
import LeaguePulse from "./LeaguePulse";
import LeagueRacePanel from "./LeagueRacePanel";
import LeagueRivalriesPanel from "./LeagueRivalriesPanel";

type LeagueInsightView = "race" | "form" | "leaders" | "rivalries";

const views: Array<{
  id: LeagueInsightView;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Activity;
}> = [
  {
    id: "race",
    label: "The live race",
    shortLabel: "Race",
    description: "Podium, gaps and contenders",
    icon: Activity,
  },
  {
    id: "form",
    label: "Who's playing well",
    shortLabel: "Form",
    description: "Recent scoring and momentum",
    icon: ChartNoAxesCombined,
  },
  {
    id: "leaders",
    label: "League leaders",
    shortLabel: "Leaders",
    description: "Category boards and achievements",
    icon: ListOrdered,
  },
  {
    id: "rivalries",
    label: "Rivalry watch",
    shortLabel: "Rivalries",
    description: "Head-to-head league stories",
    icon: Swords,
  },
];

export default function LeagueIntelligenceDashboard({
  metrics,
  events,
  roster,
  periodLabel,
  leagueId,
}: {
  metrics?: LeagueIntelligenceMetrics;
  events: IntelligenceEvent[];
  roster: LeagueRosterPlayer[];
  periodLabel: string;
  leagueId: number;
}) {
  const [view, setView] = useState<LeagueInsightView>("race");
  const dashboard = useMemo(() => buildLeagueDashboard(metrics), [metrics]);

  return (
    <section aria-label="League intelligence" className="space-y-5">
      <LeaguePulse
        metrics={metrics}
        events={events}
        roster={roster}
        periodLabel={periodLabel}
        leagueId={leagueId}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-sm">
        <div className="grid grid-cols-4 gap-1" role="tablist" aria-label="League intelligence views">
          {views.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`league-intelligence-${item.id}`}
                onClick={() => setView(item.id)}
                className={`group flex min-w-0 items-center justify-center gap-2 rounded-xl px-1.5 py-2.5 text-left transition sm:px-3 xl:justify-start xl:px-4 ${
                  active
                    ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                }`}
              >
                <Icon size={15} className={`shrink-0 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold sm:hidden">{item.shortLabel}</span>
                  <span className="hidden truncate text-[11px] font-bold sm:block">{item.label}</span>
                  <span className="hidden truncate text-[9px] text-slate-400 xl:block">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id={`league-intelligence-${view}`} role="tabpanel">
        {view === "race" ? <LeagueRacePanel dashboard={dashboard} leagueId={leagueId} /> : null}
        {view === "form" ? <LeagueFormPanel dashboard={dashboard} leagueId={leagueId} /> : null}
        {view === "leaders" ? (
          <LeagueLeadersPanel dashboard={dashboard} metrics={metrics} leagueId={leagueId} />
        ) : null}
        {view === "rivalries" ? <LeagueRivalriesPanel dashboard={dashboard} leagueId={leagueId} /> : null}
      </div>

      <p className="px-1 text-[10px] leading-4 text-slate-400">
        Insights use completed results from {periodLabel.toLowerCase() === "overall" ? "the full league" : periodLabel}. Recent form compares up to three latest net results with the prior sample. Full standings and scoring totals remain below.
      </p>
    </section>
  );
}
