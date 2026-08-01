import Button from "@/components/layout/Button";
import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InfoForm from "./create/components/InfoForm";
import TeamsForm from "./create/components/TeamsForm";
import Flights from "./create/components/Flights";
import { useUpdateLeagueEvent } from "@api/league/mutations";
import { useLeague, useLeagueEvent } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useNavigate, useParams } from "react-router";
import { Flag, Pencil, ShieldHalf } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { validateEventForm } from "./create/validation";
import { getEventDateInputValue } from "@/utils/eventDate";
import { toTimeInputValue } from "@/utils/format";

// Transform Prisma relational flight data into the flat ID-array format the components expect.
function transformFlights(event: any): { flights: any[]; teams: any[] } {
  const apiFlights: any[] = event.flights ?? [];
  if (apiFlights.length === 0) return { flights: [], teams: [] };

  const format: string = event.format ?? "team";
  const scoringFormat: string = event.scoringFormat ?? "match";

  if (format === "team") {
    // Build a deduplicated team map from all flights
    const teamMap = new Map<number, any>();
    for (const flight of apiFlights) {
      for (const ft of flight.teams ?? []) {
        const t = ft.team;
        if (t && !teamMap.has(Number(t.id))) {
          teamMap.set(Number(t.id), {
            id: Number(t.id),
            name: t.name,
            players: (t.players ?? []).map((p: any) => Number(p.id)),
          });
        }
      }
    }
    // Each flight becomes [teamId1, teamId2]
    const flights = apiFlights.map((flight: any) =>
      (flight.teams ?? []).map((ft: any) => Number(ft.teamId ?? ft.team?.id))
    );
    return { flights, teams: Array.from(teamMap.values()) };
  }

  if (format === "individual" && scoringFormat === "stroke") {
    const flights = apiFlights.map((flight: any) =>
      (flight.players ?? []).map((fp: any) => Number(fp.playerId ?? fp.player?.id))
    );
    return { flights, teams: [] };
  }

  if (format === "individual" && scoringFormat === "match") {
    // Players stored in pairs: p1,p2 = matchup1; p3,p4 = matchup2
    const flights = apiFlights.map((flight: any) => {
      const ids = (flight.players ?? []).map((fp: any) => Number(fp.playerId ?? fp.player?.id));
      const pairs: number[][] = [];
      for (let i = 0; i + 1 < ids.length; i += 2) {
        pairs.push([ids[i], ids[i + 1]]);
      }
      return pairs;
    });
    return { flights, teams: [] };
  }

  return { flights: [], teams: [] };
}

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

  const isCompletedEvent =
    Boolean(event?.isComplete) || String(event?.status || "").toLowerCase() === "completed";

  const eventForm = useForm({
    defaultValues: {
      name: "",
      type: "regular",
      date: "",
      startTime: "",
      interval: 10,
      courseId: undefined as number | undefined,
      teeId: undefined as number | undefined,
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
    const { flights, teams: eventTeams } = transformFlights(event);
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
  }, [event, league]);

  useEffect(() => {
    if (!event || !isCompletedEvent) return;
    show("Completed events cannot be edited.", "error");
    navigate(`/league/${leagueId}/events/${eventId}`);
  }, [event, eventId, isCompletedEvent, leagueId, navigate, show]);

  const format = eventForm.watch("format");
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

    mutation.mutate({
      leagueId: Number(leagueId),
      eventId: Number(eventId),
      data,
    });
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

  if (isCompletedEvent) {
    return null;
  }

  return (
    <FormProvider {...eventForm}>
      <PageHeader
        title={`Edit: ${event.name}`}
        subTitle="Update event details, teams, and flights."
        icon={<Pencil size={14} />}
        iconText="EDIT EVENT"
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
