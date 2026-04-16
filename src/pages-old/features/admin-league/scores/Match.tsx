import { calculateMatchplayPops } from "./util";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import Card from "@/components/layout/Card";
import { FirstTD, HoleInput, LastTD } from "./Components";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CheckCheck, TriangleAlert } from "lucide-react";
import Modal from "@/components/layout/Modal";
import { useLeaguePlayers } from "@api/league/queries";
import { useParams } from "react-router";
import { Select } from "@/components/form";
import { useUpdateFlightPlayers } from "@api/flight/mutations";
import { useFlight } from "@api/flight/queries";

const Flight = ({ flightId, tee, startSide, numHoles, editFlight }: any) => {
  const { data: flight } = useFlight(flightId);
  const [showEdit, setShowEdit] = useState(false);
  const players = flight?.players || [];
  const startingHole = startSide === "front" ? 1 : 10;
  const holes = tee.holes
    .slice(startingHole - 1, startingHole + numHoles - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

  const defaultHoleScores = () =>
    Object.fromEntries(Array.from({ length: numHoles }, (_, i) => [i + 1, 0]));

  const testingHoleScores = () => {
    const scores: any = {};
    for (let i = 0; i < numHoles; i++) {
      scores[i + startingHole] = Math.floor(Math.random() * 6) + 3;
    }
    return scores;
  };

  const scoresForm = useForm();

  useEffect(() => {
    if (!flight || !players) return;

    scoresForm.reset({
      players: players.reduce((acc: any, player: any) => {
        const playerId = player.player.id;
        if (!playerId) return acc;
        acc[playerId] = { scores: testingHoleScores(), completed: true };
        return acc;
      }, {}),
    });
  }, [players]);

  if (scoresForm.getValues("players") === undefined) {
    return <div>Loading...</div>;
  }

  const teamIds = flight.teams.map((t: any) => t.team.id);
  const team1 = players
    .filter((p: any) => p.teamId === teamIds[0])
    .sort((a: any, b: any) => a.player.handicap - b.player.handicap);
  const team2 = players
    .filter((p: any) => p.teamId === teamIds[1])
    .sort((a: any, b: any) => a.player.handicap - b.player.handicap);

  return (
    <Card>
      <div className="flex justify-end mb-4">
        <button className="btn btn-xs btn-error" onClick={editFlight}>
          Edit Players
        </button>
      </div>
      <FormProvider {...scoresForm}>
        <MatchUp holes={holes} p1={team1[0].player} p2={team2[0].player} />
        <div className="divider" />
        <MatchUp holes={holes} p1={team1[1].player} p2={team2[1].player} />
      </FormProvider>
      <Modal isOpen={showEdit} title="Edit Flight Players" onClose={() => setShowEdit(false)}>
        <FlightEdit onClose={() => setShowEdit(false)} />
      </Modal>
    </Card>
  );
};

const MatchUp = ({ p1, p2, holes }: any) => {
  const methods = useFormContext();
  const [p1Pops, p2Pops] = calculateMatchplayPops(p1, p2, holes);

  const totalScore = (player: any) => {
    const playerScores = methods.getValues(`players.${player.id}.scores`);
    return Object.values(playerScores).reduce((sum: number, s: any) => sum + (s as number), 0);
  };

  const totalNet = (player: any) => {
    const playerScores = methods.getValues(`players.${player.id}.scores`);
    const total = Object.values(playerScores).reduce(
      (sum: number, s: any) => sum + (s as number),
      0
    );
    return total - player.handicap;
  };

  // I have to do the handicap logic in this part
  const calculatePoints = (player: string, holeIdx: number) => {
    const p1hcp = Number(p1.handicap);
    const p2hcp = Number(p2.handicap);

    const holeNum = holes[holeIdx].num;
    const p1Score = methods.getValues(`players.${p1.id}.scores.${holeNum}`);
    const p2Score = methods.getValues(`players.${p2.id}.scores.${holeNum}`);

    // Apply pops
    let adjustedP1Score = p1Score;
    let adjustedP2Score = p2Score;

    if (p1hcp > p2hcp) {
      adjustedP1Score -= p1Pops.get(holeNum) || 0;
    } else if (p2hcp > p1hcp) {
      adjustedP2Score -= p2Pops.get(holeNum) || 0;
    }

    if (adjustedP1Score < adjustedP2Score) {
      return player === "p1" ? 1 : 0;
    } else if (adjustedP2Score < adjustedP1Score) {
      return player === "p2" ? 1 : 0;
    } else {
      return 0.5;
    }
  };

  const totalPoints = (player: any) => {
    let points = 0;
    for (let i = 0; i < holes.length; i++) {
      points += calculatePoints(player === "p1" ? "p1" : "p2", i);
    }
    return points;
  };

  const handleHoleChange = (e: any, holeNum: number, playerId: number) => {
    methods.setValue(`players.${playerId}.scores.${holeNum}`, parseInt(e.target.value));
  };

  const isComplete = (playerId: number) => {
    const scores = methods.getValues(`players.${playerId}.scores`);
    return Object.values(scores).every((score: any) => Number(score) > 0);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full horizontal-table mb-5 min-w-full whitespace-nowrap">
        <thead>
          {/* Headers */}
          <tr className="relative">
            <FirstTD>HOLE</FirstTD>
            {holes.map((_: any, idx: number) => (
              <th key={idx} className="z-0 text-center text-xs font-bold">
                {idx + 1}
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
          </tr>

          {/* Player 1 */}
          <tr className="relative">
            <FirstTD>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 justify-between">
                  <span>
                    {p1.firstName} {p1.lastName} ({Math.round(p1.handicap)})
                  </span>
                  <span>
                    {/* {isComplete(p1.id) ? (
                      <CheckCheck className="text-green-500 w-4 h-4" />
                    ) : (
                      <TriangleAlert className="text-yellow-500 w-4 h-4" />
                    )} */}
                  </span>
                </div>
              </div>
            </FirstTD>
            {holes.map((hole: any) => (
              <td key={hole.num} className="px-0.5 py-1">
                <HoleInput
                  id={`player-${p1.id}-hole-${hole.num}`}
                  value={methods.watch(`players.${p1.id}.scores.${hole.num}`)}
                  pops={p1Pops.get(hole.num)}
                  onChange={(e: any) => handleHoleChange(e, hole.num, p1.id)}
                />
              </td>
            ))}
            <LastTD>
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs font-bold">
                  {totalScore(p1)} / {totalNet(p1)}
                </span>
              </div>
            </LastTD>
          </tr>

          <tr className="relative">
            <FirstTD>
              <div className="flex flex-col text-xs">
                <div className="flex items-center gap-2 justify-between">
                  <span>
                    {p2.firstName} {p2.lastName} ({Math.round(p2.handicap)})
                  </span>
                  <span>
                    {isComplete(p2.id) ? (
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
                  id={`player-${p2.id}-hole-${hole.num}`}
                  value={methods.watch(`players.${p2.id}.scores.${hole.num}`)}
                  pops={p2Pops.get(hole.num)}
                  onChange={(e: any) => handleHoleChange(e, hole.num, p2.id)}
                />
              </td>
            ))}
            <LastTD>
              <span className="text-xs font-bold">
                {totalScore(p2)} / {totalNet(p2)}
              </span>
            </LastTD>
          </tr>

          {/* Points Row for Player 1 */}
          <tr className="relative">
            <FirstTD>{p1.first} Points</FirstTD>
            {holes.map((_: any, idx: number) => (
              <td key={idx} className="text-center text-xs font-bold  py-0">
                {calculatePoints("p1", idx)}
              </td>
            ))}
            <td className="text-center font-bold text-xs">{totalPoints("p1")}</td>
          </tr>

          {/* Points Row for Player 2 */}
          <tr className="relative">
            <FirstTD>{p2.first} Points</FirstTD>
            {holes.map((_: any, idx: number) => (
              <td key={idx} className="text-center text-xs font-bold py-0">
                {calculatePoints("p2", idx)}
              </td>
            ))}
            <td className="text-center font-bold text-xs">{totalPoints("p2")}</td>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default function Match({ event }: any) {
  const [selectedFlightIdx, setSelectedFlightIdx] = useState<number | null>(null);

  return (
    <div className="match">
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center"></div>

        {event.flights
          .filter((_: any, idx: number) => selectedFlightIdx === null || idx === selectedFlightIdx)
          .map((flight: any) => (
            <Flight
              key={flight.id}
              flightId={flight.id}
              startSide={event.startSide}
              numHoles={event.holes}
              tee={event.tee}
            />
          ))}
      </div>
    </div>
  );
}

// const sortPlayersByTeam = (team: any) => {
//   return team.players.sort((a: any, b: any) => a.handicap - b.handicap);
// };

// const FlightEdit = ({ flightId, t1p1, t1p2, t1p3, t1p4, t1, t2, onClose }: any) => {
//   const mutation = useUpdateFlightPlayers();

//   const { leagueId } = useParams();
//   const { data: players } = useLeaguePlayers(Number(leagueId!));

//   const [p1, setP1] = useState();
//   const [p2, setP2] = useState();
//   const [p3, setP3] = useState();
//   const [p4, setP4] = useState();

//   const handeleSave = () => {
//     mutation.mutate({
//       flightId: flightId,
//       players: [
//         { playerId: Number(p1), teamId: flight.teams[0].team.id },
//         { playerId: Number(p2), teamId: flight.teams[0].team.id },
//         { playerId: Number(p3), teamId: flight.teams[1].team.id },
//         { playerId: Number(p4), teamId: flight.teams[1].team.id },
//       ],
//     });

//     onClose();
//   };

//   return (
//     <>
//       <div className="flex items-center gap-4 justify-between">
//         <div className="w-full">
//           {/* <Select
//             label="Team 1 Player 1"
//             options={t1Players}
//             value={p1}
//             onChange={(e) => setP1(e.target.value)}
//           />
//           <Select
//             label="Team 1 Player 2"
//             options={t1Players}
//             value={p2}
//             onChange={(e) => setP2(e.target.value)}
//           />
//         </div>
//         <div className="">vs</div>
//         <div className="w-full">
//           <Select
//             label="Team 2 Player 1"
//             options={t2Players}
//             value={p3}
//             onChange={(e) => setP3(e.target.value)}
//           />
//           <Select
//             label="Team 2 Player 2"
//             options={t2Players}
//             value={p4}
//             onChange={(e) => setP4(e.target.value)}
//           /> */}
//         </div>
//       </div>
//       <button className="btn btn-primary" onClick={handeleSave}>
//         Save
//       </button>
//     </>
//   );
// };
