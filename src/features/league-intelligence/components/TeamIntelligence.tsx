import { ShieldHalf, Sparkles, Swords, Users } from "lucide-react";
import type { TeamProfile } from "@api/teams/types";
import { buildTeamIntelligence } from "../teamIntelligence";
import IntelligenceShell, { InsightMetric } from "./IntelligenceShell";

const record = (wins: number, losses: number, ties: number) =>
  `${wins}-${losses}${ties ? `-${ties}` : ""}`;

export default function TeamIntelligence({ team }: { team: TeamProfile }) {
  const insight = buildTeamIntelligence(team);
  const topContributor = insight.contributions[0];
  const topPairing = insight.pairings[0];
  const primaryRival = insight.rivalries[0];

  return (
    <IntelligenceShell
      kicker="Team intelligence"
      title="Team DNA"
      description="Understand who is contributing, which combinations work, and where rivalries stand."
      aside={<ShieldHalf size={22} className="text-emerald-300" />}
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 bg-white lg:grid-cols-4 lg:divide-y-0">
        <InsightMetric label="Match record" value={record(insight.record.wins, insight.record.losses, insight.record.ties)} detail={`${insight.record.matches} completed matchups`} />
        <InsightMetric label="Top contributor" value={topContributor?.name ?? "—"} detail={topContributor ? `${topContributor.points} total points` : "No scored events"} />
        <InsightMetric label="Most-used pairing" value={topPairing?.names.join(" + ") ?? "—"} detail={topPairing ? `${topPairing.events} events · ${topPairing.winRate}% wins` : "No shared events"} />
        <InsightMetric label="Primary rivalry" value={primaryRival?.name ?? "—"} detail={primaryRival ? `${record(primaryRival.wins, primaryRival.losses, primaryRival.ties)} across ${primaryRival.meetings}` : "No meetings yet"} />
      </div>

      <div className="grid border-t border-slate-200 lg:grid-cols-3">
        <section className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900">Scoring identity</h3>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["Birdies", insight.totals.birdies],
              ["Pars", insight.totals.pars],
              ["Bogeys", insight.totals.bogeys],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg bg-white px-2 py-2 text-center ring-1 ring-slate-200">
                <p className="text-lg font-black text-slate-900">{value}</p>
                <p className="text-[8px] font-bold uppercase text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-blue-500" />
            <h3 className="text-xs font-bold text-slate-900">Current form order</h3>
          </div>
          <div className="mt-2.5 space-y-2">
            {insight.formOrder.slice(0, 3).map((player, index) => (
              <div key={player.playerId} className="flex items-center justify-between gap-3 text-[10px]">
                <span className="truncate font-semibold text-slate-700">{index + 1}. {player.name}</span>
                <span className="shrink-0 font-black tabular-nums text-slate-900">{player.recentAverage} avg pts</span>
              </div>
            ))}
            {insight.formOrder.length === 0 && <p className="text-[10px] text-slate-500">Form builds from completed events.</p>}
          </div>
        </section>

        <section className="p-4">
          <div className="flex items-center gap-2">
            <Swords size={14} className="text-violet-500" />
            <h3 className="text-xs font-bold text-slate-900">Rivalry board</h3>
          </div>
          <div className="mt-2.5 space-y-2">
            {insight.rivalries.slice(0, 3).map((rivalry) => (
              <div key={rivalry.id} className="flex items-center justify-between gap-3 text-[10px]">
                <span className="truncate font-semibold text-slate-700">{rivalry.name}</span>
                <span className="shrink-0 font-black tabular-nums text-slate-900">{record(rivalry.wins, rivalry.losses, rivalry.ties)}</span>
              </div>
            ))}
            {insight.rivalries.length === 0 && <p className="text-[10px] text-slate-500">Rivalries appear after team matchups.</p>}
          </div>
        </section>
      </div>
    </IntelligenceShell>
  );
}
