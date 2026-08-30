import { Activity, Flame, Snowflake, Sparkles, TrendingDown } from "lucide-react";
import { Link } from "react-router";
import type { buildLeagueDashboard, LeagueFormStatus } from "../leagueDashboard";
import {
  LeagueInsightBadge,
  LeagueInsightEmpty,
  LeagueInsightSection,
} from "./LeagueInsightPrimitives";

type LeagueDashboard = ReturnType<typeof buildLeagueDashboard>;

const statusStyle: Record<LeagueFormStatus, { label: string; className: string }> = {
  hot: { label: "Heating up", className: "bg-orange-50 text-orange-700" },
  steady: { label: "Steady", className: "bg-blue-50 text-blue-700" },
  cooling: { label: "Searching", className: "bg-slate-100 text-slate-600" },
};

const signed = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`;

export default function LeagueFormPanel({
  dashboard,
  leagueId,
}: {
  dashboard: LeagueDashboard;
  leagueId: number;
}) {
  const hottest = dashboard.formRows[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Heating up", value: dashboard.formCounts.hot, detail: "recent net trend improving", icon: Flame, tone: "text-orange-600", surface: "from-orange-50" },
          { label: "Staying steady", value: dashboard.formCounts.steady, detail: "inside a 0.75-stroke band", icon: Activity, tone: "text-blue-600", surface: "from-blue-50" },
          { label: "Looking to rebound", value: dashboard.formCounts.cooling, detail: "recent net trend slipping", icon: Snowflake, tone: "text-slate-500", surface: "from-slate-50" },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`rounded-2xl border border-slate-200 bg-linear-to-br ${metric.surface} to-white p-4 shadow-sm`}>
              <div className="flex items-center justify-between gap-3">
                <Icon size={16} className={metric.tone} strokeWidth={2.5} />
                <span className="text-2xl font-black tabular-nums text-slate-950">{metric.value}</span>
              </div>
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">{metric.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{metric.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <LeagueInsightSection
          title="Recent performance"
          description="Recent net pace versus the prior sample, normalized to 18 holes"
          action={hottest ? <LeagueInsightBadge>{hottest.name} leads</LeagueInsightBadge> : undefined}
        >
          {dashboard.formRows.length === 0 ? (
            <LeagueInsightEmpty>Two completed scoring results per golfer unlock recent performance insights.</LeagueInsightEmpty>
          ) : (
            <div className="divide-y divide-slate-100">
              {dashboard.formRows.slice(0, 10).map((player, index) => {
                const status = statusStyle[player.status];
                return (
                  <Link
                    key={player.playerId}
                    to={`/league/${leagueId}/player/${player.playerId}`}
                    className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition hover:bg-slate-50 sm:px-5"
                  >
                    <span className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-black ${
                      index === 0 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          {player.name}
                        </span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide ${status.className}`}>
                          {status.label}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">
                        {player.recentAverage.toFixed(1)} recent net · {player.priorAverage.toFixed(1)} prior
                        {player.improvingStreak >= 2 ? ` · ${player.improvingStreak}-result improvement streak` : ""}
                      </span>
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-black tabular-nums ${
                      player.change < 0 ? "text-emerald-700" : player.change > 0 ? "text-amber-700" : "text-slate-500"
                    }`}>
                      {player.change < 0 ? <TrendingDown size={12} /> : null}
                      {signed(player.change)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </LeagueInsightSection>

        <LeagueInsightSection
          title="Recent round stars"
          description="Lowest average net in each of the latest scored events"
          action={<Sparkles size={15} className="text-violet-500" />}
        >
          {dashboard.recentWinners.length === 0 ? (
            <LeagueInsightEmpty>Recent event leaders will appear once scores are complete.</LeagueInsightEmpty>
          ) : (
            <div className="divide-y divide-slate-100">
              {dashboard.recentWinners.map((winner, index) => {
                const content = (
                  <>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[10px] font-black ${
                    index === 0 ? "bg-slate-950 text-emerald-300" : "bg-slate-100 text-slate-500"
                  }`}>
                    {winner.net.toFixed(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      {winner.playerName}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400">{winner.eventName}</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">low net</span>
                  </>
                );
                const className = "group flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5";
                return winner.playerId ? (
                  <Link
                    key={`${winner.eventName}-${winner.playerId}`}
                    to={`/league/${leagueId}/player/${winner.playerId}`}
                    className={className}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={`${winner.eventName}-tie`} className={className}>
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </LeagueInsightSection>
      </div>
    </div>
  );
}
