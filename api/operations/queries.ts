import { useQuery } from "@tanstack/react-query";
import {
  getInvitation,
  getLeagueAnnouncements,
  getLeagueAuditLogs,
  getLeagueInvitations,
} from ".";

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

export const useLeagueAnnouncements = (leagueId: number, enabled = true) => {
  return useQuery({
    queryKey: ["league", leagueId, "announcements"],
    queryFn: () => getLeagueAnnouncements(leagueId),
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
