import { memo } from "react";
import PlayerNameLink from "./PlayerNameLink";
import type { EventInsightTeamStanding } from "@/features/league-intelligence/types";

type EventTeamStandingsProps = {
  standings: EventInsightTeamStanding[];
};

const formatPoints = (value: number) =>
  Number.isInteger(Number(value)) ? String(Number(value)) : Number(value).toFixed(1);

function EventTeamStandings({ standings }: EventTeamStandingsProps) {
  if (standings.length === 0) return null;

  return (
    <div className="max-h-80 overflow-x-auto overflow-y-scroll">
      <table className="w-full min-w-[28rem] table-fixed text-left text-xs">
        <colgroup>
          <col className="w-10" />
          <col />
          <col className="w-18" />
          <col className="w-16" />
          <col className="w-16" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr className="section-kicker border-b border-gray-100">
            <th className="px-3 py-2">#</th>
            <th className="px-2.5 py-2">Team / Player</th>
            <th className="px-1.5 py-2 text-right">Player</th>
            <th className="px-1.5 py-2 text-right">Team</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {standings.map((standing, index) => {
            const rank = standing.rank ?? index + 1;
            return (
              <tr key={standing.teamId} className="bg-slate-50/40 text-xs hover:bg-gray-50/80">
                <td className="px-3 py-2 align-top font-bold text-gray-500">
                  {rank < 10 ? `0${rank}` : rank}
                </td>
                <th scope="row" className="px-2.5 py-2 text-left">
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-[10px] font-bold text-gray-500">
                      {getInitials(standing.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold leading-tight text-gray-800">
                        {standing.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        {(standing.players ?? []).map((player, playerIndex) => (
                          <span key={player.playerId} className="inline-flex min-w-0 items-center gap-1">
                            {playerIndex > 0 && (
                              <span aria-hidden="true" className="text-[10px] text-gray-300">
                                •
                              </span>
                            )}
                            <PlayerNameLink
                              playerId={player.playerId}
                              className="truncate text-[10px] font-medium text-gray-500 hover:text-slate-900 hover:underline"
                            >
                              {player.name}
                            </PlayerNameLink>
                            <span className="shrink-0 text-[10px] font-bold text-gray-400">
                              {formatPoints(player.points)} pts
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </th>
                <td className="px-1.5 py-2 text-right align-top">
                  <PointBadge value={standing.playerPoints ?? 0} />
                </td>
                <td className="px-1.5 py-2 text-right align-top">
                  <PointBadge value={standing.teamPoints ?? 0} />
                </td>
                <td className="px-3 py-2 text-right align-top">
                  <PointBadge value={standing.totalPoints} highlighted />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PointBadge({ value, highlighted = false }: { value: number; highlighted?: boolean }) {
  return (
    <span
      className={`inline-block min-w-8 rounded border px-1.5 py-0.5 text-xs font-bold ${
        highlighted
          ? "border-amber-200 bg-amber-100 text-amber-700"
          : "border-gray-200 bg-gray-100 text-gray-600"
      }`}
    >
      {formatPoints(value)}
    </span>
  );
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default memo(EventTeamStandings);
