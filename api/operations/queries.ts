import { useQuery } from "@tanstack/react-query";
import {
  getInvitation,
  getLeagueAuditLogs,
  getLeagueInvitations,
  getLeagueOnboarding,
  getNotifications,
} from ".";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
};

export const useInvitation = (token: string | undefined) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitation(String(token)),
    enabled: Boolean(token),
  });
};

export const useLeagueInvitations = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "invitations"],
    queryFn: () => getLeagueInvitations(leagueId),
    enabled: enabled && Boolean(leagueId),
  });
};

export const useLeagueOnboarding = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "onboarding"],
    queryFn: () => getLeagueOnboarding(leagueId),
    enabled: enabled && Boolean(leagueId),
  });
};

export const useLeagueAuditLogs = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "audit-logs"],
    queryFn: () => getLeagueAuditLogs(leagueId),
    enabled: enabled && Boolean(leagueId),
  });
};
