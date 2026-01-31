import { useQuery } from "@tanstack/react-query";

import * as DashboardAPI from "./index";

export const usePlayerEvents = (leagueId: number, playerId: number) => {
  return useQuery({
    queryKey: ["player-events", leagueId, playerId],
    queryFn: () => DashboardAPI.getPlayerEvents(leagueId, playerId),
    enabled: !!leagueId && !!playerId,
  });
};

export const usePlayerStats = (leagueId: number, playerId: number) => {
  return useQuery({
    queryKey: ["player-stats", leagueId, playerId],
    queryFn: () => DashboardAPI.getPlayerStats(leagueId, playerId),
    enabled: !!leagueId && !!playerId,
  });
};

export const useLeagueStats = (leagueId: number, playerId?: number) => {
  return useQuery({
    queryKey: ["league-stats", leagueId],
    queryFn: () => DashboardAPI.getLeagueStats(leagueId, playerId),
    enabled: !!leagueId,
  });
};

export const useLeagueLeaderboards = (leagueId: number) => {
  return useQuery({
    queryKey: ["league-leaderboards", leagueId],
    queryFn: () => DashboardAPI.getLeagueLeaderboards(leagueId),
    enabled: !!leagueId,
  });
};
