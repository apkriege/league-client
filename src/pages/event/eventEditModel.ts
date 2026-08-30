export type EventFlight = number[] | number[][];
type FlightTransformResult = { flights: EventFlight[]; teams: EventTeam[] };

type EventTeam = {
  id: number;
  name: string;
  players: number[];
};

const playerIdFor = (entry: any) => Number(entry?.playerId ?? entry?.player?.id);

export function transformEventFlights(event: any): FlightTransformResult {
  const apiFlights: any[] = Array.isArray(event?.flights) ? event.flights : [];
  if (apiFlights.length === 0) return { flights: [], teams: [] };

  const format = String(event?.format || "team");
  const scoringFamily = getScoringFamily(deriveScoringMode(event));

  if (format === "team") {
    const teamMap = new Map<number, EventTeam>();
    for (const flight of apiFlights) {
      for (const flightTeam of flight.teams ?? []) {
        const team = flightTeam.team;
        if (team && !teamMap.has(Number(team.id))) {
          teamMap.set(Number(team.id), {
            id: Number(team.id),
            name: String(team.name || ""),
            players: (team.players ?? []).map((player: any) => Number(player.id)),
          });
        }
      }
    }
    return {
      flights: apiFlights.map((flight) =>
        (flight.teams ?? []).map((flightTeam: any) =>
          Number(flightTeam.teamId ?? flightTeam.team?.id),
        ),
      ),
      teams: [...teamMap.values()],
    };
  }

  if (format === "individual" && scoringFamily === "stroke") {
    return {
      flights: apiFlights.map((flight) => (flight.players ?? []).map(playerIdFor)),
      teams: [],
    };
  }

  if (format === "individual" && scoringFamily === "match") {
    return {
      flights: apiFlights.map((flight) => {
        const entries = Array.isArray(flight.players) ? flight.players : [];
        const entryByPlayerId = new Map(entries.map((entry: any) => [playerIdFor(entry), entry]));
        const usedPlayerIds = new Set<number>();
        const pairs: number[][] = [];

        for (const entry of entries) {
          const playerId = playerIdFor(entry);
          const opponentId = Number(entry?.opponentId || 0);
          if (
            usedPlayerIds.has(playerId) ||
            !opponentId ||
            opponentId === playerId ||
            !entryByPlayerId.has(opponentId) ||
            usedPlayerIds.has(opponentId)
          ) {
            continue;
          }
          pairs.push([playerId, opponentId]);
          usedPlayerIds.add(playerId);
          usedPlayerIds.add(opponentId);
        }

        const unpairedPlayerIds = entries
          .map(playerIdFor)
          .filter((playerId: number) => !usedPlayerIds.has(playerId));
        for (let index = 0; index + 1 < unpairedPlayerIds.length; index += 2) {
          pairs.push([unpairedPlayerIds[index], unpairedPlayerIds[index + 1]]);
        }
        return pairs;
      }),
      teams: [],
    };
  }

  return { flights: [], teams: [] };
}
import { deriveScoringMode, getScoringFamily } from "@/features/scoring/scoringModes";
