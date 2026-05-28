import PageHeader from "@/components/layout/PageHeader";
import { useLeagueEvent } from "@api/league/queries";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

import {
  BarChart2,
  Calendar,
  CheckCircle2,
  CircleDashed,
  Clock,
  Flag,
  ListOrdered,
  MapPin,
  Medal,
  Printer,
  ShieldHalf,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  scheduled: {
    label: "Scheduled",
    icon: <CircleDashed size={12} strokeWidth={2.5} />,
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  active: {
    label: "In Progress",
    icon: <Timer size={12} strokeWidth={2.5} />,
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  complete: {
    label: "Complete",
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    className: "bg-green-50 text-green-600 border border-green-200",
  },
};

const LEADERBOARD_TABS = [
  { id: "points", label: "Points" },
  { id: "lowGross", label: "Low Gross" },
  { id: "lowNet", label: "Low Net" },
];

export default function Event() {
  const { leagueId, eventId } = useParams();
  const { data: event } = useLeagueEvent(Number(leagueId), Number(eventId));
  const [activeTab, setActiveTab] = useState("points");

  if (!event) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading event details...
      </div>
    );
  }

  const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG["scheduled"];
  const date = new Date(event.date);
  const totalSkins =
    event.metrics.skins.playerSkins.length + event.metrics.skins.playerNetSkins.length;

  const activeLeaderboard =
    activeTab === "points"
      ? event.metrics.leaderboards.playerPoints
      : activeTab === "lowGross"
        ? event.metrics.leaderboards.playerLowGross
        : event.metrics.leaderboards.playerLowNet;

  const activeValueLabel =
    activeTab === "points" ? "PTS" : activeTab === "lowGross" ? "GROSS" : "NET";
  const hasRounds = (event.metrics.scores?.length ?? 0) > 0;

  return (
    <div>
      <PageHeader
        title={event.name || "Event Details"}
        icon={status.icon}
        iconText={event.status.toUpperCase()}
      />

      <div className="mt-4 mb-8 flex flex-wrap gap-2">
        {[
          {
            icon: <Calendar size={12} />,
            text: date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          },
          {
            icon: <MapPin size={12} />,
            text: event.course.name + (event.tee?.name ? ` · ${event.tee.name}` : ""),
          },
          { icon: <Clock size={12} />, text: event.startTime },
          { icon: <ShieldHalf size={12} />, text: event.format },
          { icon: <Medal size={12} />, text: `${event.scoringFormat} play` },
        ].map((chip, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm"
          >
            <span className="text-gray-400">{chip.icon}</span>
            <span className="capitalize">{chip.text}</span>
          </div>
        ))}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${status.className}`}
        >
          {status.icon}
          {status.label}
        </div>
        <Link
          to={`/league/${leagueId}/events/${eventId}/print-scorecards`}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          <Printer size={12} />
          Print Scorecards
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {hasRounds ? (
          <>
            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  label: "Players",
                  value: activeLeaderboard.length,
                  icon: <User size={14} className="text-blue-400" />,
                },
                {
                  label: "Gross Skins",
                  value: event.metrics.skins.playerSkins.length,
                  icon: <Zap size={14} className="text-amber-400" />,
                },
                {
                  label: "Net Skins",
                  value: event.metrics.skins.playerNetSkins.length,
                  icon: <Zap size={14} className="text-violet-400" />,
                },
                {
                  label: "Holes",
                  value: event.holes,
                  icon: <Flag size={14} className="text-emerald-400" />,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex items-center gap-3"
                >
                  <div className="p-2 bg-gray-50 rounded-md border border-gray-100">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-gray-800 leading-tight">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <div className="w-2/3 flex flex-col gap-4">
                {event.metrics.scoreDistribution && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                      <BarChart2 size={14} className="text-gray-400" strokeWidth={2} />
                      <h3 className="text-sm font-semibold text-gray-800">Score Distribution</h3>
                      <span className="ml-auto text-[10px] text-gray-400">
                        This event vs. season avg
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <ScoreDistributionChart distribution={event.metrics.scoreDistribution} />
                    </div>
                  </div>
                )}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
                      <h3 className="text-sm font-semibold text-gray-800">Leaderboard</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {LEADERBOARD_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${activeTab === tab.id ? "bg-gray-100 text-gray-800 border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ScoreLeaderboard leaderboard={activeLeaderboard} valueLabel={activeValueLabel} />
                </div>
              </div>

              <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" strokeWidth={2.5} />
                    <h3 className="text-sm font-semibold text-gray-800">Skins</h3>
                  </div>
                  {totalSkins > 0 && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                      {totalSkins} total
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  <SkinsList
                    label="Gross"
                    skins={event.metrics.skins.playerSkins}
                    valueKey="gross"
                  />
                  <div className="border-t border-gray-100" />
                  <SkinsList
                    label="Net"
                    skins={event.metrics.skins.playerNetSkins}
                    valueKey="net"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
                <h3 className="text-sm font-semibold text-gray-800">Round Scores</h3>
              </div>
              <RoundsTable rounds={event.metrics.scores} />
            </div>
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
              <h3 className="text-sm font-semibold text-gray-800">Flights</h3>
              <span className="text-[10px] text-gray-400">No rounds recorded yet</span>
            </div>
            <FlightsPreview event={event} />
          </div>
        )}
      </div>
    </div>
  );
}

function FlightsPreview({ event }: { event: any }) {
  const flights = [...(event.flights || [])].sort((a: any, b: any) => {
    const aTime = String(a?.startTime || "");
    const bTime = String(b?.startTime || "");
    return aTime.localeCompare(bTime);
  });

  if (flights.length === 0) {
    return <div className="px-4 py-6 text-sm text-gray-400">No flights scheduled.</div>;
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      {flights.map((flight: any) => (
        <div key={flight.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-700">
            Flight {flight.startTime}
          </div>
          <div className="p-3">
            {event.format === "team" ? (
              <TeamFlightPreview flight={flight} />
            ) : event.scoringFormat === "match" ? (
              <IndividualMatchFlightPreview flight={flight} />
            ) : (
              <StrokeFlightPreview flight={flight} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamFlightPreview({ flight }: { flight: any }) {
  const flightTeams = flight?.teams || [];
  if (flightTeams.length < 2) {
    return <p className="text-xs text-gray-400">Waiting for team matchups.</p>;
  }

  const left = flightTeams[0]?.team;
  const right = flightTeams[1]?.team;

  return (
    <div className="grid grid-cols-3 items-start gap-2 text-xs">
      <div>
        <p className="font-semibold text-gray-800">{left?.name || "Team 1"}</p>
        <div className="mt-1 flex flex-col gap-0.5 text-gray-600">
          {(left?.players || []).map((p: any) => (
            <span key={p.id}>
              {p.firstName} {p.lastName}
            </span>
          ))}
        </div>
      </div>
      <div className="text-center text-gray-400 font-semibold">vs</div>
      <div>
        <p className="font-semibold text-gray-800">{right?.name || "Team 2"}</p>
        <div className="mt-1 flex flex-col gap-0.5 text-gray-600">
          {(right?.players || []).map((p: any) => (
            <span key={p.id}>
              {p.firstName} {p.lastName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndividualMatchFlightPreview({ flight }: { flight: any }) {
  const players = flight?.players || [];
  if (players.length === 0) {
    return <p className="text-xs text-gray-400">No player matchups yet.</p>;
  }

  const byId = new Map<number, any>(players.map((p: any) => [Number(p.playerId), p]));
  const used = new Set<number>();
  const pairs: Array<[any, any | null]> = [];

  players.forEach((entry: any) => {
    const id = Number(entry.playerId);
    if (used.has(id)) return;

    const oppId = Number(entry?.opponentId ?? entry?.player?.rounds?.[0]?.opponentId ?? 0);
    const opponent: any = byId.get(oppId);
    if (opponent && !used.has(Number(opponent.playerId))) {
      pairs.push([entry, opponent]);
      used.add(id);
      used.add(Number(opponent.playerId));
      return;
    }

    pairs.push([entry, null]);
    used.add(id);
  });

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      {pairs.map(([left, right], idx) => (
        <div key={`${left.playerId}-${right?.playerId ?? idx}`} className="flex items-center gap-2">
          <span className="font-medium text-gray-700">
            {left.player.firstName} {left.player.lastName}
          </span>
          <span className="text-gray-400">vs</span>
          <span className="font-medium text-gray-700">
            {right ? `${right.player.firstName} ${right.player.lastName}` : "TBD"}
          </span>
        </div>
      ))}
    </div>
  );
}

function StrokeFlightPreview({ flight }: { flight: any }) {
  const players = flight?.players || [];
  if (players.length === 0) {
    return <p className="text-xs text-gray-400">No players assigned.</p>;
  }

  return (
    <div className="flex flex-col gap-1 text-xs text-gray-700">
      {players.map((entry: any) => (
        <span key={entry.playerId} className="font-medium">
          {entry.player.firstName} {entry.player.lastName}
        </span>
      ))}
    </div>
  );
}

function SkinsList({ label, skins, valueKey }: { label: string; skins: any[]; valueKey: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      {skins.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No {label.toLowerCase()} skins yet</p>
      ) : (
        <div className="flex flex-col gap-1">
          {skins.map((skin: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-50 border border-amber-200 shrink-0">
                  <Flag size={10} className="text-amber-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{skin.name}</p>
                  <p className="text-[10px] text-gray-400">Hole {skin.hole}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                  {skin.scoreLabel}
                </span>
                <span className="text-xs font-bold text-gray-700">{skin[valueKey]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreLeaderboard({ leaderboard, valueLabel }: { leaderboard: any[]; valueLabel: string }) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
          <th className="px-4 py-2.5 w-10">#</th>
          <th className="px-3 py-2.5">
            <div className="flex items-center gap-1">
              <User size={10} strokeWidth={2.5} />
              <span>Player</span>
            </div>
          </th>
          <th className="px-4 py-2.5 text-right">{valueLabel}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {leaderboard.map((entry, index) => (
          <tr
            key={index}
            className={`text-sm ${index === 0 ? "bg-amber-50/40" : "hover:bg-gray-50/60"}`}
          >
            <td className="px-4 py-3">
              <span
                className={`text-xs font-bold ${index === 0 ? "text-amber-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-500" : "text-gray-400"}`}
              >
                {index < 9 ? `0${index + 1}` : index + 1}
              </span>
            </td>
            <td className="px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {getInitials(entry.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{entry.name}</p>
                  <p className="text-[10px] text-gray-400">
                    HCP {entry.handicap != null ? entry.handicap.toFixed(1) : "—"}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-right">
              <span
                className={`inline-block px-2 py-0.5 rounded text-sm font-bold border ${
                  index === 0
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {entry.value}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type ScoreDist = {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  tripleBogeys: number;
};

function ScoreDistributionChart({
  distribution,
}: {
  distribution: { thisEvent: ScoreDist; seasonAvg: ScoreDist };
}) {
  const { thisEvent, seasonAvg } = distribution;

  const chartData = {
    labels: ["Eagle", "Birdie", "Par", "Bogey", "Double", "Triple+"],
    datasets: [
      {
        label: "This Event",
        data: [
          thisEvent.eagles,
          thisEvent.birdies,
          thisEvent.pars,
          thisEvent.bogeys,
          thisEvent.doubleBogeys,
          thisEvent.tripleBogeys,
        ],
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        borderRadius: 4,
        borderSkipped: false,
        categoryPercentage: 0.8,
        barPercentage: 0.75,
      },
      {
        label: "Season Avg",
        data: [
          seasonAvg.eagles,
          seasonAvg.birdies,
          seasonAvg.pars,
          seasonAvg.bogeys,
          seasonAvg.doubleBogeys,
          seasonAvg.tripleBogeys,
        ],
        backgroundColor: "rgba(156, 163, 175, 0.5)",
        borderRadius: 4,
        borderSkipped: false,
        categoryPercentage: 0.8,
        barPercentage: 0.75,
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
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
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
    <div style={{ height: 180 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

function RoundsTable({ rounds }: { rounds: any[] }) {
  const sorted = [...rounds].sort((a, b) => a.player.lastName.localeCompare(b.player.lastName));
  const holes = rounds[0].scores
    .map((score: any) => score.hole)
    .sort((a: number, b: number) => a - b);

  return (
    <table className="w-full table-fixed">
      <colgroup>
        <col className="w-36" />
        {holes.map((hole: number) => (
          <col key={hole} />
        ))}
        <col className="w-14" />
        <col className="w-14" />
      </colgroup>
      <thead>
        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
          <th className="pl-4 py-2.5 text-left">Player</th>
          {holes.map((hole: number) => (
            <th key={hole} className="py-2.5 text-center">
              {hole}
            </th>
          ))}
          <th className="py-2.5 text-right">Gross</th>
          <th className="pr-4 py-2.5 text-right">Net</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {sorted.map((round, index) => (
          <tr key={index} className="hover:bg-gray-50/60 transition-colors">
            <td className="pl-4 py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-gray-800 truncate">{`${round.player.firstName} ${round.player.lastName}`}</span>
                {round.preHandicap != null &&
                  round.postHandicap != null &&
                  (() => {
                    const pre = Number(round.preHandicap);
                    const post = Number(round.postHandicap);
                    if (post < pre)
                      return (
                        <span className="flex items-center gap-0.5 text-green-600">
                          <span className="text-[10px] font-medium">{pre.toFixed(1)}</span>
                          <TrendingDown size={10} strokeWidth={2.5} />
                          <span className="text-[10px] font-medium">{post.toFixed(1)}</span>
                        </span>
                      );
                    if (post > pre)
                      return (
                        <span className="flex items-center gap-0.5 text-red-400">
                          <span className="text-[10px] font-medium">{pre.toFixed(1)}</span>
                          <TrendingUp size={10} strokeWidth={2.5} />
                          <span className="text-[10px] font-medium">{post.toFixed(1)}</span>
                        </span>
                      );
                    return (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {pre.toFixed(1)}
                      </span>
                    );
                  })()}
              </div>
            </td>
            {holes.map((hole: number) => {
              const score = round.scores.find((s: any) => s.hole === hole);
              return (
                <td key={hole} className="py-2.5 text-center text-xs text-gray-700">
                  {score ? (
                    <span
                      className={
                        score.gross < score.par
                          ? "inline-flex items-center justify-center w-5 h-5 rounded bg-green-100 text-green-700 font-semibold ring-1 ring-green-200"
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
            <td className="pr-4 py-2.5 text-right">
              <span className="text-sm font-semibold text-gray-500">{round.net}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
