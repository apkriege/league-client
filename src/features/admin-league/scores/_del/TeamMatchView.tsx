import Card from "@/components/layout/Card";
import dayjs from "dayjs";
import { useState } from "react";

export default function TeamMatchView({ event, scores }: any) {
  const [selectedFlightIdx, setSelectedFlightIdx] = useState<number | string | null>(null);

  if (!event?.flights?.length) {
    return <div className="text-center py-8">No flights available</div>;
  }

  return (
    <div className="">
      <div className="flight-selection mb-4">
        <h3 className="text-lg font-bold mb-3">Flights</h3>
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
        <div className="flex flex-col gap-4">
          {event.flights
            .filter(
              (_: any, idx: number) => selectedFlightIdx === null || idx === selectedFlightIdx
            )
            .map((flight: any) => (
              <FlightView
                key={flight.id}
                startSide={event.startSide}
                numHoles={event.holes}
                tee={event.tee}
                flight={flight}
                flightScores={scores?.[flight.id] || {}}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

const calculatePops = (p1: any, p2: any, holes: any) => {
  const p1hcp = Number(p1.handicap);
  const p2hcp = Number(p2.handicap);
  const hcpDiff = Math.abs(p1hcp - p2hcp);
  const sortedHoles = [...holes].sort((a: any, b: any) => a.hcp - b.hcp);

  const p1PopsMap = new Map<number, number>();
  const p2PopsMap = new Map<number, number>();

  let remainingPops = hcpDiff;
  let holeIndex = 0;

  while (remainingPops > 0) {
    const hole = sortedHoles[holeIndex % sortedHoles.length];
    const currentPops = (p1hcp > p2hcp ? p1PopsMap.get(hole.num) : p2PopsMap.get(hole.num)) || 0;

    if (p1hcp > p2hcp) {
      p1PopsMap.set(hole.num, currentPops + 1);
    } else if (p2hcp > p1hcp) {
      p2PopsMap.set(hole.num, currentPops + 1);
    }

    remainingPops--;
    holeIndex++;
  }

  return [p1PopsMap, p2PopsMap];
};

const FlightView = ({ tee, startSide, numHoles, flight, flightScores }: any) => {
  const sHole = startSide === "front" ? 1 : 10;
  const holes = tee.holes
    .slice(sHole - 1, sHole + numHoles - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + sHole }));

  const team1 = flight.teams[0].team;
  const team2 = flight.teams[1].team;

  return (
    <Card>
      <h2></h2>
      <MatchUpView
        holes={holes}
        p1={team1.players[0]}
        p2={team2.players[0]}
        flightScores={flightScores}
      />
      <div className="divider" />
      <MatchUpView
        holes={holes}
        p1={team1.players[1]}
        p2={team2.players[1]}
        flightScores={flightScores}
      />
    </Card>
  );
};

const FirstTD = ({ children }: any) => (
  <td className="sticky left-0 z-10 pr-4 text-left text-sm font-bold backdrop-blur-xl py-0">
    {children}
  </td>
);

const HoleScore = ({ value, pops }: any) => (
  <div className="relative text-center py-2">
    <div className="text-sm font-bold">{value || "-"}</div>
    {pops > 0 && (
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
        {Array.from({ length: pops }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
        ))}
      </div>
    )}
  </div>
);

const MatchUpView = ({ p1, p2, holes, flightScores }: any) => {
  const [p1Pops, p2Pops] = calculatePops(p1, p2, holes);

  const getPlayerScore = (playerId: number, holeNum: number) => {
    return flightScores[playerId]?.[holeNum] || 0;
  };

  const totalScore = (player: any) => {
    return holes.reduce((sum: number, hole: any) => {
      return sum + (getPlayerScore(player.id, hole.num) || 0);
    }, 0);
  };

  const totalNet = (player: any) => {
    const total = totalScore(player);
    return total - player.handicap;
  };

  const calculatePoints = (playerNum: "p1" | "p2", holeIdx: number) => {
    const holeNum = holes[holeIdx].num;
    const p1hcp = Number(p1.handicap);
    const p2hcp = Number(p2.handicap);

    let p1Score = getPlayerScore(p1.id, holeNum);
    let p2Score = getPlayerScore(p2.id, holeNum);

    // Apply pops
    if (p1hcp > p2hcp) {
      p1Score -= p1Pops.get(holeNum) || 0;
    } else if (p2hcp > p1hcp) {
      p2Score -= p2Pops.get(holeNum) || 0;
    }

    if (p1Score < p2Score) {
      return playerNum === "p1" ? 1 : 0;
    } else if (p2Score < p1Score) {
      return playerNum === "p2" ? 1 : 0;
    } else {
      return 0.5;
    }
  };

  const totalPoints = (playerNum: "p1" | "p2") => {
    let points = 0;
    for (let i = 0; i < holes.length; i++) {
      points += calculatePoints(playerNum, i);
    }
    return points;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full horizontal-table mb-5 min-w-full whitespace-nowrap">
        <thead>
          {/* Headers */}
          <tr className="relative">
            <FirstTD>HOLE</FirstTD>
            {holes.map((_: any, idx: number) => (
              <th key={idx} className="z-0 text-center text-sm font-bold text-gray-400">
                {idx + 1}
              </th>
            ))}
            <th className="text-center text-sm">TOTAL</th>
            <th className="text-center text-sm">NET</th>
          </tr>

          {/* Par/HCP Row */}
          <tr className="relative">
            <FirstTD>PAR | HCP</FirstTD>
            {holes.map((hole: any, idx: number) => (
              <td key={idx} className="py-0 text-center text-sm font-bold text-gray-400">
                {hole.par} | {hole.hcp}
              </td>
            ))}
            <td className="w-14 text-center"></td>
            <td className="w-14 text-center"></td>
          </tr>

          {/* Player 1 */}
          <tr className="relative">
            <FirstTD>
              {p1.first} {p1.last} ({p1.handicap})
            </FirstTD>
            {holes.map((hole: any) => (
              <td key={hole.num}>
                <HoleScore value={getPlayerScore(p1.id, hole.num)} pops={p1Pops.get(hole.num)} />
              </td>
            ))}
            <td className="text-center text-lg font-bold">{totalScore(p1)}</td>
            <td className="text-center text-lg font-bold">{totalNet(p1)}</td>
          </tr>

          {/* Player 2 */}
          <tr className="relative">
            <FirstTD>
              {p2.first} {p2.last} ({p2.handicap})
            </FirstTD>
            {holes.map((hole: any) => (
              <td key={hole.num}>
                <HoleScore value={getPlayerScore(p2.id, hole.num)} pops={p2Pops.get(hole.num)} />
              </td>
            ))}
            <td className="text-center text-lg font-bold">{totalScore(p2)}</td>
            <td className="text-center text-lg font-bold">{totalNet(p2)}</td>
          </tr>

          <tr>
            <td className="py-3"></td>
          </tr>

          {/* Points Row for Player 1 */}
          <tr className="relative">
            <FirstTD>{p1.first} Points</FirstTD>
            {holes.map((_: any, idx: number) => (
              <td key={idx} className="text-center text-sm font-bold text-gray-400 py-0">
                {calculatePoints("p1", idx)}
              </td>
            ))}
            <td className="text-center font-bold">{totalPoints("p1")}</td>
          </tr>

          {/* Points Row for Player 2 */}
          <tr className="relative">
            <FirstTD>{p2.first} Points</FirstTD>
            {holes.map((_: any, idx: number) => (
              <td key={idx} className="text-center text-sm font-bold text-gray-400 py-0">
                {calculatePoints("p2", idx)}
              </td>
            ))}
            <td className="text-center font-bold">{totalPoints("p2")}</td>
          </tr>
        </thead>
      </table>
    </div>
  );
};
