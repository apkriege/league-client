import { Award, Flame, History, Sparkles } from "lucide-react";
import type { PlayerIntelligence } from "@api/players/types";
import { formatSigned } from "../format";
import { EmptyInsight, InsightSection, SampleBadge } from "./InsightPrimitives";
import PlayerTrendChart from "./PlayerTrendChart";

export default function ProgressPanel({ intelligence }: { intelligence: PlayerIntelligence }) {
  const { streaks } = intelligence;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <InsightSection
          title="Performance trend"
          description="Each round is normalized to an 18-hole equivalent so short and full rounds compare fairly"
          action={<SampleBadge>{intelligence.trend.length} rounds</SampleBadge>}
        >
          {intelligence.trend.length < 2 ? (
            <EmptyInsight>Complete a second round to begin a meaningful scoring trend.</EmptyInsight>
          ) : (
            <div className="px-3 pb-3 pt-1 sm:px-5 sm:pb-5">
              <PlayerTrendChart trend={intelligence.trend} />
            </div>
          )}
        </InsightSection>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <InsightSection
            title="Momentum"
            description="Live streaks from the most recent completed hole"
            action={<Flame size={16} className="text-orange-500" />}
          >
            <div className="grid grid-cols-3 divide-x divide-slate-100 px-2 py-5">
              {[
                ["Current", streaks.currentParOrBetter, "par+ holes"],
                ["Personal best", streaks.bestParOrBetter, "par+ holes"],
                ["Birdie streak", streaks.currentRoundsWithBirdie, "rounds"],
              ].map(([label, value, unit]) => (
                <div key={String(label)} className="px-2 text-center">
                  <p className="text-2xl font-black tabular-nums text-slate-900">{value}</p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="text-[9px] text-slate-400">{unit}</p>
                </div>
              ))}
            </div>
          </InsightSection>

          <InsightSection
            title="Ringer potential"
            description="Your best recorded score on each hole, combined by course and tee"
            action={<Sparkles size={16} className="text-violet-500" />}
          >
            {intelligence.ringers.length === 0 ? (
              <EmptyInsight>Ringer scores appear after hole scores are recorded.</EmptyInsight>
            ) : (
              <div className="divide-y divide-slate-100">
                {intelligence.ringers.slice(0, 3).map((ringer) => (
                  <div key={`${ringer.courseId}-${ringer.teeName}`} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{ringer.courseName}</p>
                      <p className="text-[10px] text-slate-500">{ringer.teeName} · best of {ringer.rounds} rounds · {ringer.holes} holes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black leading-none tabular-nums text-slate-900">{ringer.score}</p>
                      <p className="mt-1 text-[9px] font-bold text-violet-600">{formatSigned(ringer.toPar)} par</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InsightSection>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightSection
          title="Season legacy"
          description="The same golfer across connected league seasons, normalized to 18 holes"
          action={<History size={16} className="text-slate-400" />}
        >
          {intelligence.seasonHistory.length === 0 ? (
            <EmptyInsight>Season history will build as this league renews.</EmptyInsight>
          ) : (
            <div className="divide-y divide-slate-100">
              {intelligence.seasonHistory.map((season, index) => {
                const previous = intelligence.seasonHistory[index - 1];
                const change = previous?.averageToPar != null && season.averageToPar != null
                  ? season.averageToPar - previous.averageToPar
                  : null;
                return (
                  <div key={season.leagueId} className="grid grid-cols-[52px_minmax(0,1fr)_repeat(2,58px)] items-center gap-2 px-4 py-3 sm:px-5">
                    <span className="rounded-lg bg-slate-950 px-2 py-1.5 text-center text-[10px] font-black text-white">{season.year}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{season.leagueName}</p>
                      <p className="text-[10px] text-slate-500">{season.rounds} rounds · HCP {season.handicap}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black tabular-nums text-slate-900">{formatSigned(season.averageToPar)}</p>
                      <p className="text-[8px] uppercase text-slate-400">Vs par</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black tabular-nums ${change != null && change < 0 ? "text-emerald-700" : "text-slate-700"}`}>
                        {change == null ? "—" : formatSigned(change)}
                      </p>
                      <p className="text-[8px] uppercase text-slate-400">YoY</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </InsightSection>

        <InsightSection
          title="Personal records"
          description="Separate marks for nine-hole and eighteen-hole rounds"
          action={<Award size={16} className="text-amber-500" />}
        >
          {intelligence.personalRecords.length === 0 ? (
            <EmptyInsight>Records appear after a completed 9-hole or 18-hole round.</EmptyInsight>
          ) : (
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
              {intelligence.personalRecords.map((record) => (
                <div key={record.holes} className="bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{record.holes}-hole records</p>
                    <SampleBadge>{record.rounds} rounds</SampleBadge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      ["Low gross", record.lowGross],
                      ["Low net", record.lowNet],
                      ["Best points", record.bestPoints],
                      ["Most birdies", record.mostBirdies],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <p className="text-lg font-black tabular-nums text-slate-900">{value}</p>
                        <p className="text-[9px] font-semibold text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  {record.bestRound && (
                    <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] leading-4 text-slate-500">
                      Best vs par: <span className="font-bold text-slate-800">{record.bestRound.eventName}</span> · {formatSigned(record.bestRound.toPar)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </InsightSection>
      </div>
    </div>
  );
}
