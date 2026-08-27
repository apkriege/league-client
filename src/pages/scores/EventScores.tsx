import LoadingState from "@/components/layout/LoadingState";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useLeagueEvent, useLeaguePlayers } from "@api/league/queries";
import PageState from "@/components/layout/PageState";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { formatEventDate } from "@/utils/eventDate";
import { compareTimes, formatTime } from "@/utils/format";
import {
  CalendarDays,
  CheckCircle2,
  Edit,
  Flag,
  MapPin,
  Users,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { CreateFlightScores } from "./CreateFlightScores";
import { CreateFlightScoresIndividualMatch } from "./CreateFlightScoresIndividualMatch";
import { CreateFlightScoresIndividualStroke } from "./CreateFlightScoresIndividualStroke";
import { CreateFlightScoresTeamStroke } from "./CreateFlightScoresTeamStroke";
import ViewFlightScores from "./ViewFlightScores";

export default function EventScores() {
  const { leagueId, eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingFlightIds, setEditingFlightIds] = useState<number[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);

  const {
    data: event,
    isLoading,
    isError,
    error,
    refetch: refetchEvent,
  } = useLeagueEvent(Number(leagueId)!, Number(eventId)!);
  const { data: leaguePlayers = [] } = useLeaguePlayers(Number(leagueId), Boolean(leagueId));

  if (isLoading) {
    return (
      <LoadingState>
        Loading event...
      </LoadingState>
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={status === 404 ? "Event Not Found" : status === 403 ? "Access Denied" : "Unable to Load Scores"}
        message={getApiErrorMessage(error, "The scores page could not be loaded right now.")}
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
        message="The scores page could not be loaded because the event was not found."
        variant="notFound"
        actionTo={leagueId ? `/league/${leagueId}/events` : "/leagues"}
        actionLabel="Back to Events"
      />
    );
  }

  const startEditFlight = (flightId: number) => {
    setEditingFlightIds((prev) => (prev.includes(flightId) ? prev : [...prev, flightId]));
  };

  const stopEditFlight = (flightId: number) => {
    setEditingFlightIds((prev) => prev.filter((id) => id !== flightId));
  };

  const handleFlightSaveSuccess = async (flightId: number) => {
    stopEditFlight(flightId);

    const allFlightsComplete = event.flights.every(
      (flight: any) => Number(flight.id) === Number(flightId) || flight.status === "completed"
    );

    await queryClient.invalidateQueries({ queryKey: ["league", Number(leagueId)] });
    await queryClient.invalidateQueries({ queryKey: ["league", Number(leagueId), "events"] });
    await queryClient.invalidateQueries({
      queryKey: ["league", Number(leagueId), "event", Number(eventId)],
    });

    if (allFlightsComplete) {
      await queryClient.refetchQueries({ queryKey: ["league", Number(leagueId)] });
      navigate(`/league/${leagueId}`);
      return;
    }

    await refetchEvent();
  };

  // Metrics
  const totalFlights = event.flights.length;
  const completedFlights = event.flights.filter((f: any) => f.status === "completed").length;
  const allPlayers = event.flights.flatMap((f: any) => f.players ?? []);
  const eventPlayerIds = allPlayers.map((entry: any) => Number(entry?.playerId)).filter(Boolean);
  const totalPlayers = allPlayers.length;
  const playersWithScores = allPlayers.filter((p: any) => {
    const scores = p?.player?.rounds?.[0]?.scores;
    return Array.isArray(scores) && scores.some((s: any) => Number(s?.gross) > 0);
  }).length;

  // Filter
  const sortedFlights = [...event.flights].sort((left: any, right: any) =>
    compareTimes(left?.startsAt, right?.startsAt),
  );
  const visibleFlights = selectedFlightId
    ? sortedFlights.filter((f: any) => f.id === selectedFlightId)
    : sortedFlights;

  const getFlightScoresComponent = () => {
    if (event.format === "individual" && event.scoringFormat === "stroke") {
      return CreateFlightScoresIndividualStroke;
    }
    if (event.format === "individual" && event.scoringFormat === "match") {
      return CreateFlightScoresIndividualMatch;
    }
    if (event.format === "team" && event.scoringFormat === "stroke") {
      return CreateFlightScoresTeamStroke;
    }
    return CreateFlightScores;
  };

  const FlightScoresComponent = getFlightScoresComponent();
  const canEnterScores = Boolean(event.canEnterScores);
  const canEditScores = Boolean(event.canEditScores);
  const isReadOnly = !canEnterScores && !canEditScores;

  return (
    <div>
      <PageHeader
        title={event.name || "Event Scores"}
        subTitle={event.course?.name}
      />

      {/* Metrics bar */}
      <div className="mt-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Flights Done",
            value: `${completedFlights} / ${totalFlights}`,
            icon: <Flag size={14} className="text-slate-900" />,
            bg: "bg-slate-900/5 border-slate-900/10",
          },
          {
            label: "Scores Entered",
            value: `${playersWithScores} / ${totalPlayers}`,
            icon: <Users size={14} className="text-blue-400" />,
            bg: "bg-blue-50 border-blue-100",
          },
          {
            label: "Date",
            value: formatEventDate(
              event.startsAt,
              { month: "short", day: "numeric", year: "numeric" },
              "en-US",
              event.timeZone,
            ),
            icon: <CalendarDays size={14} className="text-amber-400" />,
            bg: "bg-amber-50 border-amber-100",
          },
          {
            label: "Course",
            value: event.course?.name ?? "—",
            icon: <MapPin size={14} className="text-emerald-400" />,
            bg: "bg-emerald-50 border-emerald-100",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex items-center gap-3"
          >
            <div className={`p-2 rounded-md border ${stat.bg}`}>{stat.icon}</div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-sm font-bold text-gray-800 leading-tight truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {isReadOnly && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This event is view-only and cannot receive score changes.
        </div>
      )}

      {/* Flight filter tabs */}
      {totalFlights > 1 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setSelectedFlightId(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedFlightId === null
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Flights
          </button>
          {sortedFlights.map((flight: any) => {
            const isCompleted = flight.status === "completed";
            const isActive = selectedFlightId === flight.id;
            return (
              <button
                key={flight.id}
                onClick={() => setSelectedFlightId(isActive ? null : flight.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isCompleted && (
                  <CheckCircle2
                    size={11}
                    strokeWidth={2.5}
                    className={isActive ? "text-green-300" : "text-green-500"}
                  />
                )}
                Flight {formatTime(flight.startsAt, event.timeZone)}
              </button>
            );
          })}
        </div>
      )}

      {/* Flight content */}
      <div className="flex flex-col gap-4">
        {visibleFlights.map((flight: any) => {
          const isCompleted = flight.status === "completed";
          const isEditing = editingFlightIds.includes(flight.id);
          if ((isCompleted && !isEditing) || isReadOnly) {
            return (
              <SurfaceCard key={flight.id}>
                <PanelBar variant="header">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={isReadOnly && !isCompleted ? "text-amber-500" : "text-green-500"}
                      strokeWidth={2.5}
                    />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Flight {formatTime(flight.startsAt, event.timeZone)}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isReadOnly && !isCompleted
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}
                    >
                      {isReadOnly && !isCompleted ? "View Only" : "Completed"}
                    </span>
                  </div>
                  {canEditScores && (
                    <button
                      onClick={() => startEditFlight(flight.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <Edit size={12} strokeWidth={2} />
                      Edit Scores
                    </button>
                  )}
                </PanelBar>
                <div className="p-4">
                  <ViewFlightScores flight={flight} event={event} />
                </div>
              </SurfaceCard>
            );
          }

          return (
            canEnterScores || canEditScores ? (
              <div key={flight.id}>
                <FlightScoresComponent
                  flight={flight}
                  event={event}
                  leaguePlayers={leaguePlayers}
                  eventPlayerIds={eventPlayerIds}
                  isEditMode={isCompleted || isEditing}
                  onFlightPlayersUpdated={refetchEvent}
                  onSaveSuccess={() => handleFlightSaveSuccess(flight.id)}
                  onCancel={() => stopEditFlight(flight.id)}
                />
              </div>
            ) : null
          );
        })}
      </div>
    </div>
  );
}
