import LoadingState from "@/components/layout/LoadingState";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import {
  useCancelLeagueEvent,
  useDeleteLeagueEvent,
  useRotateLeagueViewerAccessCode,
} from "@api/league/mutations";
import { useLeague, useLeagueEvents, useLeagueMetrics } from "@api/league/queries";
import {
  AuditLogPanel,
  InvitePlayersPanel,
} from "@/components/league/AdminOpsPanels";
import LeagueAnnouncementsPanel from "@/components/league/LeagueAnnouncementsPanel";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { formatEventDate, getEventLocalDate, sortEventsByDate } from "@/utils/eventDate";
import { formatTime } from "@/utils/format";
import { useToast } from "@/context/useToast";
import { getScoringModeLabel } from "@/features/scoring/scoringModes";
import {
  Award,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardList,
  Clock,
  Copy,
  Edit,
  Flag,
  MapPin,
  Plus,
  RotateCw,
  RefreshCw,
  ShieldHalf,
  Timer,
  Trash2,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import { getLeagueBillingStatus, getLeagueCapacity } from "@/lib/billing";
import { Link, useNavigate, useParams } from "react-router";
import Tooltip from "@mui/material/Tooltip";
import { useAppStore } from "@/stores/appStore";
import {
  useCorrectLeagueRenewalLink,
  useUpdateLeagueLifecycle,
} from "@api/admin/mutations";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { confirmCheckoutSession } from "@api/payments";
import { clearCheckoutReturnFromUrl, getCheckoutReturn } from "@/features/payments/checkoutReturn";
import PaymentReturnNotice from "@/features/payments/components/PaymentReturnNotice";
import CommissionerInsights from "@/features/league-intelligence/components/CommissionerInsights";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  canceled: {
    label: "Canceled",
    icon: <Ban size={12} strokeWidth={2.5} />,
    className: "bg-slate-100 text-slate-500 border border-slate-200",
  },
};

export default function LeagueAdmin() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const restorePayment = useCreateCheckoutSession();
  const paymentReturnStartedRef = useRef(false);
  const [paymentReturnMessage, setPaymentReturnMessage] = useState<string | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentConfirmationAttempt, setPaymentConfirmationAttempt] = useState(0);

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
  const {
    data: metrics,
    isError: metricsIsError,
    error: metricsError,
  } = useLeagueMetrics(Number(leagueId));
  const deleteEvent = useDeleteLeagueEvent(() => {
    show("Event deleted.", "success");
  });
  const cancelEvent = useCancelLeagueEvent(() => {
    show("Event canceled.", "success");
  });
  const rotateViewerCode = useRotateLeagueViewerAccessCode(Number(leagueId));
  const updateLifecycle = useUpdateLeagueLifecycle();
  const correctRenewalLink = useCorrectLeagueRenewalLink();

  useEffect(() => {
    const checkoutReturn = getCheckoutReturn(window.location.search);
    if (!checkoutReturn.checkout?.startsWith("season_payment_") || paymentReturnStartedRef.current) {
      return;
    }
    paymentReturnStartedRef.current = true;

    if (checkoutReturn.checkout === "season_payment_cancel") {
      clearCheckoutReturnFromUrl();
      show("Season payment was canceled.", "warning");
      return;
    }
    if (!checkoutReturn.sessionId) {
      queueMicrotask(() => {
        setPaymentReturnMessage("The returned payment could not be identified.");
      });
      return;
    }

    const confirmPayment = async () => {
      setIsConfirmingPayment(true);
      setPaymentReturnMessage(null);
      try {
        const confirmation = await confirmCheckoutSession(checkoutReturn.sessionId!);
        if (confirmation.status === "processing") {
          setPaymentReturnMessage(confirmation.message || "Payment is still processing.");
          return;
        }
        if (confirmation.status === "failed") {
          clearCheckoutReturnFromUrl();
          setPaymentReturnMessage(confirmation.message || "Payment was not completed.");
          return;
        }
        clearCheckoutReturnFromUrl();
        await queryClient.invalidateQueries({ queryKey: ["league", Number(leagueId)] });
        show("Season payment restored.", "success");
      } catch (error) {
        setPaymentReturnMessage(
          error instanceof Error ? error.message : "Payment could not be confirmed."
        );
      } finally {
        setIsConfirmingPayment(false);
      }
    };

    void confirmPayment();
  }, [leagueId, paymentConfirmationAttempt, queryClient, show]);

  const pageError = leagueError || eventsError || metricsError;
  const errorStatus = getApiErrorStatus(pageError);

  if (leagueLoading || eventsLoading) {
    return (
      <LoadingState>Loading...</LoadingState>
    );
  }

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
  const sortedEvents = sortEventsByDate(events ?? []);
  const totalEvents = events?.length ?? 0;
  const totalPlayers = league?.players?.length ?? 0;
  const totalTeams = league?.teams?.length ?? 0;
  const nextEvent = upcoming[0] ?? null;
  const role = String(user?.role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER";
  const ownsLeague = Number(league?.adminId) === Number(user?.id);
  const leagueBillingStatus = getLeagueBillingStatus(league);
  const isReadOnly =
    league?.seasonStatus === "archived" || leagueBillingStatus === "payment_due";

  const leader = metrics?.standings?.[0] ?? null;
  const handleDeleteEvent = (event: any) => {
    if (isReadOnly) {
      show("This season is read-only.", "warning");
      return;
    }
    const confirmed = window.confirm(
      `Delete "${event.name}"? This removes it from the schedule and league event lists.`
    );
    if (!confirmed) return;

    deleteEvent.mutate(
      { leagueId: Number(leagueId), eventId: Number(event.id) },
      {
        onError: (error: any) => {
          show(error?.message || "Failed to delete event.", "error");
        },
      }
    );
  };
  const handleCancelEvent = (event: any) => {
    if (isReadOnly) {
      show("This season is read-only.", "warning");
      return;
    }
    const confirmed = window.confirm(
      `Cancel "${event.name}"? This keeps it on the schedule but removes it from scoring.`
    );
    if (!confirmed) return;

    cancelEvent.mutate(
      { leagueId: Number(leagueId), eventId: Number(event.id) },
      {
        onError: (error: any) => {
          show(error?.message || "Failed to cancel event.", "error");
        },
      }
    );
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title={league?.name ?? "League"}
      />

      {(isConfirmingPayment || paymentReturnMessage) && (
        <PaymentReturnNotice
          isChecking={isConfirmingPayment}
          message={
            isConfirmingPayment
              ? "Confirming the season payment..."
              : paymentReturnMessage || "Payment could not be confirmed."
          }
          onRetry={() => {
            paymentReturnStartedRef.current = false;
            setPaymentConfirmationAttempt((attempt) => attempt + 1);
          }}
        />
      )}

      {isReadOnly && (
        <div className={`rounded-xl border px-4 py-3 ${
          leagueBillingStatus === "payment_due"
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-amber-200 bg-amber-50 text-amber-950"
        }`}>
          <p className="text-sm font-black">
            {leagueBillingStatus === "payment_due" ? "Season payment needs attention" : "Past season — read only"}
          </p>
          <p className="mt-1 text-xs leading-5 opacity-80">
            {leagueBillingStatus === "payment_due"
              ? "A refund or dispute left this season underpaid. Results remain visible, but changes are blocked until payment is restored."
              : "Historical players, events, scores, and announcements are locked. Renew the league to manage the next season."}
          </p>
          {leagueBillingStatus === "payment_due" && ownsLeague && (
            <button
              type="button"
              disabled={restorePayment.isPending}
              onClick={async () => {
                try {
                  const checkout = await restorePayment.mutateAsync({
                    purpose: "league_capacity",
                    leagueId: Number(leagueId),
                    requestedGolfers: getLeagueCapacity(league),
                    successUrl: `${window.location.origin}/league/${leagueId}/admin?checkout=season_payment_success`,
                    cancelUrl: `${window.location.origin}/league/${leagueId}/admin?checkout=season_payment_cancel`,
                  });
                  if (checkout.alreadyCovered) {
                    await queryClient.invalidateQueries({
                      queryKey: ["league", Number(leagueId)],
                    });
                    return;
                  }
                  if (!checkout.url) throw new Error("The payment provider did not return a checkout URL.");
                  window.location.href = checkout.url;
                } catch (error) {
                  show(error instanceof Error ? error.message : "Unable to restore payment.", "error");
                }
              }}
              className="mt-3 rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white transition hover:bg-red-800 disabled:opacity-60"
            >
              {restorePayment.isPending ? "Preparing Checkout..." : "Restore Season Payment"}
            </button>
          )}
        </div>
      )}

      <div className="-mt-1 flex flex-wrap justify-end gap-2">
        {league?.renewedFromLeague && (
          <Link
            to={`/league/${league.renewedFromLeague.id}/admin`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Previous Season
          </Link>
        )}
        {league?.renewedLeague ? (
          <Link
            to={`/league/${league.renewedLeague.id}/admin`}
            className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100"
          >
            Next Season
          </Link>
        ) : String(league?.type).toLowerCase() === "season" && ownsLeague ? (
          <Link
            to={`/leagues/create?renewFrom=${league.id}`}
            className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100"
          >
            <RefreshCw size={12} strokeWidth={2.5} />
            Renew for Next Season
          </Link>
        ) : null}
        {!isReadOnly && <button
          onClick={() => navigate(`/league/${leagueId}/edit`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
        >
          <Edit size={12} strokeWidth={2.5} />
          Edit League
        </button>}
        {isSuperAdmin && (
          <button
            type="button"
            disabled={updateLifecycle.isPending}
            onClick={() => {
              const nextStatus = league?.seasonStatus === "reopened" ? "archived" : "reopened";
              if (!window.confirm(`${nextStatus === "reopened" ? "Reopen" : "Archive"} this season? This action is audited.`)) return;
              updateLifecycle.mutate(
                { leagueId: Number(leagueId), status: nextStatus },
                {
                  onSuccess: () => show(`Season ${nextStatus}.`, "success"),
                  onError: (error: any) => show(error?.message || "Unable to update season status.", "error"),
                }
              );
            }}
            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800"
          >
            {league?.seasonStatus === "reopened" ? "Lock Historical Season" : "Temporarily Unlock"}
          </button>
        )}
        {isSuperAdmin && league?.renewedFromLeagueId && (
          <button
            type="button"
            disabled={correctRenewalLink.isPending}
            onClick={() => {
              if (!window.confirm("Remove this previous-season link? Both leagues and all billing records will be preserved.")) return;
              correctRenewalLink.mutate(Number(leagueId), {
                onSuccess: () => show("Renewal link corrected.", "success"),
                onError: (error: any) => show(error?.message || "Unable to correct the renewal link.", "error"),
              });
            }}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800"
          >
            Correct Renewal Link
          </button>
        )}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black tracking-tight text-gray-900">View-only league code</p>
            <p className="mt-0.5 text-xs font-medium text-blue-800/70">
              Share this with users who only need to view this league.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-black tracking-[0.18em] text-blue-900">
              {league?.viewerAccessCode || "—"}
            </code>
            <button
              type="button"
              disabled={!league?.viewerAccessCode}
              onClick={() => {
                navigator.clipboard?.writeText(String(league.viewerAccessCode));
                show("League code copied.", "success");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-black text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy size={13} />
              Copy
            </button>
            <button
              type="button"
              disabled={rotateViewerCode.isPending || isReadOnly}
              onClick={() => {
                const confirmed = window.confirm(
                  "Generate a new view-only code? The current code will stop working immediately."
                );
                if (!confirmed) return;
                rotateViewerCode.mutate(undefined, {
                  onSuccess: () => show("League access code rotated.", "success"),
                  onError: (error: any) =>
                    show(error?.message || "Unable to rotate the access code.", "error"),
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-black text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCw size={13} className={rotateViewerCode.isPending ? "animate-spin" : ""} />
              Rotate
            </button>
          </div>
        </div>
      </div>

      <CommissionerInsights
        league={league}
        events={Array.isArray(events) ? events : []}
        metrics={metrics}
      />

      <section className="space-y-3">
        <SectionHeader
          title="Overview"
          description="League health, participation, and current season position."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: "Events",
              value: `${completed.length} / ${totalEvents}`,
              sub: "completed",
              icon: <CalendarDays size={14} className="text-slate-900" />,
              bg: "bg-slate-900/5 border-slate-900/10",
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
              className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm flex items-center gap-3"
            >
              <div className={`p-2 rounded-md border ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.16em]">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-lg font-black text-gray-900 leading-tight">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-gray-400">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div
          id="league-announcements"
          className="scroll-mt-24 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm"
        >
          <div>
            <p className="text-sm font-bold tracking-tight text-gray-900">Communication tools</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500">
              Manage profile claims and league announcements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isReadOnly ? (
              <>
                <InvitePlayersPanel leagueId={Number(leagueId)} players={league?.players ?? []} />
                <LeagueAnnouncementsPanel leagueId={Number(leagueId)} canManage />
              </>
            ) : (
              <span className="text-xs font-semibold text-gray-500">Communication changes are locked.</span>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        {/* Score entry — active events first */}
        {needsScores.length > 0 && (
          <section className="space-y-3">
            <SectionHeader
              title="Scoring"
              description="Active rounds that need scores entered or reviewed."
            />
            <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden">
              <PanelBar className="bg-blue-50/70">
                <Zap size={14} className="text-blue-600" strokeWidth={2.5} />
                <div>
                  <h3 className="text-sm font-black tracking-tight text-gray-900">
                    Ready to Score
                  </h3>
                  <p className="text-xs font-medium text-blue-700/70">
                    Active rounds waiting for score entry
                  </p>
                </div>
                <span className="ml-auto rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {needsScores.length} active
                </span>
              </PanelBar>
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
          </section>
        )}

        {/* All events list */}
        <section className="space-y-3 pt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-1">
              <SectionLabel>Events</SectionLabel>
              <p className="text-sm font-medium text-gray-500">
                Upcoming, completed, and canceled rounds
              </p>
            </div>
            <button
              onClick={() => navigate(`/league/${leagueId}/events/create`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-900/90 transition-colors"
            >
              <Plus size={12} strokeWidth={2.5} />
              New Event
            </button>
          </div>

          {nextEvent && (
            <SurfaceCard>
              <PanelBar>
                <CalendarDays size={14} className="text-blue-400" strokeWidth={2.5} />
                <h3 className="text-sm font-black tracking-tight text-gray-900">Next Event</h3>
              </PanelBar>
              <div className="px-4 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Date badge */}
                  <div className="flex flex-col items-center justify-center bg-slate-900/5 border border-slate-900/10 rounded-lg px-3 py-2 min-w-14 text-center">
                    <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
                      {formatEventDate(nextEvent.startsAt, { month: "short" }, "en-US", nextEvent.timeZone)}
                    </span>
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {formatEventDate(nextEvent.startsAt, { day: "numeric" }, "en-US", nextEvent.timeZone)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {formatEventDate(nextEvent.startsAt, { weekday: "short" }, "en-US", nextEvent.timeZone)}
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
                      {nextEvent.startsAt && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={10} className="text-gray-300" />
                          {formatTime(nextEvent.startsAt, nextEvent.timeZone)}
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-900/90 transition-colors"
                  >
                    <ClipboardList size={12} strokeWidth={2.5} />
                    Enter Scores
                  </button>
                </div>
              </div>
            </SurfaceCard>
          )}

          {totalEvents === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <CalendarDays size={32} strokeWidth={1.5} className="mb-2 opacity-40" />
              <p className="font-medium text-gray-500 text-sm">No events yet</p>
              <p className="text-xs mt-1">Create the first event to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedEvents.map((event: any) => (
                <AdminEventRow
                  key={event.id}
                  event={event}
                  onView={() => navigate(`/league/${leagueId}/events/${event.id}`)}
                  onEdit={() => navigate(`/league/${leagueId}/events/${event.id}/edit`)}
                  onScores={() => navigate(`/league/${leagueId}/events/${event.id}/scores`)}
                  onCancel={() => handleCancelEvent(event)}
                  onDelete={() => handleDeleteEvent(event)}
                  isCanceling={cancelEvent.isPending}
                  isDeleting={deleteEvent.isPending}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div>
        <SectionHeader
          title="Activity"
          description="Recent administrative changes and league operations."
        />
        <div className="mt-3">
          <AuditLogPanel leagueId={Number(leagueId)} />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.18em]">{children}</h2>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-end justify-between gap-3pb-2">
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
          {title}
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500">{description}</p>
      </div>
    </div>
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
  const date = getEventLocalDate(event.startsAt, event.timeZone);
  const canEnterScores = Boolean(event.canEnterScores);
  const canOpenScores = canEnterScores || Boolean(event.canEditScores);
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 min-w-12 text-center">
        <span className="text-[9px] font-bold uppercase text-blue-400 tracking-wider">
          {date.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-lg font-black text-blue-600 leading-none">{date.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm tracking-tight truncate">{event.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={10} className="text-gray-400" strokeWidth={2} />
          <span className="text-xs font-medium text-gray-400 truncate">{event.course?.name}</span>
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
  onCancel,
  onDelete,
  isCanceling = false,
  isDeleting = false,
}: {
  event: any;
  onView: () => void;
  onEdit: () => void;
  onScores: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isCanceling?: boolean;
  isDeleting?: boolean;
}) {
  const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG["upcoming"];
  const date = getEventLocalDate(event.startsAt, event.timeZone);
  const isCanceledEvent = String(event?.status || "").toLowerCase() === "canceled";
  const canEditEvent =
    String(event?.status || "").toLowerCase() !== "completed" &&
    !isCanceledEvent;

  return (
    <SurfaceCard
      onClick={onView}
      className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-900/30 hover:bg-slate-900/2"
    >
      <div className="flex items-stretch">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center px-3 py-3 min-w-14 border-r bg-slate-900/5 border-slate-900/10">
          <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-black leading-none text-slate-900">{date.getDate()}</span>
          <span className="text-[9px] text-gray-400 font-medium">
            {date.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 px-3.5 py-3 min-w-0">
          <div className="mb-1.5">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="min-w-0 truncate text-sm font-bold tracking-tight text-gray-900 leading-tight">
                  {event.name}
                </h3>
                <StatusChip status={status} />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-gray-400" strokeWidth={2} />
                <span className="text-xs font-medium text-gray-400 truncate">
                  {event.course?.name}
                </span>
                {event.tee?.name && (
                  <>
                    <span className="text-gray-300 text-xs">&bull;</span>
                    <span className="text-xs font-medium text-gray-400">{event.tee.name} tees</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {event.startsAt && (
              <MetaChip icon={<Clock size={10} />} label={formatTime(event.startsAt, event.timeZone)} />
            )}
            <MetaChip icon={<Flag size={10} />} label={`${event.holes}h`} />
            {event.scoringMode && (
              <MetaChip
                icon={<Award size={10} />}
                label={getScoringModeLabel(event)}
              />
            )}
            {event.playerCount != null && (
              <MetaChip icon={<User size={10} />} label={`${event.playerCount} players`} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center pr-3 pl-1 gap-1.5">
          {canEditEvent && (
            <Tooltip title="Edit event" placement="top" arrow>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="cursor-pointer p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-slate-900/30 hover:bg-slate-900/10 hover:text-slate-900 transition-colors shadow-xs"
                aria-label="Edit event"
              >
                <Edit size={13} strokeWidth={2} />
              </button>
            </Tooltip>
          )}
          {!isCanceledEvent && canEditEvent && (
            <Tooltip title="Cancel event" placement="top" arrow>
              <span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                  disabled={isCanceling}
                  className="cursor-pointer p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-700 hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
                  aria-label="Cancel event"
                >
                  <Ban size={13} strokeWidth={2} />
                </button>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Delete event" placement="top" arrow>
            <span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
                className="cursor-pointer p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
                aria-label="Delete event"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </span>
          </Tooltip>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onScores();
            }}
            disabled={isCanceledEvent}
            className={`flex cursor-pointer items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              !isCanceledEvent && (event.canEnterScores || event.canEditScores)
                ? "bg-slate-900 text-white hover:bg-slate-900/90 shadow-xs"
                : "border border-gray-200 bg-white text-gray-700 hover:border-slate-900/30 hover:bg-slate-900/10 hover:text-slate-900 shadow-xs"
            }`}
            title="Scores"
          >
            <ClipboardList size={12} strokeWidth={2} />
            {isCanceledEvent
              ? "Canceled"
              : event.canEnterScores
                ? "Scores"
                : event.canEditScores
                  ? "Edit Scores"
                  : "View Scores"}
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
      <span className="text-gray-300">{icon}</span>
      {label}
    </div>
  );
}

function StatusChip({
  status,
}: {
  status: { label: string; icon: React.ReactNode; className: string };
}) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${status.className}`}
    >
      {status.icon}
      {status.label}
    </div>
  );
}
