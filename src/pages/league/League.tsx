import LoadingState from "@/components/layout/LoadingState";
import SectionKicker from "@/components/layout/SectionKicker";
import SummaryPill from "@/components/layout/SummaryPill";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import SectionIntro from "@/components/layout/SectionIntro";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table from "@/components/Table";
import { Input } from "@/components/form";
import SharedLeagueAnnouncementsPanel from "@/components/league/LeagueAnnouncementsPanel";
import ScoringPeriodDivider from "@/components/league/ScoringPeriodDivider";
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
  Target,
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
        render: (value: string) => (
          <span className="text-xs font-semibold text-gray-800">{value}</span>
        ),
      },
      {
        key: "points",
        label: "Pts",
        render: (value: number) => (
          <span className="text-xs font-black text-slate-900">{value}</span>
        ),
      },
      {
        key: "eventsPlayed",
        label: "Events",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
    ],
    []
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
            className="text-left text-xs font-semibold text-gray-800 hover:text-slate-900 hover:underline"
          >
            {value}
          </button>
        ),
      },
      {
        key: "points",
        label: "Pts",
        render: (value: number) => (
          <span className="text-xs font-black text-slate-900">{value}</span>
        ),
      },
      {
        key: "avgGross",
        label: "Gross",
        render: (value: number) => (
          <span className="text-xs text-gray-500">{value.toFixed(1)}</span>
        ),
      },
      {
        key: "avgNet",
        label: "Net",
        render: (value: number) => (
          <span className="text-xs text-gray-500">{value.toFixed(1)}</span>
        ),
      },
      {
        key: "rounds",
        label: "Rnds",
        render: (value: number) => <span className="text-xs text-gray-400">{value}</span>,
      },
      {
        key: "birdies",
        label: "🐦",
        render: (value: number) => <span className="text-xs text-gray-400">{value}</span>,
      },
      {
        key: "currentHandicap",
        label: "HCP",
        render: (value: number | null) => (
          <span className="text-xs text-gray-500">{formatHandicap(value)}</span>
        ),
      },
      {
        key: "handicapChange",
        label: "HCP Change",
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
            className="whitespace-nowrap text-left text-xs font-semibold text-gray-800 hover:text-slate-900 hover:underline"
          >
            {value}
          </button>
        ),
      },
      {
        key: "eventsPlayed",
        label: "Events Played",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "totalGross",
        label: "Total Gross",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "totalNet",
        label: "Total Net",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "totalPoints",
        label: "Total Points",
        render: (value: number) => (
          <span className="text-xs font-black text-slate-900">
            {Number.isInteger(value) ? value : value.toFixed(1)}
          </span>
        ),
      },
      {
        key: "eagles",
        label: "Eagles",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "birdies",
        label: "Birdies",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
      {
        key: "pars",
        label: "Pars",
        render: (value: number) => <span className="text-xs text-gray-500">{value}</span>,
      },
    ],
    [leagueId, navigate]
  );

  const formatDate = (d: string | Date) => dayjs(d).format("MMM D, YYYY");

  const seasonTrendChartData = useMemo(() => {
    const labels = metrics?.playerWeeklyTrends?.labels ?? [];
    const players = metrics?.playerWeeklyTrends?.players ?? [];

    const weeklyAverage = (key: "avgGross" | "avgNet") => {
      return labels.map((_: string, idx: number) => {
        const values = players
          .map((player: any) => player?.[key]?.[idx])
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
            text: "Average Score",
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
    <div className="pb-8">
      <PageHeader title={league?.name ?? "League"} />

      {/* Info chips */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
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

      <div className="flex flex-col gap-4">
        <SharedLeagueAnnouncementsPanel leagueId={Number(leagueId)} />

        {scoringPeriods.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedScoringPeriodId(null)}
              aria-pressed={effectiveSelectedScoringPeriodId == null}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                effectiveSelectedScoringPeriodId == null
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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

        {metrics && (
          <section
            className={`space-y-6 transition-opacity ${metricsIsFetching ? "opacity-60" : ""}`}
          >
            {metrics.records && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Low Gross",
                    record: metrics.records.lowGross,
                    displayValue: (r: any) => r.value,
                    icon: <Trophy size={14} className="text-amber-500" />,
                    accent: "from-amber-50 to-white border-amber-100",
                  },
                  {
                    label: "Low Net",
                    record: metrics.records.lowNet,
                    displayValue: (r: any) => r.value,
                    icon: <Target size={14} className="text-blue-500" />,
                    accent: "from-blue-50 to-white border-blue-100",
                  },
                  {
                    label: "Most Birdies",
                    record: metrics.records.mostBirdies,
                    displayValue: (r: any) => r.value,
                    icon: <span className="text-[14px] leading-none">🐦</span>,
                    accent: "from-emerald-50 to-white border-emerald-100",
                  },
                  {
                    label: "Most Points",
                    record: metrics.records.mostPoints,
                    displayValue: (r: any) => Number(r.value).toFixed(1),
                    icon: <Zap size={14} className="text-slate-900" />,
                    accent: "from-violet-50 to-white border-violet-100",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden bg-linear-to-br ${item.accent} border rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-3`}
                  >
                    <div className="min-w-0">
                      <SectionKicker>{item.label}</SectionKicker>
                      <p className="text-2xl font-black text-gray-900 leading-tight mt-1">
                        {item.record ? item.displayValue(item.record) : "—"}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 truncate mt-1">
                        {item.record?.playerName || "No data yet"}
                      </p>
                    </div>
                    <div className="shrink-0 p-2.5 bg-white/70 rounded-lg border border-white/70 shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                      {item.icon}
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gray-900/5" />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <SectionIntro
                title="Standings"
                description={
                  standingsMode === "team"
                    ? `${selectedScoringPeriod?.name ?? "Overall"} team leaderboard and event participation`
                    : `${selectedScoringPeriod?.name ?? "Overall"} leaderboard, scoring averages, and handicap movement`
                }
              />

              <SurfaceCard className="min-w-0">
                <PanelBar>
                  <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
                  <h3 className="text-sm font-semibold text-gray-800">
                    {standingsMode === "team" ? "Team Standings" : "Standings"}
                  </h3>
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
                    />
                  ) : (
                    <Table
                      data={playerStandingsRows}
                      columns={playerStandingsColumns as any}
                      size="sm"
                      variant="clean"
                      noBorder
                      search={false}
                    />
                  )}
                </div>
              </SurfaceCard>
            </div>

            <div className="pt-2">
              <SectionIntro
                title="Player Results"
                description={`${selectedScoringPeriod?.name ?? "Overall"} player totals across completed events`}
              />

              <SurfaceCard className="min-w-0">
                <PanelBar className="justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={14} className="text-slate-500" strokeWidth={2.5} />
                    <h3 className="text-sm font-semibold text-gray-800">Player Results</h3>
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
                  />
                </div>
              </SurfaceCard>
            </div>

            <div className="pt-2">
              <div className="mb-3">
                <h3 className="font-bold text-gray-800 tracking-tight text-lg">Trends and Skins</h3>
                <p className="text-xs text-gray-500">Weekly scoring trend and skin leaders</p>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                <SurfaceCard className="w-full lg:w-2/3">
                  <PanelBar>
                    <div className="flex items-center gap-2">
                      <BarChart2 size={14} className="text-gray-400" strokeWidth={2} />
                      <h3 className="text-sm font-semibold text-gray-800">
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
                  <div className="w-full lg:w-1/3 grid grid-cols-1 gap-3">
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
                          <div className="flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <Zap size={13} className={iconClass} strokeWidth={2.5} />
                              <h3 className="text-xs font-semibold text-gray-800">{label} Skins</h3>
                            </div>
                            <span
                              className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full ${badgeClass}`}
                            >
                              {rows.length}
                            </span>
                          </div>

                          <div className="p-3">
                            {rows.length === 0 ? (
                              <p className="text-[11px] text-gray-300 italic">
                                No {type} skins yet
                              </p>
                            ) : (
                              <div className="max-h-30 overflow-y-auto pr-1 divide-y divide-gray-50 border border-gray-100 rounded-md">
                                {rows.map((p: any, i: number) => (
                                  <div
                                    key={p.playerId}
                                    className="flex items-center gap-2 px-2.5 py-2 bg-white"
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
            </div>
          </section>
        )}

        {/* ── Events list ───────────────────────────── */}
        <section className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-1">
              <SectionLabel>Events</SectionLabel>
              <p className="text-sm text-gray-500">Upcoming and completed rounds</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate(`/league/${leagueId}/events/create`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-900/90 transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
                New Event
              </button>
            )}
          </div>

          {totalEvents === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
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
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <SectionKicker as="h2">{children}</SectionKicker>;
}
