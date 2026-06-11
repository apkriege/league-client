import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useLeagueStore } from "@/stores/leagueStore";
import { Trash2 } from "lucide-react";
dayjs.extend(customParseFormat);

// HAVE TO ADD THE LOGIC THAT IF THIS IS USING
// THE MULTI CREATOR THEN THERE SHOULDN'T BE THE OPTION TO DELETE
// A FLIGHT BECAUSE IT WOULD MESS UP THE CREATION LOGIC

interface FlightsDragRowProps {
  event: any;
  flights: any[];
  selected?: string;
  setFlights: (flights: any[]) => void;
}

const FlightStrokeOutput = ({ playerIds }: any) => {
  const { league } = useLeagueStore();

  if (!league) {
    return <div>Loading league data...</div>;
  }

  const playerElements = playerIds.map((id: any) => {
    const player = league.players.find((p) => p.id === id);
    if (!player) return <div key={id}>Unknown Player</div>;
    return (
      <div key={id} className="flex items-center">
        <p className="font-medium text-xs">
          {player.firstName[0]} {player.lastName} ({player.handicap})
        </p>
      </div>
    );
  });

  return <div>{playerElements}</div>;
};

const FlightMatchOutput = ({ matchups }: any) => {
  const { league } = useLeagueStore();

  if (!league) {
    return <div>Loading league data...</div>;
  }

  const matchupElements = matchups.map((pair: any, idx: number) => {
    const player1 = league.players.find((p) => p.id === pair[0]);
    const player2 = league.players.find((p) => p.id === pair[1]);

    return (
      <div key={idx} className="flex items-center gap-2 justify-between">
        <div className="font-medium text-xs">
          {player1 ? `${player1.firstName[0]} ${player1.lastName}` : "Unknown Player"}
        </div>
        <span className="text-xs">vs</span>
        <div className="font-medium text-xs">
          {player2 ? `${player2.firstName[0]} ${player2.lastName}` : "Unknown Player"}
        </div>
      </div>
    );
  });

  return <div>{matchupElements}</div>;
};

const FlightTeamOutput = ({ matchups }: any) => {
  const { league } = useLeagueStore();

  if (!league) {
    return <div>Loading league data...</div>;
  }

  const team1 = league.teams.find((t) => t.id === matchups[0]?.id || t.id == matchups[0]);
  const team2 = league.teams.find((t) => t.id === matchups[1]?.id || t.id == matchups[1]);

  const playersLayout = (team: any) => {
    return team.players.map((p: any) => (
      <div key={p.id} className="flex items-center">
        <div className="font-medium text-[11px] italic">
          {p.firstName[0]}. {p.lastName} ({p.handicap})
        </div>
      </div>
    ));
  };

  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="font-medium text-xs">
        {team1 ? (
          <div>
            <div className="font-semibold">{team1.name}</div>
            <div>{playersLayout(team1)}</div>
          </div>
        ) : (
          "Unknown Team"
        )}
      </div>
      <span className="text-xs">vs</span>
      <div className="font-medium text-xs">
        {team2 ? (
          <div>
            <div className="font-semibold">{team2.name}</div>
            <div>{playersLayout(team2)}</div>
          </div>
        ) : (
          "Unknown Team"
        )}
      </div>
    </div>
  );
};

// don't remove selected and use it
// selected is for the the quick highlight of a flight that contains the selected player/team
export const FlightsDragRow = ({ event, flights, selected, setFlights }: FlightsDragRowProps) => {
  const [fs, setFs] = useState<any>(flights);

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
        <p className="text-xs min-w-[100px] flex flex-col">
          <span className="font-medium">{event.startSide}</span>
          <span className="">{dayjs(event.date).format("MMM D, YYYY")}</span>
        </p>

        {fs.map((flight: any, fIdx: number) => (
          <div
            key={fIdx}
            className={`min-w-[225px] rounded-lg border px-3 py-2 duration-200 hover:cursor-grab ${
              ``
              // flight.players.map((p: any) => p.name).includes(selected)
              //   ? "hover:-blue-200 border-blue-300 bg-blue-500/50 text-white hover:bg-blue-600"
              //   : "text-surface-content border-surface-border hover:bg-surface-hover"
            } ${
              dragState.draggingOver.columnIndex === fIdx &&
              dragState.draggingOver.isDraggingOver &&
              dragState.dragging.rowId === "flights-row" &&
              "border-dashed border-white bg-green-500/50"
            } ${
              dragState.activeCell.columnIndex === fIdx &&
              "translate-x-0 translate-y-0 scale-105 transform border-white transition-transform hover:bg-green-600"
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
                <FlightStrokeOutput playerIds={flight} />
              )}
              {event.format === "individual" && event.scoringFormat === "match" && (
                <FlightMatchOutput matchups={flight} />
              )}
              {event.format === "team" && event.scoringFormat === "match" && (
                <FlightTeamOutput matchups={flight} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
