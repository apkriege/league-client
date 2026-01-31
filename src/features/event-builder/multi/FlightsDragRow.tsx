import { useState, useCallback, useEffect } from "react";
import { useLeagueStore } from "@/stores/leagueStore";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { Trash2 } from "lucide-react";

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
        <div className="font-medium text-xs">
          {player.firstName} {player.lastName}
        </div>
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
      <div key={idx} className="flex items-center gap-2">
        <div className="font-medium text-xs">
          {player1 ? `${player1.firstName} ${player1.lastName}` : "Unknown Player"}
        </div>
        <span className="text-xs">vs</span>
        <div className="font-medium text-xs">
          {player2 ? `${player2.firstName} ${player2.lastName}` : "Unknown Player"}
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

  const team1 = league.teams.find((t) => t.id === matchups[0].id);
  const team2 = league.teams.find((t) => t.id === matchups[1].id);

  const playersLayout = (team: any) => {
    return team.players.map((p: any) => (
      <div key={p.id} className="flex items-center">
        <div className="font-medium text-xs italic">
          {p.firstName} {p.lastName}
        </div>
      </div>
    ));
  };

  return (
    <div className="flex items-center gap-2 justify-center">
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

  const getStartTime = (fIdx: number) => {
    return dayjs("04:00", "HH:mm")
      .add(fIdx * event.interval, "minute")
      .format("h:mm A");
  };

  console.log(event.format);

  return (
    <div className="w-full p-1">
      <div className="mb-2 flex flex-wrap gap-2">
        <p className="text-sm w-[150px]">
          <span className="font-medium">Side {event.startSide}</span>
          <br />
          <span>Date {dayjs(event.date).format("MMMM D, YYYY")}</span>
        </p>

        {fs.map((flight: any, fIdx: number) => (
          <div
            key={fIdx}
            className={`w-[250px] rounded-lg border px-3 py-2 duration-200 hover:cursor-grab ${
              ``
              // flight.players.map((p: any) => p.name).includes(selected)
              //   ? "hover:-blue-200 border-blue-300 bg-blue-500/50 text-white hover:bg-blue-600"
              //   : "text-surface-content border-surface-border hover:bg-surface-hover"
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
            <div className="mb-2 flex justify-between w-full">
              <div className="">
                <div className="mr-2 text-xs">{getStartTime(fIdx)}</div>
                <div className="font-bold text-sm">Flight {fIdx + 1}</div>
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
