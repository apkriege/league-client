// components
// course and scoring
// date and time picker
// manual flight builder / auto flight builder
import { FormProvider, useForm } from "react-hook-form";
import EventForm from "./SingleEventForm";
import FlightBuilder from "./FlightBuilder";
import Divider from "@/components/layout/Divider";
import { useState } from "react";
import { useCreateLeagueEvent } from "@api/league/mutations";
import { useLeagueStore } from "@/stores/leagueStore";

const defaultValues = {
  name: "Test Event",
  format: "team",
  eventType: "regular",
  date: new Date(),
  startTime: "08:30",
  interval: 10,
  courseId: 1,
  teeId: 1,
  startSide: "front",
  holes: 9,
  scoringFormat: "match",
  ptsPerHole: 1,
  ptsPerMatch: 2,
  ptsPerTeamWin: 2,
  strokePoints: [],
};

interface SingleEventProps {
  closeDialog: () => void;
}

export default function SingleEvent({ closeDialog }: SingleEventProps) {
  const { league } = useLeagueStore();
  const createEvent = useCreateLeagueEvent(closeDialog);
  const methods = useForm({
    defaultValues,
  });

  const [flights, setFlights] = useState<any[]>([
    // [1, 2, 3, 4], [5, 6, 7, 8] // stroke play
    // [[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]] // match play,
    [1, 2],
    [4, 3],
    // [5, 6], // team match play
  ]);

  if (!league) {
    return <div>No league selected</div>;
  }

  const handleSubmit = () => {
    const fd = methods.getValues();
    const data = { ...fd, flights };
    data.eventType = "playable";

    createEvent.mutate({ leagueId: league.id!, data: data });
  };

  return (
    <div>
      <FormProvider {...methods}>
        <EventForm />
        <FlightBuilder flights={flights} setFlights={setFlights} event={methods.watch()} />
        <Divider />
        <div className="flex justify-end gap-2">
          <button className="btn btn-neutral btn-sm" onClick={() => closeDialog()}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
            Save Event
          </button>
        </div>
      </FormProvider>
    </div>
  );
}
