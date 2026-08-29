import LoadingState from "@/components/layout/LoadingState";
import DataSection from "@/components/layout/DataSection";
import SummaryPill from "@/components/layout/SummaryPill";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table from "@/components/Table";
import { Input } from "@/components/form";
import ScoringPeriodDivider from "@/components/league/ScoringPeriodDivider";
import LeagueIntelligenceDashboard from "@/features/league-intelligence/components/LeagueIntelligenceDashboard";
import { getScoringPeriodBoundariesBeforeEvent } from "@/features/leagues/scoringPeriodBoundaries";
import { useAppStore } from "@/stores/appStore";
import { useLeague, useLeagueEvents, useLeagueMetrics } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { sortEventsByDate } from "@/utils/eventDate";
import { formatHandicap } from "@/utils/handicap";
import LeagueEventRow from "./components/LeagueEventRow";
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
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Fragment, useMemo, useState } from "react";

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
