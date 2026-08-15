import { useState, useCallback, type DragEvent } from "react";
import { Check, SquarePen, Trash2, X } from "lucide-react";
import { FlightMatchOutput, FlightStrokeOutput, FlightTeamOutput } from "./FlightOutputs";
import { MultiSelect, Select } from "@/components/form";
import { formatTimeWithOffset } from "@/utils/format";

// HAVE TO ADD THE LOGIC THAT IF THIS IS USING
// THE MULTI CREATOR THEN THERE SHOULDN'T BE THE OPTION TO DELETE
// A FLIGHT BECAUSE IT WOULD MESS UP THE CREATION LOGIC

interface FlightsDragRowProps {
  event: any;
  flights: any[];
  players: any[];
  setFlights: (flights: any[]) => void;
  allowDelete?: boolean;
  highlightId?: number | null;
}

type DragLocation = {
  columnIndex: number | null;
  rowId: string | null;
};

type FlightDragState = {
  dragging: DragLocation;
  draggingOver: DragLocation;
};

const EMPTY_DRAG_STATE: FlightDragState = {
  dragging: { columnIndex: null, rowId: null },
  draggingOver: { columnIndex: null, rowId: null },
};

const FLIGHT_CARD_BASE_CLASSES =
  "min-w-[175px] rounded-lg border px-2.5 py-1.5 transition-all duration-150";

const getFlightCardStateClasses = ({
  isDragging,
  isDropTarget,
  isEditing,
  isHighlighted,
}: {
  isDragging: boolean;
  isDropTarget: boolean;
  isEditing: boolean;
  isHighlighted: boolean;
}) => {
  if (isDragging) {
    return "cursor-grabbing border-slate-900 bg-slate-900 text-white shadow-lg ring-2 ring-sky-300/70 scale-[1.02]";
  }

  if (isDropTarget) {
    return "cursor-grab border-dashed border-sky-500 bg-sky-100 text-slate-950 shadow-md ring-2 ring-sky-300";
  }

  if (isEditing) {
    return "cursor-default border-slate-300 bg-slate-50 text-slate-900 shadow-xs ring-1 ring-slate-200";
  }

  if (isHighlighted) {
    return "cursor-grab border-blue-400 bg-blue-50 text-slate-900 shadow-xs ring-1 ring-blue-300 hover:border-blue-500 hover:bg-blue-100 hover:shadow-sm";
  }

  return "cursor-grab border-slate-200 bg-white text-slate-900 shadow-xs hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing";
};

const extractId = (value: any): number | null => {
  if (Number.isFinite(Number(value))) {
    return Number(value);
  }

  if (value && typeof value === "object") {
    const raw = value.id ?? value.teamId ?? value.playerId ?? value.team?.id ?? value.player?.id;
    if (Number.isFinite(Number(raw))) {
      return Number(raw);
    }
  }

  return null;
};

// don't remove selected and use it
// selected is for the the quick highlight of a flight that contains the selected player/team
const flightContainsId = (flight: any, id: number | null | undefined): boolean => {
  if (!id) return false;
  const flat = [flight].flat(Infinity);
  return flat.some((entry: any) => extractId(entry) === id);
};

export const FlightsDragRow = ({
  event,
  flights,
  players,
  setFlights,
  allowDelete = true,
  highlightId = null,
}: FlightsDragRowProps) => {
  const fs = flights;
  const [editingFlightIndex, setEditingFlightIndex] = useState<number | null>(null);
  const [editStrokePlayers, setEditStrokePlayers] = useState<(string | number)[]>([]);
  const [editMatchPlayers, setEditMatchPlayers] = useState<(number | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  const [editTeam1, setEditTeam1] = useState<number | undefined>();
  const [editTeam2, setEditTeam2] = useState<number | undefined>();

  const [dragState, setDragState] = useState<FlightDragState>(EMPTY_DRAG_STATE);

  const removeFlight = (flightIdx: number) => {
    const newFlights = fs.filter((_: any, idx: number) => idx !== flightIdx);
    setFlights(newFlights);
    if (editingFlightIndex === flightIdx) {
      setEditingFlightIndex(null);
    }
  };

  const getAssignedIdsExcludingFlight = (flightIdx: number) => {
    return fs
      .filter((_: any, idx: number) => idx !== flightIdx)
      .flat(Infinity)
      .map((entry: any) => extractId(entry))
      .filter((id: number | null): id is number => id !== null);
  };

  const getPlayerOptionsForFlight = (flightIdx: number) => {
    const assigned = new Set(getAssignedIdsExcludingFlight(flightIdx));
    return players
      .filter((player: any) => !assigned.has(Number(player.id)))
      .map((player: any) => ({
        value: Number(player.id),
        label: `${player.firstName} ${player.lastName}`,
      }));
  };

  const getTeamOptionsForFlight = (flightIdx: number) => {
    const assigned = new Set(getAssignedIdsExcludingFlight(flightIdx));
    return (event.teams || [])
      .filter((team: any) => !assigned.has(Number(team.id)))
      .map((team: any) => ({
        value: Number(team.id),
        label: team.name,
      }));
  };

  const startEditFlight = (flightIdx: number) => {
    const flight = fs[flightIdx];
    setEditingFlightIndex(flightIdx);

    if (event.format === "individual" && event.scoringFormat === "stroke") {
      setEditStrokePlayers(Array.isArray(flight) ? flight : []);
      return;
    }

    if (event.format === "individual" && event.scoringFormat === "match") {
      const playerIds = (Array.isArray(flight) ? flight : [])
        .slice(0, 2)
        .flatMap((pair: any) => (Array.isArray(pair) ? pair.slice(0, 2) : []))
        .map(Number);
      setEditMatchPlayers([playerIds[0], playerIds[1], playerIds[2], playerIds[3]]);
      return;
    }

    if (
      event.format === "team" &&
      (event.scoringFormat === "match" || event.scoringFormat === "stroke")
    ) {
      setEditTeam1(extractId(flight?.[0]) ?? undefined);
      setEditTeam2(extractId(flight?.[1]) ?? undefined);
    }
  };

  const cancelEditFlight = () => {
    setEditingFlightIndex(null);
    setEditStrokePlayers([]);
    setEditMatchPlayers([undefined, undefined, undefined, undefined]);
    setEditTeam1(undefined);
    setEditTeam2(undefined);
  };

  const saveEditFlight = (flightIdx: number) => {
    const newFlights = [...fs];

    if (event.format === "individual" && event.scoringFormat === "stroke") {
      if (editStrokePlayers.length === 0) return;
      newFlights[flightIdx] = editStrokePlayers;
    }

    if (event.format === "individual" && event.scoringFormat === "match") {
      const selectedPlayers = editMatchPlayers.filter(
        (playerId): playerId is number => Number.isInteger(playerId) && Number(playerId) > 0,
      );
      if (
        ![2, 4].includes(selectedPlayers.length) ||
        new Set(selectedPlayers).size !== selectedPlayers.length
      ) {
        return;
      }
      newFlights[flightIdx] = Array.from(
        { length: selectedPlayers.length / 2 },
        (_, matchupIndex) => selectedPlayers.slice(matchupIndex * 2, matchupIndex * 2 + 2),
      );
    }

    if (
      event.format === "team" &&
      (event.scoringFormat === "match" || event.scoringFormat === "stroke")
    ) {
      if (!editTeam1 || !editTeam2 || editTeam1 === editTeam2) return;
      newFlights[flightIdx] = [editTeam1, editTeam2];
    }

    setFlights(newFlights);
    cancelEditFlight();
  };

  const getMatchPlayerOptions = (flightIdx: number, slotIndex: number) => {
    const selectedInOtherSlots = new Set(
      editMatchPlayers
        .filter((_, index) => index !== slotIndex)
        .filter((playerId): playerId is number => Number.isInteger(playerId)),
    );
    return getPlayerOptionsForFlight(flightIdx).filter(
      (option) =>
        !selectedInOtherSlots.has(Number(option.value)) ||
        Number(option.value) === Number(editMatchPlayers[slotIndex]),
    );
  };

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, columnIndex: number, rowId: string) => {
    e.dataTransfer.setData("text/plain", "anything");
    e.dataTransfer.effectAllowed = "move";

    setDragState({
      dragging: { columnIndex, rowId },
      draggingOver: { columnIndex: null, rowId: null },
    });
  }, []);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, targetColumnIndex: number, rowId: string) => {
      e.preventDefault();

      // Only allow drag over if it's the same row as the dragging started
      if (dragState.dragging.rowId !== rowId) {
        return;
      }

      e.dataTransfer.dropEffect = "move";

      if (
        dragState.draggingOver.columnIndex === targetColumnIndex &&
        dragState.draggingOver.rowId === rowId
      ) {
        return;
      }

      setDragState((prev) => ({
        ...prev,
        draggingOver: { columnIndex: targetColumnIndex, rowId },
      }));
    },
    [dragState.draggingOver, dragState.dragging.rowId]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, targetColumnIndex: number, rowId: string) => {
      e.preventDefault();

      // Only allow drop if it's the same row as the dragging started
      if (dragState.dragging.rowId !== rowId) {
        return;
      }

      const { columnIndex: cIdx } = dragState.dragging;
      if (cIdx === null || cIdx === targetColumnIndex) {
        setDragState(EMPTY_DRAG_STATE);
        return;
      }

      const moved = fs[cIdx];
      const newFlights = [...fs];
      newFlights.splice(cIdx, 1);
      newFlights.splice(targetColumnIndex, 0, moved);
      setFlights(newFlights);
      setDragState(EMPTY_DRAG_STATE);
    },
    [dragState.dragging, fs, setFlights]
  );

  const handleDragEnd = useCallback(() => {
    setDragState(EMPTY_DRAG_STATE);
  }, []);

  const getStartTime = (fIdx: number) => {
    return formatTimeWithOffset(event.startTime, fIdx * event.interval);
  };

  if (flights.length === 0) {
    return (
      <div className="w-full p-4 flex flex-col items-center justify-center gap-2 text-sm text-gray-500">
        <div>No flights created yet</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-row flex-wrap gap-2">
        {/* <p className="text-xs min-w-[100px] flex flex-col bg-white rounded-lg p-2 border">
          <span className="font-bold mb-1">{event.name}</span>
          <span className="text-[11px] font-">{course?.name}</span>
          <span className="font-medium capitalize text-[11px]">
            {event.holes} Holes &bull; {event.startSide}
          </span>
        </p> */}
        {fs.map((flight: any, fIdx: number) => {
          const isHighlighted = flightContainsId(flight, highlightId);
          const isEditing = editingFlightIndex === fIdx;
          const isDragging = dragState.dragging.columnIndex === fIdx;
          const isDropTarget =
            !isDragging &&
            dragState.draggingOver.columnIndex === fIdx &&
            dragState.draggingOver.rowId === "flights-row" &&
            dragState.dragging.rowId === "flights-row";
          let visualState = "default";
          if (isHighlighted) visualState = "highlighted";
          if (isEditing) visualState = "editing";
          if (isDropTarget) visualState = "drop-target";
          if (isDragging) visualState = "dragging";

          return (
            <div
              key={fIdx}
              className={`${FLIGHT_CARD_BASE_CLASSES} ${getFlightCardStateClasses({
                isDragging,
                isDropTarget,
                isEditing,
                isHighlighted,
              })}`}
              data-flight-state={visualState}
              aria-grabbed={isDragging}
              draggable={!isEditing}
              onDragStart={(e) => handleDragStart(e, fIdx, "flights-row")}
              onDragOver={(e) => handleDragOver(e, fIdx, "flights-row")}
              onDrop={(e) => handleDrop(e, fIdx, "flights-row")}
              onDragEnd={handleDragEnd}
            >
              <div className="mb-1.5 flex justify-between w-full">
                <div className="text-[11px]">
                  <span className="font-bold mr-1.5">Flight {fIdx + 1}</span>
                  {getStartTime(fIdx)}
                </div>
                <div className="flex items-center gap-1">
                  {editingFlightIndex === fIdx ? (
                    <>
                      <Check
                        className="h-4 w-4 cursor-pointer text-green-400 hover:text-green-600"
                        onClick={() => saveEditFlight(fIdx)}
                      />
                      <X
                        className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={cancelEditFlight}
                      />
                    </>
                  ) : (
                    <SquarePen
                      className="h-4 w-4 cursor-pointer text-blue-400 hover:text-blue-600"
                      onClick={() => startEditFlight(fIdx)}
                    />
                  )}
                  {allowDelete && (
                    <Trash2
                      className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-600"
                      onClick={() => removeFlight(fIdx)}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col text-sm">
                {editingFlightIndex === fIdx &&
                  event.format === "individual" &&
                  event.scoringFormat === "stroke" && (
                    <MultiSelect
                      label="Edit Players"
                      options={getPlayerOptionsForFlight(fIdx)}
                      value={editStrokePlayers}
                      onChange={(vals) => setEditStrokePlayers(vals)}
                      placeholder="Select players"
                    />
                  )}
                {editingFlightIndex === fIdx &&
                  event.format === "individual" &&
                  event.scoringFormat === "match" && (
                    <div className="grid grid-cols-1 gap-2">
                      {editMatchPlayers.map((playerId, slotIndex) => (
                        <Select
                          key={slotIndex}
                          label={`Match ${Math.floor(slotIndex / 2) + 1} Player ${slotIndex % 2 === 0 ? "A" : "B"}`}
                          placeholder={slotIndex >= 2 ? "Optional second matchup" : "Select player"}
                          value={playerId}
                          options={getMatchPlayerOptions(fIdx, slotIndex)}
                          onChange={(event) => {
                            const nextPlayers = [...editMatchPlayers];
                            nextPlayers[slotIndex] = event.target.value
                              ? Number(event.target.value)
                              : undefined;
                            if (slotIndex === 2 && !event.target.value) nextPlayers[3] = undefined;
                            setEditMatchPlayers(nextPlayers);
                          }}
                        />
                      ))}
                    </div>
                  )}
                {editingFlightIndex === fIdx &&
                  event.format === "team" &&
                  (event.scoringFormat === "match" || event.scoringFormat === "stroke") && (
                    <div className="grid grid-cols-1 gap-2">
                      <Select
                        label="Team 1"
                        value={editTeam1}
                        options={getTeamOptionsForFlight(fIdx)}
                        onChange={(e) => setEditTeam1(Number(e.target.value))}
                      />
                      <Select
                        label="Team 2"
                        value={editTeam2}
                        options={getTeamOptionsForFlight(fIdx)}
                        onChange={(e) => setEditTeam2(Number(e.target.value))}
                      />
                    </div>
                  )}
                {editingFlightIndex !== fIdx &&
                  event.format === "individual" &&
                  event.scoringFormat === "stroke" && (
                    <FlightStrokeOutput players={players} playerIds={flight} />
                  )}
                {editingFlightIndex !== fIdx &&
                  event.format === "individual" &&
                  event.scoringFormat === "match" && (
                    <FlightMatchOutput players={players} matchups={flight} />
                  )}
                {editingFlightIndex !== fIdx &&
                  event.format === "team" &&
                  (event.scoringFormat === "match" || event.scoringFormat === "stroke") && (
                    <FlightTeamOutput players={players} teams={event.teams} matchups={flight} />
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
