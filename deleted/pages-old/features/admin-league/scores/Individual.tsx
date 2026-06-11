import Card from "@/components/layout/Card";
import { FirstTD, HoleInput, LastTD } from "./Components";
import { useFormContext } from "react-hook-form";
import { calculateStrokeplayPops } from "./util";
import { CheckCheck, TriangleAlert } from "lucide-react";

export default function Individual({ event }: any) {
  const methods = useFormContext();

  const startingHole = event.startSide === "front" ? 1 : 10;
  const holes = event.tee.holes
    .slice(startingHole - 1, startingHole + event.holes - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

  const handleHoleChange = (e: any, holeNum: number, playerId: number) => {
    const val = e.target.value;
    methods.setValue(`players.${playerId}.scores.${holeNum}`, val === "" ? 0 : parseInt(val) || 0);
  };

  const isComplete = (playerId: number) => {
    const scores = methods.getValues(`players.${playerId}.scores`);
    return Object.values(scores).every((score: any) => Number(score) > 0);
  };

  const totalScore = (p: any) => {
    const scores = methods.getValues(`players.${p.id}.scores`);
    return Object.values(scores).reduce(
      (a: number, b: any) => a + (typeof b === "number" ? b : 0),
      0
    );
  };

  const totalNet = (p: any) => {
    const scores = methods.getValues(`players.${p.id}.scores`);
    return (
      Object.values(scores).reduce((a: number, b: any) => a + (typeof b === "number" ? b : 0), 0) -
      Math.round(p.handicap)
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
                    <th key={idx} className="z-0 text-center text-xs font-bold">
                      {idx + startingHole}
                    </th>
                  ))}
                </tr>

                {/* Par/HCP Row */}
                <tr className="relative">
                  <FirstTD>PAR | HCP</FirstTD>
                  {holes.map((hole: any, idx: number) => (
                    <td key={idx} className="py-1 text-center text-xs font-bold">
                      {hole.par} | {hole.hcp}
                    </td>
                  ))}
                  <LastTD></LastTD>
                </tr>
                {flight.players.map((player: any) => {
                  const p = player.player;
                  const t = player.player.team;
                  const pops = calculateStrokeplayPops(Math.round(p.handicap), holes);

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
                        <td key={hole.num} className="px-0.5 py-1">
                          <HoleInput
                            id={`player-${p.id}-hole-${hole.num}`}
                            value={methods.watch(`players.${p.id}.scores.${hole.num}`)}
                            pops={pops.get(hole.num) || 0}
                            onChange={(e: any) => handleHoleChange(e, hole.num, p.id)}
                          />
                        </td>
                      ))}
                      <LastTD>
                        <span className="text-md font-bold">
                          {totalScore(p)} / {totalNet(p)}
                        </span>
                      </LastTD>
                    </tr>
                  );
                })}
              </thead>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
