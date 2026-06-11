import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Trash2 } from "lucide-react";
import { FlightMatchOutput, FlightStrokeOutput, FlightTeamOutput } from "./FlightOutputs";
import { useCourse } from "@api/courses";
dayjs.extend(customParseFormat);

// HAVE TO ADD THE LOGIC THAT IF THIS IS USING
// THE MULTI CREATOR THEN THERE SHOULDN'T BE THE OPTION TO DELETE
// A FLIGHT BECAUSE IT WOULD MESS UP THE CREATION LOGIC

interface FlightsDragRowProps {
  event: any;
  flights: any[];
  selected?: string;
  players: any[];
  setFlights: (flights: any[]) => void;
}

// don't remove selected and use it
// selected is for the the quick highlight of a flight that contains the selected player/team
export const FlightsDragRow = ({
  event,
  flights,
  players,
  selected,
  setFlights,
}: FlightsDragRowProps) => {
  const [fs, setFs] = useState<any>(flights);
  const { data: course } = useCourse(event.courseId);

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
        <p className="text-xs min-w-[100px] flex flex-col bg-base-100 rounded-lg p-2 border">
          <span className="font-bold mb-1">{event.name}</span>
          <span className="text-[11px]">{course?.name}</span>
          <span className="font-medium capitalize text-[11px]">
            {event.holes} Holes &bull; {event.startSide}
          </span>
          <span className="text-[11px]">{dayjs(event.date).format("MMM D, YYYY")}</span>
        </p>

        {fs.map((flight: any, fIdx: number) => (
          <div
            key={fIdx}
            className={`min-w-[225px] bg-base-100 rounded-lg border px-3 py-2 duration-200 hover:cursor-grab ${
              ``
              // flight.players.map((p: any) => p.name).includes(selected)
              //   ? "hover:-blue-200 border-blue-300 bg-blue-500/50 text-white hover:bg-blue-600"
              //   : "text-surface-content border-surface-border hover:bg-surface-hover"
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
            <div className="mb-2 flex justify-between w-full">
              <div className="text-xs">
                <span className="font-bold mr-2">Flight {fIdx + 1}</span>
                {getStartTime(fIdx)}
              </div>
              <div>
                <Trash2
                  className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-600"
                  onClick={() => removeFlight(fIdx)}
                />
              </div>
            </div>
            <div className="flex flex-col text-sm">
              {event.format === "individual" && event.scoringFormat === "stroke" && (
                <FlightStrokeOutput players={players} playerIds={flight} />
              )}
              {event.format === "individual" && event.scoringFormat === "match" && (
                <FlightMatchOutput players={players} matchups={flight} />
              )}
              {event.format === "team" && event.scoringFormat === "match" && (
                <FlightTeamOutput players={players} teams={event.teams} matchups={flight} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
