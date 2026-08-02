import { TrendingDown, TrendingUp } from "lucide-react";
import PlayerNameLink from "./PlayerNameLink";
import TableHeaderRow from "@/components/layout/TableHeaderRow";
import { memo, useMemo } from "react";

type EventScore = {
  hole: number | string;
  gross: number;
  par: number;
};

type EventRound = {
  id?: number | string;
  playerId: number | string;
  player: {
    firstName: string;
    lastName: string;
  };
  preHandicap?: number | null;
  postHandicap?: number | null;
  gross: number;
  net: number;
  scores?: EventScore[];
};

type EventRoundsTableProps = {
  rounds: EventRound[];
  highlightedHolesByPlayer?: Record<number, number[]>;
  highlightUnderPar?: boolean;
};

function EventRoundsTable({
  rounds,
  highlightedHolesByPlayer,
  highlightUnderPar = true,
}: EventRoundsTableProps) {
  const holes = useMemo(
    () =>
      Array.from(
        new Set(
          rounds.flatMap((round) =>
            (round.scores ?? []).map((score) => Number(score.hole)),
          ),
        ),
      ).sort((left, right) => left - right),
    [rounds],
  );
  const preparedRounds = useMemo(
    () =>
      rounds
        .map((round) => ({
          round,
          scoresByHole: new Map(
            (round.scores ?? []).map((score) => [Number(score.hole), score] as const),
          ),
        }))
        .sort((left, right) =>
          left.round.player.lastName.localeCompare(right.round.player.lastName),
        ),
    [rounds],
  );
  const highlightedHoleSets = useMemo(
    () =>
      new Map(
        Object.entries(highlightedHolesByPlayer ?? {}).map(([playerId, playerHoles]) => [
          Number(playerId),
          new Set(playerHoles),
        ]),
      ),
    [highlightedHolesByPlayer],
  );

  return (
    <table className="w-full table-fixed">
      <colgroup>
        <col className="w-36" />
        {holes.map((hole) => <col key={hole} />)}
        <col className="w-14" />
        <col className="w-14" />
      </colgroup>
      <thead>
        <TableHeaderRow className="border-b border-gray-100 bg-gray-50">
          <th className="py-2.5 pl-4 text-left">Player</th>
          {holes.map((hole) => (
            <th key={hole} className="py-2.5 text-center">{hole}</th>
          ))}
          <th className="py-2.5 text-right">Gross</th>
          <th className="py-2.5 pr-4 text-right">Net</th>
        </TableHeaderRow>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {preparedRounds.map(({ round, scoresByHole }) => (
          <tr key={round.id ?? round.playerId} className="transition-colors hover:bg-gray-50/60">
            <td className="py-2 pl-4">
              <div className="flex flex-col gap-0.5">
                <PlayerNameLink
                  playerId={round.playerId}
                  className="truncate text-xs font-semibold text-gray-800 hover:text-slate-900 hover:underline"
                >
                  {round.player.firstName} {round.player.lastName}
                </PlayerNameLink>
                <HandicapChange before={round.preHandicap} after={round.postHandicap} />
              </div>
            </td>
            {holes.map((hole) => {
              const score = scoresByHole.get(hole);
              const isHighlighted = highlightedHoleSets.get(Number(round.playerId))?.has(hole);
              return (
                <td key={hole} className="py-2.5 text-center text-xs text-gray-700">
                  {score ? (
                    <span
                      className={
                        isHighlighted
                          ? "inline-flex h-6 w-6 items-center justify-center rounded bg-amber-100 font-semibold text-amber-700 ring-2 ring-amber-300"
                          : highlightUnderPar && score.gross < score.par
                            ? "inline-flex h-5 w-5 items-center justify-center rounded bg-green-100 font-semibold text-green-700 ring-1 ring-green-200"
                            : ""
                      }
                    >
                      {score.gross}
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
            <td className="py-2.5 pr-4 text-right">
              <span className="text-sm font-semibold text-gray-500">{round.net}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default memo(EventRoundsTable);

function HandicapChange({ before, after }: { before: unknown; after: unknown }) {
  if (before == null || after == null) return null;
  const pre = Number(before);
  const post = Number(after);
  if (post === pre) {
    return <span className="text-[10px] font-medium text-gray-400">{pre.toFixed(1)}</span>;
  }

  const improved = post < pre;
  return (
    <span className={`flex items-center gap-0.5 ${improved ? "text-green-600" : "text-red-400"}`}>
      <span className="text-[10px] font-medium">{pre.toFixed(1)}</span>
      {improved ? (
        <TrendingDown size={10} strokeWidth={2.5} />
      ) : (
        <TrendingUp size={10} strokeWidth={2.5} />
      )}
      <span className="text-[10px] font-medium">{post.toFixed(1)}</span>
    </span>
  );
}
