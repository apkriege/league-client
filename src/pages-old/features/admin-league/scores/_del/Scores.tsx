import { useEffect, useState } from "react";
import Card from "@/components/layout/Card";
import dayjs from "dayjs";

// ============================================
// Components
// ============================================
const HoleInput = ({ id, value, pop, onChange }: any) => (
  <input
    id={id}
    type="text"
    className={`input bg-neutral/50 font-bold focus:outline-none focus:ring-0 h-8 w-full min-w-14 rounded-md border py-0 text-center ${
      pop ? "border-blue-500 border-2" : ""
    }`}
    value={value}
    onChange={onChange}
  />
);

const FirstTD = ({ children }: any) => (
  <td className="sticky left-0 z-10 pr-4 text-left text-sm font-bold backdrop-blur-xl">
    {children}
  </td>
);

// ============================================
// Helper Functions
// ============================================
const getPoints = (playerNet: number, opponentNet: number): number => {
  if (playerNet < opponentNet) return 1;
  if (playerNet > opponentNet) return 0;
  return 0.5;
};

const calculatePops = (p1: any, p2: any, holes: any) => {
  const p1hcp = Number(p1.handicap);
  const p2hcp = Number(p2.handicap);
  const hcpDiff = Math.abs(p1hcp - p2hcp);
  const sortedHoles = [...holes].sort((a: any, b: any) => a.hcp - b.hcp);

  p1.pops = p1hcp > p2hcp ? sortedHoles.slice(0, hcpDiff).map((h: any) => h.num) : [];
  p2.pops = p1hcp < p2hcp ? sortedHoles.slice(0, hcpDiff).map((h: any) => h.num) : [];

  return [p1, p2];
};

// ============================================
// Matchup Component
// ============================================
const Matchup = ({ p1, p2, holes, updatePlayer }: any) => {
  if (!p1 || !p2 || !holes?.length) return null;

  const totalScore = (player: any) => player.scores.reduce((sum: number, s: number) => sum + s, 0);
  const totalNet = (player: any) => totalScore(player) - player.handicap;
  const totalPoints = (player: any) => player.points.reduce((sum: number, p: number) => sum + p, 0);

  const handleHoleChange = (e: any, player: any, opponent: any, index: number) => {
    updatePlayer(player, opponent, index, parseInt(e.target.value));
  };

  return (
    <div className="overflow-x-auto">
      <table className="horizontal-table mb-5 min-w-full whitespace-nowrap">
        <tbody>
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
              <td key={idx} className="py-1 text-center text-sm font-bold text-gray-400">
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
            {holes.map((_: any, idx: number) => (
              <td key={idx}>
                <HoleInput
                  value={p1.scores[idx] || ""}
                  pop={p1.pops.includes(idx + 1)}
                  onChange={(e: any) => handleHoleChange(e, p1.id, p2.id, idx)}
                />
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
            {holes.map((_: any, idx: number) => (
              <td key={idx}>
                <HoleInput
                  value={p2.scores[idx] || ""}
                  pop={p2.pops.includes(idx + 1)}
                  onChange={(e: any) => handleHoleChange(e, p2.id, p1.id, idx)}
                />
              </td>
            ))}
            <td className="text-center text-lg font-bold">{totalScore(p2)}</td>
            <td className="text-center text-lg font-bold">{totalNet(p2)}</td>
          </tr>

          <tr>
            <td className="py-3"></td>
          </tr>

          {/* Points Row 1 */}
          <tr className="relative">
            <FirstTD>{p1.first} Points</FirstTD>
            {holes.map((_: any, idx: number) => (
              <td key={idx} className="py-1 text-center text-sm font-bold text-gray-400">
                {p1.points[idx]}
              </td>
            ))}
            <td className="text-center font-bold">{totalPoints(p1)}</td>
          </tr>

          {/* Points Row 2 */}
          <tr className="relative">
            <FirstTD>{p2.first} Points</FirstTD>
            {holes.map((_: any, idx: number) => (
              <td key={idx} className="py-1 text-center text-sm font-bold text-gray-400">
                {p2.points[idx]}
              </td>
            ))}
            <td className="text-center font-bold">{totalPoints(p2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// Flight Component
// ============================================
const Flight = ({ tee, startSide, numHoles, team1, team2, save, cancel }: any) => {
  const [holes, setHoles] = useState([]);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!team1 || !team2 || !tee) return;
    initFlight();
  }, [team1, team2, tee]);

  const initFlight = () => {
    const startingHole = startSide === "front" ? 1 : 10;
    const h = tee.holes
      .slice(startingHole - 1, startingHole + numHoles - 1)
      .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

    setHoles(h);

    const t1 = [...team1.players].sort((a: any, b: any) => a.handicap - b.handicap);
    const t2 = [...team2.players].sort((a: any, b: any) => a.handicap - b.handicap);

    const matchup1 = calculatePops(t1[0], t2[0], h);
    const matchup2 = calculatePops(t1[1], t2[1], h);

    const m1 = modelMatchup(matchup1, h);
    const m2 = modelMatchup(matchup2, h);
    setPlayers([...m1, ...m2]);
  };

  const modelMatchup = (matchup: any, holes: any) => {
    let m = matchup.map((player: any) => ({
      ...player,
      scores: holes.map(() => 0),
      net: holes.map((h: any) => (player.pops.includes(h.num) ? h.par - 1 : h.par)),
    }));

    m = m.map((player: any, pIdx: number) => ({
      ...player,
      points: holes.map((_: any, hIdx: number) => {
        const pNet = player.net[hIdx];
        const oNet = m[pIdx === 0 ? 1 : 0].net[hIdx];
        return getPoints(pNet, oNet);
      }),
    }));

    return m;
  };

  const updatePlayer = (playerId: number, opponentId: number, holeIdx: number, val: number) => {
    const player = players.find((p: any) => p.id === playerId);
    const opponent = players.find((p: any) => p.id === opponentId);

    if (!player || !opponent) return;

    const playerNet = player.pops.includes(holeIdx + 1) ? val - 1 : val;

    setPlayers((prev) =>
      prev.map((p: any) => {
        if (p.id === playerId) {
          return {
            ...p,
            scores: [...p.scores.slice(0, holeIdx), val, ...p.scores.slice(holeIdx + 1)],
            net: [...p.net.slice(0, holeIdx), playerNet, ...p.net.slice(holeIdx + 1)],
            points: [
              ...p.points.slice(0, holeIdx),
              getPoints(playerNet, opponent.net[holeIdx]),
              ...p.points.slice(holeIdx + 1),
            ],
          };
        }

        if (p.id === opponentId) {
          return {
            ...p,
            points: [
              ...p.points.slice(0, holeIdx),
              getPoints(opponent.net[holeIdx], playerNet),
              ...p.points.slice(holeIdx + 1),
            ],
          };
        }

        return p;
      })
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {players.length >= 2 && (
        <>
          <Matchup holes={holes} p1={players[0]} p2={players[1]} updatePlayer={updatePlayer} />
          <div className="divider my-0" />
        </>
      )}
      {players.length >= 4 && (
        <Matchup holes={holes} p1={players[2]} p2={players[3]} updatePlayer={updatePlayer} />
      )}
      <div className="flex gap-2">
        <button className="btn btn-secondary text-sm" onClick={cancel}>
          Cancel
        </button>
        <button className="btn btn-primary text-sm" onClick={() => save(players)}>
          Submit Scores
        </button>
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================
export default function EventScores({ event }: { event: any }) {
  const [selectedFlightIdx, setSelectedFlightIdx] = useState<number | null>(null);

  if (!event?.flights?.length) {
    return <div className="text-center py-8">No flights available</div>;
  }

  const selectedFlight = selectedFlightIdx !== null ? event.flights[selectedFlightIdx] : null;

  const handleSave = (players: any) => {
    console.log("Scores saved for flight:", players);
  };

  const handleCancel = () => {
    setSelectedFlightIdx(null);
  };

  return (
    <div className="">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">Flights</h3>
        <div className="grid grid-cols-2 gap-2">
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

      {/* Scorecard */}
      {/* <div className="">
        <h2 className="text-xl mb-2">Scorecard</h2>
        <Card className="rounded-xl overflow-x-hidden">
          {selectedFlightIdx === null ? (
            <div className="text-center py-3 text-base-content/70">
              Select a flight to enter scores
            </div>
          ) : (
            <>
              <h3 className="font-bold mb-4">
                {event.name} -{" "}
                <span className="italic text-base-content/70">{event.course.name}</span>
              </h3>
              <div className="overflow-x-auto -mx-6 px-6">
                <Flight
                  tee={event.tee}
                  startSide={event.startSide}
                  numHoles={event.holes}
                  team1={selectedFlight.teams[0].team}
                  team2={selectedFlight.teams[1].team}
                  save={handleSave}
                  cancel={handleCancel}
                />
              </div>
            </>
          )}
        </Card>
      </div> */}
    </div>
  );
}
