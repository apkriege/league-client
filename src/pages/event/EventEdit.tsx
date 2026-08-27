import Button from "@/components/layout/Button";
import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import InfoForm from "./create/components/InfoForm";
import TeamsForm from "./create/components/TeamsForm";
import Flights from "./create/components/Flights";
import { useUpdateLeagueEvent } from "@api/league/mutations";
import { useLeague, useLeagueEvent } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useNavigate, useParams } from "react-router";
import { Flag, ShieldHalf } from "lucide-react";
import { useToast } from "@/context/useToast";
import { validateEventForm } from "./create/validation";
import { getEventDateInputValue } from "@/utils/eventDate";
import { toTimeInputValue } from "@/utils/format";
import { transformEventFlights, type EventFlight } from "./eventEditModel";

type EventEditTeam = {
  id: number;
  name: string;
  players: number[];
};

type EventEditFormValues = {
  name: string;
  type: string;
  date: string;
  startTime: string;
  interval: number;
  courseId?: number;
  teeId?: number;
  startSide: string;
  holes: number;
  format: string;
  scoringFormat: string;
  ptsPerHole: number;
  ptsPerMatch: number;
  ptsPerTeamWin: number;
  strokePoints: string;
  pointsEnabled: boolean;
  teams: EventEditTeam[];
  flights: EventFlight[];
};

export default function EventEdit() {
  const { leagueId, eventId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: league, isError: leagueIsError, error: leagueError } = useLeague(Number(leagueId));
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventIsError,
    error: eventError,
  } = useLeagueEvent(Number(leagueId), Number(eventId));

  const mutation = useUpdateLeagueEvent(() => {
    show("Event updated successfully", "success");
    navigate(`/league/${leagueId}/events/${eventId}`);
  });

  const eventStatus = String(event?.status || "").toLowerCase();
  const isCompletedEvent =
    Boolean(event?.isComplete) || String(event?.status || "").toLowerCase() === "completed";
  const isCanceledEvent = eventStatus === "canceled";
  const hasScores = Number(event?._count?.rounds || 0) > 0;
  const isLockedEvent = isCompletedEvent || isCanceledEvent || hasScores;

  const eventForm = useForm<EventEditFormValues>({
    defaultValues: {
      name: "",
      type: "regular",
      date: "",
      startTime: "",
      interval: 10,
      courseId: undefined,
      teeId: undefined,
      startSide: "front",
      holes: 9,
      format: "team",
      scoringFormat: "match",
      ptsPerHole: 1,
      ptsPerMatch: 2,
      ptsPerTeamWin: 2,
      strokePoints: "",
      pointsEnabled: true,
      teams: [],
      flights: [],
    },
  });

  // Pre-populate form once both event and league data are loaded.
  // Use league.teams as the authoritative team pool so flight edit/add dropdowns
  // are always populated (season team leagues store teams on the league, not the event).
  useEffect(() => {
    if (!event || !league) return;
    const { flights, teams: eventTeams } = transformEventFlights(event);
    const isSeasonTeamLeague =
      String(league.type || "").toLowerCase() === "season" &&
      String(league.format || "").toLowerCase() === "team";
    const teamSource =
      isSeasonTeamLeague || eventTeams.length === 0 ? (league.teams ?? []) : eventTeams;
    const teams = teamSource.map((t: any) => ({
      id: Number(t.id),
      name: t.name,
      players: (t.players ?? []).map((p: any) =>
        typeof p === "object" ? Number(p.id) : Number(p)
      ),
    }));
    eventForm.reset({
      name: event.name ?? "",
      type: event.type ?? "regular",
      date: getEventDateInputValue(event.startsAt, event.timeZone),
      startTime: toTimeInputValue(event.startsAt, event.timeZone),
      interval: event.interval ?? 10,
      courseId: event.courseId ?? undefined,
      teeId: event.teeId ?? undefined,
      startSide: event.startSide ?? "front",
      holes: event.holes ?? 9,
      format: event.format ?? "team",
      scoringFormat: event.scoringFormat ?? "match",
      ptsPerHole: event.ptsPerHole ?? 1,
      ptsPerMatch: event.ptsPerMatch ?? 2,
      ptsPerTeamWin: event.ptsPerTeamWin ?? 2,
      pointsEnabled: event.pointsEnabled !== false,
      strokePoints: Array.isArray(event.strokePoints)
        ? event.strokePoints.join(",")
        : typeof event.strokePoints === "string"
          ? event.strokePoints
          : "",
      teams,
      flights,
    });
  }, [event, eventForm, league]);

  useEffect(() => {
    if (!event || !isLockedEvent) return;
    const message = isCompletedEvent
      ? "Completed events cannot be edited."
      : isCanceledEvent
        ? "Canceled events cannot be edited."
        : "Events with scores cannot have their setup edited.";
    show(message, "error");
    navigate(`/league/${leagueId}/events/${eventId}`);
  }, [event, eventId, isCanceledEvent, isCompletedEvent, isLockedEvent, leagueId, navigate, show]);

  const format = useWatch({ control: eventForm.control, name: "format" });
  const isSeasonLeague = String(league?.type || "").toLowerCase() === "season";
  const leagueFormat = String(league?.format || "").toLowerCase();
  const isSeasonTeamLeague = isSeasonLeague && leagueFormat === "team";
  const showTeamsSection = format === "team" && !isSeasonTeamLeague;

  const handleSubmit = eventForm.handleSubmit((data) => {
    const validationMessage = validateEventForm(data, { showTeamsSection });
    if (validationMessage) {
      show(validationMessage, "error");
      return;
    }

    mutation.mutate(
      {
        leagueId: Number(leagueId),
        eventId: Number(eventId),
        data,
      },
      {
        onError: (error) =>
          show(getApiErrorMessage(error, "Unable to save event changes."), "error"),
      },
    );
  }, (errors) => {
    const firstError = Object.values(errors)[0] as any;
    show(firstError?.message || "Please fix the required event fields.", "error");
  });

  const pageError = eventError || leagueError;
  const errorStatus = getApiErrorStatus(pageError);

  if (eventLoading) {
    return (
      <LoadingState>
        Loading event…
      </LoadingState>
    );
  }

  if (eventIsError || leagueIsError) {
    return (
      <PageState
        title={
          errorStatus === 404
            ? "Event Not Found"
            : errorStatus === 403
              ? "Access Denied"
              : "Unable to Load Event"
        }
        message={getApiErrorMessage(pageError, "The event editor could not be loaded right now.")}
        variant={errorStatus === 404 ? "notFound" : errorStatus === 403 ? "forbidden" : "error"}
      />
    );
  }

  if (!event || !league) {
    return (
      <PageState
        title="Event Not Found"
        message="The event editor could not be loaded because the event was not found."
        variant="notFound"
        actionTo={leagueId ? `/league/${leagueId}/admin` : "/leagues"}
        actionLabel="Back to League"
      />
    );
  }

  if (isLockedEvent) {
    return null;
  }

  return (
    <FormProvider {...eventForm}>
      <PageHeader
        title={`Edit: ${event.name}`}
        subTitle="Update event details, teams, and flights."
      />

      <div className="flex flex-col gap-6 pb-6 mt-6">
        <InfoForm />

        {showTeamsSection && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-slate-900 rounded-md p-1.5">
                <ShieldHalf size={12} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900/60">
                Teams
              </h2>
            </div>
            <TeamsForm />
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-slate-900 rounded-md p-1.5">
              <Flag size={12} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900/60">
              Flights
            </h2>
          </div>
          <Flights />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="default"
            onClick={() => navigate(`/league/${leagueId}/events/${eventId}`)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
