import Players from "./forms/PlayersForm";
import TeamsForm from "./forms/TeamsForm";
import ReviewForm from "./forms/ReviewForm";
import { FormProvider, useForm } from "react-hook-form";
import { useCreateLeague } from "@api/league/mutations";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import InfoForm from "./forms/InfoForm";
import { useToast } from "@/context/ToastContext";
import Stepper from "@/components/layout/Stepper";

const currPlayers = [
  {
    id: 1,
    firstName: "Adam",
    lastName: "Ant",
    email: "adam@ant.com",
    type: "player",
    handicap: 2,
    phone: "1234567890",
  },
  {
    id: 2,
    firstName: "Brent",
    lastName: "Boston",
    email: "brent@boston.com",
    type: "player",
    handicap: 4,
    phone: "1234567890",
  },
  {
    id: 3,
    firstName: "Derrick",
    lastName: "Door",
    email: "derrick@door.com",
    type: "player",
    handicap: 2,
    phone: "1234567890",
  },
  {
    id: 4,
    firstName: "Carl",
    lastName: "Calvin",
    email: "carl@calvin.com",
    type: "player",
    handicap: 8,
    phone: "1234567890",
  },
  {
    id: 5,
    firstName: "Ethan",
    lastName: "Edwards",
    email: "ethan@edwards.com",
    type: "player",
    handicap: 3,
    phone: "1234567890",
  },
  {
    id: 6,
    firstName: "Fred",
    lastName: "Franklin",
    email: "fred@franklin.com",
    type: "player",
    handicap: 10,
    phone: "1234567890",
  },
  {
    id: 7,
    firstName: "Garret",
    lastName: "Garage",
    email: "garret@garage.com",
    type: "player",
    handicap: 2,
    phone: "1234567890",
  },
  {
    id: 8,
    firstName: "Hilary",
    lastName: "Hiles",
    email: "hilary@hiles.com",
    type: "player",
    handicap: 7,
    phone: "1234567890",
  },
  {
    id: 9,
    firstName: "Irene",
    lastName: "Iverson",
    email: "i@gmail.com",
    type: "player",
    handicap: 12,
    phone: "1234567890",
  },
  {
    id: 10,
    firstName: "John",
    lastName: "Johnson",
    email: "jon@gmail.com",
    type: "player",
    handicap: 15,
    phone: "1234567890",
  },
  {
    id: 11,
    firstName: "Kevin",
    lastName: "Klein",
    email: "k@gmail.com",
    type: "player",
    handicap: 20,
    phone: "1234567890",
  },
  {
    id: 12,
    firstName: "Larry",
    lastName: "Long",
    email: "larry@gmail.com",
    type: "player",
    handicap: 25,
    phone: "1234567890",
  },
  {
    id: 13,
    firstName: "Megan",
    lastName: "Miller",
    email: "meg@gmail.com",
    type: "player",
    handicap: 5,
    phone: "1234567890",
  },
  {
    id: 14,
    firstName: "Nina",
    lastName: "Nolan",
    email: "nina@test.com",
    type: "sub",
    handicap: 3,
    phone: "1234567890",
  },
  {
    id: 15,
    firstName: "Oscar",
    lastName: "Owens",
    email: "oscar@gmail.com",
    type: "sub",
    handicap: 18,
    phone: "1234567890",
  },
];

const currTeams = [
  {
    id: 1,
    name: "Team 1",
    players: [1, 2, 13],
  },
  {
    id: 2,
    name: "Team 2",
    players: [3, 4],
  },
  {
    id: 3,
    name: "Team 3",
    players: [5, 6],
  },
  {
    id: 4,
    name: "Team 4",
    players: [7, 8],
  },
  {
    id: 5,
    name: "Team 5",
    players: [9, 10],
  },
  {
    id: 6,
    name: "Team 6",
    players: [11, 12],
  },
];

const defaultLeagueData = {
  adminId: 1,
  name: "Bomb League",
  description: "This is a simple description that will describe the league.",
  numPlayers: 0,
  type: "season",
  format: "team",
  access: "public",
  contactFirstName: "Adam",
  contactLastName: "Krieger",
  contactEmail: "adamkrieger@gmail.com",
  contactPhone: "1234567890",
  startDate: new Date(),
  endDate: new Date(),
  players: currPlayers,
  teams: currTeams,
};

const modelLeagueData = (league: any) => {
  const { players, teams, ...info } = league;

  const isSeason = info.type === "season";
  const isTeamSeason = isSeason && info.format === "team";

  return {
    ...info,
    format: isSeason ? info.format : null,
    players: (players || []).map((p: any) => ({
      ...p,
      id: Number(p.id),
    })),
    teams: isTeamSeason ? teams : [],
  };
};

export default function CreateLeague() {
  const { show } = useToast();
  const topRef = useRef<HTMLDivElement>(null);
  const createLeague = useCreateLeague();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const leagueForm = useForm({
    defaultValues: defaultLeagueData,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");

    if (!checkoutStatus) return;

    if (checkoutStatus === "success") {
      show("Stripe checkout completed successfully.", "success");
    } else if (checkoutStatus === "cancel") {
      show("Stripe checkout was canceled.", "warning");
    }

    params.delete("checkout");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, [show]);

  const handleSubmit = () => {
    const data = leagueForm.getValues();
    const modeledData = modelLeagueData(data);

    createLeague.mutate(modeledData, {
      onSuccess: (league) => {
        console.log("League created:", league);
        navigate(`/league/${league.id}`);
      },
      onError: (error) => {
        console.error("Failed to create league:", error);
      },
    });
  };

  const leagueData = leagueForm.watch();
  const steps =
    leagueData.type === "season" && leagueData.format === "team"
      ? ["info", "players", "teams", "review"]
      : ["info", "players", "review"];

  const goToStep = (nextStep: number) => {
    setStep(Math.max(1, Math.min(steps.length, nextStep)));
  };

  useEffect(() => {
    setStep((prev) => Math.max(1, Math.min(steps.length, prev)));
  }, [steps.length]);

  return (
    <div>
      <div ref={topRef} />
      <div>
        <FormProvider {...leagueForm}>
          <div className="step-body">
            {step === 1 && <InfoForm />}
            {step === 2 && <Players />}
            {steps.length === 4 && step === 3 && <TeamsForm />}
            {((steps.length === 4 && step === 4) || (steps.length === 3 && step === 3)) && (
              <ReviewForm
                handleBack={() => {
                  goToStep(Math.max(1, step - 1));
                }}
                leagueData={leagueData}
              />
            )}
          </div>
        </FormProvider>
      </div>
      {step <= steps.length && (
        <Stepper
          step={step}
          totalSteps={steps.length}
          isSubmitting={createLeague.isPending}
          smoothScroll
          scrollTargetRef={topRef}
          onBack={() => {
            goToStep(Math.max(1, step - 1));
          }}
          onNext={() => {
            if (step === steps.length) {
              handleSubmit();
              return;
            }

            goToStep(step + 1);
          }}
        />
      )}
    </div>
  );
}
