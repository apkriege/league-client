import { Crosshair, Medal, Sparkles, Trophy } from "lucide-react";
import { buildEventRecap } from "../eventRecap";
import type { EventInsightInput } from "../types";
import IntelligenceShell, { InsightMetric } from "./IntelligenceShell";

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

export default function EventRecap({ event }: { event: EventInsightInput }) {
  const recap = buildEventRecap(event);
  if (!recap) return null;

  return (
    <IntelligenceShell
      kicker="Event intelligence"
      title="Event Recap"
      description={recap.summary}
      aside={<Trophy size={22} className="text-amber-300" />}
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 bg-white lg:grid-cols-4 lg:divide-y-0">
        <InsightMetric
          label="Event leader"
          value={recap.winner.name}
          detail={recap.pointsUsed
            ? `${recap.winner.points} pts · ${recap.winner.net} net`
            : `${recap.winner.gross} gross · ${recap.winner.net} net`}
        />
        <InsightMetric label="Best vs handicap" value={recap.relativeToPar?.playerName ?? "—"} detail={recap.relativeToPar ? `${signed(recap.relativeToPar.netToPar)} net to par` : "No hole data"} />
        <InsightMetric label="Closing stretch" value={recap.clutch?.playerName ?? "—"} detail={recap.clutch ? `${signed(recap.clutch.toPar)} over holes ${recap.finishHoles.join("-")}` : "No closing holes"} />
        <InsightMetric label="Separation hole" value={recap.separationHole ? `Hole ${recap.separationHole.hole}` : "—"} detail={recap.separationHole ? `${recap.separationHole.spread}-stroke field spread` : "No comparable scores"} />
      </div>

      <div className="grid border-t border-slate-200 md:grid-cols-3">
        <div className="flex gap-3 border-b border-slate-200 p-4 md:border-b-0 md:border-r">
          <Crosshair size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-[11px] font-bold text-slate-900">Turning point</h3>
            <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
              {recap.separationHole
                ? `${recap.separationHole.bestPlayers.join(" and ")} set the pace on hole ${recap.separationHole.hole} with a net ${recap.separationHole.bestScore}.`
                : "More completed hole scores are needed."}
            </p>
          </div>
        </div>
        <div className="flex gap-3 border-b border-slate-200 p-4 md:border-b-0 md:border-r">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-violet-600" />
          <div>
            <h3 className="text-[11px] font-bold text-slate-900">Result context</h3>
            <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
              {recap.upset
                ? `${recap.upset.winner}'s playing handicap was ${recap.upset.handicapGap} strokes higher than ${recap.upset.runnerUp}'s.`
                : recap.runnerUp
                  ? `${recap.winner.name} finished ahead of ${recap.runnerUp.name}.`
                  : `${recap.winner.name} recorded the event's leading result.`}
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-4">
          <Medal size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-[11px] font-bold text-slate-900">Standout finish</h3>
            <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
              {recap.clutch
                ? `${recap.clutch.playerName} had the best net score relative to par across the final ${recap.finishHoles.length} holes.`
                : "Closing performance appears after hole-level scores are complete."}
            </p>
          </div>
        </div>
      </div>
    </IntelligenceShell>
  );
}
