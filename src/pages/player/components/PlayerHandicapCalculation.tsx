import SurfaceCard from "@/components/layout/SurfaceCard";
import SectionKicker from "@/components/layout/SectionKicker";
import type { HandicapCalculation } from "@api/players/types";
import { formatHandicap } from "@/utils/handicap";
import { handicapHoleLimits } from "@/features/leagues/handicapSettings";

export default function PlayerHandicapCalculation({ calculation }: { calculation: HandicapCalculation }) {
  const { basis, status, usedEntries, average, index, storedHandicap, bestRounds, historyWindow, eligibleRounds } = calculation;
  const needsRecalculation = index !== storedHandicap &&
    (index == null || storedHandicap == null || Math.abs(index - storedHandicap) > 0.005);
  const rounds = new Map(calculation.sourceRounds.map((round) => [round.id, round]));
  const usedIds = new Set(usedEntries.flatMap((entry) => entry.roundIds));
  const selection = eligibleRounds <= bestRounds
    ? `${usedEntries.length === 1 ? "Your first round counts." : `All ${usedEntries.length} rounds count.`} After ${bestRounds} rounds, we use your best ${bestRounds} of the last ${historyWindow}.`
    : `Your best ${bestRounds} of the latest ${calculation.entries.length} rounds count. The league looks back up to ${historyWindow} rounds.`;
  const statusLabel = status === "unknown" ? "Not established" : status === "manual" ? "Admin set"
    : eligibleRounds === 0 ? "Starting handicap" : status === "provisional" ? `Building · ${eligibleRounds}/${bestRounds} rounds` : "Established";
  const modifiedAverage = usedEntries.length
    ? usedEntries.reduce((total, entry) => total + entry.differential, 0) / usedEntries.length * calculation.multiplier : null;
  const equation = `(${usedEntries.map((entry) => entry.differential.toFixed(2)).join(" + ")}) ÷ ${usedEntries.length} × ${calculation.multiplier.toFixed(2)} = ${modifiedAverage?.toFixed(2)}`;
  const holeLimit = handicapHoleLimits.find(({ value }) => value === calculation.holeLimit)?.label;
  return (
    <div className="space-y-4 p-5">
      <SurfaceCard as="section" className="p-4">
        <SectionKicker>Current league handicap</SectionKicker>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xl font-black tabular-nums text-slate-900">{formatHandicap(storedHandicap)} <span className="text-xs font-semibold text-slate-500">{basis}-hole</span></p>
          <span className="text-[10px] font-bold text-slate-500">{statusLabel}</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {status === "unknown" ? "Finish your first individual round to get a handicap. It will also be used to score that event."
            : status === "manual" ? "Your administrator set this handicap. Your next completed round resumes the calculation."
            : eligibleRounds === 0 ? "Your entered handicap is used until you finish your first round."
            : selection}
        </p>
        {needsRecalculation && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Your saved handicap needs an update. The calculation gives {formatHandicap(index)}; ask your league administrator to refresh it.</p>}
      </SurfaceCard>
      <SurfaceCard as="section" className="overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3">
          <SectionKicker>Recent scoring window</SectionKicker>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">Gross is your total strokes. Net is your score after handicap strokes.</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">Differential accounts for course difficulty. Lower is better. {status === "manual" ? "These rounds are shown for reference while your admin’s value is used." : "Rows marked Yes count toward your handicap."}</p>
        </div>
        {calculation.entries.length === 0 ? <p className="px-4 py-5 text-xs text-slate-500">No completed rounds yet.</p> : (
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[9px] uppercase text-slate-500"><tr>
                <th className="px-4 py-2">Round</th><th className="px-3 py-2 text-right">Gross</th><th className="px-3 py-2 text-right">Net</th><th className="px-3 py-2 text-right">Differential</th><th className="px-3 py-2 text-right">Counts</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {[...calculation.entries].reverse().map((entry) => {
                  const round = rounds.get(entry.roundIds[0]);
                  const used = status !== "manual" && usedIds.has(entry.roundIds[0]);
                  return <tr key={entry.roundIds[0]} className={used ? "bg-emerald-50/50" : ""}>
                    <td className="px-4 py-2.5"><p className="break-words font-semibold text-slate-800">{round?.eventName ?? `Round ${entry.roundIds[0]}`}</p><p className="mt-0.5 text-[10px] text-slate-400">{entry.playedAt.slice(0, 10)} · {round?.holes ?? basis} holes</p></td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-900">{round?.gross ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-900">{round?.net ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums text-slate-900">{entry.differential.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right text-[10px] text-slate-500">{used ? "Yes" : "—"}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
      {average != null && status !== "manual" && <SurfaceCard as="section" className="p-4">
        <SectionKicker>Your calculation</SectionKicker>
        <p className="mt-2 text-xs leading-5 text-slate-500">Average the counting differentials, then apply the league multiplier ({(calculation.multiplier * 100).toFixed(0)}%).</p>
        <p className="mt-3 break-words rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold leading-5 tabular-nums text-slate-900">{equation}</p>
        <dl className="mt-3 space-y-2 text-xs text-slate-600">
          {calculation.maximumAdjustment !== 0 && <div className="flex justify-between gap-3"><dt>League maximum</dt><dd className="font-bold tabular-nums">{basis === 9 ? "27.00" : "54.00"}</dd></div>}
          <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-slate-900"><dt>Calculated handicap</dt><dd className="font-black tabular-nums">{formatHandicap(index)}</dd></div>
        </dl>
      </SurfaceCard>}
      <SurfaceCard as="section" className="px-4 py-3">
        <details>
          <summary className="cursor-pointer text-xs font-bold text-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-500">How round differentials work</summary>
          <div className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">
            <p>Score differential = (adjusted gross − course rating) × (113 ÷ slope).</p>
            <p>Adjusted gross applies the league’s hole-score limit: {holeLimit}. {calculation.holeLimit === "handicap-adjusted" ? "This uses your handicap before the round; without one, the limit is par + 5." : ""}</p>
            <p>Each round is compared on a {basis}-hole basis: {basis === 9 ? "divide an 18-hole differential by 2" : "multiply a 9-hole differential by 2"}. Gross and net scores stay as recorded.</p>
            <p>{eligibleRounds} rounds in your handicap history. Older rounds remain saved when they leave the recent window.</p>
            <p>This is your league handicap, not an official USGA Handicap Index.</p>
          </div>
        </details>
      </SurfaceCard>
    </div>
  );
}
