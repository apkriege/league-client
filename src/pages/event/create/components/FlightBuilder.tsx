import Button from "@/components/layout/Button";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Select } from "@/components/form";
import { useToast } from "@/context/ToastContext";

import { FlightsDragRow } from "./FlightsDragRow";
import { useParams } from "react-router";
import { useLeague } from "@api/league/queries";
import Card from "@/components/layout/Card";
import { Shuffle } from "lucide-react";

interface FlightBuilderProps {
  flights: any[];
  setFlights: (flights: any[]) => void;
  event: any;
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

export default function FlightBuilder({ flights, setFlights, event }: FlightBuilderProps) {
  const { leagueId } = useParams();
  const { show } = useToast();

  const { watch } = useFormContext();
  const scoringFormat = watch("scoringFormat");
  const { data: league } = useLeague(Number(leagueId)!);

  // 4 slots for individual stroke flights
  const [flightSlots, setFlightSlots] = useState<(number | "")[]>(["", "", "", ""]);
  // 4 slots for individual match flights: [matchup1p1, matchup1p2, matchup2p1, matchup2p2]
  const [matchSlots, setMatchSlots] = useState<(number | "")[]>(["", "", "", ""]);
  const [team1, setTeam1] = useState<number | undefined>();
  const [team2, setTeam2] = useState<number | undefined>();

  if (!league) {
    return <div>Loading league data...</div>;
  }

  const assignedIds = new Set(
    flights
      .flat(Infinity)
      .map((entry: any) => extractId(entry))
      .filter((id: number | null): id is number => id !== null)
  );

  const allPlayerOptions = league.players.map((player: any) => ({
    value: Number(player.id),
    label: `${player.firstName} ${player.lastName}`,
  }));

  // For each slot, include all unassigned players + whatever is in that slot
  const getSlotOptions = (slotIndex: number) => {
    const otherSlotIds = new Set(
      flightSlots.filter((v, i) => i !== slotIndex && v !== "").map((v) => Number(v))
    );
    return allPlayerOptions.filter(
      (opt: any) => !assignedIds.has(opt.value) && !otherSlotIds.has(opt.value)
    );
  };

  const teamOptions =
    event.teams
      .filter((team: any) => !assignedIds.has(Number(team.id)))
      .map((team: any) => ({
        value: Number(team.id),
        label: team.name,
      })) || [];

  const handleStrokeFlight = () => {
    const selected = flightSlots.filter((v) => v !== "") as number[];
    if (selected.length === 0) {
      show("Please select at least one player.");
      return;
    }
    setFlights([...flights, selected]);
    reset();
  };

  const handleAutoFill = () => {
    const unassigned = league.players
      .map((p: any) => Number(p.id))
      .filter((id: number) => !assignedIds.has(id));
    const newFlights = [...flights];
    for (let i = 0; i < unassigned.length; i += 4) {
      newFlights.push(unassigned.slice(i, i + 4));
    }
    setFlights(newFlights);
    reset();
  };

  const getMatchSlotOptions = (slotIndex: number) => {
    const otherSlotIds = new Set(
      matchSlots.filter((v, i) => i !== slotIndex && v !== "").map((v) => Number(v))
    );
    return allPlayerOptions.filter(
      (opt: any) => !assignedIds.has(opt.value) && !otherSlotIds.has(opt.value)
    );
  };

  const handleMatchFlight = () => {
    const m1p1 = matchSlots[0];
    const m1p2 = matchSlots[1];
    const m2p1 = matchSlots[2];
    const m2p2 = matchSlots[3];
    if (!m1p1 || !m1p2 || !m2p1 || !m2p2) {
      show("Please select all 4 players (2 matchups) to add a flight.");
      return;
    }
    // Each flight contains 2 matchup pairs
    const flightMatchups = [
      [m1p1, m1p2],
      [m2p1, m2p2],
    ];
    setFlights([...flights, flightMatchups]);
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
    setFlightSlots(["", "", "", ""]);
    setMatchSlots(["", "", "", ""]);
    setTeam1(undefined);
    setTeam2(undefined);
  };

  return (
    <div>
      <Card>
        {event.format === "individual" && scoringFormat === "stroke" && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-3">
              {([0, 1, 2, 3] as const).map((slot) => (
                <Select
                  key={slot}
                  label={`Player ${slot + 1}`}
                  placeholder="—"
                  value={flightSlots[slot]}
                  options={getSlotOptions(slot)}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : Number(e.target.value);
                    const next = [...flightSlots] as (number | "")[];
                    next[slot] = val;
                    setFlightSlots(next);
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleStrokeFlight}
                disabled={flightSlots.every((v) => v === "")}
              >
                Add Flight
              </Button>
              {assignedIds.size === 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAutoFill}
                  disabled={league.players.length < 2}
                >
                  <Shuffle size={12} />
                  Auto-Fill Flights
                </Button>
              )}
              <span className="text-xs text-slate-900/50 ml-auto">
                {flightSlots.filter((v) => v !== "").length}/4 players selected
              </span>
            </div>
          </div>
        )}
        {event.format === "individual" && scoringFormat === "match" && (
          <div className="flex flex-col gap-3">
            {[0, 1].map((matchup) => (
              <div key={matchup} className="flex items-end gap-3">
                <span className="text-xs font-semibold text-slate-900/50 mb-2 w-20 shrink-0">
                  Matchup {matchup + 1}
                </span>
                <div className="flex-1">
                  <Select
                    label="Player A"
                    placeholder="—"
                    value={matchSlots[matchup * 2]}
                    options={getMatchSlotOptions(matchup * 2)}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      const next = [...matchSlots] as (number | "")[];
                      next[matchup * 2] = val;
                      setMatchSlots(next);
                    }}
                  />
                </div>
                <span className="text-xs text-slate-900/40 mb-2">vs</span>
                <div className="flex-1">
                  <Select
                    label="Player B"
                    placeholder="—"
                    value={matchSlots[matchup * 2 + 1]}
                    options={getMatchSlotOptions(matchup * 2 + 1)}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      const next = [...matchSlots] as (number | "")[];
                      next[matchup * 2 + 1] = val;
                      setMatchSlots(next);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleMatchFlight}
                disabled={matchSlots.some((v) => v === "")}
              >
                Add Flight
              </Button>
              <span className="text-xs text-slate-900/50 ml-auto">
                {matchSlots.filter((v) => v !== "").length}/4 players selected
              </span>
            </div>
          </div>
        )}
        {event.format !== "individual" && scoringFormat !== "match" && event.format !== "team" && (
          <p className="text-xs text-slate-900/50">
            Set format to <span className="font-semibold">Individual</span> in Event Settings to
            build player flights.
          </p>
        )}
        {event.format === "team" && (scoringFormat === "match" || scoringFormat === "stroke") && (
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
            <Button className="col-span-2 mb-1" variant="primary" onClick={handleTeamFlight}>
              Add Flight
            </Button>
          </div>
        )}
        <div className="mt-4 border-t border-slate-200 pt-4">
          <FlightsDragRow
            event={event}
            players={league.players}
            flights={flights}
            setFlights={setFlights}
          />
        </div>
      </Card>
    </div>
  );
}
