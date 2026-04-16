import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { MultiSelect, Select } from "@/components/form";
import { useToast } from "@/context/ToastContext";

import { FlightsDragRow } from "./FlightsDragRow";
import { useParams } from "react-router";
import { useLeague } from "@api/league/queries";
import Card from "@/components/layout/Card";

interface FlightBuilderProps {
  flights: any[];
  setFlights: (flights: any[]) => void;
  event: any;
}

export default function FlightBuilder({ flights, setFlights, event }: FlightBuilderProps) {
  const { leagueId } = useParams();
  const { show } = useToast();

  const { watch } = useFormContext();
  const scoringFormat = watch("scoringFormat");
  const { data: league } = useLeague(Number(leagueId)!);

  const [strokePlayers, setStrokePlayers] = useState<(string | number)[]>([]);
  const [player1, setPlayer1] = useState<number | undefined>();
  const [player2, setPlayer2] = useState<number | undefined>();
  const [team1, setTeam1] = useState<number | undefined>();
  const [team2, setTeam2] = useState<number | undefined>();

  if (!league) {
    return <div>Loading league data...</div>;
  }

  const assignedIds = flights.flat(Infinity).map((id: any) => String(id));

  const playerOptions =
    league.players
      .filter((player: any) => !assignedIds.includes(String(player.id)))
      .map((player: any) => ({
        value: player.id,
        label: `${player.firstName} ${player.lastName}`,
      })) || [];

  const teamOptions =
    event.teams
      .filter((team: any) => !assignedIds.includes(String(team.id)))
      .map((team: any) => ({
        value: team.id,
        label: team.name,
      })) || [];

  const handleStrokeChange = (newValue: (string | number)[]) => {
    const max = event.format === "individual" ? 4 : 2;
    if (newValue.length > max) {
      return;
    }
    setStrokePlayers(newValue);
  };

  const handleStrokeFlight = () => {
    if (strokePlayers.length === 0) {
      show("Please select at least one player.");
      return;
    }
    setFlights([...flights, strokePlayers]);
    reset();
  };

  const handleMatchFlight = () => {
    if (player1 === player2 || !player1 || !player2) {
      show("Please select two different players.");
      return;
    }
    // FlightMatchOutput expects an array of matchup pairs for each flight.
    const matchup = [[player1, player2]];
    setFlights([...flights, matchup]);
    reset();
  };

  const handleTeamFlight = () => {
    if (team1 === team2 || !team1 || !team2) {
      show("Please select two different teams.");
      return;
    }

    const matchup = [team1, team2];
    setFlights([...flights, matchup]);
    reset();
  };

  const reset = () => {
    setStrokePlayers([]);
    setPlayer1(undefined);
    setPlayer2(undefined);
    setTeam1(undefined);
    setTeam2(undefined);
  };

  return (
    <div>
      <Card>
        {event.format === "individual" && scoringFormat === "stroke" && (
          <div className="grid grid-cols-10 gap-4 items-end">
            <div className="col-span-8">
              <MultiSelect
                label="Select Players"
                options={playerOptions}
                value={strokePlayers}
                onChange={handleStrokeChange}
                placeholder="Select players for stroke play flight"
              />
            </div>
            <button className="btn btn-primary mb-1 col-span-2" onClick={handleStrokeFlight}>
              Add Flight
            </button>
          </div>
        )}
        {event.format === "individual" && scoringFormat === "match" && (
          <div className="grid grid-cols-10 gap-4 items-end">
            <div className="col-span-4">
              <Select
                label="Player 1"
                placeholder="Select first player"
                value={player1}
                options={playerOptions}
                onChange={(e) => setPlayer1(Number(e.target.value))}
              />
            </div>
            <div className="col-span-4">
              <Select
                label="Player 2"
                placeholder="Select second player"
                value={player2}
                options={playerOptions}
                onChange={(e) => setPlayer2(Number(e.target.value))}
              />
            </div>
            <button className="btn btn-primary btn-sm mb-1 col-span-2" onClick={handleMatchFlight}>
              Add Flights
            </button>
          </div>
        )}
        {event.format === "team" && scoringFormat === "match" && (
          <div className="grid grid-cols-10 gap-4 items-end">
            <div className="col-span-4">
              <Select
                label="Team 1"
                placeholder="Select Team 1"
                value={team1}
                options={teamOptions}
                onChange={(e) => setTeam1(Number(e.target.value))}
              />
            </div>
            <div className="col-span-4">
              <Select
                label="Team 2"
                placeholder="Select Team 2"
                value={team2}
                options={teamOptions}
                onChange={(e) => setTeam2(Number(e.target.value))}
              />
            </div>
            <button className="btn btn-primary mb-1 col-span-2" onClick={handleTeamFlight}>
              Add Flight
            </button>
          </div>
        )}
      </Card>
      <div className="mt-2">
        <FlightsDragRow
          event={event}
          players={league.players}
          flights={flights}
          setFlights={setFlights}
          selected="1"
        />
      </div>
    </div>
  );
}
