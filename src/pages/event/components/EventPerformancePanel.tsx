import { Award, Crosshair, RotateCcw, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { FieldScoringComparison, HoleDifficulty } from "./EventFieldPerformance";
import type { buildEventDashboard, EventAward } from "@/features/league-intelligence/eventDashboard";
import {
  EventInsightBadge,
  EventInsightEmpty,
  EventInsightSection,
} from "./EventInsightPrimitives";

type EventDashboard = ReturnType<typeof buildEventDashboard>;

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

const awardIcon: Record<EventAward["id"], typeof Award> = {
  bounceback: RotateCcw,
  control: ShieldCheck,
};


export default function EventPerformancePanel({
  dashboard,
  leagueId,
}: {
  dashboard: EventDashboard;
  leagueId: number;
}) {
  const participantLabel = dashboard.players.some((player) => player.teamId) ? "Team" : "Player";
  const participantPath = (playerId: number, teamId?: number) =>
    teamId
      ? `/league/${leagueId}/team/${teamId}`
      : `/league/${leagueId}/player/${playerId}`;
  return (
    <div className="space-y-4">
      <EventInsightSection
        title="Round awards"
        description="Recovery and consistency beyond the leaderboard"
        action={<EventInsightBadge>{dashboard.awards.length} earned</EventInsightBadge>}
      >
        {dashboard.awards.length === 0 ? (
          <EventInsightEmpty>Completed hole scores unlock round awards.</EventInsightEmpty>
        ) : (
          <div className="grid gap-px bg-slate-100 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            {dashboard.awards.map((award) => {
              const Icon = awardIcon[award.id];
              return (
                <Link
                  key={award.id}
                  to={participantPath(award.playerId, award.teamId)}
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
        title={`${participantLabel} impact board`}
        description="Net vs field: negative is better. Hole stats use gross scores; closing three uses net."
        action={<Crosshair size={15} className="text-emerald-600" />}
      >
        {dashboard.players.length === 0 ? (
          <EventInsightEmpty>Player impact appears when completed scores are available.</EventInsightEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-xs">
              <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">{participantLabel}</th>
                  <th className="px-2 py-2.5 text-right">Net</th>
                  <th className="px-2 py-2.5 text-right">Net vs field</th>
                  {dashboard.pointsEnabled && <th className="px-2 py-2.5 text-right">Points</th>}
                  <th className="px-2 py-2.5 text-right">Birdies+</th>
                  <th className="px-2 py-2.5 text-right">Par or better</th>
                  <th className="px-2 py-2.5 text-right">Recovery</th>
                  <th className="px-2 py-2.5 text-right">Par streak</th>
                  <th className="px-2 py-2.5 text-right">Double bogeys+</th>
                  <th className="px-4 py-2.5 text-right sm:px-5">Closing 3 net</th>
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
                        <Link className="font-bold text-slate-900 hover:text-emerald-700" to={participantPath(player.playerId, player.teamId)}>
                          {player.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right font-black tabular-nums text-slate-900">{player.net}</td>
                    <td className="px-2 py-3 text-right font-bold tabular-nums text-slate-700">{player.netVsField == null ? "—" : signed(player.netVsField)}</td>
                    {dashboard.pointsEnabled && <td className="px-2 py-3 text-right font-black tabular-nums text-slate-900">{player.points}</td>}
                    <td className="px-2 py-3 text-right font-bold tabular-nums text-emerald-700">{player.redNumbers}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-slate-600" title={`${player.parOrBetter} of ${player.scoredHoles} scored holes`}>{player.parOrBetterRate == null ? "—" : `${player.parOrBetterRate}%`}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-slate-600" title="Gross par or better immediately after an over-par hole">{player.recoveryOpportunities ? `${player.bounceBacks}/${player.recoveryOpportunities}` : "—"}</td>
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

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <FieldScoringComparison metrics={dashboard.fieldComparison} />
        <HoleDifficulty holes={dashboard.holes} />
      </div>
    </div>
  );
}
