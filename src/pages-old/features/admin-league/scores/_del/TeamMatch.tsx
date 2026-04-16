import Card from "@/components/layout/Card";
import dayjs from "dayjs";
import { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router";
import { useSubmitEventScores } from "@api/league/mutations";

export default function TeamMatch({ event }: any) {
  const { show } = useToast();
  const navigate = useNavigate();
  const scoreMutation = useSubmitEventScores();
  const [selectedFlightIdx, setSelectedFlightIdx] = useState<number | string | null>(null);

  if (!event?.flights?.length) {
    return <div className="text-center py-8">No flights available</div>;
  }

  const startingHole = event.startSide === "front" ? 1 : 10;
  const players = event.flights.flatMap((flight: any) => flight.players);

  const defaultHoleScores = Object.fromEntries(
    Array.from({ length: event.holes }, (_, i) => [i + 1, 0])
  );

  const testingHoleScores = () => {
    const scores: any = {};
    for (let i = 0; i < event.holes; i++) {
      scores[i + startingHole] = Math.floor(Math.random() * 6) + 3;
    }
    return scores;
  };

  const scoresForm = useForm({
    defaultValues: {
      players: players.reduce((acc: any, player: any) => {
        acc[player.playerId] = { scores: testingHoleScores(), completed: true };
        return acc;
      }, {}),
    },
  });

  const saveScores = () => {
    const scores = scoresForm.getValues();

    const s = Object.entries(scores).map(([playerId, scoreData]: any) => ({
      playerId: parseInt(playerId),
      scores: scoreData.scores,
    }));

    scoreMutation.mutate(
      {
        leagueId: event.leagueId,
        eventId: event.id,
        data: s,
      },
      {
        onSuccess: () => {
          show("Scores submitted successfully!", "success");
          navigate(-1);
        },
        onError: (error: any) => {
          console.error("Error submitting scores:", error);
          show("Failed to submit scores. Please try again.", "error");
        },
      }
    );
  };

  return (
    <div className="">
      <div className="flight-selection mb-4">
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-2">
          <Card
            className={`cursor-pointer rounded-xl border transition-colors p-2! ${
              selectedFlightIdx === null ? "border-2 border-primary" : "border-base-300"
            }`}
            onClick={() => setSelectedFlightIdx(null)}
          >
            <p className="text-xs">Show All</p>
          </Card>
          {event.flights.map((flight: any, idx: number) => (
            <Card
              key={idx}
              onClick={() => setSelectedFlightIdx(idx)}
              className={`cursor-pointer rounded-xl border transition-colors p-2! ${
                selectedFlightIdx === idx ? "border-2 border-primary" : "border-base-300"
              }`}
            >
              <div className="flex justify-between">
                <div className="text-xs font-bold mb-1">
                  {dayjs(flight.startTime, "H:mm").format("h:mm A")}
                </div>
                <p className="flex text-xs">
                  {flight.teams[0].team.name} - {flight.teams[1].team.name}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="flights">
        <FormProvider {...scoresForm}>
          <form>
            <div className="flex flex-col gap-4">
              {/* {event.flights
                .filter(
                  (_: any, idx: number) => selectedFlightIdx === null || idx === selectedFlightIdx
                )
                .map((flight: any) => (
                  <Flight
                    key={flight.id}
                    startSide={event.startSide}
                    numHoles={event.holes}
                    tee={event.tee}
                    flight={flight}
                  />
                ))} */}
            </div>
          </form>
        </FormProvider>
        <div className="grid grid-cols-2 gap-4 w-full mt-4">
          <button className="btn btn-secondary" onClick={() => {}}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={saveScores}>
            Save All Scores
          </button>
        </div>
      </div>
    </div>
  );
}
