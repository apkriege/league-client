import { MultiSelect, Select } from "@/components/form";
import { useState } from "react";
import { FlightsDragRow } from "./FlightsDragRow";
import { useFormContext } from "react-hook-form";
import { useLeagueStore } from "@/stores/leagueStore";
import { useToast } from "@/context/ToastContext";

interface FlightBuilderProps {
  flights: any[];
  setFlights: (flights: any[]) => void;
  event: any;
}

export default function FlightBuilder({ flights, setFlights, event }: FlightBuilderProps) {
  const { watch } = useFormContext();
  const { league } = useLeagueStore();
  const { show } = useToast();
  const eventType = watch("type");

  const [strokePlayers, setStrokePlayers] = useState<(string | number)[]>([]);
  const [player1, setPlayer1] = useState();
  const [player2, setPlayer2] = useState();
  const [team1, setTeam1] = useState();
  const [team2, setTeam2] = useState();

  if (!league) {
    return <div>Loading league data...</div>;
  }

  const assignedIds = flights.flat(Infinity);

  const playerOptions =
    league.players
      .filter((player) => !assignedIds.includes(player.id?.toString()))
      .map((player) => ({
        value: player.id,
        label: `${player.firstName} ${player.lastName}`,
      })) || [];

  const teamOptions =
    league.teams
      .filter((team) => !assignedIds.includes(team.id?.toString()))
      .map((team) => ({
        value: team.id,
        label: team.name,
      })) || [];

  const handleStrokeChange = (newValue: (string | number)[]) => {
    // const max = event.teamType === "individual" ? 4 : 2;
    // if (newValue.length > max) {
    //   return;
    // }
    // setStrokePlayers(newValue);
  };

  const handleStrokeFlight = () => {
    // if (strokePlayers.length === 0) {
    //   show("Please select at least one player.");
    //   return;
    // }
    // setFlights([...flights, strokePlayers]);
    // reset();
  };

  const handleMatchFlight = () => {
    // if (player1 === player2 || !player1 || !player2) {
    //   show("Please select two different players.");
    //   return;
    // }
    // const matchup = [player1, player2];
    // setFlights([...flights, matchup]);
    // reset();
  };

  const handleTeamFlight = () => {
    const matchup = [team1, team2];
    if (team1 === team2 || !team1 || !team2) {
      show("Please select two different teams.");
      return;
    }

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
      {eventType === "individual" && watch("scoringFormat") === "stroke" && (
        <div className="grid grid-cols-10 gap-4 items-end">
          <div className="col-span-8">
            <MultiSelect
              label={`Select ${eventType === "individual" ? "Players" : "Teams"}`}
              options={playerOptions}
              value={strokePlayers}
              onChange={handleStrokeChange}
              placeholder={`Select ${eventType === "individual" ? "Players" : "Teams"}`}
            />
          </div>
          <button className="btn btn-primary mb-1 col-span-2" onClick={handleStrokeFlight}>
            Add Flight
          </button>
        </div>
      )}
      {eventType === "individual" && watch("scoringFormat") === "match" && (
        <div className="grid grid-cols-10 gap-4 items-end">
          <div className="col-span-4">
            <Select
              label="Players Per Flight"
              placeholder="Select number of players"
              value={player1}
              options={playerOptions}
              onChange={(e) => setPlayer1(e.target.value)}
            />
          </div>
          <div className="col-span-4">
            <Select
              label="Players Per Flight"
              placeholder="Select number of players"
              value={player2}
              options={playerOptions}
              onChange={(e) => setPlayer2(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm mb-1 col-span-2" onClick={handleMatchFlight}>
            Add Flights
          </button>
        </div>
      )}
      {eventType === "team" && watch("scoringFormat") === "match" && (
        <div className="grid grid-cols-10 gap-4 items-end">
          <div className="col-span-4">
            <Select
              label="Team 1"
              placeholder="Select Team 1"
              value={team1}
              options={teamOptions}
              onChange={(e) => setTeam1(e.target.value)}
            />
          </div>
          <div className="col-span-4">
            <Select
              label="Team 2"
              placeholder="Select Team 2"
              value={team2}
              options={teamOptions}
              onChange={(e) => setTeam2(e.target.value)}
            />
          </div>
          <button className="btn btn-primary mb-1 col-span-2" onClick={handleTeamFlight}>
            Add Flight
          </button>
        </div>
      )}
      <div className="mt-2">
        <FlightsDragRow event={event} flights={flights} setFlights={setFlights} selected="1" />
      </div>
    </div>
  );
}
