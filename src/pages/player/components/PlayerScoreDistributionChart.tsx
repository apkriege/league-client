import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ScoreDistribution } from "../playerTypes";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const round1 = (value: number) => Math.round(value * 10) / 10;

const toPerRound = (distribution: ScoreDistribution, rounds: number) => {
  const divisor = Math.max(rounds, 1);
  return [
    distribution.eagles,
    distribution.birdies,
    distribution.pars,
    distribution.bogeys,
    distribution.doubleBogeys,
    distribution.tripleBogeys,
  ].map((value) => round1(Number(value || 0) / divisor));
};

export default function PlayerScoreDistributionChart({
  playerDistribution,
  playerRounds,
  leagueDistribution,
  leagueRounds,
}: {
  playerDistribution: ScoreDistribution;
  playerRounds: number;
  leagueDistribution: ScoreDistribution;
  leagueRounds: number;
}) {
  const chartData = {
    labels: ["Eagle", "Birdie", "Par", "Bogey", "Double", "Triple+"],
    datasets: [
      {
        label: "Player Avg",
        data: toPerRound(playerDistribution, playerRounds),
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        borderRadius: 4,
        borderSkipped: false as const,
        categoryPercentage: 0.78,
        barPercentage: 0.74,
      },
      {
        label: "League Avg",
        data: toPerRound(leagueDistribution, leagueRounds),
        backgroundColor: "rgba(156, 163, 175, 0.5)",
        borderRadius: 4,
        borderSkipped: false as const,
        categoryPercentage: 0.78,
        barPercentage: 0.74,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
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
          label: (context: TooltipItem<"bar">) =>
            ` ${context.dataset.label}: ${context.parsed.y} / round`,
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
    <div className="h-45">
      <Bar data={chartData} options={options} />
    </div>
  );
}
