import { AlertTriangle, CheckCircle2, ClipboardCheck } from "lucide-react";
import { buildCommissionerInsights } from "../commissionerInsights";
import type {
  IntelligenceEvent,
  LeagueAdminInput,
  LeagueIntelligenceMetrics,
} from "../types";
import IntelligenceShell, { InsightMetric, ToneDot } from "./IntelligenceShell";

export default function CommissionerInsights({
  league,
  events,
  metrics,
}: {
  league: LeagueAdminInput;
  events: IntelligenceEvent[];
  metrics?: LeagueIntelligenceMetrics;
}) {
  const insight = buildCommissionerInsights({ league, events, metrics });
  return (
    <IntelligenceShell
      kicker="Commissioner intelligence"
      title="Operations Check"
      description="A prioritized scan of billing, participation, scoring, scheduling, and renewal readiness."
      aside={insight.health === "ready" ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
          <CheckCircle2 size={13} /> Ready
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-bold text-amber-300">
          <AlertTriangle size={13} /> Review needed
        </span>
      )}
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 bg-white lg:grid-cols-4 lg:divide-y-0">
        <InsightMetric label="Missing scores" value={insight.missingScores.length} detail="events flagged" />
        <InsightMetric label="Flight checks" value={insight.unbalancedFlights.length} detail="events flagged" />
        <InsightMetric label="Participation" value={insight.inactiveGolfers.length} detail="golfers behind pace" />
        <InsightMetric label="Renewal" value={insight.renewalNeeded ? "Action due" : "On track"} detail={insight.daysToEnd == null ? "No end date" : `${Math.max(0, insight.daysToEnd)} days remaining`} />
      </div>
      {insight.items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-5 text-xs font-semibold text-emerald-700">
          <ClipboardCheck size={16} /> No operational issues detected from current league data.
        </div>
      ) : (
        <div className="grid border-t border-slate-200 md:grid-cols-2 xl:grid-cols-3">
          {insight.items.map((item) => (
            <div key={item.key} className="flex gap-2.5 border-b border-r border-slate-200 px-4 py-3.5">
              <ToneDot tone={item.tone} />
              <div>
                <p className="text-[11px] font-bold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </IntelligenceShell>
  );
}
