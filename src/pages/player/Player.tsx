import LoadingState from "@/components/layout/LoadingState";
import PanelBar from "@/components/layout/PanelBar";
import SectionKicker from "@/components/layout/SectionKicker";
import SurfaceCard from "@/components/layout/SurfaceCard";
import { SummaryPillButton } from "@/components/layout/SummaryPill";
import Table from "@/components/Table";
import SectionIntro from "@/components/layout/SectionIntro";
import { useParams } from "react-router";
import { usePlayerStats } from "@api/players/queries";
import { useLeagueMetrics } from "@api/league/queries";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useMemo, useState, type ReactNode } from "react";
import useAnimatedDrawer from "@/hooks/useAnimatedDrawer";
import {
  BarChart2,
  Flag,
  Minus,
  ShieldHalf,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import PlayerScoreDistributionChart from "./components/PlayerScoreDistributionChart";
import { InfoChip, StatMini } from "./components/PlayerSummary";
import { PlayerRoundBreakdown, RoundHistory } from "./components/PlayerRoundTables";
import type { ScoreDistribution } from "./playerTypes";
import { formatHandicap } from "./playerFormatters";
import { buildHandicapDifferentialPool, getHandicapRule } from "./playerHandicap";
import { calculatePlayerRoundAverages } from "./playerRoundAverages";
import { formatPlayerRoundDate, getPlayerRoundTimestamp } from "./playerRoundDate";

const EMPTY_DIST: ScoreDistribution = {
  eagles: 0,
  birdies: 0,
  pars: 0,
  bogeys: 0,
  doubleBogeys: 0,
  tripleBogeys: 0,
};

const formatValue = (value: any, fallback: string | number = "-") => {
  if (value == null || value === "") return fallback;
  return value;
};

const formatDelta = (delta: number) => {
  if (Math.abs(delta) < 0.005) return "0.00";
  return delta < 0 ? delta.toFixed(2) : `+${delta.toFixed(2)}`;
};

type OverviewTile = {
  label: string;
  icon: ReactNode;
  accent: string;
  value?: string | number;
  sub?: string;
  split?: Array<{
    label: "9H" | "18H";
    value: string | number;
    sub: string;
  }>;
};

export default function Player() {
  const { leagueId, playerId } = useParams();
  const [roundBreakdownView, setRoundBreakdownView] = useState<"gross" | "net">("gross");
  const handicapDrawer = useAnimatedDrawer();
  const numericLeagueId = Number(leagueId);
  const { data, isLoading, isError, error } = usePlayerStats(numericLeagueId, Number(playerId));
  const { data: leagueMetrics } = useLeagueMetrics(numericLeagueId);
  const handicapHoleCount = Number(data?.handicapHoleBasis) === 9 ? 9 : 18;
  const roundAverages = useMemo(
    () => calculatePlayerRoundAverages(data?.rounds ?? []),
    [data?.rounds],
  );


  const handicapDetail = useMemo(() => {
    const chronologicalRows = [...(data?.rounds ?? [])]
      .filter((r: any) => r?.differential != null && Number.isFinite(Number(r.differential)))
      .sort((a: any, b: any) => getPlayerRoundTimestamp(a) - getPlayerRoundTimestamp(b))
      .map((r: any) => ({
        roundId: r.id,
        eventId: r.eventId,
        eventName: r.eventName,
        date: r.date,
        startsAt: r.startsAt,
        timeZone: r.timeZone,
        differential: Number(r.differential),
        adjustedGross: r.adjusted != null ? Number(r.adjusted) : null,
        courseRating: r.courseRating != null ? Number(r.courseRating) : null,
        courseSlope: r.courseSlope != null ? Number(r.courseSlope) : null,
        preHandicap: r.preHandicap != null ? Number(r.preHandicap) : null,
        scores: Array.isArray(r.scores) ? r.scores : [],
      }));

    const handicapWindow = chronologicalRows.slice(-20);
    const allRows = [...handicapWindow].sort((a, b) => a.differential - b.differential);
    const differentialPool = buildHandicapDifferentialPool(
      handicapWindow,
      (row) => row.differential,
      Number(data?.player?.startingHandicap),
    );
    const rule = getHandicapRule(differentialPool.length);
    const usedEntries = rule
      ? [...differentialPool]
          .sort((left, right) => left.differential - right.differential)
          .slice(0, rule.count)
      : [];
    const usedRows = usedEntries.flatMap((entry) => (entry.row ? [entry.row] : []));

    return {
      allRows,
      differentialPool,
      usedEntries,
      usedRows,
      rule,
    };
  }, [data?.player?.startingHandicap, data?.rounds]);

  const handicapComputation = useMemo(() => {
    const allRows = handicapDetail.allRows;
    const used = handicapDetail.usedEntries;
    const rule = handicapDetail.rule;
    if (!rule || used.length === 0) return null;

    const usedSum = used.reduce((sum, entry) => sum + entry.differential, 0);
    const averageBase = usedSum / used.length;
    const tableIndex = Number((averageBase + rule.adjustment).toFixed(2));
    const currentStored = Number(data?.player?.handicap ?? 0);

    return {
      recordedRowsCount: allRows.length,
      modeledCount: handicapDetail.differentialPool.length - allRows.length,
      used,
      usedSum,
      averageBase,
      adjustment: rule.adjustment,
      tableIndex,
      expression: used
        .map((entry) =>
          `${entry.differential.toFixed(2)}${entry.isStartingIndex ? " start" : ""}`,
        )
        .join(" + "),
      currentStored,
    };
  }, [data?.player?.handicap, handicapDetail]);

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "Player Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load Player"
        }
        message={getApiErrorMessage(error, "The player page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
        actionTo={leagueId ? `/league/${leagueId}/players` : "/leagues"}
        actionLabel="Back to Players"
      />
    );
  }

  if (isLoading) {
    return <LoadingState>Loading player...</LoadingState>;
  }

  if (!data) return null;

  const { player, stats, rounds = [] } = data;
  const fullName = `${player.firstName} ${player.lastName}`;
  const hcpDelta = Number(stats?.handicapChange || 0);
  const HcpIcon = hcpDelta < 0 ? TrendingDown : hcpDelta > 0 ? TrendingUp : Minus;
  const hcpColor =
    hcpDelta < 0 ? "text-emerald-600" : hcpDelta > 0 ? "text-red-500" : "text-gray-400";

  const playerDistribution: ScoreDistribution = stats
    ? {
        eagles: Number(stats.totalEagles || 0),
        birdies: Number(stats.totalBirdies || 0),
        pars: Number(stats.totalPars || 0),
        bogeys: Number(stats.totalBogeys || 0),
        doubleBogeys: Number(stats.totalDoubleBogeys || 0),
        tripleBogeys: Number(stats.totalTripleBogeys || 0),
      }
    : EMPTY_DIST;

  const leagueDistribution: ScoreDistribution =
    leagueMetrics?.scoreDistribution || EMPTY_DIST;
  const leagueRoundCount = Number(leagueMetrics?.seasonSummary?.totalRounds || 0);
  const averageValue = (holes: 9 | 18, key: "avgGross" | "avgNet" | "avgPutts") =>
    roundAverages[holes]?.[key] ?? "—";
  const overviewTiles: OverviewTile[] = [
    {
      label: "Season Points",
      value: stats?.totalPoints ?? 0,
      sub: `9H ${roundAverages[9]?.avgPoints ?? "—"} avg · 18H ${roundAverages[18]?.avgPoints ?? "—"} avg`,
      icon: <Zap size={15} className="text-slate-900" />,
      accent: "from-slate-50 to-white border-slate-200",
    },
    {
      label: "Avg Gross",
      split: ([9, 18] as const).map((holes) => ({
        label: `${holes}H` as const,
        value: averageValue(holes, "avgGross"),
        sub: `Low ${roundAverages[holes]?.lowGross ?? "—"}`,
      })),
      icon: <BarChart2 size={15} className="text-blue-500" />,
      accent: "from-blue-50 to-white border-blue-100",
    },
    {
      label: "Avg Net",
      split: ([9, 18] as const).map((holes) => ({
        label: `${holes}H` as const,
        value: averageValue(holes, "avgNet"),
        sub: `Low ${roundAverages[holes]?.lowNet ?? "—"}`,
      })),
      icon: <Target size={15} className="text-emerald-500" />,
      accent: "from-emerald-50 to-white border-emerald-100",
    },
    {
      label: "Rounds Played",
      value: stats?.rounds ?? 0,
      sub: `${roundAverages[9]?.rounds ?? 0} nine-hole · ${roundAverages[18]?.rounds ?? 0} eighteen-hole`,
      icon: <Trophy size={15} className="text-amber-500" />,
      accent: "from-amber-50 to-white border-amber-100",
    },
  ];

  return (
    <div>
      <PageHeader title={fullName} />

      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <InfoChip icon={<User size={12} />} text={player.type} capitalize />
        {player.team && <InfoChip icon={<ShieldHalf size={12} />} text={player.team.name} />}
        <InfoChip
          icon={<Trophy size={12} />}
          text={stats ? `${stats.rounds} rounds` : "No rounds"}
        />
        {player.seasonRank && <InfoChip text={`Rank #${player.seasonRank}`} strong />}
        <SummaryPillButton
          onClick={() => handicapDrawer.open()}
          className="hover:border-slate-900/30 hover:bg-slate-900/5"
          title="How handicap is calculated"
        >
          <span className="text-gray-400">
            <Target size={12} />
          </span>
          <span className="font-semibold text-gray-800">
            {handicapHoleCount}H HCP {formatHandicap(player.handicap)}
          </span>
        </SummaryPillButton>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border bg-white ${hcpColor}`}
        >
          <HcpIcon size={12} strokeWidth={2.5} />
          <span>{formatDelta(hcpDelta)}</span>
        </div>
      </div>

      {!stats ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No rounds completed yet this season.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <SectionIntro
              title="Overview"
              description="Season snapshot and key scoring metrics"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewTiles.map((tile) => (
                <div
                  key={tile.label}
                  className={`relative overflow-hidden bg-linear-to-br ${tile.accent} border rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-3`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      {tile.label}
                    </p>
                    {tile.split ? (
                      <div className="mt-1.5 flex items-start gap-5">
                        {tile.split.map((metric) => (
                          <div key={metric.label}>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                              {metric.label}
                            </p>
                            <p className="text-xl font-black leading-tight text-gray-900">
                              {metric.value}
                            </p>
                            <p className="mt-0.5 text-[9px] text-gray-500">{metric.sub}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="mt-1 text-2xl font-black leading-tight text-gray-900">
                          {tile.value}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-gray-500">{tile.sub}</p>
                      </>
                    )}
                  </div>
                  <div className="shrink-0 p-2.5 bg-white/70 rounded-lg border border-white/70 shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                    {tile.icon}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gray-900/5" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <SectionIntro
              title="Performance"
              description="Scoring distribution and detailed stat breakdown"
            />
            <aside className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
              <SurfaceCard as="section">
                <PanelBar>
                  <BarChart2 size={14} className="text-gray-400" strokeWidth={2} />
                  <h2 className="text-sm font-semibold text-gray-900">Score Distribution</h2>
                  <span className="ml-auto text-[10px] text-gray-400">Player vs league avg</span>
                </PanelBar>
                <div className="px-4 py-3">
                  <PlayerScoreDistributionChart
                    playerDistribution={playerDistribution}
                    playerRounds={Number(stats.rounds || 0)}
                    leagueDistribution={leagueDistribution}
                    leagueRounds={leagueRoundCount}
                  />
                </div>
              </SurfaceCard>

              <SurfaceCard as="section">
                <div className="px-4 py-3">
                  <h2 className="text-sm font-semibold text-gray-900">Scoring Detail</h2>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                  {[
                    { label: "Eagles", value: stats.totalEagles },
                    { label: "Birdies", value: stats.totalBirdies },
                    { label: "Net Eagles", value: stats.totalNetEagles },
                    { label: "Net Birdies", value: stats.totalNetBirdies },
                    { label: "Best Points", value: stats.bestPoints },
                    { label: "Total Points", value: stats.totalPoints },
                  ].map((item) => (
                    <div key={item.label} className="px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-lg font-black text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </aside>
          </div>

          <div className="pt-2">
            <SectionIntro
              title="Round History"
              description="Chronological log of completed rounds"
            />
            <SurfaceCard as="section">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
                  <h2 className="text-sm font-semibold text-gray-900">Full Round History</h2>
                </div>
                <span className="text-[10px] font-medium text-gray-400">
                  {rounds.length} completed
                </span>
              </div>
              <RoundHistory rounds={rounds} leagueId={leagueId} />
            </SurfaceCard>
          </div>

          <div className="pt-2">
            <SectionIntro
              title="Round Breakdown"
              description="Hole-by-hole gross and net scoring details"
            />
            <SurfaceCard as="section">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Flag size={14} className="text-emerald-500" strokeWidth={2.5} />
                  <h2 className="text-sm font-semibold text-gray-900">Round Score Breakdown</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-400">
                    {rounds.length} rounds
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoundBreakdownView("gross")}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      roundBreakdownView === "gross"
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    Gross
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoundBreakdownView("net")}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      roundBreakdownView === "net"
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    Net
                  </button>
                </div>
              </div>
              <PlayerRoundBreakdown
                rounds={rounds}
                leagueId={leagueId}
                scoreView={roundBreakdownView}
              />
            </SurfaceCard>
          </div>
        </div>
      )}

      {handicapDrawer.isMounted && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close handicap drawer"
            onClick={handicapDrawer.close}
            className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
              handicapDrawer.isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto transition-transform duration-300 ease-out ${
              handicapDrawer.isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <SectionKicker>Handicap Detail</SectionKicker>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  How Handicap Is Calculated
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on completed rounds and {handicapHoleCount}-hole scoring differentials
                </p>
              </div>
              <button
                type="button"
                onClick={handicapDrawer.close}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <SurfaceCard as="section" className="p-4">
                <SectionKicker className="mb-2.5">1. Handicap Setup</SectionKicker>
                <div className="grid grid-cols-2 gap-3">
                  <StatMini
                    label={`Starting ${handicapHoleCount}H`}
                    value={formatHandicap(stats?.startingHandicap ?? player.startingHandicap)}
                  />
                  <StatMini
                    label={`Current ${handicapHoleCount}H`}
                    value={formatHandicap(player.handicap)}
                  />
                  <StatMini
                    label="Completed Rounds"
                    value={formatValue(stats?.rounds ?? rounds.length)}
                  />
                  <StatMini
                    label="Differentials"
                    value={
                      handicapComputation
                        ? `${handicapComputation.recordedRowsCount} recorded · ${handicapComputation.modeledCount} baseline`
                        : "No eligible rounds"
                    }
                  />
                </div>
              </SurfaceCard>

              <SurfaceCard as="section" className="p-4">
                <SectionKicker className="mb-2.5">
                  2. Round Variations (Differentials)
                </SectionKicker>
                {handicapDetail.allRows.length === 0 ? (
                  <p className="text-xs text-gray-400">No differentials available yet.</p>
                ) : (
                  <div className="max-h-72 overflow-auto border border-gray-100 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <Table
                      data={handicapDetail.allRows}
                      search={false}
                      variant="clean"
                      noBorder
                      tableClassName="w-full text-left text-xs"
                      renderTable={(visibleRows) => (
                        <>
                          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                            <tr className="section-kicker">
                              <th className="px-3 py-2">Round</th>
                              <th className="px-3 py-2 text-right">Adj</th>
                              <th className="px-3 py-2 text-right">Rating</th>
                              <th className="px-3 py-2 text-right">Diff</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {visibleRows.map((row) => {
                          const isUsed = handicapDetail.usedRows.some(
                            (used) => used.roundId === row.roundId
                          );

                          return (
                            <tr
                              key={row.roundId ?? `${row.eventId}-${row.differential}`}
                              className={isUsed ? "bg-blue-50/50" : "bg-white hover:bg-gray-50/60"}
                            >
                              <td className="px-3 py-2 min-w-0">
                                <p className="font-semibold text-gray-800 truncate max-w-45">
                                  {row.eventName}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {formatPlayerRoundDate(row)}
                                </p>
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-700 tabular-nums">
                                {row.adjustedGross != null ? row.adjustedGross : "-"}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-700 tabular-nums">
                                {row.courseRating != null ? `${row.courseRating.toFixed(1)}` : "-"}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-gray-800 tabular-nums">
                                {row.differential.toFixed(2)}
                              </td>
                            </tr>
                          );
                            })}
                          </tbody>
                        </>
                      )}
                    />
                  </div>
                )}
              </SurfaceCard>

              <SurfaceCard as="section" className="p-4">
                <SectionKicker className="mb-2.5">
                  3. Use Variations To Calculate Handicap
                </SectionKicker>
                {handicapComputation ? (
                  <div className="space-y-2.5 text-xs text-gray-600">
                    {handicapComputation.modeledCount > 0 && (
                      <p className="rounded-md border border-blue-100 bg-blue-50/60 px-2.5 py-2 text-[11px] text-blue-800">
                        Until 20 league rounds are available, the starting handicap fills the
                        missing history so one score cannot replace the entire index.
                      </p>
                    )}
                    <p className="font-medium text-gray-700">
                      The lowest qualifying differentials are added together.
                    </p>
                    <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      {handicapComputation.expression} = {handicapComputation.usedSum.toFixed(2)}
                    </p>

                    <p className="font-medium text-gray-700 pt-1">
                      Divide by the number used, then apply the configured table adjustment.
                    </p>
                    <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      {handicapComputation.usedSum.toFixed(2)} / {handicapComputation.used.length} ={" "}
                      {handicapComputation.averageBase.toFixed(2)}
                    </p>
                    <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      Table adjustment: {handicapComputation.adjustment > 0 ? "+" : ""}
                      {handicapComputation.adjustment.toFixed(2)}
                    </p>
                    <p className="font-semibold text-blue-900 tabular-nums bg-blue-50 border border-blue-200 rounded-md px-2.5 py-1.5">
                      Base index = {handicapComputation.tableIndex.toFixed(2)}
                    </p>
                    <p className="font-medium text-gray-700 pt-1">
                      Current {handicapHoleCount}-Hole League Handicap: {handicapComputation.currentStored.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      The saved index is authoritative and also includes any applicable
                      exceptional-score and cap adjustments. {handicapHoleCount === 9
                        ? "Nine-hole differentials remain on the 9-hole scale."
                        : "Nine-hole results are normalized to the 18-hole scale before they enter this list."}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    A completed round with a valid differential is needed before the handicap can
                    be recalculated.
                  </p>
                )}
              </SurfaceCard>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
