import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { PlayerIntelligence } from "@api/players/types";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

export default function PlayerTrendChart({
  trend,
}: {
  trend: PlayerIntelligence["trend"];
}) {
  const labels = trend.map((_, index) => `R${index + 1}`);
  const data = {
    labels,
    datasets: [
      {
        label: "Round",
        data: trend.map((row) => row.toPar),
        borderColor: "rgba(148, 163, 184, 0.75)",
        backgroundColor: "rgba(148, 163, 184, 0.08)",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#64748b",
        pointBorderWidth: 2,
        pointRadius: 3,
        borderWidth: 1.5,
        tension: 0.28,
      },
      {
        label: "3-round form",
        data: trend.map((row) => row.rollingAverage),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        borderWidth: 2.5,
        tension: 0.32,
        fill: true,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 9,
          boxHeight: 9,
          usePointStyle: true,
          pointStyle: "circle",
          color: "#64748b",
          font: { size: 10 },
        },
      },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<"line">[]) => {
            const row = trend[items[0]?.dataIndex ?? 0];
            return row?.eventName ?? "Round";
          },
          label: (item: TooltipItem<"line">) =>
            ` ${item.dataset.label}: ${Number(item.parsed.y) > 0 ? "+" : ""}${item.parsed.y}`,
          afterTitle: (items: TooltipItem<"line">[]) => trend[items[0]?.dataIndex ?? 0]?.date ?? "",
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10 }, maxTicksLimit: 10 },
      },
      y: {
        grid: { color: "rgba(226, 232, 240, 0.7)" },
        border: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 10 },
          callback: (value) => `${Number(value) > 0 ? "+" : ""}${value}`,
        },
        title: { display: true, text: "Strokes vs par / 18", color: "#94a3b8", font: { size: 10 } },
      },
    },
  };

  return (
    <div>
      <div className="h-62" role="img" aria-label="Scoring trend by round with three-round rolling average">
        <Line data={data} options={options} />
      </div>
      <p className="sr-only">
        {trend.map((row) => `${row.eventName}: ${row.toPar} versus par. `).join("")}
      </p>
    </div>
  );
}
