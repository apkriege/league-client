import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useSubmitEventScores } from "@api/league/mutations";

import Card from "@/components/layout/Card";
import { useToast } from "@/context/ToastContext";
import { CheckCheck, TriangleAlert } from "lucide-react";

const calculatePops = (hcp: number, holes: any) => {
  const sortedHoles = [...holes].sort((a, b) => a.hcp - b.hcp);
  const popsMap = new Map<number, number>();

  while (hcp > 0) {
    for (const hole of sortedHoles) {
      if (hcp <= 0) break;
      popsMap.set(hole.num, (popsMap.get(hole.num) || 0) + 1);
      hcp--;
    }
  }

  return popsMap;
};

const FirstTD = ({ children }: any) => (
  <td className="sticky left-0 z-10 pr-4 text-left text-sm font-bold backdrop-blur-xl py-0">
    {children}
  </td>
);

const LastTD = ({ children }: any) => (
  <td className="sticky right-0 z-10 pl-4 text-left text-sm font-bold backdrop-blur-xl py-0">
    {children}
  </td>
);

const HoleInput = ({ id, value, pops, onChange }: any) => (
  <div className="relative">
    <input
      id={id}
      type="text"
      className={`input font-bold focus:outline-none focus:ring-0 h-8 w-full min-w-14 rounded-md border py-0 text-center`}
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        onChange({ ...e, target: { ...e.target, value: val === "" ? 0 : parseInt(val) || 0 } });
      }}
    />
    {pops > 0 && (
      <div className="absolute bottom-2 right-2 flex gap-0.5">
        {Array.from({ length: pops }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-base-content rounded-full" />
        ))}
      </div>
    )}
  </div>
);

export default function ScoresX({ event }: any) {
  const { show } = useToast();
  const navigate = useNavigate();
  const scoreMutation = useSubmitEventScores();

  const startingHole = event.startSide === "front" ? 1 : 10;
  const players = event.flights.flatMap((flight: any) => flight.players);

  // create a list of random scores for each hole for testing
  // make the scores between 3 and 8 for testing
  const getDefaultHoleScores = () => {
    const scores: any = {};
    for (let i = 0; i < event.holes; i++) {
      scores[i + startingHole] = Math.floor(Math.random() * 6) + 3;
    }
    return scores;
  };

  const pForm = useForm({
    defaultValues: {
      players: players.reduce((acc: any, player: any) => {
        acc[player.playerId] = { scores: getDefaultHoleScores(), completed: true };
        return acc;
      }, {}),
    },
  });

  const sHole = event.startSide === "front" ? 1 : 10;
  const holes = event.tee.holes
    .slice(sHole - 1, sHole + event.holes - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + sHole }));

  const handleHoleChange = (e: any, holeNum: number, playerId: number) => {
    const val = e.target.value;
    pForm.setValue(`players.${playerId}.scores.${holeNum}`, val === "" ? 0 : parseInt(val) || 0);
  };

  const totalScore = (p: any) => {
    const scores = pForm.getValues(`players.${p.id}.scores`);
    return Object.values(scores).reduce(
      (a: number, b: any) => a + (typeof b === "number" ? b : 0),
      0
    );
  };

  const totalNet = (p: any) => {
    const scores = pForm.getValues(`players.${p.id}.scores`);
    return (
      Object.values(scores).reduce((a: number, b: any) => a + (typeof b === "number" ? b : 0), 0) -
      Math.round(p.handicap)
    );
  };

  const isComplete = (playerId: number) => {
    const scores = pForm.getValues(`players.${playerId}.scores`);
    return Object.values(scores).every((score: any) => Number(score) > 0);
  };

  const cancelScores = () => {
    pForm.reset();
  };

  const saveScores = () => {
    const scores = pForm.getValues("players");

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
    <div className="score-table flex flex-col gap-4">
      {event.flights.map((flight: any, idx: number) => (
        <Card key={idx} className="">
          <h3>Flight {idx + 1} </h3>
          <div className="overflow-x-scroll">
            <table className="table table-sm w-full horizontal-table mb-5 min-w-full whitespace-nowrap">
              <thead>
                {/* Headers */}
                <tr className="relative">
                  <FirstTD>HOLE</FirstTD>
                  {holes.map((_: any, idx: number) => (
                    <th key={idx} className="z-0 text-center text-sm font-bold">
                      {idx + startingHole}
                    </th>
                  ))}
                  {/* <LastTD>TOTAL/NET</LastTD> */}
                </tr>

                {/* Par/HCP Row */}
                <tr className="relative">
                  <FirstTD>PAR | HCP</FirstTD>
                  {holes.map((hole: any, idx: number) => (
                    <td key={idx} className="py-1 text-center text-sm font-bold">
                      {hole.par} | {hole.hcp}
                    </td>
                  ))}
                  <LastTD></LastTD>
                </tr>
                {flight.players.map((player: any) => {
                  const p = player.player;
                  const t = player.player.team;
                  const pops = calculatePops(Math.round(p.handicap), holes);

                  return (
                    <tr className="relative" key={p.id}>
                      <FirstTD>
                        <div className="flex flex-col">
                          <span className="text-xs">{t.name}</span>
                          <div className="flex items-center gap-2 justify-between">
                            <span>
                              {p.firstName} {p.lastName} ({Math.round(p.handicap)})
                            </span>
                            <span>
                              {isComplete(p.id) ? (
                                <CheckCheck className="text-green-500 w-4 h-4" />
                              ) : (
                                <TriangleAlert className="text-yellow-500 w-4 h-4" />
                              )}
                            </span>
                          </div>
                        </div>
                      </FirstTD>
                      {holes.map((hole: any) => (
                        <td key={hole.num} className="px-0.5">
                          <HoleInput
                            id={`player-${p.id}-hole-${hole.num}`}
                            value={pForm.watch(`players.${p.id}.scores.${hole.num}`)}
                            pops={pops.get(hole.num) || 0}
                            onChange={(e: any) => handleHoleChange(e, hole.num, p.id)}
                          />
                        </td>
                      ))}
                      <LastTD>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-md font-bold">
                            {totalScore(p)} / {totalNet(p)}
                          </span>
                          {/* <button
                            className="btn btn-xs btn-primary mt-1"
                            onClick={() => savePlayer(p.id)}
                          >
                            Save
                          </button> */}
                        </div>
                      </LastTD>
                    </tr>
                  );
                })}
              </thead>
            </table>
          </div>
        </Card>
      ))}
      <div className="grid grid-cols-2 gap-4 w-full">
        <button className="btn btn-secondary" onClick={cancelScores}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={saveScores}>
          Save All Scores
        </button>
      </div>
    </div>
  );
}
