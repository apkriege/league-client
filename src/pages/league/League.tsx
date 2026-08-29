import LoadingState from "@/components/layout/LoadingState";
import DataSection from "@/components/layout/DataSection";
import SummaryPill from "@/components/layout/SummaryPill";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table from "@/components/Table";
import { Input } from "@/components/form";
import SharedLeagueAnnouncementsPanel from "@/components/league/LeagueAnnouncementsPanel";
import ScoringPeriodDivider from "@/components/league/ScoringPeriodDivider";
import LeagueIntelligenceDashboard from "@/features/league-intelligence/components/LeagueIntelligenceDashboard";
import { getScoringPeriodBoundariesBeforeEvent } from "@/features/leagues/scoringPeriodBoundaries";
import { useAppStore } from "@/stores/appStore";
import { useLeague, useLeagueEvents, useLeagueMetrics } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { sortEventsByDate } from "@/utils/eventDate";
import { formatHandicap } from "@/utils/handicap";
import LeagueEventRow from "./components/LeagueEventRow";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import {
  BarChart2,
  CalendarDays,
  Flag,
  MapPin,
  Medal,
  Plus,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Fragment, useMemo, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

type TeamStandingsRow = {
  rank: number;
  teamId: number;
  name: string;
  points: number;
  eventsPlayed: number;
};

type PlayerStandingsRow = {
  rank: number;
  playerId: number;
  name: string;
  points: number;
  avgGross: number;
  avgNet: number;
  rounds: number;
  birdies: number;
  currentHandicap: number | null;
  handicapChange: number | null;
};

type PlayerResultsRow = {
  rank: number;
  playerId: number;
  name: string;
  eventsPlayed: number;
  totalGross: number;
  totalNet: number;
  totalPoints: number;
  eagles: number;
  birdies: number;
  pars: number;
};

export default function League() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const isAdmin = user?.isAdmin;
  const [selectedScoringPeriodId, setSelectedScoringPeriodId] = useState<number | null>(null);
  const [playerResultsSearch, setPlayerResultsSearch] = useState("");

  const {
    data: league,
    isLoading: leagueLoading,
    isError: leagueIsError,
    error: leagueError,
  } = useLeague(Number(leagueId));
  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsIsError,
    error: eventsError,
  } = useLeagueEvents(Number(leagueId));
  const scoringPeriods = Array.isArray(league?.scoringPeriods) ? league.scoringPeriods : [];
  const selectedScoringPeriod = scoringPeriods.find(
    (period: any) => Number(period.id) === selectedScoringPeriodId
  );
  const effectiveSelectedScoringPeriodId = selectedScoringPeriod ? selectedScoringPeriodId : null;
  const {
    data: metrics,
    isError: metricsIsError,
    error: metricsError,
    isFetching: metricsIsFetching,
  } = useLeagueMetrics(Number(leagueId), { periodId: effectiveSelectedScoringPeriodId });

  const pageError = leagueError || eventsError || metricsError;
  const errorStatus = getApiErrorStatus(pageError);

  const sortedEvents = useMemo(() => sortEventsByDate(events ?? []), [events]);
  const totalEvents = events?.length ?? 0;
  const standingsMode = metrics?.standingsMode === "team" ? "team" : "player";
  const teamStandingsRows = useMemo<TeamStandingsRow[]>(
    () =>
      (metrics?.teamStandings ?? []).map((team: any, idx: number) => ({
        rank: idx + 1,
        teamId: Number(team.teamId),
        name: team.name,
        points: Number(team.points ?? 0),
        eventsPlayed: Number(team.eventsPlayed ?? 0),
      })),
    [metrics?.teamStandings]
  );

  const playerStandingsRows = useMemo<PlayerStandingsRow[]>(
    () =>
      (metrics?.standings ?? []).map((player: any, idx: number) => ({
        rank: idx + 1,
        playerId: Number(player.playerId),
        name: player.name,
        points: Number(player.points ?? 0),
        avgGross: Number(player.avgGross ?? 0),
        avgNet: Number(player.avgNet ?? 0),
        rounds: Number(player.rounds ?? 0),
        birdies: Number(player.birdies ?? 0),
        currentHandicap: player.currentHandicap != null ? Number(player.currentHandicap) : null,
        handicapChange: player.handicapChange != null ? Number(player.handicapChange) : null,
      })),
    [metrics?.standings]
  );

  const playerResultsRows = useMemo<PlayerResultsRow[]>(
    () =>
      (metrics?.playerResults ?? []).map((player: any) => ({
        rank: Number(player.rank ?? 0),
        playerId: Number(player.playerId),
        name: String(player.name ?? ""),
        eventsPlayed: Number(player.eventsPlayed ?? 0),
        totalGross: Number(player.totalGross ?? 0),
        totalNet: Number(player.totalNet ?? 0),
        totalPoints: Number(player.totalPoints ?? 0),
        eagles: Number(player.eagles ?? 0),
        birdies: Number(player.birdies ?? 0),
        pars: Number(player.pars ?? 0),
      })),
    [metrics?.playerResults]
  );
  const filteredPlayerResultsRows = useMemo(() => {
    const search = playerResultsSearch.trim().toLowerCase();
    if (!search) return playerResultsRows;
    return playerResultsRows.filter((player) => player.name.toLowerCase().includes(search));
  }, [playerResultsRows, playerResultsSearch]);

  const teamStandingsColumns = useMemo(
    () => [
      {
        key: "rank",
        label: "#",
        width: "64px",
        render: (value: number) => <span className="text-xs font-bold text-gray-400">{value}</span>,
      },
      {
        key: "name",
        label: "Team",
        render: (value: string, row: TeamStandingsRow) => (
          <button
            type="button"
            onClick={() => navigate(`/league/${leagueId}/team/${row.teamId}`)}
            className="text-left text-xs font-bold text-slate-800 transition-colors hover:text-emerald-700 hover:underline"
          >
            {value}
          </button>
        ),
      },
      {
        key: "points",
        label: "Pts",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => (
          <span className="text-xs font-black text-slate-900">{value}</span>
        ),
      },
      {
        key: "eventsPlayed",
        label: "Events",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
    ],
    [leagueId, navigate]
  );

  const playerStandingsColumns = useMemo(
    () => [
      {
        key: "rank",
        label: "#",
        width: "64px",
        render: (value: number) => <span className="text-xs font-bold text-gray-400">{value}</span>,
      },
      {
        key: "name",
        label: "Player",
        render: (value: string, row: PlayerStandingsRow) => (
          <button
            type="button"
            onClick={() => navigate(`/league/${leagueId}/player/${row.playerId}`)}
            className="text-left text-xs font-bold text-slate-800 transition-colors hover:text-emerald-700 hover:underline"
          >
            {value}
          </button>
        ),
      },
      {
        key: "points",
        label: "Pts",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => (
          <span className="text-xs font-black text-slate-900">{value}</span>
        ),
      },
      {
        key: "avgGross",
        label: "Gross",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => (
          <span className="text-xs text-gray-500">{value.toFixed(1)}</span>
        ),
      },
      {
        key: "avgNet",
        label: "Net",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => (
          <span className="text-xs text-gray-500">{value.toFixed(1)}</span>
        ),
      },
      {
        key: "rounds",
        label: "Rnds",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-400">{value}</span>,
      },
      {
        key: "birdies",
        label: "Birdies",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-400">{value}</span>,
      },
      {
        key: "currentHandicap",
        label: "HCP",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number | null) => (
          <span className="text-xs text-gray-500">{formatHandicap(value)}</span>
        ),
      },
      {
        key: "handicapChange",
        label: "HCP Change",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number | null) =>
          value != null ? (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                value < 0 ? "text-emerald-600" : value > 0 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {value < 0 && <TrendingDown size={11} strokeWidth={2} />}
              {value > 0 && <TrendingUp size={11} strokeWidth={2} />}
              {value === 0 ? "0.00" : value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
    ],
    [leagueId, navigate]
  );

  const playerResultsColumns = useMemo(
    () => [
      {
        key: "rank",
        label: "Pos",
        width: "64px",
        render: (value: number) => <span className="text-xs font-bold text-gray-400">{value}</span>,
      },
      {
        key: "name",
        label: "Player",
        render: (value: string, row: PlayerResultsRow) => (
          <button
            type="button"
            onClick={() => navigate(`/league/${leagueId}/player/${row.playerId}`)}
            className="whitespace-nowrap text-left text-xs font-bold text-slate-800 transition-colors hover:text-emerald-700 hover:underline"
          >
            {value}
          </button>
        ),
      },
      {
        key: "eventsPlayed",
        label: "Events Played",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "totalGross",
        label: "Total Gross",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "totalNet",
        label: "Total Net",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "totalPoints",
        label: "Total Points",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => (
          <span className="text-xs font-black text-slate-900">
            {Number.isInteger(value) ? value : value.toFixed(1)}
          </span>
        ),
      },
      {
        key: "eagles",
        label: "Eagles",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "birdies",
        label: "Birdies",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "pars",
        label: "Pars",
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right tabular-nums",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
    ],
    [leagueId, navigate]
  );

  const formatDate = (d: string | Date) => dayjs(d).format("MMM D, YYYY");

  const seasonTrendChartData = useMemo(() => {
    const labels = metrics?.playerWeeklyTrends?.labels ?? [];
    const eventHoles = metrics?.playerWeeklyTrends?.holes ?? [];
    const players = metrics?.playerWeeklyTrends?.players ?? [];

    const weeklyAverage = (key: "avgGross" | "avgNet") => {
      return labels.map((_: string, idx: number) => {
        const values = players
          .map((player: any) => {
            const score = player?.[key]?.[idx];
            if (typeof score !== "number" || !Number.isFinite(score)) return null;
            return score * (18 / Math.max(1, Number(eventHoles[idx] || 18)));
          })
          .filter((value: any) => typeof value === "number" && Number.isFinite(value));

        if (values.length === 0) return null;
        return (
          Math.round(
            (values.reduce((sum: number, value: number) => sum + value, 0) / values.length) * 10
          ) / 10
        );
      });
    };

    const datasets = [
      {
        label: "League Avg Gross",
        data: weeklyAverage("avgGross"),
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        borderWidth: 2.5,
        pointRadius: 2.5,
        pointHoverRadius: 4.5,
        tension: 0.25,
        spanGaps: true,
      },
      {
        label: "League Avg Net",
        data: weeklyAverage("avgNet"),
        borderColor: "#059669",
        backgroundColor: "#059669",
        borderWidth: 2.5,
        pointRadius: 2.5,
        pointHoverRadius: 4.5,
        tension: 0.25,
        spanGaps: true,
      },
    ];

    return { labels, datasets };
  }, [metrics?.playerWeeklyTrends]);

  const seasonTrendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: "line",
            padding: 12,
            font: { size: 10 },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            font: { size: 10 },
          },
          grid: {
            color: "rgba(148,163,184,0.2)",
          },
        },
        y: {
          beginAtZero: false,
          ticks: {
            font: { size: 10 },
          },
          title: {
            display: true,
            text: "18-hole equivalent",
            font: { size: 10, weight: 600 as const },
          },
          grid: {
            color: "rgba(148,163,184,0.2)",
          },
        },
      },
    }),
    []
  );

  if (leagueIsError || eventsIsError || metricsIsError) {
    return (
      <PageState
        title={
          errorStatus === 404
            ? "League Not Found"
            : errorStatus === 403
              ? "Access Denied"
              : "Unable to Load League"
        }
        message={getApiErrorMessage(pageError, "The league page could not be loaded right now.")}
        variant={errorStatus === 404 ? "notFound" : errorStatus === 403 ? "forbidden" : "error"}
      />
    );
  }

  if (leagueLoading || eventsLoading) {
    return <LoadingState>Loading...</LoadingState>;
  }

  return (
    <div className="pb-10">
      <PageHeader title={league?.name ?? "League"} />

      <div className="mb-8 mt-5 flex flex-wrap gap-2.5">
        {league?.startDate && league?.endDate && (
          <SummaryPill icon={<CalendarDays size={12} />}>
            {formatDate(league.startDate)} → {formatDate(league.endDate)}
          </SummaryPill>
        )}
        {league?.format && (
          <SummaryPill icon={<Flag size={12} />} className="capitalize">
            {league.format}
          </SummaryPill>
        )}
        {league?.type && (
          <SummaryPill icon={<Medal size={12} />} className="capitalize">
            {league.type}
          </SummaryPill>
        )}
        {league?.contactFirstName && (
          <SummaryPill icon={<MapPin size={12} />}>
            {league.contactFirstName} {league.contactLastName}
          </SummaryPill>
        )}
      </div>

      <div className="space-y-9">
        <div className="space-y-4">
          {scoringPeriods.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedScoringPeriodId(null)}
                aria-pressed={effectiveSelectedScoringPeriodId == null}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  effectiveSelectedScoringPeriodId == null
                    ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                Overall
              </button>
              {scoringPeriods.map((period: any) => {
                const periodId = Number(period.id);
                const isSelected = selectedScoringPeriodId === periodId;
                return (
                  <button
                    key={periodId}
                    type="button"
                    onClick={() => setSelectedScoringPeriodId(periodId)}
                    aria-pressed={isSelected}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                    }`}
                  >
                    {period.name}
                  </button>
                );
              })}
              <span className="ml-auto hidden px-2 text-[10px] text-slate-400 sm:inline">
                {selectedScoringPeriod
                  ? `${formatDate(selectedScoringPeriod.startDate)} – ${formatDate(selectedScoringPeriod.endDate)}`
                  : "All league events"}
              </span>
            </div>
          )}

          <LeagueIntelligenceDashboard
            metrics={metrics}
            events={Array.isArray(events) ? events : []}
            roster={Array.isArray(league?.players) ? league.players : []}
            periodLabel={selectedScoringPeriod?.name ?? "Overall"}
            leagueId={Number(leagueId)}
          />
        </div>

        <SharedLeagueAnnouncementsPanel leagueId={Number(leagueId)} />

        {metrics && (
          <section
            className={`space-y-9 transition-opacity ${metricsIsFetching ? "opacity-60" : ""}`}
          >
            <DataSection title="Detailed Standings" icon={<Trophy size={16} strokeWidth={2.5} />}>
              <div className="space-y-4">
                <SurfaceCard className="min-w-0">
                  <PanelBar>
                    <Trophy size={13} className="text-emerald-600" strokeWidth={2.5} />
                    <h3 className="text-xs font-bold text-slate-900">
                      {standingsMode === "team" ? "Team Standings" : "Standings"}
                    </h3>
                    <span className="ml-auto text-[10px] font-medium text-slate-400">
                      {selectedScoringPeriod?.name ?? "Overall"}
                    </span>
                  </PanelBar>
                  <div className="p-0">
                    {standingsMode === "team" ? (
                      <Table
                        data={teamStandingsRows}
                        columns={teamStandingsColumns as any}
                        size="sm"
                        variant="clean"
                        noBorder
                        search={false}
                        className="!rounded-none !shadow-none"
                      />
                    ) : (
                      <Table
                        data={playerStandingsRows}
                        columns={playerStandingsColumns as any}
                        size="sm"
                        variant="clean"
                        noBorder
                        search={false}
                        className="!rounded-none !shadow-none"
                      />
                    )}
                  </div>
                </SurfaceCard>

                <SurfaceCard className="min-w-0">
                  <PanelBar className="justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={13} className="text-emerald-600" strokeWidth={2.5} />
                      <h3 className="text-xs font-bold text-slate-900">Full Player Results</h3>
                    </div>
                    <Input
                      dense
                      type="search"
                      aria-label="Search player results"
                      placeholder="Search players..."
                      value={playerResultsSearch}
                      onChange={(event) => setPlayerResultsSearch(event.target.value)}
                      className="w-44 sm:w-56"
                    />
                  </PanelBar>
                  <div className="p-0">
                    <Table
                      data={filteredPlayerResultsRows}
                      columns={playerResultsColumns as any}
                      size="sm"
                      variant="clean"
                      noBorder
                      search={false}
                      pageSize={25}
                      className="!rounded-none !shadow-none"
                    />
                  </div>
                </SurfaceCard>
              </div>
            </DataSection>

            <DataSection title="Scoring Detail" icon={<BarChart2 size={16} strokeWidth={2.5} />}>
              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(16rem,0.75fr)]">
                <SurfaceCard className="w-full">
                  <PanelBar>
                    <div className="flex items-center gap-2">
                      <BarChart2 size={13} className="text-emerald-600" strokeWidth={2.5} />
                      <h3 className="text-xs font-bold text-slate-900">
                        {selectedScoringPeriod?.name ?? "Season"} Trend
                      </h3>
                    </div>
                  </PanelBar>
                  <div className="px-4 py-3 h-64">
                    {(metrics?.playerWeeklyTrends?.labels?.length ?? 0) > 0 ? (
                      <Line data={seasonTrendChartData} options={seasonTrendChartOptions} />
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60">
                        <div className="text-center">
                          <BarChart2
                            size={22}
                            className="mx-auto mb-2 text-gray-300"
                            strokeWidth={2}
                          />
                          <p className="text-xs font-semibold text-gray-500">No trend data yet</p>
                          <p className="mt-1 text-[11px] text-gray-400">
                            Completed event scores will populate this chart.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </SurfaceCard>

                {metrics.skins && (
                  <div className="grid w-full grid-cols-1 gap-4">
                    {(
                      [
                        {
                          type: "gross",
                          label: "Gross",
                          iconClass: "text-amber-500",
                          badgeClass: "bg-amber-50 text-amber-600 border-amber-200",
                        },
                        {
                          type: "net",
                          label: "Net",
                          iconClass: "text-violet-500",
                          badgeClass: "bg-violet-50 text-violet-600 border-violet-200",
                        },
                      ] as const
                    ).map(({ type, label, iconClass, badgeClass }) => {
                      const rows = (metrics.skins[type] as any[]) ?? [];
                      return (
                        <SurfaceCard key={type}>
                          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Zap size={13} className={iconClass} strokeWidth={2.5} />
                              <h3 className="text-xs font-bold text-slate-900">{label} Skins</h3>
                            </div>
                            <span
                              className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full ${badgeClass}`}
                            >
                              {rows.length}
                            </span>
                          </div>

                          <div className="p-4">
                            {rows.length === 0 ? (
                              <p className="text-[11px] text-gray-300 italic">
                                No {type} skins yet
                              </p>
                            ) : (
                              <div className="max-h-32 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                                {rows.map((p: any, i: number) => (
                                  <div
                                    key={p.playerId}
                                    className="flex items-center gap-2 bg-white px-2.5 py-2.5"
                                  >
                                    <span
                                      className={`text-[10px] font-black w-4 shrink-0 ${
                                        i === 0 ? "text-amber-400" : "text-gray-300"
                                      }`}
                                    >
                                      {i + 1}
                                    </span>
                                    <span className="flex-1 text-[11px] font-semibold text-gray-800 truncate">
                                      {p.name}
                                    </span>
                                    <span
                                      className={`text-xs font-black tabular-nums ${
                                        i === 0 ? "text-amber-500" : "text-gray-600"
                                      }`}
                                    >
                                      {p.skins}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </SurfaceCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </DataSection>
          </section>
        )}

        <DataSection
          title="Events"
          icon={<CalendarDays size={16} strokeWidth={2.5} />}
          action={
            isAdmin ? (
              <button
                type="button"
                onClick={() => navigate(`/league/${leagueId}/events/create`)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <Plus size={12} strokeWidth={2.5} />
                New Event
              </button>
            ) : undefined
          }
        >
          {totalEvents === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              <CalendarDays size={32} strokeWidth={1.5} className="mb-2 opacity-40" />
              <p className="font-medium text-gray-500 text-sm">No events yet</p>
              {isAdmin && <p className="text-xs mt-1">Create your first event to get started.</p>}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedEvents.map((event: any, eventIndex: number) => {
                const boundaries = getScoringPeriodBoundariesBeforeEvent(
                  sortedEvents,
                  eventIndex,
                  scoringPeriods
                );

                return (
                  <Fragment key={event.id}>
                    {boundaries.map((period) => (
                      <ScoringPeriodDivider key={period.id} period={period} />
                    ))}
                    <LeagueEventRow
                      event={event}
                      isAdmin={isAdmin}
                      onView={() => navigate(`/league/${leagueId}/events/${event.id}`)}
                      onEdit={() => navigate(`/league/${leagueId}/events/${event.id}/edit`)}
                    />
                  </Fragment>
                );
              })}
            </div>
          )}
        </DataSection>
      </div>
    </div>
  );
}
