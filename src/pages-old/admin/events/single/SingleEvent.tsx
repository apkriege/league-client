import Stepper from "@/components/layout/Stepper";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InfoForm from "./InfoForm";
import TeamsForm from "../shared/TeamsForm";
import Flights from "./Flights";
import { useCreateLeagueEvent } from "@api/league/mutations";
import { useParams } from "react-router";

const defaultValues = {
  name: "Test Event",
  type: "regular",
  date: new Date().toISOString().split("T")[0],
  startTime: "08:30",

  interval: 10,
  courseId: 1,
  teeId: 2,
  startSide: "front",
  holes: 9,

  format: "team",
  scoringFormat: "match", // stroke, match
  ptsPerHole: 1,
  ptsPerMatch: 2,
  ptsPerTeamWin: 2,
  strokePoints: [],

  teams: [
    {
      id: 1111,
      name: "Team 1",
      players: [3, 4],
    },
    {
      id: 2222,
      name: "Team 2",
      players: [5, 6],
    },
    {
      id: 3333,
      name: "Team 3",
      players: [7, 8],
    },
    {
      id: 4444,
      name: "Team 4",
      players: [9, 10],
    },
  ],

  flights: [
    [1111, 2222],
    [3333, 4444],
  ],
};

export default function SingleEvent() {
  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(3);
  const { leagueId } = useParams();

  const mutation = useCreateLeagueEvent();

  const eventForm = useForm({
    defaultValues: defaultValues,
  });

  const goToStep = (nextStep: number) => {
    setStep(Math.max(1, Math.min(3, nextStep)));
  };

  const handleSubmit = () => {
    const data = eventForm.getValues();
    console.log("Submitting event data:", data);

    const parsedLeagueId = Number(leagueId);
    if (!parsedLeagueId) {
      console.error("Missing or invalid leagueId route param.");
      return;
    }

    mutation.mutate(
      { leagueId: parsedLeagueId, data },
      {
        onSuccess: (event) => {
          console.log("Event created:", event);
        },
        onError: (error) => {
          console.error("Failed to create event:", error);
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-full" ref={topRef}>
      <FormProvider {...eventForm}>
        <div className="flex-1 mb-4">
          {step === 1 && <InfoForm />}
          {step === 2 && <TeamsForm />}
          {step === 3 && <Flights />}
          {/* {step === 4 && <ReviewForm />} */}
        </div>
      </FormProvider>
      <Stepper
        className="mt-auto"
        step={step}
        totalSteps={3}
        smoothScroll
        scrollTargetRef={topRef}
        onBack={() => {
          goToStep(Math.max(1, step - 1));
        }}
        onNext={() => {
          if (step === 3) {
            handleSubmit();
            return;
          }

          goToStep(step + 1);
        }}
      />
    </div>
  );
}

// function ReviewForm() {
//   return (
//     <div>
//       <PageHeader
//         title="Single Event"
//         subTitle="Select the type of event you want to create. This will determine the setup process and available features."
//         icon={<Trophy size={14} />}
//         iconText="CREATE EVENT"
//       />
//       <Card>
//         <h3 className="text-lg font-bold">Review & Submit</h3>
//         <p className="text-sm text-gray-500">Review your event details before submitting.</p>
//       </Card>
//     </div>
//   );
// }
