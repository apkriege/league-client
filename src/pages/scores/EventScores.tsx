import { useState } from "react";
import { useParams } from "react-router";
import { useLeagueEvent } from "@api/league/queries";
import { CalendarDays, CheckCircle2, ClipboardList, Edit, Flag, MapPin, Users } from "lucide-react";
import dayjs from "dayjs";

import PageHeader from "@/components/layout/PageHeader";
import { CreateFlightScores } from "./CreateFlightScores";
import { CreateFlightScoresIndividualMatch } from "./CreateFlightScoresIndividualMatch";
import { CreateFlightScoresIndividualStroke } from "./CreateFlightScoresIndividualStroke";
import { CreateFlightScoresTeamStroke } from "./CreateFlightScoresTeamStroke";
import ViewFlightScores from "./ViewFlightScores";

export default function EventScores() {
  const { leagueId, eventId } = useParams();
  const [editingFlightIds, setEditingFlightIds] = useState<number[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);

  const { data: event } = useLeagueEvent(Number(leagueId)!, Number(eventId)!);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading event...
      </div>
    );
  }

  const startEditFlight = (flightId: number) => {
    setEditingFlightIds((prev) => (prev.includes(flightId) ? prev : [...prev, flightId]));
  };

  const stopEditFlight = (flightId: number) => {
    setEditingFlightIds((prev) => prev.filter((id) => id !== flightId));
  };

  // Metrics
  const totalFlights = event.flights.length;
  const completedFlights = event.flights.filter((f: any) => f.status === "completed").length;
  const allPlayers = event.flights.flatMap((f: any) => f.players ?? []);
  const totalPlayers = allPlayers.length;
  const playersWithScores = allPlayers.filter((p: any) => {
    const scores = p?.player?.rounds?.[0]?.scores;
    return Array.isArray(scores) && scores.some((s: any) => Number(s?.gross) > 0);
  }).length;

  // Filter
  const visibleFlights = selectedFlightId
    ? event.flights.filter((f: any) => f.id === selectedFlightId)
    : event.flights;

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

  return (
    <div>
      <PageHeader
        title={event.name || "Event Scores"}
        subTitle={event.course?.name}
        icon={<ClipboardList size={14} />}
        iconText="SCORES"
      />

      {/* Metrics bar */}
      <div className="mt-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Flights Done",
            value: `${completedFlights} / ${totalFlights}`,
            icon: <Flag size={14} className="text-primary" />,
            bg: "bg-primary/5 border-primary/10",
          },
          {
            label: "Scores Entered",
            value: `${playersWithScores} / ${totalPlayers}`,
            icon: <Users size={14} className="text-blue-400" />,
            bg: "bg-blue-50 border-blue-100",
          },
          {
            label: "Date",
            value: dayjs(event.date).format("MMM D, YYYY"),
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

      {/* Flight filter tabs */}
      {totalFlights > 1 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setSelectedFlightId(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedFlightId === null
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Flights
          </button>
          {event.flights.map((flight: any) => {
            const isCompleted = flight.status === "completed";
            const isActive = selectedFlightId === flight.id;
            return (
              <button
                key={flight.id}
                onClick={() => setSelectedFlightId(isActive ? null : flight.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
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
                Flight {flight.startTime}
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

          if (isCompleted && !isEditing) {
            return (
              <div
                key={flight.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" strokeWidth={2.5} />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Flight {flight.startTime}
                    </h3>
                    <span className="text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                  <button
                    onClick={() => startEditFlight(flight.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={12} strokeWidth={2} />
                    Edit Scores
                  </button>
                </div>
                <div className="p-4">
                  <ViewFlightScores flight={flight} event={event} />
                </div>
              </div>
            );
          }

          return (
            <FlightScoresComponent
              key={flight.id}
              flight={flight}
              event={event}
              isEditMode={isCompleted || isEditing}
              onSaveSuccess={() => stopEditFlight(flight.id)}
              onCancel={() => stopEditFlight(flight.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
