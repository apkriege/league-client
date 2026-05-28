import { useQuery } from "@tanstack/react-query";
import { getPlayerById, getPlayers, getPlayerStats } from ".";

export const usePlayer = (id: number) => {
  return useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayerById(id),
  });
};

export const usePlayers = () => {
  return useQuery({
    queryKey: ["players"],
    queryFn: () => getPlayers(),
  });
};

export const usePlayerStats = (leagueId: number, playerId: number) => {
  return useQuery({
    queryKey: ["player", leagueId, playerId, "stats"],
    queryFn: () => getPlayerStats(leagueId, playerId),
    enabled: !!leagueId && !!playerId,
  });
};
