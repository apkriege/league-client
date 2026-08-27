import { ChevronDown, ChevronRight, ChevronUp, Minus } from "lucide-react";
import { Link } from "react-router";
import Table from "@/components/Table";
import type { PlayerRound } from "../playerTypes";
import { formatHandicap } from "../playerFormatters";
import { formatPlayerRoundDate, getPlayerRoundTimestamp } from "../playerRoundDate";

const formatValue = (
  value: number | string | null | undefined,
  fallback: string | number = "-"
) => {
  if (value == null || value === "") return fallback;
  return value;
};

const formatDeltaMagnitude = (delta: number) => {
  if (Math.abs(delta) < 0.005) return "0.00";
  return Math.abs(delta).toFixed(2);
};

export function RoundHistory({
  rounds,
  leagueId,
}: {
  rounds: PlayerRound[];
  leagueId?: string;
}) {
  const sorted = [...rounds].sort(
    (a, b) => getPlayerRoundTimestamp(a) - getPlayerRoundTimestamp(b),
  );

  return (
    <Table
      data={sorted}
      search={false}
      variant="clean"
      noBorder
      tableClassName="w-full text-xs"
      renderTable={(visibleRounds) => (
        <>
          <thead>
            <tr className="section-kicker bg-gray-50">
              <th className="pl-4 pr-3 py-2.5 text-left min-w-56">Event</th>
              <th className="px-3 py-2.5 text-right">Gross</th>
              <th className="px-3 py-2.5 text-right">Net</th>
              <th className="px-3 py-2.5 text-right">Pts</th>
              <th className="px-3 py-2.5 text-right">Putts</th>
              <th className="px-3 py-2.5 text-right">E</th>
              <th className="px-3 py-2.5 text-right">B</th>
              <th className="px-3 py-2.5 text-right">Par</th>
              <th className="px-3 py-2.5 text-right">Bogey</th>
              <th className="px-3 py-2.5 text-right">Diff</th>
              <th className="pl-3 pr-4 py-2.5 text-right">HCP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleRounds.map((round) => {
              const delta =
                round.preHandicap != null && round.postHandicap != null
                  ? Number(round.postHandicap) - Number(round.preHandicap)
                  : null;
              const DeltaIcon =
                delta == null || Math.abs(delta) < 0.005
                  ? Minus
                  : delta < 0
                    ? ChevronDown
                    : ChevronUp;
              const deltaClass =
                delta == null || Math.abs(delta) < 0.005
                  ? "text-gray-300"
                  : delta < 0
                    ? "text-emerald-600"
                    : "text-red-500";

              return (
                <tr key={round.eventId} className="hover:bg-gray-50/70">
                  <td className="pl-4 pr-3 py-2.5">
                    <Link
                      to={`/league/${leagueId}/events/${round.eventId}`}
                      className="group flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-gray-900">
                          {round.eventName}
                        </span>
                        <span className="block text-[10px] text-gray-400">
                          {formatPlayerRoundDate(round)}
                        </span>
                      </span>
                      <ChevronRight
                        size={13}
                        className="text-gray-300 group-hover:text-gray-500 shrink-0"
                      />
                    </Link>
                  </td>
                  <NumericCell value={round.gross} strong />
                  <NumericCell value={round.net} />
                  <NumericCell value={round.points} strong className="text-slate-900" />
                  <NumericCell value={round.putts} />
                  <NumericCell value={round.eagles} />
                  <NumericCell value={round.birdies} />
                  <NumericCell value={round.pars} />
                  <NumericCell value={round.bogeys} />
                  <NumericCell
                    value={
                      round.differential == null
                        ? null
                        : Number(round.differential).toFixed(2)
                    }
                  />
                  <td className="pl-3 pr-4 py-2.5 text-right">
                    {round.postHandicap == null ? (
                      <span className="text-[10px] font-semibold text-gray-400">
                        Not recorded
                      </span>
                    ) : (
                      <>
                        <span className="block text-sm font-bold text-gray-700">
                          {formatHandicap(round.postHandicap)}
                        </span>
                        <span
                          className={`inline-flex items-center justify-end gap-0.5 text-[10px] font-semibold ${deltaClass}`}
                        >
                          <DeltaIcon size={11} strokeWidth={2.5} />
                          {delta == null ? "Not recorded" : formatDeltaMagnitude(delta)}
                        </span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </>
      )}
    />
  );
}

export function PlayerRoundBreakdown({
  rounds,
  leagueId,
  scoreView,
}: {
  rounds: PlayerRound[];
  leagueId?: string;
  scoreView: "gross" | "net";
}) {
  const sorted = [...rounds].sort(
    (a, b) => getPlayerRoundTimestamp(b) - getPlayerRoundTimestamp(a),
  );
  const holes = Array.from(
    new Set(sorted.flatMap((round) => (round.scores ?? []).map((score) => Number(score.hole))))
  ).sort((a, b) => a - b);

  return (
    <div className="w-full">
      <Table
        data={sorted}
        search={false}
        variant="clean"
        noBorder
        tableClassName="w-full table-fixed"
        renderTable={(visibleRounds) => (
          <>
          <colgroup>
            <col className="w-56" />
            {holes.map((hole) => (
              <col key={hole} />
            ))}
            <col className="w-14" />
            <col className="w-14" />
          </colgroup>
          <thead>
            <tr className="section-kicker border-b border-gray-100 bg-gray-50">
              <th className="pl-4 py-2.5 text-left">Round</th>
              {holes.map((hole) => (
                <th key={hole} className="py-2.5 text-center">
                  {hole}
                </th>
              ))}
              <th className="py-2.5 text-right">Gross</th>
              <th className="pr-4 py-2.5 text-right">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleRounds.map((round) => (
              <tr key={round.id ?? round.eventId} className="transition-colors hover:bg-gray-50/60">
                <td className="pl-4 py-2">
                  <Link
                    to={`/league/${leagueId}/events/${round.eventId}`}
                    className="group flex flex-col gap-0.5"
                  >
                    <span className="truncate text-xs font-semibold text-gray-800 group-hover:text-gray-950">
                      {round.eventName || "Round"}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {formatPlayerRoundDate(round)}
                      {round.course?.name ? ` · ${round.course.name}` : ""}
                      {round.tee?.name ? ` · ${round.tee.name}` : ""}
                      {round.event?.startSide ? ` · ${round.event.startSide}` : ""}
                    </span>
                  </Link>
                </td>
                {holes.map((hole) => {
                  const score = round.scores?.find((item) => Number(item.hole) === hole);
                  const value = score?.[scoreView];
                  const par = Number(score?.par ?? 0);
                  const numericValue = Number(value ?? 0);
                  const isHighlight = score && par > 0 && numericValue < par;

                  return (
                    <td key={hole} className="py-2.5 text-center text-xs text-gray-700">
                      {score ? (
                        <span
                          className={
                            isHighlight
                              ? "inline-flex h-5 w-5 items-center justify-center rounded bg-green-100 font-semibold text-green-700 ring-1 ring-green-200"
                              : ""
                          }
                        >
                          {formatValue(value)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2.5 text-right">
                  <span className="text-sm font-bold text-gray-700">{round.gross}</span>
                </td>
                <td className="pr-4 py-2.5 text-right">
                  <span className="text-sm font-semibold text-gray-500">{round.net}</span>
                </td>
              </tr>
            ))}
          </tbody>
          </>
        )}
      />
    </div>
  );
}

function NumericCell({
  value,
  strong = false,
  className = "",
}: {
  value: number | string | null | undefined;
  strong?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-3 py-2.5 text-right text-gray-600 ${strong ? "font-black text-gray-900" : ""} ${className}`}
    >
      {formatValue(value)}
    </td>
  );
}
