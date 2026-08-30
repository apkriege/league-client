import { Crown, Gauge, Trophy, Users } from "lucide-react";
import { Link } from "react-router";
import type { buildLeagueDashboard } from "../leagueDashboard";
import {
  LeagueInsightBadge,
  LeagueInsightEmpty,
  LeagueInsightSection,
} from "./LeagueInsightPrimitives";

type LeagueDashboard = ReturnType<typeof buildLeagueDashboard>;

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default function LeagueRacePanel({
  race,
  leagueId,
  entity,
}: {
  race: LeagueDashboard["playerRace"];
  leagueId: number;
  entity: "player" | "team";
}) {
  const { rows, contenders, contenderThreshold, leadGap } = race;
  const title = entity === "team" ? "Team live race" : "Player live race";
  const leaderPoints = rows[0]?.points ?? 0;
  const podium = rows.slice(0, 3);

  if (rows.length === 0 || !rows.some((row) => row.points !== 0 || row.appearances > 0)) {
    return (
      <LeagueInsightSection
        title={title}
        description="Standings pressure and contender status update as points are recorded"
      >
        <LeagueInsightEmpty>
          Complete a scored {entity === "team" ? "team " : ""}event to open this race.
        </LeagueInsightEmpty>
      </LeagueInsightSection>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {podium.map((entry, index) => {
          const path = entry.entity === "team"
            ? `/league/${leagueId}/team/${entry.id}`
            : `/league/${leagueId}/player/${entry.id}`;
          return (
            <Link
              key={`${entry.entity}-${entry.id}`}
              to={path}
              className={`group relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                index === 0
                  ? "border-amber-200 bg-linear-to-br from-amber-50 via-white to-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {index === 0 ? (
                <div className="pointer-events-none absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />
              ) : null}
              <div className="relative flex items-start justify-between gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-black ${
                  index === 0 ? "bg-slate-950 text-amber-300" : "bg-slate-100 text-slate-500"
                }`}>
                  {index === 0 ? <Crown size={15} /> : `#${entry.rank}`}
                </span>
                <span className="text-right">
                  <span className="block text-xl font-black tabular-nums text-slate-950">
                    {formatNumber(entry.points)}
                  </span>
                  <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    points
                  </span>
                </span>
              </div>
              <p className="relative mt-4 truncate text-sm font-black text-slate-900 transition group-hover:text-emerald-700">
                {entry.name}
              </p>
              <p className="relative mt-1 text-[10px] text-slate-500">
                {entry.rank === 1 ? "Setting the pace" : `${formatNumber(entry.gap)} points from first`}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(270px,0.55fr)]">
        <LeagueInsightSection
          title="Championship pressure"
          description={`Anyone within ${formatNumber(contenderThreshold)} points is marked as a live contender`}
          action={<LeagueInsightBadge>{contenders} in the hunt</LeagueInsightBadge>}
        >
          <div className="divide-y divide-slate-100">
            {rows.slice(0, 10).map((entry) => {
              const width = leaderPoints > 0 ? Math.max(5, (entry.points / leaderPoints) * 100) : 5;
              const isContender = entry.gap <= contenderThreshold;
              const path = entry.entity === "team"
                ? `/league/${leagueId}/team/${entry.id}`
                : `/league/${leagueId}/player/${entry.id}`;
              return (
                <Link
                  key={`${entry.entity}-race-${entry.id}`}
                  to={path}
                  className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition hover:bg-slate-50 sm:px-5"
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-black ${
                    entry.rank === 1 ? "bg-slate-950 text-amber-300" : "bg-slate-100 text-slate-500"
                  }`}>
                    {entry.rank}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                        {entry.name}
                      </span>
                      {isContender ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-700">
                          In hunt
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className={`block h-full rounded-full ${isContender ? "bg-linear-to-r from-slate-700 to-emerald-500" : "bg-slate-300"}`}
                        style={{ width: `${width}%` }}
                      />
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xs font-black tabular-nums text-slate-900">
                      {formatNumber(entry.points)}
                    </span>
                    <span className="block text-[9px] text-slate-400">
                      {entry.rank === 1 ? "leader" : `-${formatNumber(entry.gap)}`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </LeagueInsightSection>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {[
            { icon: Trophy, label: "Lead margin", value: leadGap == null ? "—" : formatNumber(leadGap), detail: "points over second", tone: "text-amber-600" },
            { icon: Gauge, label: "Contender line", value: formatNumber(contenderThreshold), detail: "points from first", tone: "text-emerald-600" },
            { icon: Users, label: "Live contenders", value: String(contenders), detail: `of ${rows.length} ranked`, tone: "text-blue-600" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <metric.icon size={15} className={metric.tone} strokeWidth={2.5} />
              <p className="mt-4 text-2xl font-black tabular-nums text-slate-950">{metric.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{metric.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
