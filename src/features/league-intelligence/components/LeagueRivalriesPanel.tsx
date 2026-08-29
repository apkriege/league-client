import { Flame, MessageCircleMore, Swords, Users } from "lucide-react";
import { Link } from "react-router";
import type { buildLeagueDashboard } from "../leagueDashboard";
import {
  LeagueInsightBadge,
  LeagueInsightEmpty,
  LeagueInsightSection,
} from "./LeagueInsightPrimitives";

type LeagueDashboard = ReturnType<typeof buildLeagueDashboard>;

const record = (wins: number, losses: number, ties: number) =>
  `${wins}-${losses}${ties ? `-${ties}` : ""}`;

export default function LeagueRivalriesPanel({
  dashboard,
  leagueId,
}: {
  dashboard: LeagueDashboard;
  leagueId: number;
}) {
  const featured = dashboard.rivalries[0];
  const classics = dashboard.rivalries.filter((rivalry) => rivalry.label === "Instant classic").length;
  const totalMeetings = dashboard.rivalries.reduce((sum, rivalry) => sum + rivalry.meetings, 0);

  if (!featured) {
    return (
      <LeagueInsightSection
        title="Rivalry watch"
        description="Head-to-head stories are built only from assigned match-play results"
        action={<Swords size={15} className="text-slate-400" />}
      >
        <LeagueInsightEmpty>
          Rivalries unlock after opponents complete scored matchups. The league tables remain available below.
        </LeagueInsightEmpty>
      </LeagueInsightSection>
    );
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-violet-300">
            <Flame size={14} strokeWidth={2.5} />
            <p className="text-[9px] font-black uppercase tracking-[0.18em]">Featured rivalry</p>
          </div>
          <LeagueInsightBadge>{featured.label}</LeagueInsightBadge>
        </div>
        <div className="relative grid items-center gap-5 px-5 py-6 sm:grid-cols-[1fr_auto_1fr] sm:px-8">
          <Link to={`/league/${leagueId}/player/${featured.playerId}`} className="group text-center sm:text-right">
            <p className="text-lg font-black text-white transition group-hover:text-emerald-300">{featured.playerName}</p>
            <p className="mt-1 text-[10px] text-slate-400">{featured.wins} matchup wins</p>
          </Link>
          <div className="mx-auto text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-violet-300 ring-1 ring-white/10">
              <Swords size={19} strokeWidth={2.5} />
            </span>
            <p className="mt-2 text-xs font-black tabular-nums text-amber-300">
              {record(featured.wins, featured.losses, featured.ties)}
            </p>
          </div>
          <Link to={`/league/${leagueId}/player/${featured.opponentId}`} className="group text-center sm:text-left">
            <p className="text-lg font-black text-white transition group-hover:text-emerald-300">{featured.opponentName}</p>
            <p className="mt-1 text-[10px] text-slate-400">{featured.losses} matchup wins</p>
          </Link>
        </div>
        <p className="relative border-t border-white/10 px-5 py-3 text-center text-[10px] text-slate-400">
          {featured.meetings} meetings recorded · the displayed record follows {featured.playerName}
        </p>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
        <LeagueInsightSection
          title="Matchup board"
          description="More meetings and tighter records rise to the top"
          action={<LeagueInsightBadge>{dashboard.rivalries.length} rivalries</LeagueInsightBadge>}
        >
          <div className="divide-y divide-slate-100">
            {dashboard.rivalries.map((rivalry, index) => (
              <div
                key={`${rivalry.playerId}-${rivalry.opponentId}`}
                className="grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-5"
              >
                <span className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-black ${
                  index === 0 ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Link className="truncate hover:text-emerald-700" to={`/league/${leagueId}/player/${rivalry.playerId}`}>
                      {rivalry.playerName}
                    </Link>
                    <span className="shrink-0 text-[9px] text-slate-300">vs</span>
                    <Link className="truncate hover:text-emerald-700" to={`/league/${leagueId}/player/${rivalry.opponentId}`}>
                      {rivalry.opponentName}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {rivalry.meetings} meetings · {rivalry.label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black tabular-nums text-slate-900">
                    {record(rivalry.wins, rivalry.losses, rivalry.ties)}
                  </p>
                  <p className="text-[8px] uppercase tracking-wide text-slate-400">record</p>
                </div>
              </div>
            ))}
          </div>
        </LeagueInsightSection>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {[
            { label: "Recorded meetings", value: totalMeetings, detail: "head-to-head results", icon: Swords, tone: "text-violet-600" },
            { label: "Instant classics", value: classics, detail: "3+ meetings, one-win margin", icon: MessageCircleMore, tone: "text-amber-600" },
            { label: "Active rivalries", value: dashboard.rivalries.length, detail: "unique player matchups", icon: Users, tone: "text-blue-600" },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Icon size={15} className={metric.tone} strokeWidth={2.5} />
                <p className="mt-4 text-2xl font-black tabular-nums text-slate-950">{metric.value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{metric.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{metric.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
