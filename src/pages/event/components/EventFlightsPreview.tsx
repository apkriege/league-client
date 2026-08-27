import { compareTimes, formatTime } from "@/utils/format";
import PlayerNameLink from "./PlayerNameLink";

export default function EventFlightsPreview({ event }: { event: any }) {
  const flights = [...(event.flights || [])].sort((a: any, b: any) =>
    compareTimes(a?.startsAt, b?.startsAt),
  );

  if (flights.length === 0) {
    return <div className="px-4 py-6 text-sm text-gray-400">No flights scheduled.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
      {flights.map((flight: any) => (
        <div key={flight.id} className="overflow-hidden rounded-lg border border-gray-200">
          <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
            Flight {formatTime(flight.startsAt, event.timeZone)}
          </div>
          <div className="p-3">
            {event.format === "team" ? (
              <TeamFlightPreview flight={flight} />
            ) : event.scoringFormat === "match" ? (
              <IndividualMatchFlightPreview flight={flight} />
            ) : (
              <StrokeFlightPreview flight={flight} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamFlightPreview({ flight }: { flight: any }) {
  const flightTeams = flight?.teams || [];
  if (flightTeams.length < 2) {
    return <p className="text-xs text-gray-400">Waiting for team matchups.</p>;
  }

  const left = flightTeams[0]?.team;
  const right = flightTeams[1]?.team;

  return (
    <div className="grid grid-cols-3 items-start gap-2 text-xs">
      <TeamPlayers team={left} fallbackName="Team 1" />
      <div className="text-center font-semibold text-gray-400">vs</div>
      <TeamPlayers team={right} fallbackName="Team 2" />
    </div>
  );
}

function TeamPlayers({ team, fallbackName }: { team: any; fallbackName: string }) {
  return (
    <div>
      <p className="font-semibold text-gray-800">{team?.name || fallbackName}</p>
      <div className="mt-1 flex flex-col gap-0.5 text-gray-600">
        {(team?.players || []).map((player: any) => (
          <PlayerNameLink
            key={player.id}
            playerId={player.id}
            className="font-medium text-gray-600 hover:text-slate-900 hover:underline"
          >
            {player.firstName} {player.lastName}
          </PlayerNameLink>
        ))}
      </div>
    </div>
  );
}

function IndividualMatchFlightPreview({ flight }: { flight: any }) {
  const players = flight?.players || [];
  if (players.length === 0) {
    return <p className="text-xs text-gray-400">No player matchups yet.</p>;
  }

  const byId = new Map<number, any>(players.map((player: any) => [Number(player.playerId), player]));
  const used = new Set<number>();
  const pairs: Array<[any, any | null]> = [];

  players.forEach((entry: any) => {
    const id = Number(entry.playerId);
    if (used.has(id)) return;

    const opponentId = Number(
      entry?.opponentId ?? entry?.player?.rounds?.[0]?.opponentId ?? 0,
    );
    const opponent = byId.get(opponentId);
    if (opponent && !used.has(Number(opponent.playerId))) {
      pairs.push([entry, opponent]);
      used.add(id);
      used.add(Number(opponent.playerId));
      return;
    }

    pairs.push([entry, null]);
    used.add(id);
  });

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      {pairs.map(([left, right], index) => (
        <div
          key={`${left.playerId}-${right?.playerId ?? index}`}
          className="flex items-center gap-2"
        >
          <PlayerLink entry={left} />
          <span className="text-gray-400">vs</span>
          {right ? <PlayerLink entry={right} /> : <span className="font-medium text-gray-700">TBD</span>}
        </div>
      ))}
    </div>
  );
}

function PlayerLink({ entry }: { entry: any }) {
  return (
    <PlayerNameLink
      playerId={entry.playerId}
      className="font-medium text-gray-700 hover:text-slate-900 hover:underline"
    >
      {entry.player.firstName} {entry.player.lastName}
    </PlayerNameLink>
  );
}

function StrokeFlightPreview({ flight }: { flight: any }) {
  const players = flight?.players || [];
  if (players.length === 0) {
    return <p className="text-xs text-gray-400">No players assigned.</p>;
  }

  return (
    <div className="flex flex-col gap-1 text-xs text-gray-700">
      {players.map((entry: any) => (
        <PlayerLink key={entry.playerId} entry={entry} />
      ))}
    </div>
  );
}
