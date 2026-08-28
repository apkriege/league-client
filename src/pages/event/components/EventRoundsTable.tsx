import { TrendingDown, TrendingUp } from "lucide-react";
import Table from "@/components/Table";
import PlayerNameLink from "./PlayerNameLink";
import { memo, useMemo } from "react";
import { calculateRoundScoreStats, type HoleScoreMode } from "../eventRoundStats";
import { formatHandicap } from "@/utils/handicap";

type EventScore = {
  hole: number | string;
  gross: number;
  net: number;
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
  pointsEarned?: number | null;
  matchPoints?: number | null;
  scores?: EventScore[];
};

type EventRoundsTableProps = {
  rounds: EventRound[];
  highlightedHolesByPlayer?: Record<number, number[]>;
  highlightUnderPar?: boolean;
  holeScoreKey?: HoleScoreMode;
  showRoundStats?: boolean;
};

const formatPoints = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const getRoundPoints = (round: EventRound) =>
  Number(round.pointsEarned || 0) + Number(round.matchPoints || 0);

function EventRoundsTable({
  rounds,
  highlightedHolesByPlayer,
  highlightUnderPar = true,
  holeScoreKey = "gross",
  showRoundStats = false,
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
    <Table
      data={preparedRounds}
      search={false}
      variant="clean"
      noBorder
      tableClassName={showRoundStats ? "w-max min-w-full table-auto" : "w-full table-fixed"}
      renderTable={(visibleRounds) => (
        <>
          <colgroup>
            <col className="w-48" />
            {holes.map((hole) => <col key={hole} />)}
            <col className="w-14" />
            <col className="w-14" />
            {showRoundStats && (
              <>
                <col className="w-14" />
                <col className="w-14" />
                <col className="w-14" />
                <col className="w-14" />
                <col className="w-16" />
              </>
            )}
          </colgroup>
          <thead>
            <tr className="section-kicker border-b border-slate-200 bg-slate-50/90">
              <th className="py-3 pl-5 text-left">Player</th>
              {holes.map((hole) => (
                <th key={hole} className="py-3 text-center">{hole}</th>
              ))}
              <th className="py-3 text-right">Gross</th>
              <th className={`py-3 text-right ${showRoundStats ? "" : "pr-5"}`}>Net</th>
              {showRoundStats && (
                <>
                  <th className="py-3 text-right">PTS</th>
                  <th className="py-3 text-right text-[9px] tracking-normal">Eagles</th>
                  <th className="py-3 text-right text-[9px] tracking-normal">Birdies</th>
                  <th className="py-3 text-right text-[9px] tracking-normal">Pars</th>
                  <th className="py-3 pr-5 text-right text-[9px] tracking-normal">Bogeys</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRounds.map(({ round, scoresByHole }) => {
              const roundPoints = getRoundPoints(round);
              const roundStats = calculateRoundScoreStats(round.scores ?? [], holeScoreKey);

              return (
                <tr key={round.id ?? round.playerId} className="transition-colors hover:bg-emerald-50/35">
                  <td className="py-3 pl-5">
                    <div className="flex flex-col gap-0.5">
                      <PlayerNameLink
                        playerId={round.playerId}
                        className="truncate text-xs font-bold text-slate-800 transition-colors hover:text-emerald-700 hover:underline"
                      >
                        {round.player.firstName} {round.player.lastName}
                      </PlayerNameLink>
                      <HandicapChange before={round.preHandicap} after={round.postHandicap} />
                    </div>
                  </td>
                  {holes.map((hole) => {
                    const score = scoresByHole.get(hole);
                    const isHighlighted = highlightedHoleSets
                      .get(Number(round.playerId))
                      ?.has(hole);
                    const displayedScore = score?.[holeScoreKey];
                    return (
                      <td key={hole} className="py-3 text-center text-xs font-medium text-slate-700">
                        {score && displayedScore != null ? (
                          <span
                            className={
                              isHighlighted
                                ? "inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 font-black text-amber-700 ring-2 ring-amber-300"
                                : highlightUnderPar && displayedScore < score.par
                                  ? "inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 font-black text-emerald-700 ring-1 ring-emerald-200"
                                  : ""
                            }
                          >
                            {displayedScore}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 text-right tabular-nums">
                    <span className="text-sm font-black text-slate-900">{round.gross}</span>
                  </td>
                  <td className={`py-3 text-right tabular-nums ${showRoundStats ? "" : "pr-5"}`}>
                    <span className="text-sm font-bold text-slate-500">{round.net}</span>
                  </td>
                  {showRoundStats && (
                    <>
                      <td className="py-3 text-right text-xs font-black tabular-nums text-slate-900">
                        {formatPoints(roundPoints)}
                      </td>
                      <td className="py-3 text-right text-xs font-medium tabular-nums text-slate-600">
                        {roundStats.eagles}
                      </td>
                      <td className="py-3 text-right text-xs font-medium tabular-nums text-slate-600">
                        {roundStats.birdies}
                      </td>
                      <td className="py-3 text-right text-xs font-medium tabular-nums text-slate-600">
                        {roundStats.pars}
                      </td>
                      <td className="py-3 pr-5 text-right text-xs font-medium tabular-nums text-slate-600">
                        {roundStats.bogeys}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </>
      )}
    />
  );
}

export default memo(EventRoundsTable);

function HandicapChange({ before, after }: { before: unknown; after: unknown }) {
  if (before == null || after == null) return null;
  const pre = Number(before);
  const post = Number(after);
  if (post === pre) {
    return <span className="text-[10px] font-medium text-gray-400">{formatHandicap(pre)}</span>;
  }

  const improved = post < pre;
  return (
    <span className={`flex items-center gap-0.5 ${improved ? "text-green-600" : "text-red-400"}`}>
      <span className="text-[10px] font-medium">{formatHandicap(pre)}</span>
      {improved ? (
        <TrendingDown size={10} strokeWidth={2.5} />
      ) : (
        <TrendingUp size={10} strokeWidth={2.5} />
      )}
      <span className="text-[10px] font-medium">{formatHandicap(post)}</span>
    </span>
  );
}
