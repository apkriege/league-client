import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export const FlightsDragRowSingleMatch = ({ event, flights, selected, setFlights }: any) => {
  console.log("flights in FlightsDragRow:", flights);
  const [fs, setFs] = useState<any>(flights);

  useEffect(() => {
    setFs(flights);
  }, [flights]);

  const [dragState, setDragState] = useState<any>({
    dragging: { columnIndex: null },
    activeCell: { columnIndex: null },
    draggingOver: { columnIndex: null, isDraggingOver: false },
  });

  const removeFlight = (flightIdx: number) => {
    const newFlights = fs.filter((_: any, idx: number) => idx !== flightIdx);
    setFs(newFlights);
    setFlights(newFlights);
  };

  const handleDragStart = useCallback(
    (e: any, columnIndex: number) => {
      e.dataTransfer.setData("text/plain", "anything");

      setDragState((prev: any) => ({
        ...prev,
        dragging: { columnIndex },
        activeCell: { columnIndex },
      }));
    },
    [dragState.activeCell.columnIndex]
  );

  const handleDragOver = useCallback(
    (e: any, targetColumnIndex: number) => {
      e.preventDefault();

      if (dragState.draggingOver.columnIndex === targetColumnIndex) return;

      setDragState((prev: any) => ({
        ...prev,
        draggingOver: {
          columnIndex: targetColumnIndex,
          isDraggingOver: true,
        },
      }));
    },
    [dragState.draggingOver.columnIndex]
  );

  const handleDrop = useCallback(
    (e: any, targetColumnIndex: number) => {
      e.preventDefault();

      const { columnIndex: cIdx } = dragState.dragging;
      const moved = fs[cIdx];
      const newFlights = [...fs];
      newFlights.splice(cIdx, 1);
      newFlights.splice(targetColumnIndex, 0, moved);

      // setFs(newFlights);
      setFlights(newFlights);
    },
    [dragState.dragging.columnIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDragState((prev: any) => ({
      ...prev,
      dragging: { columnIndex: null },
      activeCell: { columnIndex: null },
      draggingOver: { columnIndex: null, isDraggingOver: false },
    }));
  }, []);

  return (
    <div className="w-full p-1">
      <div className="mb-2 flex flex-wrap gap-2">
        {fs.map((flight: any, fIdx: number) => (
          <div
            key={fIdx}
            className={`min-w-[170px] rounded-lg border px-3 py-2 duration-200 hover:cursor-grab ${
              flight.players.map((p: any) => p.name).includes(selected)
                ? "hover:-blue-200 border-blue-300 bg-blue-500/50 text-white hover:bg-blue-600"
                : "text-surface-content border-surface-border hover:bg-surface-hover"
            } ${
              dragState.draggingOver.columnIndex === fIdx &&
              dragState.draggingOver.isDraggingOver &&
              "border-dashed border-white bg-green-500/20"
            } ${
              dragState.activeCell.columnIndex === fIdx &&
              "translate-x-0 translate-y-0 scale-105 transform border-white transition-transform hover:bg-green-600"
            } `}
            draggable
            onDragStart={(e) => handleDragStart(e, fIdx)}
            onDragOver={(e) => handleDragOver(e, fIdx)}
            onDrop={(e) => handleDrop(e, fIdx)}
            onDragEnd={handleDragEnd}
          >
            <div className="mb-2 flex justify-between">
              <div className="">
                <div className="font-bold text-sm">Flight {fIdx + 1}</div>
                <div className="mr-2 text-xs">
                  {dayjs(event.startTime, "H:mm")
                    .add(fIdx * event.interval, "minute")
                    .format("H:mm A")}
                </div>
              </div>
              <div>
                <i
                  className="pi pi-trash cursor-pointer p-1 text-[14px]! font-bold! text-red-400"
                  onClick={() => removeFlight(fIdx)}
                  title="Remove Flight"
                />
              </div>
            </div>
            <div className="flex flex-col text-xs">
              {flight.players.map((p: any, k: number) => (
                <p key={`${p.name}-${k}`} className="italic">
                  {p.name} ({p.handicap})
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
