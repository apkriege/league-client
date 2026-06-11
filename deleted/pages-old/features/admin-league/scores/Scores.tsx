import { useToast } from "@/context/ToastContext";
import { useSubmitEventScores } from "@api/league/mutations";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import Modal from "@/components/layout/Modal";
import AllPlayers from "./All";
import Individual from "./Individual";
import Match from "./Match";

interface ScoresProps {
  event: any;
  layout: string;
}

export default function Scores({ event, layout }: ScoresProps) {
  // const { show } = useToast();
  // const navigate = useNavigate();
  // const scoreMutation = useSubmitEventScores();
  // const startingHole = event.startSide === "front" ? 1 : 10;
  // const players = event.flights.flatMap((flight: any) => flight.players);

  // const defaultHoleScores = () =>
  //   Object.fromEntries(Array.from({ length: event.holes }, (_, i) => [i + 1, 0]));

  // const testingHoleScores = () => {
  //   const scores: any = {};
  //   for (let i = 0; i < event.holes; i++) {
  //     scores[i + startingHole] = Math.floor(Math.random() * 6) + 3;
  //   }
  //   return scores;
  // };

  // const scoresForm = useForm({
  //   defaultValues: {
  //     players: players.reduce((acc: any, player: any) => {
  //       acc[player.playerId] = { scores: testingHoleScores(), completed: true };
  //       return acc;
  //     }, {}),
  //   },
  // });

  const saveScores = () => {
    //   const scores = scoresForm.getValues();
    //   const s = Object.entries(scores.players).map(([playerId, scoreData]: any) => ({
    //     playerId: parseInt(playerId),
    //     scores: scoreData.scores,
    //   }));
    //   console.log("Submitting scores:", s);
    //   // scoreMutation.mutate(
    //   //   {
    //   //     leagueId: event.leagueId,
    //   //     eventId: event.id,
    //   //     data: s,
    //   //   },
    //   //   {
    //   //     onSuccess: () => {
    //   //       show("Scores submitted successfully!", "success");
    //   //       navigate(`/admin/league/${event.leagueId}`);
    //   //     },
    //   //     onError: (error: any) => {
    //   //       console.error("Error submitting scores:", error);
    //   //       show("Failed to submit scores. Please try again.", "error");
    //   //     },
    //   //   }
    //   // );
  };

  return (
    <div>
      {layout === "stroke" && <Individual event={event} />}
      {layout === "match" && <Match event={event} />}
      <div className="grid grid-cols-2 gap-4 w-full mt-4">
        <button className="btn btn-primary" onClick={saveScores}>
          Save All Scores
        </button>
      </div>
    </div>
  );
}
