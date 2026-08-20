import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentBypassCode, revokePaymentBypassCode } from ".";

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
