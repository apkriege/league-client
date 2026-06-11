import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table from "@/components/Table";
import { useAppStore } from "@/stores/appStore";
import { useLeague, useLeagueEvents, useLeagueMetrics } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
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
  Award,
  BarChart2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock,
  Edit,
  Flag,
  MapPin,
  Medal,
  Plus,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useMemo } from "react";

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  upcoming: {
    label: "Scheduled",
    icon: <CircleDashed size={12} strokeWidth={2.5} />,
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  active: {
    label: "In Progress",
    icon: <Timer size={12} strokeWidth={2.5} />,
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  completed: {
    label: "Complete",
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    className: "bg-green-50 text-green-600 border border-green-200",
  },
};

type TeamStandingsRow = {
  rank: number;
  name: string;
  points: number;
  eventsPlayed: number;
};

type PlayerStandingsRow = {
  rank: number;
  name: string;
  points: number;
  avgGross: number;
  avgNet: number;
  rounds: number;
  birdies: number;
  currentHandicap: number | null;
  handicapChange: number | null;
};

export default function League() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const isAdmin = user?.isAdmin;

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
  const { data: metrics, isError: metricsIsError, error: metricsError } = useLeagueMetrics(Number(leagueId));

  const pageError = leagueError || eventsError || metricsError;
  const errorStatus = getApiErrorStatus(pageError);

  if (leagueIsError || eventsIsError || metricsIsError) {
    return (
      <PageState
        title={errorStatus === 404 ? "League Not Found" : errorStatus === 403 ? "Access Denied" : "Unable to Load League"}
        message={getApiErrorMessage(
          pageError,
          "The league page could not be loaded right now."
        )}
        variant={errorStatus === 404 ? "notFound" : errorStatus === 403 ? "forbidden" : "error"}
      />
    );
  }

  const completed = events?.filter((e: any) => e.status === "completed") ?? [];
  const upcoming = events?.filter((e: any) => e.status !== "completed") ?? [];
  const totalEvents = events?.length ?? 0;
  const standingsMode = metrics?.standingsMode === "team" ? "team" : "player";
  const teamStandings = metrics?.teamStandings ?? [];

  const teamStandingsRows = useMemo<TeamStandingsRow[]>(
    () =>
      teamStandings.map((team: any, idx: number) => ({
        rank: idx + 1,
        name: team.name,
        points: Number(team.points ?? 0),
        eventsPlayed: Number(team.eventsPlayed ?? 0),
      })),
    [teamStandings]
  );

  const playerStandingsRows = useMemo<PlayerStandingsRow[]>(
    () =>
      (metrics?.standings ?? []).map((player: any, idx: number) => ({
        rank: idx + 1,
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
        render: (value: number) => <span className="text-xs font-black text-primary">{value}</span>,
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
        render: (value: string) => (
          <span className="text-xs font-semibold text-gray-800">{value}</span>
        ),
      },
      {
        key: "points",
        label: "Pts",
        render: (value: number) => <span className="text-xs font-black text-primary">{value}</span>,
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
          <span className="text-xs text-gray-500">{value != null ? value.toFixed(1) : "—"}</span>
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
              {value === 0 ? "—" : value < 0 ? value.toFixed(1) : `+${value.toFixed(1)}`}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
    ],
    []
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

  if (leagueLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading...</div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader title={league?.name ?? "League"} icon={<Trophy size={14} />} iconText="LEAGUE" />

      {/* Info chips */}
      <div className="mt-4 mb-8 flex flex-wrap gap-2">
        {league?.startDate && league?.endDate && (
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            <CalendarDays size={12} className="text-gray-400" />
            <span>
              {formatDate(league.startDate)} → {formatDate(league.endDate)}
            </span>
          </div>
        )}
        {league?.format && (
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            <Flag size={12} className="text-gray-400" />
            <span className="capitalize">{league.format}</span>
          </div>
        )}
        {league?.type && (
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            <Medal size={12} className="text-gray-400" />
            <span className="capitalize">{league.type}</span>
          </div>
        )}
        {league?.contactFirstName && (
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            <MapPin size={12} className="text-gray-400" />
            <span>
              {league.contactFirstName} {league.contactLastName}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {metrics && (
          <section className="space-y-6">
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
                    icon: <Zap size={14} className="text-primary" />,
                    accent: "from-violet-50 to-white border-violet-100",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden bg-linear-to-br ${item.accent} border rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-3`}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {item.label}
                      </p>
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

            <div className="pt-2 border-t border-gray-100">
              <div className="mb-3">
                <h3 className="font-bold text-gray-800 tracking-tight text-lg">Trends and Skins</h3>
                <p className="text-xs text-gray-500">Weekly scoring trend and skin leaders</p>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={14} className="text-gray-400" strokeWidth={2} />
                      <h3 className="text-sm font-semibold text-gray-800">Season Trend</h3>
                    </div>
                  </div>
                  <div className="px-4 py-3 h-[250px]">
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
                </div>

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
                        <div
                          key={type}
                          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
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
                              <div className="max-h-[120px] overflow-y-auto pr-1 divide-y divide-gray-50 border border-gray-100 rounded-md">
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">Standings</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {standingsMode === "team"
                    ? "Team leaderboard and event participation"
                    : "Season leaderboard, scoring averages, and handicap movement"}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-w-0">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
                  <h3 className="text-sm font-semibold text-gray-800">
                    {standingsMode === "team" ? "Team Standings" : "Standings"}
                  </h3>
                </div>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
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
              {[...upcoming, ...completed].map((event: any) => (
                <EventRow
                  key={event.id}
                  event={event}
                  isAdmin={isAdmin}
                  onView={() => navigate(`/league/${leagueId}/events/${event.id}`)}
                  onEdit={() => navigate(`/league/${leagueId}/events/${event.id}/edit`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{children}</h2>
  );
}

function EventRow({
  event,
  isAdmin,
  onView,
  onEdit,
}: {
  event: any;
  isAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
}) {
  const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG["upcoming"];
  const date = new Date(event.date);
  const canEditEvent =
    !event?.isComplete && String(event?.status || "").toLowerCase() !== "completed";

  return (
    <div
      onClick={isAdmin ? undefined : onView}
      className={`group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-gray-300 ${!isAdmin ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-stretch">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center px-3 py-3 min-w-14 border-r bg-primary/5 border-primary/10">
          <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-black leading-none text-primary">{date.getDate()}</span>
          <span className="text-[9px] text-gray-400 font-medium">
            {date.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 px-3 py-2.5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 leading-tight">{event.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-gray-400" strokeWidth={2} />
                <span className="text-xs text-gray-400">{event.course?.name}</span>
                {event.tee?.name && (
                  <>
                    <span className="text-gray-300 text-xs">&bull;</span>
                    <span className="text-xs text-gray-400">{event.tee.name} tees</span>
                  </>
                )}
              </div>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${status.className}`}
            >
              {status.icon}
              {status.label}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {event.startTime && <MetaChip icon={<Clock size={10} />} label={event.startTime} />}
            <MetaChip icon={<Flag size={10} />} label={`${event.holes}h`} />
            {event.scoringFormat && (
              <MetaChip
                icon={<Award size={10} />}
                label={event.scoringFormat.charAt(0).toUpperCase() + event.scoringFormat.slice(1)}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center pr-3 pl-1 gap-1">
          {isAdmin ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="p-1.5 rounded-lg text-gray-300 hover:text-primary hover:bg-primary/10 transition-colors"
                title="View"
              >
                <ChevronRight size={15} strokeWidth={2} />
              </button>
              {canEditEvent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Edit"
                >
                  <Edit size={13} strokeWidth={2} />
                </button>
              )}
            </>
          ) : (
            <ChevronRight
              size={15}
              className="text-gray-300 group-hover:text-gray-500 transition-colors"
              strokeWidth={2}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-gray-400">
      <span className="text-gray-300">{icon}</span>
      {label}
    </div>
  );
}
