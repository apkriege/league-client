import Stepper from "@/components/layout/Stepper";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InfoForm from "./InfoForm";
import TeamsForm from "../shared/TeamsForm";
import Flights from "./Flights";
import { useCreateLeagueEvent } from "@api/league/mutations";
import { useLeague } from "@api/league/queries";
import { useNavigate, useParams } from "react-router";
import ReviewForm from "./Review";

const teamSteps = ["info", "teams", "flights", "review"] as const;
const individualSteps = ["info", "flights", "review"] as const;
export type StepKey = (typeof teamSteps)[number];

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
  teams: [],
  flights: [],
};

export default function SingleEvent() {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { leagueId } = useParams();
  const { data: league } = useLeague(Number(leagueId));

  const mutation = useCreateLeagueEvent();

  const eventForm = useForm({
    defaultValues: defaultValues,
  });

  const format = eventForm.watch("format");
  const isSeasonLeague = String(league?.type || "").toLowerCase() === "season";
  const leagueFormat = String(league?.format || "").toLowerCase();
  const isSeasonTeamLeague = isSeasonLeague && leagueFormat === "team";

  const activeSteps = (
    format === "team" && !isSeasonTeamLeague ? teamSteps : individualSteps
  ) as readonly StepKey[];

  useEffect(() => {
    if (!league) return;

    const isSeason = String(league.type || "").toLowerCase() === "season";
    const lf = String(league.format || "").toLowerCase();

    if (isSeason && (lf === "team" || lf === "individual")) {
      eventForm.setValue("format", lf, { shouldDirty: true });

      if (lf === "team") {
        const mappedTeams = (league.teams || []).map((team: any) => ({
          id: Number(team.id),
          name: team.name,
          players: (team.players || []).map((p: any) => Number(p.id)),
        }));

        eventForm.setValue("teams", mappedTeams, { shouldDirty: true });
      }
    }
  }, [league, eventForm]);

  useEffect(() => {
    setCurrentStepIndex((prev) => Math.max(0, Math.min(activeSteps.length - 1, prev)));
  }, [activeSteps.length]);

  const goToStep = (nextIndex: number) => {
    setCurrentStepIndex(Math.max(0, Math.min(activeSteps.length - 1, nextIndex)));
  };

  const currentStep = activeSteps[currentStepIndex];

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
          navigate(`/league/${leagueId}`);
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
          {currentStep === "info" && <InfoForm />}
          {currentStep === "teams" && <TeamsForm />}
          {currentStep === "flights" && <Flights />}
          {currentStep === "review" && <ReviewForm step={currentStep} />}
        </div>
      </FormProvider>
      <Stepper
        className="mt-auto"
        step={currentStepIndex + 1}
        totalSteps={activeSteps.length}
        smoothScroll
        scrollTargetRef={topRef}
        onBack={() => {
          goToStep(currentStepIndex - 1);
        }}
        onNext={() => {
          if (currentStep === "review") {
            handleSubmit();
            return;
          }

          goToStep(currentStepIndex + 1);
        }}
      />
    </div>
  );
}
