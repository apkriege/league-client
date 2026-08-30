import { CalendarClock, MapPinned, Swords, Target } from "lucide-react";
import { buildSchedulePreview } from "../schedulePreview";
import type { IntelligenceEvent, LeagueIntelligenceMetrics } from "../types";
import { getEventLocalDate } from "@/utils/eventDate";
import IntelligenceShell from "./IntelligenceShell";

const record = (wins: number, losses: number, ties: number) =>
  `${wins}-${losses}${ties ? `-${ties}` : ""}`;

const firstName = (name: string) => name.split(" ")[0] || name;

export default function MatchupPreview({
  events,
  metrics,
}: {
  events: IntelligenceEvent[];
  metrics?: LeagueIntelligenceMetrics;
}) {
  const preview = buildSchedulePreview({ events, metrics });
  if (!preview) return null;
  const eventDate = getEventLocalDate(preview.event.startsAt, preview.event.timeZone);

  return (
    <IntelligenceShell
      kicker="Schedule intelligence"
      title="Matchup Preview"
      description={`What to watch in ${preview.event.name}, based on recent performance, handicap, course history, and recorded meetings.`}
      aside={(
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white">
          <CalendarClock size={14} className="text-emerald-300" />
          {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      )}
    >
      {!preview.assignmentsReady ? (
        <div className="px-5 py-6 text-center text-xs text-slate-500">
          Matchup insights will appear when flights and opponents are assigned.
        </div>
      ) : preview.playerMatchups.length > 0 ? (
        <div className="grid gap-px bg-slate-200 lg:grid-cols-3">
          {preview.playerMatchups.slice(0, 3).map((matchup, index) => (
            <article key={`${matchup.playerId}-${matchup.opponentId}`} className="bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-black ${index === 0 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                      {index === 0 ? "Closest projected match" : "Match to watch"}
                    </p>
                    <p className="text-xs font-black text-slate-900">{matchup.playerName} vs {matchup.opponentName}</p>
                  </div>
                </div>
                <Swords size={15} className="text-slate-400" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <Target size={11} className="mx-auto text-blue-500" />
                  <p className="mt-1 text-xs font-black text-slate-900">{matchup.handicapGap ?? "—"}</p>
                  <p className="text-[8px] uppercase text-slate-400">HCP gap</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <Swords size={11} className="mx-auto text-violet-500" />
                  <p className="mt-1 text-xs font-black text-slate-900">
                    {matchup.history ? record(matchup.history.wins, matchup.history.losses, matchup.history.ties) : "New"}
                  </p>
                  <p className="text-[8px] uppercase text-slate-400">History</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <MapPinned size={11} className="mx-auto text-emerald-500" />
                  <p className="mt-1 text-xs font-black text-slate-900">
                    {matchup.courseEdge == null
                      ? "—"
                      : matchup.courseEdge === 0
                        ? "Even"
                        : `${firstName(matchup.courseEdge < 0 ? matchup.playerName : matchup.opponentName)} ${Math.abs(matchup.courseEdge)}`}
                  </p>
                  <p className="text-[8px] uppercase text-slate-400">Course edge</p>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-4 text-slate-500">
                {matchup.recentNet != null && matchup.opponentRecentNet != null
                  ? `Recent net averages: ${matchup.recentNet} vs ${matchup.opponentRecentNet}.`
                  : "Recent performance insights will strengthen as both golfers complete more rounds."}
                {matchup.courseEdge != null
                  ? matchup.courseEdge === 0
                    ? " Their course scoring history is even."
                    : ` Course history favors ${matchup.courseEdge < 0 ? matchup.playerName : matchup.opponentName} by ${Math.abs(matchup.courseEdge)} net strokes across ${matchup.courseSamples} combined rounds.`
                  : " No shared course history yet."}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
          {preview.teamMatchups.map((matchup) => (
            <article key={`${matchup.teamId}-${matchup.opponentId}`} className="bg-white p-4">
              <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Team matchup</p>
              <p className="mt-1 text-sm font-black text-slate-900">{matchup.teamName} vs {matchup.opponentName}</p>
              <p className="mt-1 text-[10px] text-slate-500">Only {matchup.pointsGap} season points separate these teams.</p>
            </article>
          ))}
        </div>
      )}
    </IntelligenceShell>
  );
}
