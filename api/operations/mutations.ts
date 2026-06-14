import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimInvitation,
  createLeagueInvitations,
  createLeagueNotification,
  markNotificationRead,
  revokeLeagueInvitation,
  updateLeagueOnboarding,
} from ".";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useClaimInvitation = () => {
  return useMutation({
    mutationFn: (token: string) => claimInvitation(token),
  });
};

export const useCreateLeagueInvitations = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { playerIds?: number[]; emails?: string[] }) =>
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

export const useCreateLeagueNotification = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; body: string; includeAdmin?: boolean }) =>
      createLeagueNotification(leagueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["league", leagueId, "audit-logs"] });
    },
  });
};

export const useUpdateLeagueOnboarding = (leagueId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { key: string; dismissed?: boolean }) =>
      updateLeagueOnboarding(leagueId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["league", leagueId, "onboarding"] }),
  });
};
