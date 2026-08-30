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
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import EventFlightsPreview from "./components/EventFlightsPreview";
import EventActionsMenu from "./components/EventActionsMenu";
import EventIntelligenceDashboard from "./components/EventIntelligenceDashboard";
import EventRoundsTable from "./components/EventRoundsTable";
import EventScoringSetup from "./components/EventScoringSetup";
import {
  FlightScorecardsDrawer,
  IndividualStrokeScorecardsDrawer,
} from "./components/EventScorecardDrawers";
import {
  SkinsRoundScoresDrawer,
  type SkinsDrawerContent,
} from "./components/EventSkins";
import { getEventStatusConfig, normalizeEventStatus } from "./eventStatus";
import useAnimatedDrawer from "@/hooks/useAnimatedDrawer";
import {
  deriveScoringMode,
  getScoringFamilyForEvent,
  getScoringModeLabel,
  isSharedTeamScoringMode,
} from "@/features/scoring/scoringModes";

function EventSectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3.5 px-1">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-emerald-300 shadow-sm">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p>
      </div>
    </div>
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
  const [roundScoreMode, setRoundScoreMode] = useState<"gross" | "net">("gross");
  const scorecardDrawer = useAnimatedDrawer();
  const skinsDrawer = useAnimatedDrawer<SkinsDrawerContent>();

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
  const hasRounds = (event.metrics?.scores?.length ?? 0) > 0;
  const isSharedTeamMode = isSharedTeamScoringMode(deriveScoringMode(event));
  const hasSharedTeamRounds = isSharedTeamMode && (event.teamRounds?.length ?? 0) > 0;
  const normalizedStatus = normalizeEventStatus(event.status);
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
        onError: (error: unknown) => {
          show(getApiErrorMessage(error, "Failed to delete event."), "error");
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
        onError: (error: unknown) => {
          show(getApiErrorMessage(error, "Failed to cancel event."), "error");
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
            {getScoringModeLabel(event)}
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

      <div className="mt-4">
        <EventScoringSetup event={event} />
      </div>

      {hasRounds && !isSharedTeamMode && (
        <div className="mb-8 mt-6">
          <EventIntelligenceDashboard
            event={event}
            leagueId={Number(leagueId)}
            onOpenSkins={skinsDrawer.open}
          />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-10">
        {hasSharedTeamRounds ? (
          <section className="space-y-5 [content-visibility:auto] [contain-intrinsic-size:auto_480px]">
            <EventSectionHeading
              icon={<ListOrdered size={16} strokeWidth={2.5} />}
              title="Team Scores"
              description="One shared scorecard per team with gross, net, and event points"
            />
            <SurfaceCard>
              <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <Flag size={13} className="text-emerald-600" strokeWidth={2.5} />
                  <h3 className="text-xs font-bold text-slate-900">Event Score Breakdown</h3>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <FlightScorecardsDrawer event={event} emptyMessage="No team scorecards available." />
              </div>
            </SurfaceCard>
          </section>
        ) : hasRounds ? (
          <section className="space-y-5 [content-visibility:auto] [contain-intrinsic-size:auto_560px]">
              <EventSectionHeading
                icon={<ListOrdered size={16} strokeWidth={2.5} />}
                title="Round Scores"
                description="Hole-by-hole scoring and round totals for every player"
              />
              <SurfaceCard>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <Flag size={13} className="text-emerald-600" strokeWidth={2.5} />
                    <h3 className="text-xs font-bold text-slate-900">Event Score Breakdown</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 shadow-inner"
                      role="group"
                      aria-label="Hole score display"
                    >
                      {(["gross", "net"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setRoundScoreMode(mode)}
                          aria-pressed={roundScoreMode === mode}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold capitalize transition ${
                            roundScoreMode === mode
                              ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => scorecardDrawer.open()}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
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
          </section>
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
              ) : getScoringFamilyForEvent(event) === "match" ? (
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
