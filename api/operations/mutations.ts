import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimInvitation,
  createLeagueAnnouncement,
  createLeagueInvitations,
  deleteLeagueAnnouncement,
  revokeLeagueInvitation,
  updateLeagueAnnouncement,
} from ".";

export const useClaimInvitation = () => {
  return useMutation({
    mutationFn: (token: string) => claimInvitation(token),
  });
};

export const useCreateLeagueInvitations = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { playerIds: number[] }) =>
      createLeagueInvitations(leagueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "invitations"] });
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "audit-logs"] });
    },
  });
};

export const useRevokeLeagueInvitation = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) => revokeLeagueInvitation(leagueId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "invitations"] });
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "audit-logs"] });
    },
  });
};

export const useCreateLeagueAnnouncement = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; body: string }) =>
      createLeagueAnnouncement(leagueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "audit-logs"] });
    },
  });
};

export const useUpdateLeagueAnnouncement = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      data,
    }: {
      announcementId: number;
      data: { title?: string; body?: string };
    }) => updateLeagueAnnouncement(leagueId, announcementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "audit-logs"] });
    },
  });
};

export const useDeleteLeagueAnnouncement = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: number) => deleteLeagueAnnouncement(leagueId, announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "audit-logs"] });
    },
  });
};
