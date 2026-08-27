import { useQuery } from "@tanstack/react-query";
import {
  getLeague,
  getLeagueEvent,
  getLeagueEvents,
  getLeagueMetrics,
  getLeagues,
  getLeaguePlayers,
  getLeagueRenewalTemplate,
} from ".";

export const useLeagues = (enabled = true) => {
  return useQuery({
    queryKey: ["leagues"],
    queryFn: () => getLeagues(),
    enabled,
  });
};

export const useLeague = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", id],
    queryFn: () => getLeague(id),
    enabled: enabled && !!id,
  });
};

export const useLeagueRenewalTemplate = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", id, "renewal-template"],
    queryFn: () => getLeagueRenewalTemplate(id),
    enabled: enabled && !!id,
    staleTime: 0,
  });
};

export const useLeagueMetrics = (
  leagueId: number,
  options: { enabled?: boolean; periodId?: number | null } = {}
) => {
  const { enabled = true, periodId = null } = options;
  return useQuery({
    queryKey: ["league", leagueId, "metrics", periodId],
    queryFn: () => getLeagueMetrics(leagueId, periodId),
    enabled: enabled && !!leagueId,
  });
};

export const useLeagueEvents = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "events"],
    queryFn: async () => getLeagueEvents(leagueId),
    enabled: enabled && !!leagueId,
  });
};

export const useLeagueEvent = (leagueId: number, eventId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "event", eventId],
    queryFn: async () => getLeagueEvent(leagueId, eventId),
    enabled: enabled && !!leagueId && !!eventId,
  });
};

export const useLeaguePlayers = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["players", leagueId],
    queryFn: () => getLeaguePlayers(leagueId),
    enabled: enabled && !!leagueId,
  });
};
