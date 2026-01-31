import { useQuery } from "@tanstack/react-query";
import {
  getLeague,
  getLeagueEvent,
  getLeagueEvents,
  getAdminLeagues,
  getLeagues,
  getLeaguePlayers,
  getLeagueTeams,
  getLeagueEventScores,
} from ".";

export const useAdminLeagues = () => {
  return useQuery({
    queryKey: ["leagues"],
    queryFn: () => getAdminLeagues(),
  });
};

export const useLeagues = () => {
  return useQuery({
    queryKey: ["leagues"],
    queryFn: () => getLeagues(),
  });
};

export const useLeague = (id: number) => {
  return useQuery({
    queryKey: ["league", id],
    queryFn: () => getLeague(id),
  });
};

export const useLeagueEvents = (leagueId: number) => {
  return useQuery({
    queryKey: ["league", leagueId, "events"],
    queryFn: async () => getLeagueEvents(leagueId),
    enabled: !!leagueId,
  });
};

export const useLeagueEvent = (leagueId: number, eventId: number) => {
  return useQuery({
    queryKey: ["league", leagueId, "event", eventId],
    queryFn: async () => getLeagueEvent(leagueId, eventId),
    enabled: !!leagueId && !!eventId,
  });
};

export const useLeagueEventScores = (leagueId: number, eventId: number) => {
  return useQuery({
    queryKey: ["league", leagueId, "event", eventId, "scores"],
    queryFn: async () => getLeagueEventScores(leagueId, eventId),
    enabled: !!leagueId && !!eventId,
  });
};

export const useLeaguePlayers = (leagueId: number) => {
  return useQuery({
    queryKey: ["players", leagueId],
    queryFn: () => getLeaguePlayers(leagueId),
  });
};

export const useLeagueTeams = (leagueId: number) => {
  return useQuery({
    queryKey: ["teams", leagueId],
    queryFn: () => getLeagueTeams(leagueId),
  });
};
