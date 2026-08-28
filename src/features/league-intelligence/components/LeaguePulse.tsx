import { CalendarClock } from "lucide-react";
import { buildLeaguePulse } from "../leaguePulse";
import type {
  IntelligenceEvent,
  LeagueIntelligenceMetrics,
  LeagueRosterPlayer,
} from "../types";
import IntelligenceShell, { InsightMetric, ToneDot } from "./IntelligenceShell";

export default function LeaguePulse({
  metrics,
  events,
  roster,
}: {
  metrics?: LeagueIntelligenceMetrics;
  events: IntelligenceEvent[];
  roster: LeagueRosterPlayer[];
}) {
  const pulse = buildLeaguePulse({ metrics, events, roster });
  return (
    <IntelligenceShell
      kicker="League intelligence"
      title="League Pulse"
      description="The competitive and participation signals that matter right now."
      aside={pulse.nextEvent ? (
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <CalendarClock size={14} className="text-emerald-300" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Next up</p>
            <p className="max-w-48 truncate text-xs font-bold text-white">{pulse.nextEvent.name}</p>
          </div>
        </div>
      ) : null}
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 bg-white lg:grid-cols-4 lg:divide-y-0">
        <InsightMetric label="Participation" value={`${pulse.participation}%`} detail={`${pulse.activePlayers} of ${pulse.rosterSize} golfers active`} />
        <InsightMetric label="Season progress" value={`${pulse.completedEvents}/${pulse.scheduledEvents}`} detail="events completed" />
        <InsightMetric label="Standings gap" value={pulse.leadGap == null ? "—" : pulse.leadGap} detail={pulse.leader ? `${pulse.leader.name} leads` : "No leader yet"} />
        <InsightMetric label="Most improved" value={pulse.mostImproved?.name ?? "—"} detail={pulse.mostImproved ? `${pulse.mostImproved.handicapChange > 0 ? "+" : ""}${pulse.mostImproved.handicapChange} HCP` : "Needs two rounds"} />
      </div>
      <div className="grid border-t border-slate-200 md:grid-cols-3">
        {pulse.takeaways.slice(0, 3).map((takeaway) => (
          <div key={takeaway.title} className="flex gap-2.5 border-b border-slate-200 px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
            <ToneDot tone={takeaway.tone} />
            <div>
              <p className="text-[11px] font-bold text-slate-900">{takeaway.title}</p>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{takeaway.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </IntelligenceShell>
  );
}
