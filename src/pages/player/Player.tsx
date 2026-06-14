import { Link, useParams } from "react-router";
import { usePlayerStats } from "@api/players/queries";
import { useLeagueMetrics } from "@api/league/queries";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  BarChart2,
  ChevronRight,
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
import dayjs from "dayjs";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ScoreDist = {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  tripleBogeys: number;
};

const EMPTY_DIST: ScoreDist = {
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
  if (Math.abs(delta) < 0.05) return "-";
  return delta < 0 ? delta.toFixed(1) : `+${delta.toFixed(1)}`;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export default function Player() {
  const { leagueId, playerId } = useParams();
  const [roundBreakdownView, setRoundBreakdownView] = useState<"gross" | "net">("gross");
  const [isHandicapDrawerMounted, setIsHandicapDrawerMounted] = useState(false);
  const [isHandicapDrawerOpen, setIsHandicapDrawerOpen] = useState(false);
  const handicapDrawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const numericLeagueId = Number(leagueId);
  const { data, isLoading, isError, error } = usePlayerStats(numericLeagueId, Number(playerId));
  const { data: leagueMetrics } = useLeagueMetrics(numericLeagueId);

  const openHandicapDrawer = () => {
    if (handicapDrawerCloseTimerRef.current) {
      clearTimeout(handicapDrawerCloseTimerRef.current);
      handicapDrawerCloseTimerRef.current = null;
    }
    setIsHandicapDrawerMounted(true);
    requestAnimationFrame(() => {
      setIsHandicapDrawerOpen(true);
    });
  };

  const closeHandicapDrawer = () => {
    setIsHandicapDrawerOpen(false);
    if (handicapDrawerCloseTimerRef.current) {
      clearTimeout(handicapDrawerCloseTimerRef.current);
    }
    handicapDrawerCloseTimerRef.current = setTimeout(() => {
      setIsHandicapDrawerMounted(false);
      handicapDrawerCloseTimerRef.current = null;
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (handicapDrawerCloseTimerRef.current) {
        clearTimeout(handicapDrawerCloseTimerRef.current);
      }
    };
  }, []);

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

  const handicapDetail = useMemo(() => {
    const chronologicalRows = [...(data?.rounds ?? [])]
      .filter((r: any) => r?.differential != null && Number.isFinite(Number(r.differential)))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r: any) => ({
        roundId: r.id,
        eventId: r.eventId,
        eventName: r.eventName,
        date: r.date,
        differential: Number(r.differential),
        adjustedGross: r.adjusted != null ? Number(r.adjusted) : null,
        courseRating: r.courseRating != null ? Number(r.courseRating) : null,
        courseSlope: r.courseSlope != null ? Number(r.courseSlope) : null,
        preHandicap: r.preHandicap != null ? Number(r.preHandicap) : null,
        scores: Array.isArray(r.scores) ? r.scores : [],
      }));

    const allRows = [...chronologicalRows].sort((a, b) => a.differential - b.differential);
    const usedRows = allRows.length < 5 ? allRows : allRows.slice(0, 5);

    return {
      chronologicalRows,
      allRows,
      usedRows,
    };
  }, [data?.rounds]);

  const handicapComputation = useMemo(() => {
    const allRows = handicapDetail.allRows;
    const used = handicapDetail.usedRows;
    const latestRound =
      handicapDetail.chronologicalRows[handicapDetail.chronologicalRows.length - 1];

    if (!latestRound || allRows.length === 0) return null;

    const preHandicap = latestRound.preHandicap ?? Number(data?.player?.startingHandicap ?? 0);
    const usedSum = used.reduce((sum, row) => sum + row.differential, 0);

    const isFirstHandicapRound = allRows.length === 1 && Math.abs(preHandicap) < 0.0001;

    let averageBase: number;
    let numerator: number;
    let divisor: number;
    let expression: string;

    if (isFirstHandicapRound) {
      numerator = allRows[0].differential;
      divisor = 1;
      averageBase = numerator;
      expression = allRows[0].differential.toFixed(1);
    } else if (allRows.length < 5) {
      const allDiffSum = allRows.reduce((sum, row) => sum + row.differential, 0);
      numerator = allDiffSum + preHandicap;
      divisor = allRows.length + 1;
      averageBase = numerator / divisor;
      expression = `${allRows.map((row) => row.differential.toFixed(1)).join(" + ")} + ${preHandicap.toFixed(2)}`;
    } else {
      numerator = usedSum;
      divisor = 5;
      averageBase = numerator / divisor;
      expression = used.map((row) => row.differential.toFixed(1)).join(" + ");
    }

    const handicapPercent = 96;
    const multiplied = averageBase * 0.96;
    const handicapAfterPercent = Number(multiplied.toFixed(2));

    const parTotal = latestRound.scores.reduce(
      (sum: number, score: any) => sum + Number(score.par ?? 0),
      0
    );
    const scratchPar = latestRound.courseRating;
    const teeAdjustment =
      scratchPar != null && Number.isFinite(parTotal) ? scratchPar - parTotal : null;

    const finalHandicap = Number(
      (teeAdjustment != null ? handicapAfterPercent + teeAdjustment : handicapAfterPercent).toFixed(
        2
      )
    );
    const roundedWhole = Math.round(finalHandicap);
    const currentStored = Number(data?.player?.handicap ?? 0);
    const differenceFromStored = Number((currentStored - finalHandicap).toFixed(2));

    return {
      allRowsCount: allRows.length,
      used,
      usedSum,
      preHandicap,
      numerator,
      divisor,
      averageBase,
      handicapPercent,
      multiplied,
      handicapAfterPercent,
      scratchPar,
      parTotal,
      teeAdjustment,
      finalHandicap,
      roundedWhole,
      expression,
      currentStored,
      differenceFromStored,
    };
  }, [data?.player?.handicap, data?.player?.startingHandicap, handicapDetail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading player...
      </div>
    );
  }

  if (!data) return null;

  const { player, stats, rounds = [] } = data;
  const fullName = `${player.firstName} ${player.lastName}`;
  const hcpDelta = Number(stats?.handicapChange || 0);
  const HcpIcon = hcpDelta < 0 ? TrendingDown : hcpDelta > 0 ? TrendingUp : Minus;
  const hcpColor =
    hcpDelta < 0 ? "text-emerald-600" : hcpDelta > 0 ? "text-red-500" : "text-gray-400";

  const playerDistribution: ScoreDist = stats
    ? {
        eagles: Number(stats.totalEagles || 0),
        birdies: Number(stats.totalBirdies || 0),
        pars: Number(stats.totalPars || 0),
        bogeys: Number(stats.totalBogeys || 0),
        doubleBogeys: Number(stats.totalDoubleBogeys || 0),
        tripleBogeys: Number(stats.totalTripleBogeys || 0),
      }
    : EMPTY_DIST;

  const leagueDistribution: ScoreDist = leagueMetrics?.scoreDistribution || EMPTY_DIST;
  const leagueRoundCount = Number(leagueMetrics?.seasonSummary?.totalRounds || 0);

  return (
    <div>
      <PageHeader title={fullName} icon={<User size={14} />} iconText="PLAYER" />

      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <InfoChip icon={<User size={12} />} text={player.type} capitalize />
        {player.team && <InfoChip icon={<ShieldHalf size={12} />} text={player.team.name} />}
        <InfoChip
          icon={<Trophy size={12} />}
          text={stats ? `${stats.rounds} rounds` : "No rounds"}
        />
        {player.seasonRank && <InfoChip text={`Rank #${player.seasonRank}`} strong />}
        <button
          type="button"
          onClick={openHandicapDrawer}
          className="cursor-pointer flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-colors"
          title="How handicap is calculated"
        >
          <span className="text-gray-400">
            <Target size={12} />
          </span>
          <span className="font-semibold text-gray-800">HCP {formatValue(player.handicap)}</span>
        </button>
        {/* <InfoChip
          icon={<Flag size={12} />}
          text={`Start ${formatValue(stats?.startingHandicap ?? player.startingHandicap)}`}
        /> */}
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
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">Overview</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Season snapshot and key scoring metrics
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Season Points",
                  value: stats.totalPoints,
                  sub: `${stats.avgPoints} avg / round`,
                  icon: <Zap size={15} className="text-primary" />,
                  accent: "from-slate-50 to-white border-slate-200",
                },
                {
                  label: "Avg Gross",
                  value: stats.avgGross,
                  sub: `Low ${stats.lowGross}`,
                  icon: <BarChart2 size={15} className="text-blue-500" />,
                  accent: "from-blue-50 to-white border-blue-100",
                },
                {
                  label: "Avg Net",
                  value: stats.avgNet,
                  sub: `Low ${stats.lowNet}`,
                  icon: <Target size={15} className="text-emerald-500" />,
                  accent: "from-emerald-50 to-white border-emerald-100",
                },
                {
                  label: "Avg Putts",
                  value: stats.avgPutts,
                  sub: `${stats.totalBirdies} birdies`,
                  icon: <Flag size={15} className="text-amber-500" />,
                  accent: "from-amber-50 to-white border-amber-100",
                },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className={`relative overflow-hidden bg-linear-to-br ${tile.accent} border rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-3`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      {tile.label}
                    </p>
                    <p className="text-2xl font-black leading-tight text-gray-900 mt-1">
                      {tile.value}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{tile.sub}</p>
                  </div>
                  <div className="shrink-0 p-2.5 bg-white/70 rounded-lg border border-white/70 shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                    {tile.icon}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gray-900/5" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">Performance</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Scoring distribution and detailed stat breakdown
              </p>
            </div>
            <aside className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
              <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <BarChart2 size={14} className="text-gray-400" strokeWidth={2} />
                  <h2 className="text-sm font-semibold text-gray-900">Score Distribution</h2>
                  <span className="ml-auto text-[10px] text-gray-400">Player vs league avg</span>
                </div>
                <div className="px-4 py-3">
                  <ScoreDistributionChart
                    playerDistribution={playerDistribution}
                    playerRounds={Number(stats.rounds || 0)}
                    leagueDistribution={leagueDistribution}
                    leagueRounds={leagueRoundCount}
                  />
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
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
              </section>
            </aside>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">Round History</h3>
              <p className="text-xs text-gray-500 mt-0.5">Chronological log of completed rounds</p>
            </div>
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
                  <h2 className="text-sm font-semibold text-gray-900">Full Round History</h2>
                </div>
                <span className="text-[10px] font-medium text-gray-400">
                  {rounds.length} completed
                </span>
              </div>
              <RoundHistory rounds={rounds} leagueId={leagueId} />
            </section>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">Round Breakdown</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Hole-by-hole gross and net scoring details
              </p>
            </div>
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
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
            </section>
          </div>
        </div>
      )}

      {isHandicapDrawerMounted && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close handicap drawer"
            onClick={closeHandicapDrawer}
            className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
              isHandicapDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto transition-transform duration-300 ease-out ${
              isHandicapDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Handicap Detail
                </p>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  How Handicap Is Calculated
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on completed rounds and scoring differential
                </p>
              </div>
              <button
                type="button"
                onClick={closeHandicapDrawer}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                  1. Handicap Setup
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <StatMini
                    label="Starting"
                    value={formatValue(stats?.startingHandicap ?? player.startingHandicap)}
                  />
                  <StatMini label="Current" value={formatValue(player.handicap)} />
                  <StatMini
                    label="Completed Rounds"
                    value={formatValue(stats?.rounds ?? rounds.length)}
                  />
                  <StatMini
                    label="Differentials"
                    value={
                      handicapComputation
                        ? handicapComputation.allRowsCount < 5
                          ? `All ${handicapComputation.allRowsCount} (+ pre-HCP)`
                          : "Lowest 5"
                        : "Need rounds"
                    }
                  />
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                  2. Round Variations (Differentials)
                </p>
                {handicapDetail.allRows.length === 0 ? (
                  <p className="text-xs text-gray-400">No differentials available yet.</p>
                ) : (
                  <div className="max-h-64 overflow-auto border border-gray-100 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <th className="px-3 py-2">Round</th>
                          <th className="px-3 py-2 text-right">Adj</th>
                          <th className="px-3 py-2 text-right">Rating</th>
                          <th className="px-3 py-2 text-right">Diff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {handicapDetail.allRows.map((row) => {
                          const isUsed = handicapDetail.usedRows.some(
                            (used) =>
                              used.eventId === row.eventId &&
                              used.differential === row.differential &&
                              used.date === row.date
                          );

                          return (
                            <tr
                              key={`${row.eventId}-${row.date}-${row.differential}`}
                              className={isUsed ? "bg-blue-50/50" : "bg-white hover:bg-gray-50/60"}
                            >
                              <td className="px-3 py-2 min-w-0">
                                <p className="font-semibold text-gray-800 truncate max-w-[180px]">
                                  {row.eventName}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {dayjs(row.date).format("MMM D, YYYY")}
                                </p>
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-700 tabular-nums">
                                {row.adjustedGross != null ? row.adjustedGross : "-"}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-700 tabular-nums">
                                {row.courseRating != null ? `${row.courseRating.toFixed(1)}` : "-"}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-gray-800 tabular-nums">
                                {row.differential.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                  3. Use Variations To Calculate Handicap
                </p>
                {handicapComputation ? (
                  <div className="space-y-2.5 text-xs text-gray-600">
                    <p className="font-medium text-gray-700">Variations are added together...</p>
                    <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      {handicapComputation.expression} = {handicapComputation.usedSum.toFixed(3)}
                    </p>

                    <p className="font-medium text-gray-700 pt-1">
                      Then divide by the total number included.
                    </p>
                    <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      Pre-Handicap = {handicapComputation.numerator.toFixed(3)} /{" "}
                      {handicapComputation.divisor} = {handicapComputation.averageBase.toFixed(3)}
                    </p>

                    <p className="font-medium text-gray-700 pt-1">
                      {fullName} is a {player.type} player, so Handicap Percent is{" "}
                      {handicapComputation.handicapPercent}%.
                    </p>
                    <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      Handicap = {handicapComputation.averageBase.toFixed(3)} x{" "}
                      {handicapComputation.handicapPercent}% ={" "}
                      {handicapComputation.multiplied.toFixed(4)}
                    </p>
                    <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      Handicap = {handicapComputation.handicapAfterPercent.toFixed(2)}
                    </p>

                    {handicapComputation.teeAdjustment != null ? (
                      <>
                        <p className="font-medium text-gray-700 pt-1">
                          Adjust handicap for play on different tees.
                        </p>
                        <p className="font-semibold text-gray-900 tabular-nums">
                          Tee adjustment = 'Scratch Par' - Par
                        </p>
                        <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                          Tee adjustment = ({handicapComputation.scratchPar?.toFixed(1)} -{" "}
                          {handicapComputation.parTotal}) ={" "}
                          {handicapComputation.teeAdjustment.toFixed(1)}
                        </p>
                        <p className="font-semibold text-gray-900 tabular-nums bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                          Handicap = {handicapComputation.handicapAfterPercent.toFixed(2)} +{" "}
                          {handicapComputation.teeAdjustment.toFixed(1)}
                        </p>
                        <p className="font-semibold text-blue-900 tabular-nums bg-blue-50 border border-blue-200 rounded-md px-2.5 py-1.5">
                          Final Handicap = {handicapComputation.finalHandicap.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-gray-400">
                        Tee adjustment unavailable for this sample.
                      </p>
                    )}

                    <p className="font-medium text-gray-700 pt-1">
                      When converted to whole number, handicap is rounded to{" "}
                      {handicapComputation.roundedWhole}.
                    </p>
                    <p className="font-medium text-gray-700 pt-1">
                      Current stored handicap: {handicapComputation.currentStored.toFixed(2)}
                      {Math.abs(handicapComputation.differenceFromStored) > 0.01 && (
                        <span className="text-amber-600">
                          {" "}
                          (difference {handicapComputation.differenceFromStored > 0 ? "+" : ""}
                          {handicapComputation.differenceFromStored.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    At least 3 completed rounds are needed before a handicap can be calculated.
                  </p>
                )}
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

function InfoChip({
  icon,
  text,
  strong = false,
  capitalize = false,
}: {
  icon?: ReactNode;
  text: any;
  strong?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span
        className={`${strong ? "font-semibold text-gray-800" : ""} ${capitalize ? "capitalize" : ""}`}
      >
        {text}
      </span>
    </div>
  );
}

function ScoreDistributionChart({
  playerDistribution,
  playerRounds,
  leagueDistribution,
  leagueRounds,
}: {
  playerDistribution: ScoreDist;
  playerRounds: number;
  leagueDistribution: ScoreDist;
  leagueRounds: number;
}) {
  const toPerRound = (dist: ScoreDist, rounds: number) => {
    const divisor = Math.max(rounds, 1);
    return [
      dist.eagles,
      dist.birdies,
      dist.pars,
      dist.bogeys,
      dist.doubleBogeys,
      dist.tripleBogeys,
    ].map((value) => round1(Number(value || 0) / divisor));
  };

  const chartData = {
    labels: ["Eagle", "Birdie", "Par", "Bogey", "Double", "Triple+"],
    datasets: [
      {
        label: "Player Avg",
        data: toPerRound(playerDistribution, playerRounds),
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        borderRadius: 4,
        borderSkipped: false,
        categoryPercentage: 0.78,
        barPercentage: 0.74,
      },
      {
        label: "League Avg",
        data: toPerRound(leagueDistribution, leagueRounds),
        backgroundColor: "rgba(156, 163, 175, 0.5)",
        borderRadius: 4,
        borderSkipped: false,
        categoryPercentage: 0.78,
        barPercentage: 0.74,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
          useBorderRadius: true,
          font: { size: 11 },
          color: "#6b7280",
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y} / round`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: "#9ca3af" },
        border: { display: false },
      },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 10 }, color: "#9ca3af", precision: 0 },
        border: { display: false },
      },
    },
  };

  return (
    <div className="h-[180px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}

function RoundHistory({ rounds, leagueId }: { rounds: any[]; leagueId?: string }) {
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
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
          {sorted.map((round: any) => {
            const delta =
              round.preHandicap != null && round.postHandicap != null
                ? Number(round.postHandicap) - Number(round.preHandicap)
                : null;
            const DeltaIcon =
              delta == null || Math.abs(delta) < 0.05
                ? Minus
                : delta < 0
                  ? TrendingDown
                  : TrendingUp;
            const deltaClass =
              delta == null || Math.abs(delta) < 0.05
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
                        {dayjs(round.date).format("MMM D, YYYY")}
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
                <NumericCell value={round.points} strong className="text-primary" />
                <NumericCell value={round.putts} />
                <NumericCell value={round.eagles} />
                <NumericCell value={round.birdies} />
                <NumericCell value={round.pars} />
                <NumericCell value={round.bogeys} />
                <NumericCell value={round.differential} />
                <td className="pl-3 pr-4 py-2.5 text-right">
                  <span
                    className={`inline-flex items-center justify-end gap-1 font-semibold ${deltaClass}`}
                  >
                    <DeltaIcon size={11} strokeWidth={2.5} />
                    {delta == null ? "-" : formatDelta(delta)}
                  </span>
                  <span className="block text-[10px] text-gray-400">
                    {formatValue(round.postHandicap)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlayerRoundBreakdown({
  rounds,
  leagueId,
  scoreView,
}: {
  rounds: any[];
  leagueId?: string;
  scoreView: "gross" | "net";
}) {
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const holes = Array.from(
    new Set(sorted.flatMap((round) => (round.scores ?? []).map((score: any) => Number(score.hole))))
  ).sort((a, b) => a - b);

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-56" />
            {holes.map((hole) => (
              <col key={hole} />
            ))}
            <col className="w-14" />
            <col className="w-14" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
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
            {sorted.map((round: any) => (
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
                      {dayjs(round.date).format("MMM D, YYYY")}
                      {round.course?.name ? ` · ${round.course.name}` : ""}
                      {round.tee?.name ? ` · ${round.tee.name}` : ""}
                      {round.event?.startSide ? ` · ${round.event.startSide}` : ""}
                    </span>
                  </Link>
                </td>
                {holes.map((hole) => {
                  const score = round.scores?.find((s: any) => Number(s.hole) === hole);
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
        </table>
      </div>
    </div>
  );
}

function NumericCell({
  value,
  strong = false,
  className = "",
}: {
  value: any;
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
