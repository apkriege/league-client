import { FormProvider, useForm } from "react-hook-form";
import { useLeagueStore } from "@/stores/leagueStore";
import { useCreateLeagueEvents } from "@api/league/mutations";

import InfoForm from "./InfoForm";
import ScoringForm from "./ScoringForm";
import DatesForm from "./DatesForm";
import Schedule from "./Schedule";

const defaultValues = {
  name: "Test Event",
  format: "team",
  courseId: 1,
  teeId: 1,
  startSide: "front",
  holes: 9,

  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-02-01"),
  startTime: "04:00",
  interval: 10,
  frequency: "weekly",
  daysOfWeek: ["tuesday"],
  daysOff: [{ id: 1234123, date: new Date("2026-01-14"), name: "Holiday" }],
  alternate: true,

  scoringFormat: "match",
  ptsPerHole: 1,
  ptsPerMatch: 2,
  ptsPerTeamWin: 2,
  strokePoints: [],
};

interface MultipleEventProps {
  closeDialog: () => void;
}

export default function MultipleEvents({ closeDialog }: MultipleEventProps) {
  const mutation = useCreateLeagueEvents(closeDialog);
  const { league } = useLeagueStore();
  const methods = useForm({
    defaultValues,
  });

  if (!league) {
    return <div>No league selected</div>;
  }

  const handleSubmit = (events: any) => {
    console.log("Submitting events:", events);
    mutation.mutate({ leagueId: league.id!, events });
  };

  return (
    <div>
      <FormProvider {...methods}>
        <div className="mb-6">
          <h3 className="text-lg font-bold">Event Information</h3>
          <InfoForm />
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold">Scoring</h3>
          <ScoringForm />
        </div>
        <div className="">
          <h3 className="text-lg font-bold">Dates and Times</h3>
          <DatesForm />
        </div>
        <div className="">
          <Schedule submit={handleSubmit} />
        </div>
      </FormProvider>
    </div>
  );
}
