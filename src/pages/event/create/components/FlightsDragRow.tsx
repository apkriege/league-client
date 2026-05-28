import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Check, SquarePen, Trash2, X } from "lucide-react";
import { FlightMatchOutput, FlightStrokeOutput, FlightTeamOutput } from "./FlightOutputs";
import { MultiSelect, Select } from "@/components/form";
dayjs.extend(customParseFormat);

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
  const [fs, setFs] = useState<any>(flights);
  const [editingFlightIndex, setEditingFlightIndex] = useState<number | null>(null);
  const [editStrokePlayers, setEditStrokePlayers] = useState<(string | number)[]>([]);
  const [editPlayer1, setEditPlayer1] = useState<number | undefined>();
  const [editPlayer2, setEditPlayer2] = useState<number | undefined>();
  const [editTeam1, setEditTeam1] = useState<number | undefined>();
  const [editTeam2, setEditTeam2] = useState<number | undefined>();

  useEffect(() => {
    setFs(flights);
  }, [flights]);

  const [dragState, setDragState] = useState<any>({
    dragging: { columnIndex: null, rowId: null },
    activeCell: { columnIndex: null },
    draggingOver: { columnIndex: null, isDraggingOver: false },
  });

  const removeFlight = (flightIdx: number) => {
    const newFlights = fs.filter((_: any, idx: number) => idx !== flightIdx);
    setFs(newFlights);
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
      setEditPlayer1(Number(flight?.[0]?.[0]));
      setEditPlayer2(Number(flight?.[0]?.[1]));
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
    setEditPlayer1(undefined);
    setEditPlayer2(undefined);
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
      if (!editPlayer1 || !editPlayer2 || editPlayer1 === editPlayer2) return;
      newFlights[flightIdx] = [[editPlayer1, editPlayer2]];
    }

    if (
      event.format === "team" &&
      (event.scoringFormat === "match" || event.scoringFormat === "stroke")
    ) {
      if (!editTeam1 || !editTeam2 || editTeam1 === editTeam2) return;
      newFlights[flightIdx] = [editTeam1, editTeam2];
    }

    setFs(newFlights);
    setFlights(newFlights);
    cancelEditFlight();
  };

  const handleDragStart = useCallback((e: any, columnIndex: number, rowId: string) => {
    e.dataTransfer.setData("text/plain", "anything");

    setDragState((prev: any) => ({
      ...prev,
      dragging: { columnIndex, rowId },
      activeCell: { columnIndex },
    }));
  }, []);

  const handleDragOver = useCallback(
    (e: any, targetColumnIndex: number, rowId: string) => {
      e.preventDefault();

      // Only allow drag over if it's the same row as the dragging started
      if (dragState.dragging.rowId !== rowId) {
        return;
      }

      if (dragState.draggingOver.columnIndex === targetColumnIndex) return;

      setDragState((prev: any) => ({
        ...prev,
        draggingOver: {
          columnIndex: targetColumnIndex,
          isDraggingOver: true,
        },
      }));
    },
    [dragState.draggingOver.columnIndex, dragState.dragging.rowId]
  );

  const handleDrop = useCallback(
    (e: any, targetColumnIndex: number, rowId: string) => {
      e.preventDefault();

      // Only allow drop if it's the same row as the dragging started
      if (dragState.dragging.rowId !== rowId) {
        return;
      }

      const { columnIndex: cIdx } = dragState.dragging;
      const moved = fs[cIdx];
      const newFlights = [...fs];
      newFlights.splice(cIdx, 1);
      newFlights.splice(targetColumnIndex, 0, moved);
      setFlights(newFlights);
    },
    [dragState.dragging.columnIndex, dragState.dragging.rowId]
  );

  const handleDragEnd = useCallback(() => {
    setDragState((prev: any) => ({
      ...prev,
      dragging: { columnIndex: null },
      activeCell: { columnIndex: null },
      draggingOver: { columnIndex: null, isDraggingOver: false },
    }));
  }, []);

  const getStartTime = (fIdx: number) => {
    return dayjs(event.startTime, "H:mm")
      .add(fIdx * event.interval, "minute")
      .format("h:mm A");
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
      <div className="flex gap-2">
        {/* <p className="text-xs min-w-[100px] flex flex-col bg-base-100 rounded-lg p-2 border">
          <span className="font-bold mb-1">{event.name}</span>
          <span className="text-[11px] font-">{course?.name}</span>
          <span className="font-medium capitalize text-[11px]">
            {event.holes} Holes &bull; {event.startSide}
          </span>
          {/* <span className="text-[11px]">{dayjs(event.date).format("MMM D, YYYY")}</span>
        </p> */}

        {fs.map((flight: any, fIdx: number) => {
          const isHighlighted = flightContainsId(flight, highlightId);
          return (
            <div
              key={fIdx}
              className={`min-w-[175px] bg-base-100 rounded-lg border px-2.5 py-1.5 duration-200 hover:cursor-grab ${
                isHighlighted ? "border-blue-500 bg-blue-100 ring-1 ring-blue-500" : ""
              } ${
                dragState.draggingOver.columnIndex === fIdx &&
                dragState.draggingOver.isDraggingOver &&
                dragState.dragging.rowId === "flights-row" &&
                "border-dashed border-white bg-info/50"
              } ${
                dragState.activeCell.columnIndex === fIdx &&
                "translate-x-0 translate-y-0 scale-105 transform border-white transition-transform hover:bg-info text-white"
              } `}
              draggable
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
                      <Select
                        label="Player 1"
                        value={editPlayer1}
                        options={getPlayerOptionsForFlight(fIdx)}
                        onChange={(e) => setEditPlayer1(Number(e.target.value))}
                      />
                      <Select
                        label="Player 2"
                        value={editPlayer2}
                        options={getPlayerOptionsForFlight(fIdx)}
                        onChange={(e) => setEditPlayer2(Number(e.target.value))}
                      />
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
