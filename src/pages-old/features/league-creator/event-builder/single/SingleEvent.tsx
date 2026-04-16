// components
// course and scoring
// date and time picker
// manual flight builder / auto flight builder
import { useEffect, useState } from "react";
import { useCreateLeagueEvent, useUpdateLeagueEvent } from "@api/league/mutations";
import { useLeagueStore } from "@/stores/leagueStore";
import { FormProvider, set, useForm } from "react-hook-form";

import SingleEventForm from "./SingleEventForm";
import FlightBuilder from "../FlightBuilder";
import Divider from "@/components/layout/Divider";
import dayjs from "dayjs";

// const defaultValues = {
//   name: "Test Event",
//   format: "team",
//   type: "regular",
//   date: new Date(),
//   startTime: "08:30",
//   interval: 10,
//   courseId: 1,
//   teeId: 1,
//   startSide: "front",
//   holes: 9,
//   scoringFormat: "match",
//   ptsPerHole: 1,
//   ptsPerMatch: 2,
//   ptsPerTeamWin: 2,
//   strokePoints: [],
// };

const defaultValues = {
  name: "",
  format: "individual",
  type: "regular",
  date: dayjs(new Date()).format("YYYY-MM-DD"),
  startTime: "08:30",
  interval: 10,
  courseId: undefined,
  teeId: undefined,
  startSide: "front",
  holes: 9,
  scoringFormat: "stroke",
  ptsPerHole: 1,
  ptsPerMatch: 2,
  ptsPerTeamWin: 2,
  strokePoints: [],
};

console.log("Default Values:", defaultValues);

interface SingleEventProps {
  event?: any;
  closeDialog: () => void;
}

export default function SingleEvent({ event, closeDialog }: SingleEventProps) {
  const { league } = useLeagueStore();
  const createEvent = useCreateLeagueEvent(closeDialog);
  const updateEvent = useUpdateLeagueEvent(closeDialog);
  const [flights, setFlights] = useState<any[]>([]);

  const methods = useForm({
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (!event) {
      resetForm();
      return;
    }

    if (event) {
      const eventData = {
        ...event,
        date: dayjs(event.date).format("YYYY-MM-DD"),
      };
      methods.reset(eventData);

      const formattedFlights =
        event.flights?.map((flight: any) => {
          if (event.format === "individual") {
            return flight.players.map((p: any) => p.id);
          } else if (event.format === "team") {
            return flight.teams.map((t: any) => t.team.id);
          }
          return [];
        }) || [];

      setFlights(formattedFlights || []);
    }
  }, [event]);

  if (!league) {
    return <div>No league selected</div>;
  }

  const resetForm = () => {
    methods.reset(defaultValues);
    setFlights([]);
  };

  const handleSubmit = () => {
    const fd = methods.getValues();
    const data = { ...fd, flights, date: dayjs(fd.date).toISOString() };
    data.type = "regular";
    createEvent.mutate({ leagueId: league.id!, data: data });
  };

  const handleUpdate = () => {
    const fd = methods.getValues();
    const data = { ...fd, flights, date: dayjs(fd.date).toISOString() };
    updateEvent.mutate({ leagueId: league.id!, eventId: event.id, data: data });
  };

  return (
    <div>
      <FormProvider {...methods}>
        <SingleEventForm />
        <FlightBuilder flights={flights} setFlights={setFlights} event={methods.watch()} />
        <Divider />
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-neutral btn-sm"
            onClick={() => {
              resetForm();
              closeDialog();
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={event?.id ? handleUpdate : handleSubmit}
          >
            Save Event
          </button>
        </div>
      </FormProvider>
    </div>
  );
}
