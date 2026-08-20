import { useUpdateFlightPlayers } from "@api/flight/mutations";
import { useLeagueEvent, useLeaguePlayers } from "@api/league/queries";
import PageState from "@/components/layout/PageState";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { formatEventDate } from "@/utils/eventDate";
import { compareTimes, formatTime } from "@/utils/format";
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Table from "@/components/Table";
import { Link, useParams } from "react-router";
import {
  PlayerSwapControl,
} from "./PlayerSwapControl";
import { buildSwappedPlayerEntry, getSwapCandidates } from "./playerSwapUtils";

export default function PrintFlightScorecards() {
  const { leagueId, eventId } = useParams();
  const numericLeagueId = Number(leagueId);
  const numericEventId = Number(eventId);
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventIsError,
    error: eventError,
    refetch: refetchEvent,
  } = useLeagueEvent(numericLeagueId, numericEventId);
  const {
    data: leaguePlayers = [],
    isError: playersIsError,
    error: playersError,
  } = useLeaguePlayers(numericLeagueId);
  const updateFlightPlayersMutation = useUpdateFlightPlayers();
  const [flightPlayerOverrides, setFlightPlayerOverrides] = useState<{
    eventId: number;
    playersById: Record<number, any[]>;
  }>({ eventId: numericEventId, playersById: {} });
  const flights = useMemo(() => {
    if (!event?.flights) return [];
    const flightPlayersById =
      flightPlayerOverrides.eventId === numericEventId
        ? flightPlayerOverrides.playersById
        : {};
    return [...event.flights]
      .sort((a: any, b: any) => compareTimes(a?.startsAt, b?.startsAt))
      .map((flight: any) => ({
        ...flight,
        players: flightPlayersById[Number(flight.id)] || [...(flight.players || [])],
      }));
  }, [event, flightPlayerOverrides, numericEventId]);

  const saveFlightPlayers = async (flightId: number, players: any[]) => {
    const payload = players.map((player: any) => ({
      playerId: Number(player.playerId),
      teamId: player?.teamId ?? player?.player?.teamId ?? null,
      opponentId: player?.opponentId ?? null,
    }));

    await updateFlightPlayersMutation.mutateAsync({
      flightId: Number(flightId),
      players: payload,
    });

    const refreshed = await refetchEvent();
    const refreshedPlayers = refreshed.data?.flights?.find(
      (flight: any) => Number(flight.id) === Number(flightId)
    )?.players;

    setFlightPlayerOverrides((current) => ({
      eventId: numericEventId,
      playersById: {
        ...(current.eventId === numericEventId ? current.playersById : {}),
        [Number(flightId)]: Array.isArray(refreshedPlayers) ? refreshedPlayers : players,
      },
    }));
  };

  const pageError = eventError || playersError;
  const errorStatus = getApiErrorStatus(pageError);

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-gray-500">
        Loading scorecards...
      </div>
    );
  }

  if (eventIsError || playersIsError) {
    return (
      <PageState
        title={
          errorStatus === 404
            ? "Event Not Found"
            : errorStatus === 403
              ? "Access Denied"
              : "Unable to Load Scorecards"
        }
        message={getApiErrorMessage(pageError, "The printable scorecards could not be loaded right now.")}
        variant={errorStatus === 404 ? "notFound" : errorStatus === 403 ? "forbidden" : "error"}
        actionTo={
          numericLeagueId && numericEventId
            ? `/league/${numericLeagueId}/events/${numericEventId}`
            : "/leagues"
        }
        actionLabel="Back to Event"
      />
    );
  }

  if (!event) {
    return (
      <PageState
        title="Event Not Found"
        message="The printable scorecards could not be loaded because the event was not found."
        variant="notFound"
        actionTo={numericLeagueId ? `/league/${numericLeagueId}` : "/leagues"}
        actionLabel="Back to League"
      />
    );
  }

  const holeCount = Number(event?.holes || 18);
  const eventPlayerIds = event.flights
    .flatMap((flight: any) => flight.players || [])
    .map((entry: any) => Number(entry?.playerId))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:p-0 print:bg-white">
      <style>{`
        @page {
          size: letter portrait;
          margin: 0.35in;
        }

        @media print {
          body {
            background: #fff;
          }

          .no-print {
            display: none !important;
          }

          .print-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.2in;
          }

          .flight-card {
            height: calc((11in - 0.7in - 0.2in) / 2);
            break-inside: avoid;
            page-break-inside: avoid;
            border: 1px solid #111827 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
          }

          .scorecard-table {
            font-size: 7px !important;
          }

          .scorecard-table th,
          .scorecard-table td {
            padding-left: 1px !important;
            padding-right: 1px !important;
          }

          .scorecard-player-cell {
            width: 1.05in !important;
          }

          .scorecard-total-cell {
            width: 0.24in !important;
          }

          .scorecard-footer {
            margin-top: 0 !important;
          }
        }
      `}</style>

      <div className="no-print max-w-6xl mx-auto mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Flight Scorecards</h1>
          <p className="text-xs text-slate-500">
            {event.name} · {formatEventDate(event.startsAt, undefined, "en-US", event.timeZone)} · {event.course?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/league/${leagueId}/events/${eventId}`}
            className="px-3 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
          >
            Back to Event
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-900 bg-slate-900 text-white text-xs font-semibold"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      <div className="print-grid max-w-6xl mx-auto grid grid-cols-1 gap-4">
        {flights.length === 0 ? (
          <div className="flight-card bg-white border border-slate-300 rounded-md p-4">
            <p className="text-sm text-slate-600">No flights available for this event.</p>
          </div>
        ) : (
          flights.map((flight: any, index: number) => (
            <FlightCard
              key={flight.id}
              event={event}
              flight={flight}
              flightNumber={index + 1}
              holeCount={holeCount}
              leaguePlayers={leaguePlayers}
              eventPlayerIds={eventPlayerIds}
              onSaveFlightPlayers={saveFlightPlayers}
              isSaving={updateFlightPlayersMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FlightCard({
  event,
  flight,
  flightNumber,
  holeCount,
  leaguePlayers,
  eventPlayerIds,
  onSaveFlightPlayers,
  isSaving,
}: {
  event: any;
  flight: any;
  flightNumber: number;
  holeCount: number;
  leaguePlayers: any[];
  eventPlayerIds: number[];
  onSaveFlightPlayers: (flightId: number, players: any[]) => Promise<void>;
  isSaving: boolean;
}) {
  const rows = getFlightRows(event, flight);
  const getRowSwapCandidates = (row: any) =>
    getSwapCandidates({
      currentEntry: row.entry,
      leaguePlayers,
      eventPlayerIds,
      activePlayerIds: (flight?.players || []).map((player: any) => Number(player.playerId)),
      teamOnly: event?.format === "team",
    });

  const savePlayerSwap = async (row: any, replacementId: number) => {
    const slotIndex = Number(row.slotIndex);
    const players = [...(flight?.players || [])];
    const targetEntry = players[slotIndex];
    if (!targetEntry) return;

    const currentId = Number(targetEntry.playerId);
    const nextId = Number(replacementId);
    if (!nextId || currentId === nextId) return;

    const candidates = getSwapCandidates({
      currentEntry: targetEntry,
      leaguePlayers,
      eventPlayerIds,
      activePlayerIds: players.map((player: any) => Number(player.playerId)),
      teamOnly: event?.format === "team",
    });
    const replacement = candidates.find((player: any) => Number(player?.id) === nextId);
    if (!replacement) return;

    const nextPlayers = players.map((player: any, index: number) =>
      index === slotIndex ? buildSwappedPlayerEntry(player, replacement) : player
    );

    const playersToSave =
      event?.scoringFormat === "match"
        ? nextPlayers.map((player: any) =>
            Number(player?.opponentId) === currentId
              ? { ...player, opponentId: nextId }
              : player
          )
        : nextPlayers;

    await onSaveFlightPlayers(Number(flight.id), playersToSave);
  };

  return (
    <section className="flight-card bg-white border border-slate-300 rounded-lg shadow-sm p-3.5 flex flex-col gap-3">
        <header className="flex items-start justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{event.name}</h2>
            <p className="text-[11px] text-slate-600">
              Flight {flightNumber}
              {flight?.startsAt ? ` · ${formatTime(flight.startsAt, event.timeZone)}` : ""}
              {event?.tee?.name ? ` · ${event.tee.name}` : ""}
            </p>
            <p className="text-[11px] text-slate-500">{event?.course?.name || ""}</p>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <p>Date: {formatEventDate(event.startsAt, undefined, "en-US", event.timeZone)}</p>
            <p>Format: {String(event.format || "").toUpperCase()}</p>
            <p>Scoring: {String(event.scoringFormat || "").toUpperCase()}</p>
          </div>
        </header>

        <div className="text-[11px] text-slate-700 grid grid-cols-2 gap-x-5 gap-y-1">
          <p>
            <span className="font-semibold">Starter:</span> ______________________
          </p>
          <p>
            <span className="font-semibold">Marker:</span> ______________________
          </p>
        </div>

        <div className="overflow-hidden border border-slate-300">
          <ScorecardGrid
            players={rows}
            startHole={event.startSide === "back" && holeCount === 9 ? 10 : 1}
            holeCount={holeCount}
            renderPlayerActions={(row) => (
              <PlayerSwapControl
                currentPlayerId={Number(row.entry?.playerId)}
                candidates={getRowSwapCandidates(row)}
                isSaving={isSaving}
                onSwap={(replacementId) => savePlayerSwap(row, replacementId)}
              />
            )}
          />
        </div>

        <div className="scorecard-footer grid grid-cols-2 gap-3 text-[11px] text-slate-700">
          <p className="border border-slate-300 p-2">Notes:</p>
          <p className="border border-slate-300 p-2">Signatures:</p>
        </div>
    </section>
  );
}

function ScorecardGrid({
  players,
  startHole,
  holeCount,
  renderPlayerActions,
}: {
  players: Array<{
    id: string;
    name: string;
    detail?: string;
    handicap?: number | null;
    slotIndex: number;
    entry: any;
  }>;
  startHole: number;
  holeCount: number;
  renderPlayerActions?: (player: any) => ReactNode;
}) {
  const holes = Array.from({ length: holeCount }, (_, idx) => startHole + idx);

  return (
    <Table
      data={players}
      search={false}
      variant="clean"
      noBorder
      tableClassName="scorecard-table w-full border-collapse table-fixed text-[9px]"
      renderTable={(visiblePlayers) => (
        <>
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="scorecard-player-cell w-32 border border-slate-300 px-1.5 py-1 text-left">
                Player
              </th>
              {holes.map((hole) => (
                <th key={hole} className="border border-slate-300 py-1 text-center">
                  {hole}
                </th>
              ))}
              <th className="scorecard-total-cell w-8 border border-slate-300 py-1 text-center">
                TOT
              </th>
            </tr>
          </thead>
          <tbody>
            {visiblePlayers.map((player) => (
              <tr key={player.id}>
                <td className="scorecard-player-cell border border-slate-300 px-1.5 py-1 align-top">
                  <p className="font-semibold text-slate-800 leading-tight">
                    {player.name}
                    <span className="ml-1 font-normal text-[9px] text-slate-500">
                      Course HCP {player.handicap != null ? player.handicap.toFixed(1) : "-"}
                    </span>
                  </p>
                  {player.detail ? <p className="text-[9px] text-slate-500">{player.detail}</p> : null}
                  {renderPlayerActions ? (
                    <div className="no-print mt-1">{renderPlayerActions(player)}</div>
                  ) : null}
                </td>
                {holes.map((hole) => (
                  <td key={`${player.id}-${hole}`} className="border border-slate-300 h-7" />
                ))}
                <td className="scorecard-total-cell border border-slate-300" />
              </tr>
            ))}
          </tbody>
        </>
      )}
    />
  );
}

function getFlightRows(
  event: any,
  flight: any
): Array<{
  id: string;
  name: string;
  detail?: string;
  handicap?: number | null;
  slotIndex: number;
  entry: any;
}> {
  const flightPlayers = flight?.players || [];
  const getDisplayHandicap = (entry: any): number | null => {
    const courseHandicap = Number(entry?.courseHandicap);
    return Number.isFinite(courseHandicap) ? courseHandicap : null;
  };

  const getSortHandicap = (entry: any) => getDisplayHandicap(entry) ?? 999;

  if (event?.format === "team") {
    const teamNamesById = new Map<number, string>();
    const orderedTeamIds: number[] = [];
    (flight?.teams || []).forEach((entry: any, idx: number) => {
      const id = Number(entry?.team?.id ?? entry?.teamId ?? 0);
      if (id > 0) {
        orderedTeamIds.push(id);
        teamNamesById.set(id, entry?.team?.name || `Team ${idx + 1}`);
      }
    });

    const allTeamIds = Array.from(
      new Set([
        ...orderedTeamIds,
        ...flightPlayers.map((entry: any) => Number(entry?.teamId ?? entry?.player?.teamId ?? 0)),
      ])
    ).filter((id) => id > 0);

    type FlightSlot = { entry: any; slotIndex: number };

    const sortedEntries = allTeamIds.flatMap((teamId) =>
      flightPlayers
        .map((entry: any, slotIndex: number) => ({ entry, slotIndex }))
        .filter(
          ({ entry }: FlightSlot) =>
            Number(entry?.teamId ?? entry?.player?.teamId ?? 0) === Number(teamId)
        )
        .sort((a: FlightSlot, b: FlightSlot) => getSortHandicap(a.entry) - getSortHandicap(b.entry))
    );

    const leftovers = flightPlayers
      .map((entry: any, slotIndex: number) => ({ entry, slotIndex }))
      .filter(({ entry }: FlightSlot) => Number(entry?.teamId ?? entry?.player?.teamId ?? 0) <= 0)
      .sort((a: FlightSlot, b: FlightSlot) => getSortHandicap(a.entry) - getSortHandicap(b.entry));

    return [...sortedEntries, ...leftovers].map(({ entry, slotIndex }) => {
      const playerId = Number(entry?.playerId);
      const name = `${entry?.player?.firstName || ""} ${entry?.player?.lastName || ""}`.trim();
      const teamName = teamNamesById.get(Number(entry?.teamId ?? entry?.player?.teamId ?? 0));

      return {
        id: `p-${playerId}`,
        name,
        detail: teamName,
        handicap: getDisplayHandicap(entry),
        slotIndex,
        entry,
      };
    });
  }

  if (event?.scoringFormat === "match") {
    const byId = new Map<number, any>(flightPlayers.map((p: any) => [Number(p.playerId), p]));
    const slotByPlayerId = new Map<number, number>(
      flightPlayers.map((entry: any, idx: number) => [Number(entry.playerId), idx])
    );
    const used = new Set<number>();
    const rows: Array<{
      id: string;
      name: string;
      detail?: string;
      handicap?: number | null;
      slotIndex: number;
      entry: any;
    }> = [];

    flightPlayers.forEach((entry: any) => {
      const id = Number(entry.playerId);
      if (used.has(id)) return;

      const name = `${entry?.player?.firstName || ""} ${entry?.player?.lastName || ""}`.trim();
      const oppId = Number(entry?.opponentId ?? entry?.player?.rounds?.[0]?.opponentId ?? 0);
      const opponent = byId.get(oppId);

      rows.push({
        id: `p-${id}`,
        name,
        detail: opponent
          ? `vs ${opponent.player.firstName} ${opponent.player.lastName}`
          : "Match: TBD",
        handicap: getDisplayHandicap(entry),
        slotIndex: Number(slotByPlayerId.get(id) ?? 0),
        entry,
      });
      used.add(id);

      if (opponent && !used.has(Number(opponent.playerId))) {
        const opponentId = Number(opponent.playerId);
        rows.push({
          id: `p-${opponentId}`,
          name: `${opponent.player.firstName} ${opponent.player.lastName}`,
          detail: `vs ${name}`,
          handicap: getDisplayHandicap(opponent),
          slotIndex: Number(slotByPlayerId.get(opponentId) ?? 0),
          entry: opponent,
        });
        used.add(opponentId);
      }
    });

    return rows;
  }

  return flightPlayers.map((entry: any, slotIndex: number) => ({
    id: `p-${entry.playerId}`,
    name: `${entry?.player?.firstName || ""} ${entry?.player?.lastName || ""}`.trim(),
    handicap: getDisplayHandicap(entry),
    slotIndex,
    entry,
  }));
}
