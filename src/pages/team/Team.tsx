import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import SectionKicker from "@/components/layout/SectionKicker";
import SurfaceCard from "@/components/layout/SurfaceCard";
import PanelBar from "@/components/layout/PanelBar";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { formatTime } from "@/utils/format";
import { formatEventDate } from "@/utils/eventDate";
import { formatHandicap } from "@/utils/handicap";
import { useTeam } from "@api/teams/queries";
import dayjs from "dayjs";
import {
  CalendarDays,
  ChevronLeft,
  CircleGauge,
  Medal,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router";

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatPoints = (value: unknown) => {
  const points = numberValue(value);
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
};

const playerName = (player: any) =>
  `${player?.firstName || ""} ${player?.lastName || ""}`.trim() || "Unnamed player";

const initials = (player: any) => {
  const first = String(player?.firstName || "").trim().charAt(0);
  const last = String(player?.lastName || "").trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
};

const eventModeLabel = (event: any) => {
  const format = String(event?.format || "").trim();
  const scoring = String(event?.scoringFormat || "").trim();
  return [format, scoring].filter(Boolean).join(" · ") || "Event";
};

function StatCard({
  label,
  value,
  subText,
  icon,
}: {
  label: string;
  value: string;
  subText?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionKicker>{label}</SectionKicker>
          <p className="mt-1 text-2xl font-black leading-tight text-gray-900">{value}</p>
          {subText && <p className="mt-0.5 text-[11px] font-medium text-gray-500">{subText}</p>}
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/10 text-slate-900">
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function Team() {
  const { leagueId, teamId } = useParams();
  const numericLeagueId = Number(leagueId);
  const numericTeamId = Number(teamId);
  const hasValidTeamId = Number.isFinite(numericTeamId) && numericTeamId > 0;
  const { data: team, isLoading, isError, error } = useTeam(numericTeamId, hasValidTeamId);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Loading team...
      </div>
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404 ? "Team Not Found" : status === 403 ? "Access Denied" : "Unable to Load Team"
        }
        message={getApiErrorMessage(error, "The team page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
        actionTo={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        actionLabel="Back to Teams"
      />
    );
  }

  if (!team) {
    return (
      <PageState
        title="Team Not Found"
        message="The requested team could not be found."
        variant="notFound"
        actionTo={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        actionLabel="Back to Teams"
      />
    );
  }

  const players = Array.isArray(team.players) ? team.players : [];
  const teamEventPoints = Array.isArray(team.teamEventPoints) ? team.teamEventPoints : [];
  const recentRounds = Array.isArray(team.recentRounds) ? team.recentRounds : [];
  const upcomingEvents = Array.isArray(team.upcomingEvents) ? team.upcomingEvents : [];
  const eventPointsTotal = teamEventPoints.reduce(
    (sum: number, row: any) => sum + numberValue(row.points),
    0
  );
  const seasonPoints = numberValue(team.seasonPoints, eventPointsTotal);
  const avgHandicap =
    players.length > 0
      ? players.reduce((sum: number, player: any) => sum + numberValue(player.handicap), 0) /
        players.length
      : 0;
  const lowRecentNet = recentRounds.reduce((best: number | null, round: any) => {
    const net = numberValue(round.net, NaN);
    if (!Number.isFinite(net)) return best;
    return best == null || net < best ? net : best;
  }, null as number | null);

  return (
    <div className="pb-8">
      <Link
        to={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition hover:text-slate-900"
      >
        <ChevronLeft size={14} />
        Back to teams
      </Link>

      <PageHeader
        title={team.name || "Team"}
        subTitle="Team dashboard with roster, scoring history, and upcoming league schedule."
      />

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Season Points"
          value={formatPoints(seasonPoints)}
          subText={team.seasonRank ? `Rank #${team.seasonRank}` : "No rank yet"}
          icon={<Trophy size={18} />}
        />
        <StatCard
          label="Roster"
          value={String(players.length)}
          subText={players.length === 1 ? "player assigned" : "players assigned"}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Avg Handicap"
          value={players.length ? formatHandicap(avgHandicap) : "—"}
          subText="Current roster"
          icon={<CircleGauge size={18} />}
        />
        <StatCard
          label="Best Recent Net"
          value={lowRecentNet == null ? "—" : String(lowRecentNet)}
          subText="From recent player rounds"
          icon={<Medal size={18} />}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <SurfaceCard as="section">
            <div className="flex items-center justify-between gap-3">
              <PanelBar>
                <div className="rounded-lg bg-slate-900/10 p-2 text-slate-900">
                  <Users size={15} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Roster</h2>
                  <p className="text-xs text-gray-400">Players assigned to this team</p>
                </div>
              </PanelBar>
              <span className="mr-4 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                {players.length}
              </span>
            </div>

            <div className="grid gap-2 border-t border-gray-100 px-4 py-3 md:grid-cols-2">
              {players.length === 0 ? (
                <p className="text-sm text-gray-400">No players are currently assigned.</p>
              ) : (
                players.map((player: any) => (
                  <Link
                    key={player.id}
                    to={`/league/${numericLeagueId}/player/${player.id}`}
                    className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition hover:border-slate-900/20 hover:bg-slate-900/5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/10 text-[11px] font-black text-slate-900">
                      {initials(player)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-gray-800">
                        {playerName(player)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        HCP {formatHandicap(player.handicap)}
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard as="section">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-slate-900" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Team Points</h2>
                  <p className="text-xs text-gray-400">Event-by-event scoring</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100">
              {teamEventPoints.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No team points have been recorded yet.</p>
              ) : (
                teamEventPoints.map((row: any) => (
                  <Link
                    key={row.id}
                    to={`/league/${numericLeagueId}/events/${row.event?.id}`}
                    className="grid grid-cols-[1fr_auto] gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 transition hover:bg-gray-50"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-gray-800">
                        {row.event?.name || "Event"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {row.event?.startsAt
                          ? formatEventDate(
                              row.event.startsAt,
                              { month: "short", day: "numeric", year: "numeric" },
                              "en-US",
                              row.event.timeZone,
                            )
                          : "No date"}
                      </span>
                    </span>
                    <span className="text-right text-xs font-black text-slate-900">
                      {formatPoints(row.points)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-4">
          <SurfaceCard as="section">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <Medal size={14} className="text-amber-500" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Recent Results</h2>
                  <p className="text-xs text-gray-400">Completed player rounds</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 p-3">
              {recentRounds.length === 0 ? (
                <p className="px-1 py-2 text-sm text-gray-400">No completed rounds for this team yet.</p>
              ) : (
                recentRounds.map((round: any) => (
                  <Link
                    key={round.id}
                    to={`/league/${numericLeagueId}/events/${round.event?.id}`}
                    className="block rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition hover:border-slate-900/20 hover:bg-slate-900/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">
                          {playerName(round.player)}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-gray-400">
                          {round.event?.name || "Event"} ·{" "}
                          {round.date ? dayjs(round.date).format("MMM D") : "No date"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-800">Net {round.net}</p>
                        <p className="text-[11px] text-gray-400">
                          {formatPoints(
                            numberValue(round.pointsEarned) + numberValue(round.matchPoints)
                          )}{" "}
                          pts
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard as="section">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-gray-400" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Upcoming Events</h2>
                  <p className="text-xs text-gray-400">League schedule</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 p-3">
              {upcomingEvents.length === 0 ? (
                <p className="px-1 py-2 text-sm text-gray-400">No upcoming events are scheduled.</p>
              ) : (
                upcomingEvents.map((event: any) => (
                  <Link
                    key={event.id}
                    to={`/league/${numericLeagueId}/events/${event.id}`}
                    className="block rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition hover:border-slate-900/20 hover:bg-slate-900/5"
                  >
                    <p className="text-xs font-semibold text-gray-800">{event.name}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {event.startsAt
                        ? formatEventDate(
                            event.startsAt,
                            { month: "short", day: "numeric", year: "numeric" },
                            "en-US",
                            event.timeZone,
                          )
                        : "No date"}
                      {event.startsAt ? ` · ${formatTime(event.startsAt, event.timeZone)}` : ""}
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                      {eventModeLabel(event)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
