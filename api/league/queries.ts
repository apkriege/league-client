import { useQuery } from "@tanstack/react-query";
import {
  getLeague,
  getLeagueEvent,
  getLeagueEvents,
  getLeagueMetrics,
  getLeagues,
  getLeaguePlayers,
  getLeagueTeams,
  getLeagueEventScores,
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

export const useLeagueMetrics = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "metrics"],
    queryFn: () => getLeagueMetrics(leagueId),
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

export const useLeagueEventScores = (leagueId: number, eventId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "event", eventId, "scores"],
    queryFn: async () => getLeagueEventScores(leagueId, eventId),
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

export const useLeagueTeams = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["teams", leagueId],
    queryFn: () => getLeagueTeams(leagueId),
    enabled: enabled && !!leagueId,
  });
};
