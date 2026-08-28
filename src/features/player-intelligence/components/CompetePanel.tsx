import { ShieldHalf, Swords, Trophy } from "lucide-react";
import type { PlayerIntelligence } from "@api/players/types";
import { formatRecord } from "../format";
import { EmptyInsight, InsightSection, SampleBadge } from "./InsightPrimitives";

function RecordBadge({ wins, losses, ties }: { wins: number; losses: number; ties: number }) {
  const total = wins + losses + ties;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="text-right">
      <p className="text-sm font-black tabular-nums text-slate-900">{formatRecord(wins, losses, ties)}</p>
      <p className="text-[9px] font-semibold text-slate-400">{winRate}% wins</p>
    </div>
  );
}

export default function CompetePanel({
  intelligence,
  teamName,
}: {
  intelligence: PlayerIntelligence;
  teamName?: string | null;
}) {
  const matches = intelligence.headToHead.wins + intelligence.headToHead.losses + intelligence.headToHead.ties;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
      <InsightSection
        title="League position"
        description="Category ranks use only golfers with enough recorded data"
        action={<Trophy size={16} className="text-amber-500" />}
      >
        {intelligence.categoryRankings.length === 0 ? (
          <EmptyInsight>Rankings appear when league scores are available.</EmptyInsight>
        ) : (
          <div className="divide-y divide-slate-100">
            {intelligence.categoryRankings.map((ranking) => {
              const percentile = ranking.total > 1
                ? Math.round(((ranking.total - ranking.rank) / (ranking.total - 1)) * 100)
                : 100;
              return (
                <div key={ranking.key} className="px-4 py-3.5 sm:px-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ranking.label}</p>
                      <p className="text-[10px] text-slate-500">{ranking.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black leading-none text-slate-900">
                        #{ranking.rank}<span className="text-[10px] font-semibold text-slate-400"> / {ranking.total}</span>
                      </p>
                      <p className="mt-1 text-[9px] text-slate-400">value {ranking.value}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-label={`${percentile}th percentile among eligible league golfers`}>
                    <div
                      className="h-full rounded-full bg-linear-to-r from-slate-700 to-emerald-500"
                      style={{ width: `${Math.max(6, percentile)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </InsightSection>

      <div className="space-y-4">
        <InsightSection
          title="Head-to-head"
          description="Results use the points recorded under each event’s scoring rules"
          action={<Swords size={16} className="text-slate-400" />}
        >
          {matches === 0 ? (
            <EmptyInsight>Head-to-head records appear after a completed event with an assigned opponent.</EmptyInsight>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 bg-slate-950 px-4 py-4 text-white sm:px-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Career matchup record</p>
                  <p className="mt-1 text-3xl font-black tracking-tight">
                    {formatRecord(intelligence.headToHead.wins, intelligence.headToHead.losses, intelligence.headToHead.ties)}
                  </p>
                </div>
                <SampleBadge>{matches} matches</SampleBadge>
              </div>
              <div className="divide-y divide-slate-100">
                {intelligence.headToHead.opponents.map((opponent) => (
                  <div key={opponent.opponentId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                      {opponent.opponentName.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{opponent.opponentName}</p>
                      <p className="text-[10px] text-slate-500">
                        {opponent.pointsFor}-{opponent.pointsAgainst} pts · net margin {opponent.averageNetMargin > 0 ? "+" : ""}{opponent.averageNetMargin}
                      </p>
                    </div>
                    <RecordBadge wins={opponent.wins} losses={opponent.losses} ties={opponent.ties} />
                  </div>
                ))}
              </div>
            </>
          )}
        </InsightSection>

        <InsightSection
          title={teamName ? `${teamName} rivalries` : "Team rivalries"}
          description="Every recorded team meeting, aggregated opponent by opponent"
          action={<ShieldHalf size={16} className="text-blue-500" />}
        >
          {intelligence.teamRivalries.length === 0 ? (
            <EmptyInsight>
              {teamName
                ? "Rivalry records appear after this team completes a matchup."
                : "Assign this golfer to a team to unlock rivalry history."}
            </EmptyInsight>
          ) : (
            <div className="divide-y divide-slate-100">
              {intelligence.teamRivalries.map((rivalry, index) => (
                <div key={rivalry.opponentId} className="grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5">
                  <span className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-black ${index === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">{rivalry.opponentName}</p>
                    <p className="text-[10px] text-slate-500">
                      {rivalry.matches} meetings · {rivalry.pointsFor}-{rivalry.pointsAgainst} total pts
                    </p>
                  </div>
                  <RecordBadge wins={rivalry.wins} losses={rivalry.losses} ties={rivalry.ties} />
                </div>
              ))}
            </div>
          )}
        </InsightSection>
      </div>
    </div>
  );
}
