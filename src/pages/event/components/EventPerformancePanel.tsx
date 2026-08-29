import { Award, Crosshair, Flame, RotateCcw, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router";
import type { buildEventDashboard, EventAward } from "@/features/league-intelligence/eventDashboard";
import {
  EventInsightBadge,
  EventInsightEmpty,
  EventInsightSection,
} from "./EventInsightPrimitives";

type EventDashboard = ReturnType<typeof buildEventDashboard>;

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

const awardIcon: Record<EventAward["id"], typeof Award> = {
  hot: Flame,
  closer: TrendingUp,
  bounceback: RotateCcw,
  control: ShieldCheck,
  skins: Zap,
  surge: Sparkles,
};

const distributionLabel = {
  eagles: "Eagles",
  birdies: "Birdies",
  pars: "Pars",
  bogeys: "Bogeys",
  doubleBogeys: "Double+",
};

const distributionTone = {
  eagles: "bg-violet-500",
  birdies: "bg-emerald-500",
  pars: "bg-blue-500",
  bogeys: "bg-amber-500",
  doubleBogeys: "bg-red-400",
};

export default function EventPerformancePanel({
  dashboard,
  leagueId,
}: {
  dashboard: EventDashboard;
  leagueId: number;
}) {
  return (
    <div className="space-y-4">
      <EventInsightSection
        title="Round awards"
        description="Recognition earned from specific scoring behaviors—not arbitrary badges"
        action={<EventInsightBadge>{dashboard.awards.length} earned</EventInsightBadge>}
      >
        {dashboard.awards.length === 0 ? (
          <EventInsightEmpty>Completed hole scores unlock round awards.</EventInsightEmpty>
        ) : (
          <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
            {dashboard.awards.map((award) => {
              const Icon = awardIcon[award.id];
              return (
                <Link
                  key={award.id}
                  to={`/league/${leagueId}/player/${award.playerId}`}
                  className="group bg-white p-4 transition hover:bg-emerald-50/30 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`grid h-8 w-8 place-items-center rounded-xl ${
                      award.tone === "attention"
                        ? "bg-orange-50 text-orange-600"
                        : award.tone === "neutral"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}>
                      <Icon size={14} strokeWidth={2.5} />
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-600">
                      {award.stat}
                    </span>
                  </div>
                  <p className="mt-4 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{award.label}</p>
                  <p className="mt-1 text-sm font-black text-slate-900 group-hover:text-emerald-700">{award.title}</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">{award.detail}</p>
                </Link>
              );
            })}
          </div>
        )}
      </EventInsightSection>

      <EventInsightSection
        title="Player impact board"
        description="How each card was built: scoring bursts, control, recovery, damage, and finish"
        action={<Crosshair size={15} className="text-emerald-600" />}
      >
        {dashboard.players.length === 0 ? (
          <EventInsightEmpty>Player impact appears when completed scores are available.</EventInsightEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-xs">
              <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Player</th>
                  <th className="px-2 py-2.5 text-right">Net</th>
                  <th className="px-2 py-2.5 text-right">Points</th>
                  <th className="px-2 py-2.5 text-right">Red</th>
                  <th className="px-2 py-2.5 text-right">Par+</th>
                  <th className="px-2 py-2.5 text-right">Bounce</th>
                  <th className="px-2 py-2.5 text-right">Control</th>
                  <th className="px-2 py-2.5 text-right">Double+</th>
                  <th className="px-4 py-2.5 text-right sm:px-5">Closing 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.players.map((player, index) => (
                  <tr key={player.playerId} className={index === 0 ? "bg-amber-50/30" : "hover:bg-slate-50/70"}>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2.5">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                          index === 0 ? "bg-slate-950 text-amber-300" : "bg-slate-100 text-slate-500"
                        }`}>
                          {index + 1}
                        </span>
                        <Link className="font-bold text-slate-900 hover:text-emerald-700" to={`/league/${leagueId}/player/${player.playerId}`}>
                          {player.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right font-black tabular-nums text-slate-900">{player.net}</td>
                    <td className="px-2 py-3 text-right font-black tabular-nums text-slate-900">{player.points}</td>
                    <td className="px-2 py-3 text-right font-bold tabular-nums text-emerald-700">{player.redNumbers}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-slate-600">{player.parOrBetter}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-slate-600">{player.bounceBacks}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-slate-600">{player.longestControlStreak}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-red-500">{player.doublesOrWorse}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-700 sm:px-5">
                      {player.closingToPar == null ? "—" : signed(player.closingToPar)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </EventInsightSection>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <EventInsightSection
          title="Field scoring fingerprint"
          description="This event compared with a typical league event this season"
        >
          {dashboard.fieldComparison.length === 0 ? (
            <EventInsightEmpty>Season comparison data is still building.</EventInsightEmpty>
          ) : (
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-1">
              {dashboard.fieldComparison.map((metric) => {
                const scale = Math.max(1, metric.event, metric.usual);
                const differenceIsFavorable = metric.key === "bogeys" || metric.key === "doubleBogeys"
                  ? metric.difference < 0
                  : metric.difference > 0;
                return (
                  <div key={metric.key} className="bg-white px-4 py-3.5 sm:px-5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{distributionLabel[metric.key]}</p>
                        <p className="text-[9px] text-slate-400">Typical event: {metric.usual}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black leading-none tabular-nums text-slate-950">{metric.event}</p>
                        <p className={`mt-1 text-[9px] font-bold ${metric.difference === 0 ? "text-slate-400" : differenceIsFavorable ? "text-emerald-700" : "text-amber-700"}`}>
                          {signed(metric.difference)} vs usual
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${distributionTone[metric.key]}`} style={{ width: `${Math.max(4, (metric.event / scale) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </EventInsightSection>

        <EventInsightSection
          title="Hole personality map"
          description="Field average gross to par, with opportunity and damage markers"
        >
          {dashboard.holes.length === 0 ? (
            <EventInsightEmpty>Hole profiles appear from complete scorecards.</EventInsightEmpty>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-6 xl:grid-cols-3">
              {dashboard.holes.map((hole) => {
                const tone = hole.averageGrossToPar <= 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : hole.averageGrossToPar <= 1
                    ? "border-slate-200 bg-slate-50 text-slate-700"
                    : "border-amber-200 bg-amber-50 text-amber-800";
                return (
                  <div
                    key={hole.hole}
                    className={`rounded-xl border p-2.5 text-center ${tone}`}
                    title={`${hole.scores} scores · ${hole.birdiesOrBetter} birdies or better · ${hole.doublesOrWorse} doubles or worse`}
                  >
                    <p className="text-[9px] font-black uppercase tracking-wide opacity-60">Hole {hole.hole}</p>
                    <p className="mt-1 text-base font-black tabular-nums">{signed(hole.averageGrossToPar)}</p>
                    <p className="text-[8px] opacity-60">Par {hole.par}</p>
                  </div>
                );
              })}
            </div>
          )}
        </EventInsightSection>
      </div>
    </div>
  );
}
