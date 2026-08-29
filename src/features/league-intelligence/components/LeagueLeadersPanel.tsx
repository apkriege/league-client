import { Award, Crosshair, Medal, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router";
import type { buildLeagueDashboard, LeagueCategoryBoard } from "../leagueDashboard";
import type { LeagueIntelligenceMetrics } from "../types";
import {
  LeagueInsightBadge,
  LeagueInsightEmpty,
  LeagueInsightSection,
} from "./LeagueInsightPrimitives";

type LeagueDashboard = ReturnType<typeof buildLeagueDashboard>;

const toneClass: Record<LeagueCategoryBoard["tone"], string> = {
  emerald: "bg-emerald-600 text-white",
  amber: "bg-amber-400 text-slate-950",
  blue: "bg-blue-600 text-white",
  violet: "bg-violet-600 text-white",
};

export default function LeagueLeadersPanel({
  dashboard,
  metrics,
  leagueId,
}: {
  dashboard: LeagueDashboard;
  metrics?: LeagueIntelligenceMetrics;
  leagueId: number;
}) {
  const isTeamLeague = metrics?.standingsMode === "team";
  const hasSkins = (metrics?.skins?.gross.length ?? 0) + (metrics?.skins?.net.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {dashboard.categoryBoards.map((board) => (
          <LeagueInsightSection
            key={board.id}
            title={board.title}
            description={board.description}
            action={<Medal size={15} className="text-amber-500" />}
          >
            {board.rows.length === 0 ? (
              <LeagueInsightEmpty>More scored rounds are needed for this leaderboard.</LeagueInsightEmpty>
            ) : (
              <div className="divide-y divide-slate-100">
                {board.rows.map((row, index) => {
                  const path = isTeamLeague && board.id === "team-points"
                    ? `/league/${leagueId}/team/${row.id}`
                    : `/league/${leagueId}/player/${row.id}`;
                  return (
                    <Link
                      key={`${board.id}-${row.id}`}
                      to={path}
                      className="group grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition hover:bg-slate-50 sm:px-5"
                    >
                      <span className={`grid h-6 w-6 place-items-center rounded-lg text-[9px] font-black ${
                        index === 0 ? toneClass[board.tone] : "bg-slate-100 text-slate-500"
                      }`}>
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          {row.name}
                        </span>
                        <span className="block truncate text-[9px] text-slate-400">{row.detail}</span>
                      </span>
                      <span className="text-sm font-black tabular-nums text-slate-950">{row.value}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </LeagueInsightSection>
        ))}
      </div>

      <LeagueInsightSection
        title="Achievement cabinet"
        description="Meaningful season awards earned from participation, scoring, improvement, and match play"
        action={<LeagueInsightBadge>{dashboard.achievements.length} unlocked</LeagueInsightBadge>}
      >
        {dashboard.achievements.length === 0 ? (
          <LeagueInsightEmpty>Achievements unlock as completed rounds build the season story.</LeagueInsightEmpty>
        ) : (
          <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
            {dashboard.achievements.map((achievement, index) => (
              <Link
                key={achievement.id}
                to={`/league/${leagueId}/player/${achievement.playerId}`}
                className="group bg-white p-4 transition hover:bg-emerald-50/30 sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-xl ${
                    index === 0
                      ? "bg-slate-950 text-amber-300"
                      : achievement.tone === "attention"
                        ? "bg-amber-50 text-amber-600"
                        : achievement.tone === "neutral"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {achievement.id === "striker" ? <ShieldCheck size={14} /> : achievement.id === "birdies" ? <Crosshair size={14} /> : <Award size={14} />}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-600">
                    {achievement.stat}
                  </span>
                </div>
                <p className="mt-4 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {achievement.label}
                </p>
                <p className="mt-1 text-sm font-black text-slate-900 group-hover:text-emerald-700">
                  {achievement.title}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">{achievement.detail}</p>
              </Link>
            ))}
          </div>
        )}
      </LeagueInsightSection>

      {hasSkins ? (
        <LeagueInsightSection
          title="Skins leaders"
          description="Unique low scores won outright on a hole"
          action={<Zap size={15} className="text-violet-500" />}
        >
          <div className="grid gap-px bg-slate-100 md:grid-cols-2">
            {(["gross", "net"] as const).map((type) => (
              <div key={type} className="bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={13} className={type === "gross" ? "text-amber-500" : "text-violet-500"} />
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                    {type} skins
                  </p>
                </div>
                <div className="space-y-2">
                  {(metrics?.skins?.[type] ?? []).map((player, index) => (
                    <Link
                      key={`${type}-${player.playerId}`}
                      to={`/league/${leagueId}/player/${player.playerId}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition hover:border-emerald-200"
                    >
                      <span className="text-[10px] font-black text-slate-400">#{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-800">{player.name}</span>
                      <span className="text-sm font-black text-slate-950">{player.skins}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </LeagueInsightSection>
      ) : null}
    </div>
  );
}
