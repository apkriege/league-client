import { convertTime, formatCase } from "@/utils/format";

export const PlayerFlight = ({ flight }: any) => {
  return flight.players.map((playerFlight: any, index: number) => (
    <div key={index} className="mt-1">
      <p className="text-xs font-semibold">
        {playerFlight.player.firstName[0]} {playerFlight.player.lastName}
      </p>
    </div>
  ));
};

export const TeamFlight = ({ flight }: any) => {
  const team1 = flight.teams[0];
  const team2 = flight.teams[1];

  return (
    <div className="mt-1 flex justify-between">
      <div className="mr-4">
        <p className="text-xs font-semibold">{team1.team.name}</p>
        {team1.team.players.map((player: any, pIndex: number) => (
          <p key={pIndex} className="text-xs italic">
            {player.firstName[0]}. {player.lastName}
          </p>
        ))}
      </div>
      <span className="text-xs mt-2">vs</span>
      <div className="ml-4">
        <p className="text-xs font-semibold">{team2.team.name}</p>
        {team2.team.players.map((player: any, pIndex: number) => (
          <p key={pIndex} className="text-xs italic">
            {player.firstName[0]}. {player.lastName}
          </p>
        ))}
      </div>
    </div>
  );
};

export const EventRow = ({ event }: any) => {
  return (
    <div className="bg-base-200 rounded-box border px-4 py-2 flex">
      <div className="flex flex-col mr-6">
        <h2 className="text-md font-bold">{event.name}</h2>
        <p className="text-xs text-gray-400">Format: {formatCase(event.format)}</p>
        <p className="text-xs text-gray-400">Date: {new Date(event.date).toLocaleDateString()}</p>
      </div>
      <div className="flex gap-2">
        <table className="table-fixed text-xs">
          <thead>
            <tr>
              <th className="w-1/2">Flight</th>
              <th className="w-1/2">Start Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <h2 className="text-md font-bold">{event.name}</h2>
                <p className="text-xs text-gray-400">Format: {formatCase(event.format)}</p>
                <p className="text-xs text-gray-400">
                  Date: {new Date(event.date).toLocaleDateString()}
                </p>
              </td>
              {event.flights.map((flight: any, index: number) => (
                <td key={index} className="py-1">
                  <p className="font-medium">Flight {index + 1}</p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* {(event.flights && event.flights.length) > 0 &&
          event.flights.map((flight: any, index: number) => (
            <div key={index} className="card bg-base-300 border px-2 py-1">
              <h3 className="text-xs font-semibold flex justify-between">
                <span>Flight {index + 1}</span>
                <span>{convertTime(flight.startTime)}</span>
              </h3>
              {event.format === "individual" && <PlayerFlight flight={flight} />}
              {event.format === "team" && <TeamFlight flight={flight} />}
            </div>
          ))} */}
      </div>
    </div>
  );
};
