import { useQuery } from "@tanstack/react-query";
import { getPlayerStats } from ".";

export const usePlayerStats = (leagueId: number, playerId: number) => {
  return useQuery({
    queryKey: ["player", leagueId, playerId, "stats"],
    queryFn: () => getPlayerStats(leagueId, playerId),
    enabled: !!leagueId && !!playerId,
  });
};
