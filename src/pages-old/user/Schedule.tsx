import { Select } from "@/components/form";
import { EventRow, PlayerFlight, TeamFlight } from "@/features/components/FlightLayouts";
import { convertTime, formatCase } from "@/utils/format";
import { useLeague, useLeagueEvents } from "@api/league/queries";
import { useState } from "react";
import { useParams } from "react-router";

export default function Schedule() {
  const { leagueId } = useParams();
  const { data: league } = useLeague(Number(leagueId));
  const { data: events } = useLeagueEvents(Number(leagueId));
  const [playerId, setPlayerId] = useState<number>();
  const [teamId, setTeamId] = useState<number>();

  console.log("League:", league);

  const playerOptions = league
    ? league.players.map((player: any) => ({
        value: player.id,
        label: `${player.firstName} ${player.lastName}`,
      }))
    : [];

  const teamOptions = league
    ? league.teams.map((team: any) => ({
        value: team.id,
        label: team.name,
      }))
    : [];

  return (
    <div className="p-4">
      <div className="header mb-4">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p>This is the schedule page. Here you can view and manage your league's events.</p>
      </div>

      <div className="filters">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex w-2/3 gap-2">
          <Select
            label="Player"
            options={[{ label: "Select Player", value: null }, ...playerOptions]}
            value={playerId}
            onChange={(e) => {
              setTeamId(undefined);
              setPlayerId(Number(e.target.value));
            }}
          />
          <Select
            label="Team"
            options={[{ label: "Select Team", value: null }, ...teamOptions]}
            value={teamId}
            onChange={(e) => {
              setPlayerId(undefined);
              setTeamId(Number(e.target.value));
            }}
          />
        </div>
      </div>
      <div className="divider m-0" />

      <div className="flex flex-col overflow-scroll">
        {events &&
          events.map((event: any) => (
            <div key={event.id} className="flex gap-0.5">
              <div className="py-0.5 px-0.5 min-w-[200px]">
                <div className="card bg-base-100 border px-3 py-2 h-full">
                  <h2 className="text-md font-bold">{event.name}</h2>
                  <p className="text-xs text-gray-400">Format: {formatCase(event.format)}</p>
                </div>
              </div>
              <div className="flex gap-0.5 flex-1">
                {event.flights.map((flight: any, index: number) => {
                  const teamIds = flight.teams.flatMap((t: any) => t.team.id);
                  const playerIds = flight.teams.flatMap((t: any) =>
                    t.team.players.map((p: any) => p.id)
                  );

                  const outline =
                    (playerIds.includes(playerId) || teamIds.includes(teamId)) &&
                    "border-sky-500 border-2 bg-sky-100";

                  return (
                    <div key={index} className="flex-1 py-0.5 px-0.5 min-w-[225px]">
                      {/* <div key={index} className={`flex-1 py-0.5 px-0.5 min-w-[225px] ${outline}`}> */}
                      <div className={`card bg-base-100 border px-3 py-2 h-full ${outline}`}>
                        <h3 className="text-xs font-semibold flex justify-between">
                          <span>Flight {index + 1}</span>
                          <span>{convertTime(flight.startTime)}</span>
                        </h3>
                        {event.format === "individual" && <PlayerFlight flight={flight} />}
                        {event.format === "team" && <TeamFlight flight={flight} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
