import ViewFlightScores from "@/pages/scores/ViewFlightScores";
import Table from "@/components/Table";
import SurfaceCard from "@/components/layout/SurfaceCard";
import { compareTimes, formatTime } from "@/utils/format";
import PlayerNameLink from "./PlayerNameLink";
import { memo, useEffect, useMemo, useRef, useState } from "react";

export const FlightScorecardsDrawer = memo(function FlightScorecardsDrawer({
  event,
  emptyMessage = "No scorecards available yet.",
}: {
  event: any;
  emptyMessage?: string;
}) {
  const flights = useMemo(
    () =>
      [...(event.flights || [])].sort((a: any, b: any) =>
        compareTimes(a?.startsAt, b?.startsAt),
      ),
    [event.flights],
  );

  if (flights.length === 0) {
    return <p className="text-sm text-gray-400">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {flights.map((flight: any, index: number) => (
        <DeferredFlightScorecard
          key={flight.id}
          event={event}
          flight={flight}
          eager={index < 2}
        />
      ))}
    </div>
  );
});

function DeferredFlightScorecard({
  event,
  flight,
  eager,
}: {
  event: any;
  flight: any;
  eager: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(
    () => eager || typeof IntersectionObserver === "undefined",
  );
  const estimatedHeight = Math.max(220, Number(flight.players?.length ?? 0) * 52 + 150);

  useEffect(() => {
    if (shouldRender || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={containerRef}
      className="event-scorecard-flight"
      style={{ containIntrinsicSize: `auto ${estimatedHeight}px` }}
    >
      <SurfaceCard>
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700">
          Flight {formatTime(flight.startsAt, event.timeZone)}
        </div>
        {shouldRender ? (
          <div className="p-4">
            <ViewFlightScores event={event} flight={flight} />
          </div>
        ) : (
          <div style={{ height: estimatedHeight - 38 }} aria-hidden="true" />
        )}
      </SurfaceCard>
    </div>
  );
}

export const IndividualStrokeScorecardsDrawer = memo(function IndividualStrokeScorecardsDrawer({ rounds }: { rounds: any[] }) {
  const holes = useMemo(
    () =>
      Array.from(
        new Set(
          rounds.flatMap((round) =>
            (round.scores ?? []).map((score: any) => Number(score.hole)),
          ),
        ),
      ).sort((left, right) => left - right),
    [rounds],
  );
  const preparedRounds = useMemo(
    () =>
      rounds
        .map((round) => ({
          round,
          scoresByHole: new Map<number, any>(
            (round.scores ?? []).map((score: any) => [Number(score.hole), score]),
          ),
        }))
        .sort((left, right) =>
          left.round.player.lastName.localeCompare(right.round.player.lastName),
        ),
    [rounds],
  );

  if (!rounds?.length) {
    return <p className="text-sm text-gray-400">No scorecards available yet.</p>;
  }

  return (
    <SurfaceCard className="overflow-x-auto">
      <Table
        data={preparedRounds}
        search={false}
        variant="clean"
        noBorder
        tableClassName="score-table"
        renderTable={(visibleRounds) => (
          <>
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
              {visibleRounds.map(({ round, scoresByHole }) => (
                <tr key={round.id ?? round.playerId} className="bg-slate-50/50 text-sm">
                  <td className="p-2 text-xs">
                    <PlayerNameLink playerId={round.playerId}>
                      {round.player.firstName} {round.player.lastName}
                    </PlayerNameLink>
                    <div className="mt-0.5 text-[10px] leading-tight text-gray-500">
                      Handicap: {Math.round(Number(round.preHandicap ?? 0))}
                    </div>
                  </td>
                  {holes.map((hole) => {
                    const score = scoresByHole.get(hole);
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
          </>
        )}
      />
    </SurfaceCard>
  );
});

const getRoundPoints = (round: any) =>
  Number(round?.pointsEarned ?? round?.points ?? 0) + Number(round?.matchPoints ?? 0);
