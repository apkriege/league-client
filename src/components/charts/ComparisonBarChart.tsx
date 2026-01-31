import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ComparisonBarChartProps {
  playerData: Record<string, number | string>;
  leagueData: Record<string, number | string>;
  playerLabel: string;
  leagueLabel: string;
  title: string;
  height?: string | number;
  width?: string | number;
  padding?: string | number;
}

export default function ComparisonBarChart({
  playerData,
  leagueData,
  playerLabel = "Player",
  leagueLabel = "League",
  title = "Comparison",
}: ComparisonBarChartProps) {
  const labels = Object.keys(playerData).map((key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );

  const playerValues = Object.values(playerData).map((v) => parseFloat(String(v)));
  const leagueValues = Object.values(leagueData).map((v) => parseFloat(String(v)));

  const data = {
    labels,
    datasets: [
      {
        label: playerLabel,
        data: playerValues,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        categoryPercentage: 0.5,
      },
      {
        label: leagueLabel,
        data: leagueValues,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        borderRadius: 10,
        borderSkipped: false,
        categoryPercentage: 0.5,
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
}
