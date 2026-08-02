import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { memo, useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ScoreDistribution = {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  tripleBogeys: number;
};

type ScoreDistributionChartProps = {
  distribution: {
    thisEvent: ScoreDistribution;
    seasonAvg: ScoreDistribution;
  };
};

const LABELS = ["Eagle", "Birdie", "Par", "Bogey", "Double", "Triple+"];

const values = (scores: ScoreDistribution) => [
  scores.eagles,
  scores.birdies,
  scores.pars,
  scores.bogeys,
  scores.doubleBogeys,
  scores.tripleBogeys,
];

const OPTIONS: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  normalized: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        useBorderRadius: true,
        borderRadius: 3,
        font: { size: 11 },
        color: "#6b7280",
        padding: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => ` ${context.dataset.label}: ${context.parsed.y}`,
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

function ScoreDistributionChart({
  distribution,
}: ScoreDistributionChartProps) {
  const { thisEvent, seasonAvg } = distribution;
  const chartData = useMemo<ChartData<"bar", number[], string>>(
    () => ({
      labels: LABELS,
      datasets: [
        {
          label: "This Event",
          data: values(thisEvent),
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          borderRadius: 4,
          borderSkipped: false,
          categoryPercentage: 0.8,
          barPercentage: 0.75,
        },
        {
          label: "Season Avg",
          data: values(seasonAvg),
          backgroundColor: "rgba(156, 163, 175, 0.5)",
          borderRadius: 4,
          borderSkipped: false,
          categoryPercentage: 0.8,
          barPercentage: 0.75,
        },
      ],
    }),
    [seasonAvg, thisEvent],
  );

  return (
    <div className="h-45">
      <Bar data={chartData} options={OPTIONS} />
    </div>
  );
}

export default memo(ScoreDistributionChart);
