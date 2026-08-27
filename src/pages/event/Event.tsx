import LoadingState from "@/components/layout/LoadingState";
import SectionKicker from "@/components/layout/SectionKicker";
import SummaryPill from "@/components/layout/SummaryPill";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import SectionIntro from "@/components/layout/SectionIntro";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { useCancelLeagueEvent, useDeleteLeagueEvent } from "@api/league/mutations";
import { useLeagueEvent } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { getEventLocalDate } from "@/utils/eventDate";
import { formatTime } from "@/utils/format";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/context/useToast";
import {
  Calendar,
  Clock,
  Eye,
  Flag,
  ListOrdered,
  MapPin,
  Medal,
  ShieldHalf,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  buildEventLeaderboard,
  type EventLeaderboardSort,
} from "./eventLeaderboard";
import EventFlightsPreview from "./components/EventFlightsPreview";
import EventActionsMenu from "./components/EventActionsMenu";
import EventRoundsTable from "./components/EventRoundsTable";
import EventTeamStandings from "./components/EventTeamStandings";
import {
  FlightScorecardsDrawer,
  IndividualStrokeScorecardsDrawer,
} from "./components/EventScorecardDrawers";
import {
  SkinsList,
  SkinsRoundScoresDrawer,
  type SkinsDrawerContent,
} from "./components/EventSkins";
import { ScoreLeaderboard, TopThreePlayers } from "./components/EventLeaderboard";
import { getEventStatusConfig, normalizeEventStatus } from "./eventStatus";
import useAnimatedDrawer from "@/hooks/useAnimatedDrawer";

const LEADERBOARD_TABS = [
  { id: "points", label: "Points" },
  { id: "lowGross", label: "Low Gross" },
  { id: "lowNet", label: "Low Net" },
] satisfies Array<{ id: EventLeaderboardSort; label: string }>;
const SCORE_ONLY_LEADERBOARD_TABS = LEADERBOARD_TABS.filter((tab) => tab.id !== "points");
const buildEventView = (event: any, activeTab: EventLeaderboardSort) => {
  const rounds = event.metrics?.scores ?? [];
  const pointsEnabled = event.pointsEnabled !== false;
  const resolvedActiveTab = pointsEnabled
    ? activeTab
    : activeTab === "points"
      ? "lowNet"
      : activeTab;
  const pointsLeaderboard = event.metrics?.leaderboards?.playerPoints ?? [];
  const lowNetLeaderboard = event.metrics?.leaderboards?.playerLowNet ?? [];
  const hasPointValues =
    pointsEnabled && pointsLeaderboard.some((entry: any) => Number(entry?.value || 0) > 0);

  return {
    activeLeaderboard: buildEventLeaderboard(rounds, resolvedActiveTab),
    hasRounds: rounds.length > 0,
    leaderboardSort: resolvedActiveTab,
    leaderboardTabs: pointsEnabled ? LEADERBOARD_TABS : SCORE_ONLY_LEADERBOARD_TABS,
    normalizedStatus: normalizeEventStatus(event.status),
    resolvedActiveTab,
    topThree: (hasPointValues ? pointsLeaderboard : lowNetLeaderboard).slice(0, 3),
    topThreeMode: hasPointValues ? ("points" as const) : ("net" as const),
    totalFlightPlayers: (event.flights ?? []).reduce(
      (total: number, flight: any) => total + (flight.players?.length ?? 0),
      0,
    ),
  };
};

export default function Event() {
  const { leagueId, eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { show } = useToast();
  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useLeagueEvent(Number(leagueId), Number(eventId));
  const deleteEvent = useDeleteLeagueEvent(() => {
    show("Event deleted.", "success");
    navigate(`/league/${leagueId}/admin`);
  });
  const cancelEvent = useCancelLeagueEvent(() => {
    show("Event canceled.", "success");
  });
  const [activeTab, setActiveTab] = useState<EventLeaderboardSort>("points");
  const [roundScoreMode, setRoundScoreMode] = useState<"gross" | "net">("gross");
  const scorecardDrawer = useAnimatedDrawer();
  const skinsDrawer = useAnimatedDrawer<SkinsDrawerContent>();
  const eventView = useMemo(
    () => (event ? buildEventView(event, activeTab) : null),
    [activeTab, event],
  );

  if (isLoading) {
    return (
      <LoadingState>
        Loading event details...
      </LoadingState>
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "Event Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load Event"
        }
        message={getApiErrorMessage(error, "The event page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
        actionTo={leagueId ? `/league/${leagueId}/events` : "/leagues"}
        actionLabel="Back to Events"
      />
    );
  }

  if (!event) {
    return (
      <PageState
        title="Event Not Found"
        message="The event could not be found."
        variant="notFound"
        actionTo={leagueId ? `/league/${leagueId}/events` : "/leagues"}
        actionLabel="Back to Events"
      />
    );
  }

  const status = getEventStatusConfig(event.status);
  const date = getEventLocalDate(event.startsAt, event.timeZone);
  const {
    activeLeaderboard,
    hasRounds,
    leaderboardSort,
    leaderboardTabs,
    normalizedStatus,
    resolvedActiveTab,
    topThree,
    topThreeMode,
    totalFlightPlayers,
  } = eventView!;
  const role = String(user?.role || "").toUpperCase();
  const canManageEvent = role === "ADMIN" || role === "SUPER";
  const isCanceledEvent = normalizedStatus === "canceled";
  const canModifyEvent = !isCanceledEvent && normalizedStatus !== "complete";
  const handleDeleteEvent = () => {
    const confirmed = window.confirm(
      `Delete "${event.name}"? This removes it from the schedule and league event lists.`
    );
    if (!confirmed) return;

    deleteEvent.mutate(
      { leagueId: Number(leagueId), eventId: Number(eventId) },
      {
        onError: (error: any) => {
          show(error?.message || "Failed to delete event.", "error");
        },
      }
    );
  };
  const handleCancelEvent = () => {
    const confirmed = window.confirm(
      `Cancel "${event.name}"? This keeps it visible but prevents score entry.`
    );
    if (!confirmed) return;

    cancelEvent.mutate(
      { leagueId: Number(leagueId), eventId: Number(eventId) },
      {
        onError: (error: any) => {
          show(error?.message || "Failed to cancel event.", "error");
        },
      }
    );
  };

  return (
    <div>
      <PageHeader title={event.name || "Event Details"} />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <SummaryPill icon={<Calendar size={12} />}>
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </SummaryPill>
          <SummaryPill icon={<Clock size={12} />}>
            {formatTime(event.startsAt, event.timeZone)}
          </SummaryPill>
          <SummaryPill icon={<MapPin size={12} />}>
            {event.course.name}
            {event.tee?.name ? ` · ${event.tee.name}` : ""}
          </SummaryPill>
          <SummaryPill icon={<ShieldHalf size={12} />} className="capitalize">
            {event.format}
          </SummaryPill>
          <SummaryPill icon={<Medal size={12} />} className="capitalize">
            {event.scoringFormat} play
          </SummaryPill>
          <SummaryPill icon={status.icon} strong>
            {status.label}
          </SummaryPill>
        </div>

        {canManageEvent && (
          <div className="shrink-0">
            <EventActionsMenu
              canModify={canModifyEvent}
              canPrint={!isCanceledEvent}
              isCanceling={cancelEvent.isPending}
              isDeleting={deleteEvent.isPending}
              onEdit={() => navigate(`/league/${leagueId}/events/${eventId}/edit`)}
              onPrint={() => navigate(`/league/${leagueId}/events/${eventId}/print-scorecards`)}
              onCancel={handleCancelEvent}
              onDelete={handleDeleteEvent}
            />
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Players",
            value: hasRounds ? activeLeaderboard.length : totalFlightPlayers,
            sub: hasRounds ? "scored players" : "in flights",
            icon: <User size={14} className="text-blue-500" />,
            accent: "from-blue-50 to-white border-blue-100",
          },
          {
            label: "Gross Skins",
            value: event.metrics.skins.playerSkins.length,
            sub: "winning holes",
            icon: <Zap size={14} className="text-amber-500" />,
            accent: "from-amber-50 to-white border-amber-100",
          },
          {
            label: "Net Skins",
            value: event.metrics.skins.playerNetSkins.length,
            sub: "winning holes",
            icon: <Zap size={14} className="text-violet-500" />,
            accent: "from-violet-50 to-white border-violet-100",
          },
          {
            label: "Holes",
            value: event.holes,
            sub: `${event.startSide === "back" ? "back" : "front"} start`,
            icon: <Flag size={14} className="text-emerald-500" />,
            accent: "from-emerald-50 to-white border-emerald-100",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden bg-linear-to-br ${stat.accent} border rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-3`}
          >
            <div className="min-w-0">
              <SectionKicker>
                {stat.label}
              </SectionKicker>
              <p className="text-2xl font-black text-gray-900 leading-tight mt-1">{stat.value}</p>
              <p className="text-[11px] font-medium text-gray-500 mt-1">{stat.sub}</p>
            </div>
            <div className="shrink-0 p-2.5 bg-white/70 rounded-lg border border-white/70 shadow-[0_1px_0_rgba(255,255,255,0.8)]">
              {stat.icon}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gray-900/5" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {hasRounds ? (
          <>
            <div className="pt-2">
              <SectionIntro
                title="Performance and Skins"
                description="Distribution, leaderboard, and skin winners"
              />
              <div className="flex gap-4">
                <div className="w-1/3 flex flex-col gap-4">
                  {topThree.length > 0 && (
                    <TopThreePlayers players={topThree} mode={topThreeMode} />
                  )}
                  <div className="flex flex-col gap-3">
                    <SkinsList
                      label="Gross"
                      skins={event.metrics.skins.playerSkins}
                      valueKey="gross"
                      iconClass="text-amber-500"
                      badgeClass="bg-amber-50 text-amber-600 border-amber-200"
                      onViewAll={() =>
                        skinsDrawer.open({
                          label: "Gross",
                          skins: event.metrics.skins.playerSkins,
                          valueKey: "gross",
                          iconClass: "text-amber-500",
                          badgeClass: "bg-amber-50 text-amber-600 border-amber-200",
                        })
                      }
                    />
                    <SkinsList
                      label="Net"
                      skins={event.metrics.skins.playerNetSkins}
                      valueKey="net"
                      iconClass="text-violet-500"
                      badgeClass="bg-violet-50 text-violet-600 border-violet-200"
                      onViewAll={() =>
                        skinsDrawer.open({
                          label: "Net",
                          skins: event.metrics.skins.playerNetSkins,
                          valueKey: "net",
                          iconClass: "text-violet-500",
                          badgeClass: "bg-violet-50 text-violet-600 border-violet-200",
                        })
                      }
                    />
                  </div>
                </div>

                <div className="w-2/3 flex flex-col gap-3">
                  <SurfaceCard>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
                        <h3 className="text-sm font-semibold text-gray-800">Leaderboard</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {leaderboardTabs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            aria-pressed={resolvedActiveTab === tab.id}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${resolvedActiveTab === tab.id ? "bg-gray-100 text-gray-800 border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ScoreLeaderboard
                      leaderboard={activeLeaderboard}
                      sortBy={leaderboardSort}
                    />
                  </SurfaceCard>
                  {event.format === "team" && event.metrics.teamStandings?.length > 0 && (
                    <EventTeamStandings standings={event.metrics.teamStandings} />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 [content-visibility:auto] [contain-intrinsic-size:auto_560px]">
              <SectionIntro title="Round Scores" description="All player scores for this event" />
              <SurfaceCard>
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
                    <h3 className="text-sm font-semibold text-gray-800">Round Scores</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center rounded-md border border-gray-200 bg-gray-50 p-0.5"
                      role="group"
                      aria-label="Hole score display"
                    >
                      {(["gross", "net"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setRoundScoreMode(mode)}
                          aria-pressed={roundScoreMode === mode}
                          className={`rounded px-2 py-1 text-[10px] font-bold capitalize transition-colors ${
                            roundScoreMode === mode
                              ? "bg-white text-gray-800 shadow-sm"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => scorecardDrawer.open()}
                      className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <Eye size={12} strokeWidth={2.5} />
                      Scorecards
                    </button>
                  </div>
                </div>
                <EventRoundsTable
                  rounds={event.metrics.scores}
                  holeScoreKey={roundScoreMode}
                  showRoundStats
                />
              </SurfaceCard>
            </div>
          </>
        ) : (
          <div className="pt-2">
            <SectionIntro title="Flights" description="Pairings and tee time assignments" />
            <SurfaceCard>
              <PanelBar>
                <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
                <h3 className="text-sm font-semibold text-gray-800">Flights</h3>
                <span className="text-[10px] text-gray-400">No rounds recorded yet</span>
              </PanelBar>
              <EventFlightsPreview event={event} />
            </SurfaceCard>
          </div>
        )}
      </div>

      {scorecardDrawer.isMounted && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close scorecards drawer"
            onClick={scorecardDrawer.close}
            className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
              scorecardDrawer.isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer scorecards-drawer absolute right-0 top-0 h-full w-full max-w-5xl overscroll-contain overflow-y-auto border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
              scorecardDrawer.isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <SectionKicker>Scorecard View</SectionKicker>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Detailed Scorecards
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Admin-style score breakdown for this event
                </p>
              </div>
              <button
                type="button"
                onClick={scorecardDrawer.close}
                className="rounded-lg border border-transparent p-2 text-gray-400 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {event.format === "team" ? (
                <FlightScorecardsDrawer
                  event={event}
                  emptyMessage="No flight scorecards available."
                />
              ) : event.scoringFormat === "match" ? (
                <FlightScorecardsDrawer event={event} />
              ) : (
                <IndividualStrokeScorecardsDrawer rounds={event.metrics.scores || []} />
              )}
            </div>
          </aside>
        </div>
      )}

      {skinsDrawer.isMounted && skinsDrawer.content && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close skins drawer"
            onClick={skinsDrawer.close}
            className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
              skinsDrawer.isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer absolute right-0 top-0 h-full w-full max-w-5xl overscroll-contain overflow-y-auto border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
              skinsDrawer.isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <SectionKicker>Skins Breakdown</SectionKicker>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {skinsDrawer.content.label} Skins
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Full round scores with skin-winning holes highlighted
                </p>
              </div>
              <button
                type="button"
                onClick={skinsDrawer.close}
                className="rounded-lg border border-transparent p-2 text-gray-400 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <SkinsRoundScoresDrawer
                rounds={event.metrics.scores || []}
                skins={skinsDrawer.content.skins}
                label={skinsDrawer.content.label}
                valueKey={skinsDrawer.content.valueKey}
                iconClass={skinsDrawer.content.iconClass}
                badgeClass={skinsDrawer.content.badgeClass}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
