import { useUpdateFlightPlayers } from "@api/flight/mutations";
import { useLeagueEvent, useLeaguePlayers } from "@api/league/queries";
import { useQueryClient } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

export default function PrintFlightScorecards() {
  const { leagueId, eventId } = useParams();
  const numericLeagueId = Number(leagueId);
  const numericEventId = Number(eventId);
  const queryClient = useQueryClient();
  const { data: event } = useLeagueEvent(numericLeagueId, numericEventId);
  const { data: leaguePlayers = [] } = useLeaguePlayers(numericLeagueId);
  const updateFlightPlayersMutation = useUpdateFlightPlayers();
  const [flightPlayersById, setFlightPlayersById] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (!event?.flights) return;

    const nextById: Record<number, any[]> = {};
    event.flights.forEach((flight: any) => {
      nextById[Number(flight.id)] = [...(flight.players || [])];
    });
    setFlightPlayersById(nextById);
  }, [event]);

  const flights = useMemo(() => {
    if (!event?.flights) return [];
    return [...event.flights]
      .sort((a: any, b: any) => {
        const aTime = String(a?.startTime || "");
        const bTime = String(b?.startTime || "");
        return aTime.localeCompare(bTime);
      })
      .map((flight: any) => ({
        ...flight,
        players: flightPlayersById[Number(flight.id)] || [...(flight.players || [])],
      }));
  }, [event, flightPlayersById]);

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

    setFlightPlayersById((prev) => ({
      ...prev,
      [Number(flightId)]: players,
    }));

    queryClient.invalidateQueries({
      queryKey: ["league", numericLeagueId, "event", numericEventId],
    });
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-gray-500">
        Loading scorecards...
      </div>
    );
  }

  const holeCount = Number(event?.holes || 18);

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
        }
      `}</style>

      <div className="no-print max-w-6xl mx-auto mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Flight Scorecards</h1>
          <p className="text-xs text-slate-500">
            {event.name} · {new Date(event.date).toLocaleDateString()} · {event.course?.name}
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
  onSaveFlightPlayers,
  isSaving,
}: {
  event: any;
  flight: any;
  flightNumber: number;
  holeCount: number;
  leaguePlayers: any[];
  onSaveFlightPlayers: (flightId: number, players: any[]) => Promise<void>;
  isSaving: boolean;
}) {
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [swapCandidateId, setSwapCandidateId] = useState<number | null>(null);
  const [showSwapUi, setShowSwapUi] = useState(false);

  const rows = getFlightRows(event, flight);
  const activePlayerIds = new Set((flight?.players || []).map((p: any) => Number(p.playerId)));

  const getSwapCandidates = (row: any) => {
    const baseEntry = row.entry;
    const currentId = Number(baseEntry.playerId);
    const baseTeamId = Number(baseEntry?.teamId ?? baseEntry?.player?.teamId ?? 0);

    const sameTeam = (leaguePlayers || []).filter(
      (p: any) => Number(p?.teamId ?? 0) === baseTeamId
    );
    const subs = (leaguePlayers || []).filter(
      (p: any) => String(p?.type || "").toLowerCase() === "sub"
    );

    const unique = new Map<number, any>();
    if (baseEntry?.player) {
      unique.set(currentId, { ...baseEntry.player, id: currentId });
    }

    [...sameTeam, ...subs].forEach((candidate: any) => {
      const id = Number(candidate?.id);
      if (id > 0) unique.set(id, candidate);
    });

    return Array.from(unique.values()).filter((candidate: any) => {
      const candidateId = Number(candidate?.id);
      return candidateId === currentId || !activePlayerIds.has(candidateId);
    });
  };

  const startSwap = (row: any) => {
    setEditingRowIndex(Number(row.slotIndex));
    setSwapCandidateId(Number(row.entry?.playerId));
  };

  const cancelSwap = () => {
    setEditingRowIndex(null);
    setSwapCandidateId(null);
  };

  const saveSwap = async () => {
    if (editingRowIndex == null || !swapCandidateId) return;

    const players = [...(flight?.players || [])];
    const targetEntry = players[editingRowIndex];
    if (!targetEntry) {
      cancelSwap();
      return;
    }

    const currentId = Number(targetEntry.playerId);
    const nextId = Number(swapCandidateId);
    if (currentId === nextId) {
      cancelSwap();
      return;
    }

    const replacement = (leaguePlayers || []).find((player: any) => Number(player?.id) === nextId);
    if (!replacement) {
      cancelSwap();
      return;
    }

    players[editingRowIndex] = {
      ...targetEntry,
      playerId: nextId,
      player: {
        ...targetEntry.player,
        ...replacement,
        id: nextId,
        rounds: [],
      },
    };

    try {
      await onSaveFlightPlayers(Number(flight.id), players);
      cancelSwap();
    } catch (error) {
      console.error("Failed to swap player for scorecard:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="no-print">
        <button
          onClick={() => {
            if (showSwapUi) {
              cancelSwap();
            }
            setShowSwapUi((prev) => !prev);
          }}
          className="text-[11px] px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-700"
        >
          {showSwapUi
            ? `Hide swaps for Flight ${flightNumber}`
            : `Show swaps for Flight ${flightNumber}`}
        </button>
      </div>

      {showSwapUi && (
        <div className="no-print border border-slate-200 rounded-md p-2.5 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-slate-700">Swap Players Before Print</p>
            <p className="text-[10px] text-slate-500">Hidden on paper</p>
          </div>

          <div className="space-y-1.5">
            {rows.map((row) => {
              const isEditing = editingRowIndex === Number(row.slotIndex);
              const candidates = getSwapCandidates(row);

              return (
                <div
                  key={`swap-${row.id}-${row.slotIndex}`}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 truncate">{row.name}</p>
                    {row.detail ? <p className="text-[10px] text-slate-500">{row.detail}</p> : null}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        className="text-[11px] border border-slate-300 rounded px-1.5 py-1 bg-white"
                        value={swapCandidateId ?? ""}
                        onChange={(e) => setSwapCandidateId(Number(e.target.value) || null)}
                      >
                        {candidates.map((candidate: any) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.firstName} {candidate.lastName}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={saveSwap}
                        disabled={isSaving}
                        className="text-[11px] px-2 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelSwap}
                        className="text-[11px] px-2 py-1 rounded border border-slate-300 bg-white text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startSwap(row)}
                      className="text-[11px] px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 shrink-0"
                    >
                      Swap
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <section className="flight-card bg-white border border-slate-300 rounded-lg shadow-sm p-3.5 flex flex-col gap-3">
        <header className="flex items-start justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{event.name}</h2>
            <p className="text-[11px] text-slate-600">
              Flight {flightNumber}
              {flight?.startTime ? ` · ${flight.startTime}` : ""}
              {event?.tee?.name ? ` · ${event.tee.name}` : ""}
            </p>
            <p className="text-[11px] text-slate-500">{event?.course?.name || ""}</p>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
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
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-700 mt-auto">
          <p className="border border-slate-300 p-2">Notes:</p>
          <p className="border border-slate-300 p-2">Signatures:</p>
        </div>
      </section>
    </div>
  );
}

function ScorecardGrid({
  players,
  startHole,
  holeCount,
}: {
  players: Array<{ id: string; name: string; detail?: string; handicap?: number | null }>;
  startHole: number;
  holeCount: number;
}) {
  const holes = Array.from({ length: holeCount }, (_, idx) => startHole + idx);

  return (
    <table className="scorecard-table w-full border-collapse table-fixed text-[9px]">
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
        {players.map((player) => (
          <tr key={player.id}>
            <td className="scorecard-player-cell border border-slate-300 px-1.5 py-1 align-top">
              <p className="font-semibold text-slate-800 leading-tight">
                {player.name}
                <span className="ml-1 font-normal text-[9px] text-slate-500">
                  HCP {player.handicap != null ? player.handicap.toFixed(1) : "-"}
                </span>
              </p>
              {player.detail ? <p className="text-[9px] text-slate-500">{player.detail}</p> : null}
            </td>
            {holes.map((hole) => (
              <td key={`${player.id}-${hole}`} className="border border-slate-300 h-7" />
            ))}
            <td className="scorecard-total-cell border border-slate-300" />
          </tr>
        ))}
      </tbody>
    </table>
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
    const preHandicap = Number(entry?.player?.rounds?.[0]?.preHandicap);
    if (Number.isFinite(preHandicap)) return preHandicap;

    const handicap = Number(entry?.player?.handicap);
    return Number.isFinite(handicap) ? handicap : null;
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
