import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { useCancelLeagueEvent, useDeleteLeagueEvent } from "@api/league/mutations";
import { useLeagueEvent } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { getEventLocalDate } from "@/utils/eventDate";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/context/ToastContext";
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
  Ban,
  Calendar,
  CheckCircle2,
  CircleDashed,
  Clock,
  Eye,
  Flag,
  ListOrdered,
  MapPin,
  Medal,
  Printer,
  ShieldHalf,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ViewFlightScores from "@/pages/scores/ViewFlightScores";

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
  canceled: {
    label: "Canceled",
    icon: <Ban size={12} strokeWidth={2.5} />,
    className: "bg-slate-100 text-slate-500 border border-slate-200",
  },
};

const normalizeStatus = (status: string) => {
  if (status === "completed" || status === "complete") return "complete";
  if (status === "canceled" || status === "cancelled") return "canceled";
  if (status === "upcoming" || status === "scheduled") return "scheduled";
  if (status === "active") return "active";
  return "scheduled";
};

const LEADERBOARD_TABS = [
  { id: "points", label: "Points" },
  { id: "lowGross", label: "Low Gross" },
  { id: "lowNet", label: "Low Net" },
];

function PlayerNameLink({
  playerId,
  children,
  className = "font-semibold text-gray-800 hover:text-primary hover:underline",
}: {
  playerId?: number | string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const { leagueId } = useParams();
  const numericPlayerId = Number(playerId);

  if (!leagueId || !Number.isFinite(numericPlayerId) || numericPlayerId <= 0) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={`/league/${leagueId}/player/${numericPlayerId}`}
      className={className}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </Link>
  );
}

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
  const [activeTab, setActiveTab] = useState("points");
  const [isScorecardDrawerMounted, setIsScorecardDrawerMounted] = useState(false);
  const [isScorecardDrawerOpen, setIsScorecardDrawerOpen] = useState(false);
  const [activeSkinsDrawer, setActiveSkinsDrawer] = useState<{
    label: string;
    skins: any[];
    valueKey: string;
    iconClass: string;
    badgeClass: string;
  } | null>(null);
  const [isSkinsDrawerMounted, setIsSkinsDrawerMounted] = useState(false);
  const [isSkinsDrawerOpen, setIsSkinsDrawerOpen] = useState(false);
  const drawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skinsDrawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openScorecardDrawer = () => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    setIsScorecardDrawerMounted(true);
    requestAnimationFrame(() => {
      setIsScorecardDrawerOpen(true);
    });
  };

  const closeScorecardDrawer = () => {
    setIsScorecardDrawerOpen(false);
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
    }
    drawerCloseTimerRef.current = setTimeout(() => {
      setIsScorecardDrawerMounted(false);
      drawerCloseTimerRef.current = null;
    }, 300);
  };

  const openSkinsDrawer = (config: {
    label: string;
    skins: any[];
    valueKey: string;
    iconClass: string;
    badgeClass: string;
  }) => {
    if (skinsDrawerCloseTimerRef.current) {
      clearTimeout(skinsDrawerCloseTimerRef.current);
      skinsDrawerCloseTimerRef.current = null;
    }
    setActiveSkinsDrawer(config);
    setIsSkinsDrawerMounted(true);
    requestAnimationFrame(() => {
      setIsSkinsDrawerOpen(true);
    });
  };

  const closeSkinsDrawer = () => {
    setIsSkinsDrawerOpen(false);
    if (skinsDrawerCloseTimerRef.current) {
      clearTimeout(skinsDrawerCloseTimerRef.current);
    }
    skinsDrawerCloseTimerRef.current = setTimeout(() => {
      setIsSkinsDrawerMounted(false);
      setActiveSkinsDrawer(null);
      skinsDrawerCloseTimerRef.current = null;
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (drawerCloseTimerRef.current) {
        clearTimeout(drawerCloseTimerRef.current);
      }
      if (skinsDrawerCloseTimerRef.current) {
        clearTimeout(skinsDrawerCloseTimerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading-state">
        Loading event details...
      </div>
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

  const status =
    STATUS_CONFIG[normalizeStatus(String(event.status || ""))] ?? STATUS_CONFIG["scheduled"];
  const date = getEventLocalDate(event.date);
  const pointsEnabled = event.pointsEnabled !== false;
  const leaderboardTabs = pointsEnabled
    ? LEADERBOARD_TABS
    : LEADERBOARD_TABS.filter((tab) => tab.id !== "points");
  const resolvedActiveTab = pointsEnabled
    ? activeTab
    : activeTab === "points"
      ? "lowNet"
      : activeTab;

  const activeLeaderboard =
    resolvedActiveTab === "points"
      ? event.metrics.leaderboards.playerPoints
      : resolvedActiveTab === "lowGross"
        ? event.metrics.leaderboards.playerLowGross
        : event.metrics.leaderboards.playerLowNet;

  const activeValueLabel =
    resolvedActiveTab === "points" ? "PTS" : resolvedActiveTab === "lowGross" ? "GROSS" : "NET";
  const hasRounds = (event.metrics.scores?.length ?? 0) > 0;
  const totalFlightPlayers = (event.flights ?? []).flatMap(
    (flight: any) => flight.players ?? []
  ).length;
  const pointsLeaderboard = event.metrics.leaderboards.playerPoints || [];
  const lowNetLeaderboard = event.metrics.leaderboards.playerLowNet || [];
  const hasPointValues =
    pointsEnabled && pointsLeaderboard.some((entry: any) => Number(entry?.value || 0) > 0);
  const topThreeMode = hasPointValues ? "points" : "net";
  const topThree = (hasPointValues ? pointsLeaderboard : lowNetLeaderboard).slice(0, 3);
  const role = String(user?.role || "").toUpperCase();
  const canManageEvent = role === "ADMIN" || role === "SUPER";
  const isCanceledEvent = normalizeStatus(String(event.status || "")) === "canceled";
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
            className="summary-pill"
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
        {canManageEvent &&
          !isCanceledEvent &&
          normalizeStatus(String(event.status || "")) !== "complete" && (
            <Link
              to={`/league/${leagueId}/events/${eventId}/print-scorecards`}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            >
              <Printer size={12} />
              Print Scorecards
            </Link>
          )}
        {canManageEvent &&
          !isCanceledEvent &&
          normalizeStatus(String(event.status || "")) !== "complete" && (
            <button
              type="button"
              onClick={handleCancelEvent}
              disabled={cancelEvent.isPending}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <Ban size={12} />
              {cancelEvent.isPending ? "Canceling..." : "Cancel Event"}
            </button>
          )}
        {canManageEvent && (
          <button
            type="button"
            onClick={handleDeleteEvent}
            disabled={deleteEvent.isPending}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 size={12} />
            {deleteEvent.isPending ? "Deleting..." : "Delete Event"}
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
              <p className="section-kicker">
                {stat.label}
              </p>
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
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                  Performance and Skins
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribution, leaderboard, and skin winners
                </p>
              </div>
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
                        openSkinsDrawer({
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
                        openSkinsDrawer({
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
                  <div className="surface-card">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
                        <h3 className="text-sm font-semibold text-gray-800">Leaderboard</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {leaderboardTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${resolvedActiveTab === tab.id ? "bg-gray-100 text-gray-800 border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ScoreLeaderboard
                      leaderboard={activeLeaderboard}
                      valueLabel={activeValueLabel}
                    />
                  </div>
                  {event.metrics.scoreDistribution && (
                    <div className="surface-card">
                      <div className="panel-row">
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
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">Round Scores</h3>
                <p className="text-xs text-gray-500 mt-0.5">All player scores for this event</p>
              </div>
              <div className="surface-card">
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
                    <h3 className="text-sm font-semibold text-gray-800">Round Scores</h3>
                  </div>
                  <button
                    type="button"
                    onClick={openScorecardDrawer}
                    className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    <Eye size={12} strokeWidth={2.5} />
                    Scorecards
                  </button>
                </div>
                <RoundsTable rounds={event.metrics.scores} />
              </div>
            </div>
          </>
        ) : (
          <div className="pt-2">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">Flights</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pairings and tee time assignments</p>
            </div>
            <div className="surface-card">
              <div className="panel-row">
                <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
                <h3 className="text-sm font-semibold text-gray-800">Flights</h3>
                <span className="text-[10px] text-gray-400">No rounds recorded yet</span>
              </div>
              <FlightsPreview event={event} />
            </div>
          </div>
        )}
      </div>

      {isScorecardDrawerMounted && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close scorecards drawer"
            onClick={closeScorecardDrawer}
            className={`absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${
              isScorecardDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer absolute right-0 top-0 h-full w-full max-w-5xl border-l border-gray-200 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
              isScorecardDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">
                  Scorecard View
                </p>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Detailed Scorecards
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Admin-style score breakdown for this event
                </p>
              </div>
              <button
                type="button"
                onClick={closeScorecardDrawer}
                className="rounded-lg border border-transparent p-2 text-gray-400 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {event.format === "team" ? (
                <TeamScorecardsDrawer event={event} />
              ) : event.scoringFormat === "match" ? (
                <IndividualMatchScorecardsDrawer event={event} />
              ) : (
                <IndividualStrokeScorecardsDrawer rounds={event.metrics.scores || []} />
              )}
            </div>
          </aside>
        </div>
      )}

      {isSkinsDrawerMounted && activeSkinsDrawer && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close skins drawer"
            onClick={closeSkinsDrawer}
            className={`absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${
              isSkinsDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer absolute right-0 top-0 h-full w-full max-w-5xl border-l border-gray-200 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
              isSkinsDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">
                  Skins Breakdown
                </p>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {activeSkinsDrawer.label} Skins
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Full round scores with skin-winning holes highlighted
                </p>
              </div>
              <button
                type="button"
                onClick={closeSkinsDrawer}
                className="rounded-lg border border-transparent p-2 text-gray-400 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <SkinsRoundScoresDrawer
                rounds={event.metrics.scores || []}
                skins={activeSkinsDrawer.skins}
                label={activeSkinsDrawer.label}
                valueKey={activeSkinsDrawer.valueKey}
                iconClass={activeSkinsDrawer.iconClass}
                badgeClass={activeSkinsDrawer.badgeClass}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function TeamScorecardsDrawer({ event }: { event: any }) {
  const flights = [...(event.flights || [])].sort((a: any, b: any) => {
    const aTime = String(a?.startTime || "");
    const bTime = String(b?.startTime || "");
    return aTime.localeCompare(bTime);
  });

  if (flights.length === 0) {
    return <p className="text-sm text-gray-400">No flight scorecards available.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {flights.map((flight: any) => (
        <div
          key={flight.id}
          className="surface-card"
        >
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-700">
            Flight {flight.startTime}
          </div>
          <div className="p-4">
            <ViewFlightScores event={event} flight={flight} />
          </div>
        </div>
      ))}
    </div>
  );
}

function IndividualStrokeScorecardsDrawer({ rounds }: { rounds: any[] }) {
  if (!rounds?.length) {
    return <p className="text-sm text-gray-400">No scorecards available yet.</p>;
  }

  const sorted = [...rounds].sort((a, b) => a.player.lastName.localeCompare(b.player.lastName));
  const holes = Array.from(
    new Set(rounds.flatMap((round) => (round.scores ?? []).map((score: any) => Number(score.hole))))
  ).sort((a, b) => a - b);

  const getRoundPoints = (round: any) =>
    Number(round?.pointsEarned ?? round?.points ?? 0) + Number(round?.matchPoints ?? 0);

  return (
    <div className="surface-card overflow-x-auto">
      <table className="score-table">
        <thead>
          <tr className="text-xs text-gray-700">
            <th className="p-2">Player</th>
            {holes.map((hole: number) => (
              <th key={hole} className="p-2 text-center">
                {hole}
              </th>
            ))}
            <th className="p-2 text-center">Total</th>
            <th className="p-2 text-center">Net</th>
            <th className="p-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((round: any) => (
            <tr key={round.id} className="text-sm bg-slate-50/50">
              <td className="p-2 text-xs">
                <PlayerNameLink playerId={round.playerId}>
                  {round.player.firstName} {round.player.lastName}
                </PlayerNameLink>
                <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  Handicap: {Math.round(Number(round.preHandicap ?? 0))}
                </div>
              </td>
              {holes.map((hole: number) => {
                const score = round.scores?.find((s: any) => Number(s.hole) === hole);
                return (
                  <td key={hole} className="p-2">
                    <div className="relative h-8 min-w-10 border rounded flex items-center justify-center text-xs font-semibold bg-white">
                      {score?.gross ?? "-"}
                    </div>
                  </td>
                );
              })}
              <td className="font-bold text-center text-xs">{round.gross ?? 0}</td>
              <td className="font-bold text-center text-xs">{round.net ?? 0}</td>
              <td className="font-bold text-center text-xs">{getRoundPoints(round)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IndividualMatchScorecardsDrawer({ event }: { event: any }) {
  const flights = [...(event.flights || [])].sort((a: any, b: any) => {
    const aTime = String(a?.startTime || "");
    const bTime = String(b?.startTime || "");
    return aTime.localeCompare(bTime);
  });

  if (flights.length === 0) {
    return <p className="text-sm text-gray-400">No scorecards available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {flights.map((flight: any) => (
        <div
          key={flight.id}
          className="surface-card"
        >
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-700">
            Flight {flight.startTime}
          </div>
          <div className="p-4">
            <ViewFlightScores event={event} flight={flight} />
          </div>
        </div>
      ))}
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
            <PlayerNameLink
              key={p.id}
              playerId={p.id}
              className="font-medium text-gray-600 hover:text-primary hover:underline"
            >
              {p.firstName} {p.lastName}
            </PlayerNameLink>
          ))}
        </div>
      </div>
      <div className="text-center text-gray-400 font-semibold">vs</div>
      <div>
        <p className="font-semibold text-gray-800">{right?.name || "Team 2"}</p>
        <div className="mt-1 flex flex-col gap-0.5 text-gray-600">
          {(right?.players || []).map((p: any) => (
            <PlayerNameLink
              key={p.id}
              playerId={p.id}
              className="font-medium text-gray-600 hover:text-primary hover:underline"
            >
              {p.firstName} {p.lastName}
            </PlayerNameLink>
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
          <PlayerNameLink
            playerId={left.playerId}
            className="font-medium text-gray-700 hover:text-primary hover:underline"
          >
            {left.player.firstName} {left.player.lastName}
          </PlayerNameLink>
          <span className="text-gray-400">vs</span>
          {right ? (
            <PlayerNameLink
              playerId={right.playerId}
              className="font-medium text-gray-700 hover:text-primary hover:underline"
            >
              {right.player.firstName} {right.player.lastName}
            </PlayerNameLink>
          ) : (
            <span className="font-medium text-gray-700">TBD</span>
          )}
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
        <PlayerNameLink
          key={entry.playerId}
          playerId={entry.playerId}
          className="font-medium text-gray-700 hover:text-primary hover:underline"
        >
          {entry.player.firstName} {entry.player.lastName}
        </PlayerNameLink>
      ))}
    </div>
  );
}

function SkinsList({
  label,
  skins,
  valueKey,
  iconClass,
  badgeClass,
  onViewAll,
}: {
  label: string;
  skins: any[];
  valueKey: string;
  iconClass: string;
  badgeClass: string;
  onViewAll: () => void;
}) {
  return (
    <div className="surface-card">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <Zap size={13} className={iconClass} strokeWidth={2.5} />
          <h3 className="text-xs font-semibold text-gray-800">{label} Skins</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full ${badgeClass}`}>
            {skins.length}
          </span>
          <button
            type="button"
            onClick={onViewAll}
            className="text-[10px] font-semibold text-gray-500 hover:text-gray-700"
          >
            View
          </button>
        </div>
      </div>
      <div className="p-3">
        {skins.length === 0 ? (
          <p className="text-[11px] text-gray-300 italic">No {label.toLowerCase()} skins yet</p>
        ) : (
          <div className="max-h-45 overflow-y-auto pr-1 divide-y divide-gray-50 border border-gray-100 rounded-md">
            {skins.map((skin: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-2.5 py-2 bg-white">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center justify-center w-4 h-4 rounded bg-amber-50 border border-amber-200 shrink-0">
                    <Flag size={9} className="text-amber-500" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <PlayerNameLink
                      playerId={skin.playerId}
                      className="text-[11px] font-semibold text-gray-800 leading-tight truncate hover:text-primary hover:underline"
                    >
                      {skin.name}
                    </PlayerNameLink>
                    <p className="text-[10px] text-gray-400">Hole {skin.hole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-1 py-0.5 rounded">
                    {skin.scoreLabel}
                  </span>
                  <span className="text-xs font-bold text-gray-700 tabular-nums">
                    {skin[valueKey]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SkinsRoundScoresDrawer({
  rounds,
  skins,
  label,
  valueKey,
  iconClass,
  badgeClass,
}: {
  rounds: any[];
  skins: any[];
  label: string;
  valueKey: string;
  iconClass: string;
  badgeClass: string;
}) {
  if (!rounds?.length) {
    return <p className="text-sm text-gray-400">No scorecards available yet.</p>;
  }

  const highlightedHolesByPlayer = skins.reduce((acc: Record<number, number[]>, skin: any) => {
    const playerId = Number(skin?.playerId ?? 0);
    const hole = Number(skin?.hole ?? 0);
    if (!playerId || !hole) return acc;
    acc[playerId] = [...(acc[playerId] || []), hole];
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="surface-card">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Zap size={14} className={iconClass} strokeWidth={2.5} />
            <h3 className="text-sm font-semibold text-gray-800">{label} Skin Winners</h3>
          </div>
          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${badgeClass}`}>
            {skins.length} skins
          </span>
        </div>
        <div className="p-3">
          {skins.length === 0 ? (
            <p className="text-[11px] text-gray-300 italic">No {label.toLowerCase()} skins yet</p>
          ) : (
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-md">
              {skins.map((skin: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-2.5 py-2 bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-4 h-4 rounded bg-amber-50 border border-amber-200 shrink-0">
                      <Flag size={9} className="text-amber-500" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800 leading-tight truncate">
                        {skin.name}
                      </p>
                      <p className="text-[10px] text-gray-400">Hole {skin.hole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-1 py-0.5 rounded">
                      {skin.scoreLabel}
                    </span>
                    <span className="text-xs font-bold text-gray-700 tabular-nums">
                      {skin[valueKey]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="surface-card">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-gray-800">Round Scores</h3>
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">
            Highlighted cells mark skin holes
          </span>
        </div>
        <div className="overflow-x-auto">
          <RoundsTable
            rounds={rounds}
            highlightedHolesByPlayer={highlightedHolesByPlayer}
            highlightUnderPar={false}
          />
        </div>
      </div>
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
    <div className="max-h-70 overflow-y-auto">
      <table className="w-full text-left">
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr className="section-kicker border-b border-gray-100">
            <th className="px-3 py-2 w-8">#</th>
            <th className="px-2.5 py-2">
              <div className="flex items-center gap-1">
                <User size={10} strokeWidth={2.5} />
                <span>Player</span>
              </div>
            </th>
            <th className="px-3 py-2 text-right">{valueLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leaderboard.map((entry, index) => (
            <tr
              key={index}
              className={`text-xs ${index === 0 ? "bg-amber-50/40" : "hover:bg-gray-50/60"}`}
            >
              <td className="px-3 py-2">
                <span
                  className={`text-xs font-bold ${index === 0 ? "text-amber-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-500" : "text-gray-400"}`}
                >
                  {index < 9 ? `0${index + 1}` : index + 1}
                </span>
              </td>
              <td className="px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      index === 0
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {getInitials(entry.name)}
                  </div>
                  <div>
                    <PlayerNameLink
                      playerId={entry.playerId}
                      className="font-semibold text-gray-800 text-xs leading-tight hover:text-primary hover:underline"
                    >
                      {entry.name}
                    </PlayerNameLink>
                    <p className="text-[10px] text-gray-400">
                      HCP {entry.handicap != null ? entry.handicap.toFixed(1) : "—"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 text-right">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold border ${
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
    </div>
  );
}

function TopThreePlayers({ players, mode }: { players: any[]; mode: "points" | "net" }) {
  const label = mode === "points" ? "Top Points" : "Low Net Leaders";
  const valueLabel = mode === "points" ? "PTS" : "NET";

  const getInitials = (name: string) =>
    String(name || "")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const podiumStyles = [
    {
      rank: "1",
      medal: "bg-amber-100 text-amber-700 border-amber-200",
      card: "border-amber-200 bg-linear-to-br from-amber-50 to-white",
      icon: "text-amber-500",
    },
    {
      rank: "2",
      medal: "bg-slate-100 text-slate-600 border-slate-200",
      card: "border-slate-200 bg-linear-to-br from-slate-50 to-white",
      icon: "text-slate-400",
    },
    {
      rank: "3",
      medal: "bg-orange-100 text-orange-700 border-orange-200",
      card: "border-orange-200 bg-linear-to-br from-orange-50 to-white",
      icon: "text-orange-500",
    },
  ];

  return (
    <section className="surface-card">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-amber-500" strokeWidth={2.5} />
          <h3 className="text-xs font-semibold text-gray-800">{label}</h3>
        </div>
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500">
          Top 3
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {players.map((player, index) => {
          const style = podiumStyles[index] || podiumStyles[2];
          const value = Number(player?.value ?? 0);
          const displayValue = mode === "points" ? value : Math.round(value);

          return (
            <div
              key={`${player.playerId}-${index}`}
              className={`relative overflow-hidden rounded-lg border px-3 py-2.5 shadow-xs ${style.card}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${style.medal}`}
                  >
                    {getInitials(player.name) || style.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Medal size={13} className={style.icon} strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        #{style.rank}
                      </span>
                    </div>
                    <PlayerNameLink
                      playerId={player.playerId}
                      className="mt-0.5 block truncate text-xs font-bold text-gray-900 hover:text-primary hover:underline"
                    >
                      {player.name}
                    </PlayerNameLink>
                    <p className="text-[11px] font-medium text-gray-400">
                      HCP{" "}
                      {player.handicap != null && Number.isFinite(Number(player.handicap))
                        ? Number(player.handicap).toFixed(1)
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {valueLabel}
                  </p>
                  <p className="text-xl font-black leading-none text-gray-950">{displayValue}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
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

function RoundsTable({
  rounds,
  highlightedHolesByPlayer,
  highlightUnderPar = true,
}: {
  rounds: any[];
  highlightedHolesByPlayer?: Record<number, number[]>;
  highlightUnderPar?: boolean;
}) {
  const sorted = [...rounds].sort((a, b) => a.player.lastName.localeCompare(b.player.lastName));
  const holes = Array.from(
    new Set(rounds.flatMap((round) => (round.scores ?? []).map((score: any) => Number(score.hole))))
  ).sort((a, b) => a - b);

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
        <tr className="section-kicker bg-gray-50 border-b border-gray-100">
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
                <PlayerNameLink
                  playerId={round.playerId}
                  className="text-xs font-semibold text-gray-800 truncate hover:text-primary hover:underline"
                >
                  {round.player.firstName} {round.player.lastName}
                </PlayerNameLink>
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
              const isHighlighted = (
                highlightedHolesByPlayer?.[Number(round.playerId)] || []
              ).includes(hole);
              return (
                <td key={hole} className="py-2.5 text-center text-xs text-gray-700">
                  {score ? (
                    <span
                      className={
                        isHighlighted
                          ? "inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100 text-amber-700 font-semibold ring-2 ring-amber-300"
                          : highlightUnderPar && score.gross < score.par
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
