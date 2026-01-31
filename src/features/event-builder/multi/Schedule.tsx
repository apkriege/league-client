import { useLeagueStore } from "@/stores/leagueStore";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FlightsDragRow } from "./FlightsDragRow";
// import { useCreateLeagueEvents } from "@api/league/mutations";

type Team = {
  id: number;
  name: string;
};

type GeneratedEvent = {
  date: Date;
  interval: number;
  startSide: "front" | "back";
  format: string;
  eventType: string;
  scoringFormat: string;
  startTime: string;
  name: string;
  flights: any[];
};

const getAlternateStartSide = (
  currentSide: "front" | "back",
  eventIndex: number
): "front" | "back" => {
  if (eventIndex % 2 === 0) return currentSide;
  return currentSide === "front" ? "back" : "front";
};

const createPlayerFlights = (players: string[], numEvents: number) => {
  const flights = [];
  const ps = [...players];

  for (let i = 0; i < numEvents; i++) {
    let pairings = [];
    let l = 0;
    let r = ps.length - 1;
    while (l < r) {
      const p = [...new Set([ps[l], ps[r], ps[l + 1], ps[r - 1]])];
      pairings.push(p);
      l += 2;
      r -= 2;
    }
    ps.splice(1, 0, ps.pop()!);

    flights.push({
      flights: pairings,
    });
  }

  return flights;
};

const createTeamFlights = (teams: Team[], numEvents: number) => {
  const flights = [];
  const ts = [...teams];

  for (let i = 0; i < numEvents; i++) {
    let pairings = [];
    let l = 0;
    let r = ts.length - 1;
    while (l < r) {
      pairings.push([ts[l], ts[r]]);
      l++;
      r--;
    }
    ts.splice(1, 0, ts.pop()!);

    flights.push({
      flights: pairings,
    });
  }

  return flights;
};

const getDatesArray = (startDate: string, endDate: string, daysOfWeek: string[]) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];

  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    if (daysOfWeek.includes(dt.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase())) {
      dates.push(new Date(dt));
    }
  }

  return dates;
};

interface MultipleEventProps {
  submit: (events: any) => void;
}

export default function Schedule({ submit }: MultipleEventProps) {
  const { watch } = useFormContext();
  const { league } = useLeagueStore();
  const [events, setEvents] = useState<GeneratedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!league) {
    return <div>No league data available</div>;
  }

  const generateEvents = () => {
    setIsLoading(true);
    try {
      const eventData: any = watch();

      const eventDates = getDatesArray(
        eventData.startDate.toString(),
        eventData.endDate.toString(),
        eventData.daysOfWeek
      );

      const eventFlights =
        eventData.type === "individual"
          ? createPlayerFlights(
              league.players.map((p: any) => `${p.firstName} ${p.lastName}`),
              eventDates.length
            )
          : createTeamFlights(
              league.teams.map((t: any) => ({ id: t.id, name: t.name })),
              eventDates.length
            );

      let playableEventCount = 0;
      const generatedEvents = eventDates.map((date): GeneratedEvent => {
        const isOffDay = eventData.daysOff?.some(
          (o: any) => new Date(o.date).toDateString() === date.toDateString()
        );

        if (isOffDay) {
          return {
            date,
            interval: eventData.interval,
            startSide: eventData.startSide,
            scoringFormat: eventData.scoringFormat,
            startTime: eventData.startTime,
            name: "Off Day",
            flights: [],
            eventType: "off",
            format: eventData.format,
          };
        }

        const currentEventIndex = playableEventCount;
        playableEventCount++;

        return {
          date,
          interval: eventData.interval,
          startSide: getAlternateStartSide(eventData.startSide, currentEventIndex),
          scoringFormat: eventData.scoringFormat,
          startTime: eventData.startTime,
          name: `Event ${currentEventIndex + 1}`,
          flights: eventFlights[currentEventIndex]?.flights || [],
          eventType: "regular",
          format: eventData.format,
        };
      });

      setEvents(generatedEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const eventData = watch();

      const eventsToSave = events.map((e) => ({
        courseId: eventData.courseId,
        teeId: eventData.teeId,
        holes: eventData.holes,
        name: e.name,
        date: e.date,
        startTime: e.startTime,
        startSide: e.startSide,
        interval: eventData.interval,
        type: eventData.type,
        scoringFormat: eventData.scoringFormat,
        ptsPerHole: eventData.ptsPerHole,
        ptsPerMatch: eventData.ptsPerMatch,
        ptsPerTeamWin: eventData.ptsPerTeamWin,
        strokePoints: eventData.strokePoints,
        flights: e.flights,
        eventType: e.eventType,
        format: eventData.format,
      }));

      submit(eventsToSave);
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  return (
    <div className="space-y-4">
      <button className="btn btn-secondary btn-sm" onClick={generateEvents} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Schedule"}
      </button>

      {events.length > 0 && (
        <>
          <div className="alert alert-info">
            <p className="text-sm">
              Preview of {events.length} events. Adjust details to see changes.
            </p>
          </div>

          <div className="space-y-2">
            {events.map((event, index) => (
              <FlightsDragRow
                key={`${event.date}-${index}`}
                event={event}
                flights={event.flights}
                setFlights={(newFlights) => {
                  setEvents((prev) => {
                    const updated = [...prev];
                    updated[index].flights = newFlights;
                    return updated;
                  });
                }}
              />
            ))}
          </div>

          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            Save Schedule
          </button>
        </>
      )}
    </div>
  );
}
