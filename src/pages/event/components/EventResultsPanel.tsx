import { Crown, Medal, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import type { EventInsightInput } from "@/features/league-intelligence/types";
import {
  buildEventLeaderboard,
  type EventLeaderboardSort,
} from "../eventLeaderboard";
import { ScoreLeaderboard } from "./EventLeaderboard";
import EventTeamStandings from "./EventTeamStandings";
import PlayerNameLink from "./PlayerNameLink";
import { EventInsightBadge, EventInsightSection } from "./EventInsightPrimitives";

const TABS = [
  { id: "points", label: "Points" },
  { id: "lowGross", label: "Low Gross" },
  { id: "lowNet", label: "Low Net" },
] satisfies Array<{ id: EventLeaderboardSort; label: string }>;

const formatNumber = (value: number | null) => {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

export default function EventResultsPanel({ event }: { event: EventInsightInput }) {
  const rounds = useMemo(() => event.metrics?.scores ?? [], [event.metrics?.scores]);
  const teamStandings = event.metrics?.teamStandings ?? [];
  const pointsEnabled = event.pointsEnabled !== false;
  const hasPoints = pointsEnabled && rounds.some(
    (round) => Number(round.pointsEarned || 0) + Number(round.matchPoints || 0) > 0,
  );
  const [sort, setSort] = useState<EventLeaderboardSort>(hasPoints ? "points" : "lowNet");
  const resolvedSort = !pointsEnabled && sort === "points" ? "lowNet" : sort;
  const leaderboard = useMemo(
    () => buildEventLeaderboard(rounds, resolvedSort),
    [resolvedSort, rounds],
  );
  const podium = leaderboard.slice(0, 3);
  const leader = leaderboard[0];
  const runnerUp = leaderboard[1];
  const margin = leader && runnerUp
    ? resolvedSort === "points"
      ? leader.points - runnerUp.points
      : resolvedSort === "lowGross"
        ? Number(runnerUp.gross) - Number(leader.gross)
        : Number(runnerUp.net) - Number(leader.net)
    : null;
  const primaryValue = (player: (typeof leaderboard)[number]) =>
    resolvedSort === "points" ? player.points : resolvedSort === "lowGross" ? player.gross : player.net;
  const primaryLabel = resolvedSort === "points" ? "points" : resolvedSort === "lowGross" ? "gross" : "net";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {podium.map((player, index) => (
          <div
            key={player.playerId}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${
              index === 0
                ? "border-amber-200 bg-linear-to-br from-amber-50 via-white to-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            {index === 0 ? (
              <div className="pointer-events-none absolute -right-7 -top-9 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl" />
            ) : null}
            <div className="relative flex items-start justify-between gap-3">
              <span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-black ${
                index === 0 ? "bg-slate-950 text-amber-300" : "bg-slate-100 text-slate-500"
              }`}>
                {index === 0 ? <Crown size={15} /> : <Medal size={14} />}
              </span>
              <span className="text-right">
                <span className="block text-2xl font-black tabular-nums text-slate-950">
                  {formatNumber(primaryValue(player))}
                </span>
                <span className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                  {primaryLabel}
                </span>
              </span>
            </div>
            <PlayerNameLink
              playerId={player.playerId}
              className="relative mt-4 block truncate text-sm font-black text-slate-900 hover:text-emerald-700"
            >
              {player.name}
            </PlayerNameLink>
            <p className="relative mt-1 text-[10px] text-slate-500">
              {formatNumber(player.points)} pts · {formatNumber(player.gross)} gross · {formatNumber(player.net)} net
            </p>
          </div>
        ))}
      </div>

      <EventInsightSection
        title="Event leaderboard"
        description="The full field with points, gross, net, and handicap context"
        action={
          <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner">
            {TABS.filter((tab) => pointsEnabled || tab.id !== "points").map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSort(tab.id)}
                aria-pressed={resolvedSort === tab.id}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                  resolvedSort === tab.id
                    ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid border-b border-slate-100 bg-slate-50/60 sm:grid-cols-3">
          {[
            { label: "Field", value: leaderboard.length, detail: "scored players" },
            { label: "Winning margin", value: margin == null ? "—" : formatNumber(Math.abs(margin)), detail: resolvedSort === "points" ? "points" : "strokes" },
            { label: margin === 0 ? "Result" : "Leader", value: margin === 0 ? "Tied" : leader?.name ?? "—", detail: resolvedSort === "points" ? "points race" : `low ${primaryLabel}` },
          ].map((metric) => (
            <div key={metric.label} className="border-b border-slate-100 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">{metric.label}</p>
              <p className="mt-1 truncate text-sm font-black text-slate-900">{metric.value}</p>
              <p className="mt-0.5 text-[9px] text-slate-400">{metric.detail}</p>
            </div>
          ))}
        </div>
        <ScoreLeaderboard leaderboard={leaderboard} sortBy={resolvedSort} />
      </EventInsightSection>

      {event.format === "team" && teamStandings.length > 0 ? (
        <EventInsightSection
          title="Team result"
          description="Player contributions and team points combined"
          action={<EventInsightBadge><Trophy size={10} /> Team event</EventInsightBadge>}
        >
          <EventTeamStandings standings={teamStandings} />
        </EventInsightSection>
      ) : null}
    </div>
  );
}
