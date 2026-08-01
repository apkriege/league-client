import ViewFlightScores from "@/pages/scores/ViewFlightScores";
import SurfaceCard from "@/components/layout/SurfaceCard";
import { compareTimes, formatTime } from "@/utils/format";
import PlayerNameLink from "./PlayerNameLink";

export function FlightScorecardsDrawer({
  event,
  emptyMessage = "No scorecards available yet.",
}: {
  event: any;
  emptyMessage?: string;
}) {
  const flights = [...(event.flights || [])].sort((a: any, b: any) =>
    compareTimes(a?.startsAt, b?.startsAt),
  );

  if (flights.length === 0) {
    return <p className="text-sm text-gray-400">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {flights.map((flight: any) => (
        <SurfaceCard key={flight.id}>
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700">
            Flight {formatTime(flight.startsAt, event.timeZone)}
          </div>
          <div className="p-4">
            <ViewFlightScores event={event} flight={flight} />
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}

export function IndividualStrokeScorecardsDrawer({ rounds }: { rounds: any[] }) {
  if (!rounds?.length) {
    return <p className="text-sm text-gray-400">No scorecards available yet.</p>;
  }

  const sorted = [...rounds].sort((a, b) =>
    a.player.lastName.localeCompare(b.player.lastName),
  );
  const holes = Array.from(
    new Set(
      rounds.flatMap((round) =>
        (round.scores ?? []).map((score: any) => Number(score.hole)),
      ),
    ),
  ).sort((a, b) => a - b);

  return (
    <SurfaceCard className="overflow-x-auto">
      <table className="score-table">
        <thead>
          <tr className="text-xs text-gray-700">
            <th className="p-2">Player</th>
            {holes.map((hole) => <th key={hole} className="p-2 text-center">{hole}</th>)}
            <th className="p-2 text-center">Total</th>
            <th className="p-2 text-center">Net</th>
            <th className="p-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((round: any) => (
            <tr key={round.id} className="bg-slate-50/50 text-sm">
              <td className="p-2 text-xs">
                <PlayerNameLink playerId={round.playerId}>
                  {round.player.firstName} {round.player.lastName}
                </PlayerNameLink>
                <div className="mt-0.5 text-[10px] leading-tight text-gray-500">
                  Handicap: {Math.round(Number(round.preHandicap ?? 0))}
                </div>
              </td>
              {holes.map((hole) => {
                const score = round.scores?.find((entry: any) => Number(entry.hole) === hole);
                return (
                  <td key={hole} className="p-2">
                    <div className="relative flex h-8 min-w-10 items-center justify-center rounded border bg-white text-xs font-semibold">
                      {score?.gross ?? "-"}
                    </div>
                  </td>
                );
              })}
              <td className="text-center text-xs font-bold">{round.gross ?? 0}</td>
              <td className="text-center text-xs font-bold">{round.net ?? 0}</td>
              <td className="text-center text-xs font-bold">{getRoundPoints(round)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SurfaceCard>
  );
}

const getRoundPoints = (round: any) =>
  Number(round?.pointsEarned ?? round?.points ?? 0) + Number(round?.matchPoints ?? 0);
