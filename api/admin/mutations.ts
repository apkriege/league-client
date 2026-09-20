import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentBypassCode,
  revokePaymentBypassCode,
  syncAdminLeagueSeason,
  correctLeagueRenewalLink,
} from ".";

export const useCorrectLeagueRenewalLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: correctLeagueRenewalLink,
    onSuccess: async (_, leagueId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["league", leagueId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-leagues"] }),
      ]);
    },
  });
};

export const useCreatePaymentBypassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentBypassCode,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payment-bypass-codes"] });
    },
  });
};

export const useRevokePaymentBypassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokePaymentBypassCode,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payment-bypass-codes"] });
    },
  });
};

export const useSyncAdminLeagueSeason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAdminLeagueSeason,
    onSuccess: async (_response, leagueId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-leagues"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-league", leagueId] }),
        queryClient.invalidateQueries({ queryKey: ["league", leagueId] }),
        queryClient.invalidateQueries({ queryKey: ["players", leagueId] }),
        queryClient.invalidateQueries({ queryKey: ["teams", leagueId] }),
        queryClient.invalidateQueries({ queryKey: ["player", leagueId] }),
      ]);
    },
  });
};
