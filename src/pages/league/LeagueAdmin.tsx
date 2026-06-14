import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { useLeague, useLeagueEvents, useLeagueMetrics } from "@api/league/queries";
import {
  AuditLogPanel,
  InvitePlayersPanel,
  LeagueNotificationComposer,
  OnboardingChecklist,
} from "@/components/league/AdminOpsPanels";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import dayjs from "dayjs";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardList,
  Clock,
  Edit,
  Flag,
  MapPin,
  Plus,
  ShieldHalf,
  Timer,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

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

export default function LeagueAdmin() {
  const { leagueId } = useParams();
  const navigate = useNavigate();

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

  if (leagueLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading...</div>
    );
  }

  if (leagueIsError || eventsIsError || metricsIsError) {
    return (
      <PageState
        title={errorStatus === 404 ? "League Not Found" : errorStatus === 403 ? "Access Denied" : "Unable to Load League"}
        message={getApiErrorMessage(
          pageError,
          "The admin league page could not be loaded right now."
        )}
        variant={errorStatus === 404 ? "notFound" : errorStatus === 403 ? "forbidden" : "error"}
        actionTo={leagueId ? `/league/${leagueId}` : "/leagues"}
        actionLabel={errorStatus === 403 ? "Back to League" : "Back to Leagues"}
      />
    );
  }

  const completed = events?.filter((e: any) => e.status === "completed") ?? [];
  const needsScores = events?.filter((e: any) => e.status === "active") ?? [];
  const upcoming = events?.filter((e: any) => e.status === "upcoming") ?? [];
  const totalEvents = events?.length ?? 0;
  const totalPlayers = league?.players?.length ?? 0;
  const totalTeams = league?.teams?.length ?? 0;
  const nextEvent = upcoming[0] ?? null;

  const leader = metrics?.standings?.[0] ?? null;

  return (
    <div>
      <PageHeader
        title={league?.name ?? "League"}
        icon={<ShieldHalf size={14} />}
        iconText="ADMIN"
      />

      <div className="mt-3 mb-2 flex justify-end">
        <button
          onClick={() => navigate(`/league/${leagueId}/edit`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
        >
          <Edit size={12} strokeWidth={2.5} />
          Edit League
        </button>
      </div>

      <OnboardingChecklist leagueId={Number(leagueId)} />

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Events",
            value: `${completed.length} / ${totalEvents}`,
            sub: "completed",
            icon: <CalendarDays size={14} className="text-primary" />,
            bg: "bg-primary/5 border-primary/10",
          },
          {
            label: "Players",
            value: totalPlayers,
            sub: "members",
            icon: <Users size={14} className="text-blue-400" />,
            bg: "bg-blue-50 border-blue-100",
          },
          {
            label: "Teams",
            value: totalTeams,
            sub: "in league",
            icon: <ShieldHalf size={14} className="text-violet-400" />,
            bg: "bg-violet-50 border-violet-100",
          },
          {
            label: "Leader",
            value: leader ? leader.name.split(" ")[0] : "—",
            sub: leader ? `${leader.points} pts` : "no data yet",
            icon: <Trophy size={14} className="text-amber-400" />,
            bg: "bg-amber-50 border-amber-100",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex items-center gap-3"
          >
            <div className={`p-2 rounded-md border ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-gray-800 leading-tight">{stat.value}</p>
              <p className="text-[10px] text-gray-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Admin tools
          </p>
          <p className="text-xs font-semibold text-gray-600">
            Invite players or send a quick league-wide update.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InvitePlayersPanel leagueId={Number(leagueId)} players={league?.players ?? []} />
          <LeagueNotificationComposer leagueId={Number(leagueId)} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Score entry — active events first */}
        {needsScores.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-100 bg-blue-50/70">
              <Zap size={14} className="text-blue-600" strokeWidth={2.5} />
              <h3 className="text-sm font-semibold text-gray-800">Ready to Score</h3>
              <span className="ml-auto rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {needsScores.length} active
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {needsScores.map((event: any) => (
                <ScoreEntryRow
                  key={event.id}
                  event={event}
                  onScores={() => navigate(`/league/${leagueId}/events/${event.id}/scores`)}
                  onView={() => navigate(`/league/${leagueId}/events/${event.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next event callout */}
        {nextEvent && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <CalendarDays size={14} className="text-blue-400" strokeWidth={2.5} />
              <h3 className="text-sm font-semibold text-gray-800">Next Event</h3>
            </div>
            <div className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Date badge */}
                <div className="flex flex-col items-center justify-center bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 min-w-14 text-center">
                  <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
                    {dayjs(nextEvent.date).format("MMM")}
                  </span>
                  <span className="text-2xl font-black text-primary leading-none">
                    {dayjs(nextEvent.date).format("D")}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {dayjs(nextEvent.date).format("ddd")}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{nextEvent.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-gray-400" strokeWidth={2} />
                    <span className="text-xs text-gray-400">{nextEvent.course?.name}</span>
                    {nextEvent.tee?.name && (
                      <>
                        <span className="text-gray-300">&bull;</span>
                        <span className="text-xs text-gray-400">{nextEvent.tee.name} tees</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    {nextEvent.startTime && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={10} className="text-gray-300" />
                        {nextEvent.startTime}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Flag size={10} className="text-gray-300" />
                      {nextEvent.holes} holes
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/league/${leagueId}/events/${nextEvent.id}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Edit size={12} strokeWidth={2.5} />
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/league/${leagueId}/events/${nextEvent.id}/scores`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <ClipboardList size={12} strokeWidth={2.5} />
                  Enter Scores
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All events list */}
        <section className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-1">
              <SectionLabel>Events</SectionLabel>
              <p className="text-sm text-gray-500">Upcoming and completed rounds</p>
            </div>
            <button
              onClick={() => navigate(`/league/${leagueId}/events/create`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus size={12} strokeWidth={2.5} />
              New Event
            </button>
          </div>

          {totalEvents === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <CalendarDays size={32} strokeWidth={1.5} className="mb-2 opacity-40" />
              <p className="font-medium text-gray-500 text-sm">No events yet</p>
              <p className="text-xs mt-1">Create the first event to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...(needsScores ?? []), ...(upcoming ?? []), ...(completed ?? [])].map(
                (event: any) => (
                  <AdminEventRow
                    key={event.id}
                    event={event}
                    onView={() => navigate(`/league/${leagueId}/events/${event.id}`)}
                    onEdit={() => navigate(`/league/${leagueId}/events/${event.id}/edit`)}
                    onScores={() => navigate(`/league/${leagueId}/events/${event.id}/scores`)}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6">
        <AuditLogPanel leagueId={Number(leagueId)} />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{children}</h2>
  );
}

function ScoreEntryRow({
  event,
  onScores,
  onView,
}: {
  event: any;
  onScores: () => void;
  onView: () => void;
}) {
  const date = new Date(event.date);
  const canEnterScores = Boolean(event.canEnterScores);
  const canOpenScores = canEnterScores || Boolean(event.canEditScores);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 min-w-12 text-center">
        <span className="text-[9px] font-bold uppercase text-blue-400 tracking-wider">
          {date.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-lg font-black text-blue-600 leading-none">{date.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{event.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={10} className="text-gray-400" strokeWidth={2} />
          <span className="text-xs text-gray-400 truncate">{event.course?.name}</span>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onView}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={12} strokeWidth={2.5} />
          View
        </button>
        <button
          onClick={onScores}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            canEnterScores
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : canOpenScores
                ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <ClipboardList size={12} strokeWidth={2.5} />
          {canEnterScores ? "Enter Scores" : canOpenScores ? "Edit Scores" : "View Scores"}
        </button>
      </div>
    </div>
  );
}

function AdminEventRow({
  event,
  onView,
  onEdit,
  onScores,
}: {
  event: any;
  onView: () => void;
  onEdit: () => void;
  onScores: () => void;
}) {
  const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG["upcoming"];
  const date = new Date(event.date);
  const canEditEvent =
    !event?.isComplete && String(event?.status || "").toLowerCase() !== "completed";

  return (
    <div
      onClick={onView}
      className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-gray-300 cursor-pointer"
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
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 leading-tight truncate">
                {event.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-gray-400" strokeWidth={2} />
                <span className="text-xs text-gray-400 truncate">{event.course?.name}</span>
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
            {event.playerCount != null && (
              <MetaChip icon={<User size={10} />} label={`${event.playerCount} players`} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center pr-3 pl-1 gap-1">
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onScores();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              event.canEnterScores || event.canEditScores
                ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            title="Scores"
          >
            <ClipboardList size={12} strokeWidth={2} />
            {event.canEnterScores
              ? "Scores"
              : event.canEditScores
                ? "Edit Scores"
                : "View Scores"}
          </button>
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
