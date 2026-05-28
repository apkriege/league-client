import { Link, useParams } from "react-router";
import { usePlayerStats } from "@api/players/queries";
import { useLeagueMetrics } from "@api/league/queries";
import PageHeader from "@/components/layout/PageHeader";
import type { ReactNode } from "react";
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
  const numericLeagueId = Number(leagueId);
  const { data, isLoading } = usePlayerStats(numericLeagueId, Number(playerId));
  const { data: leagueMetrics } = useLeagueMetrics(numericLeagueId);

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
          icon={<Target size={12} />}
          text={`HCP ${formatValue(player.handicap)}`}
          strong
        />
        <InfoChip
          icon={<Flag size={12} />}
          text={`Start ${formatValue(stats?.startingHandicap ?? player.startingHandicap)}`}
        />
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border bg-white ${hcpColor}`}
        >
          <HcpIcon size={12} strokeWidth={2.5} />
          <span>{formatDelta(hcpDelta)}</span>
        </div>
        <InfoChip
          icon={<Trophy size={12} />}
          text={stats ? `${stats.rounds} rounds` : "No rounds"}
        />
        {player.seasonRank && <InfoChip text={`Rank #${player.seasonRank}`} strong />}
      </div>

      {!stats ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No rounds completed yet this season.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              {
                label: "Season Points",
                value: stats.totalPoints,
                sub: `${stats.avgPoints} avg / round`,
                icon: <Zap size={15} className="text-primary" />,
              },
              {
                label: "Avg Gross",
                value: stats.avgGross,
                sub: `Low ${stats.lowGross}`,
                icon: <BarChart2 size={15} className="text-blue-500" />,
              },
              {
                label: "Avg Net",
                value: stats.avgNet,
                sub: `Low ${stats.lowNet}`,
                icon: <Target size={15} className="text-emerald-500" />,
              },
              {
                label: "Avg Putts",
                value: stats.avgPutts,
                sub: `${stats.totalBirdies} birdies`,
                icon: <Flag size={15} className="text-amber-500" />,
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {tile.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    {tile.label}
                  </p>
                  <p className="text-lg font-black leading-tight text-gray-900">{tile.value}</p>
                  <p className="text-[10px] text-gray-400 truncate">{tile.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
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

            <aside className="flex flex-col gap-4">
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
        </div>
      )}
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
