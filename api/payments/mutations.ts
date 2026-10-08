import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCheckoutSession,
  redeemPaymentBypassCode,
  type CreateCheckoutSessionPayload,
} from ".";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (payload: CreateCheckoutSessionPayload) => {
      return await createCheckoutSession(payload);
    },
    // A timed-out request may still have created a Stripe session. Never create a second one
    // automatically; the payment error boundary directs the user through a safe recovery.
    retry: false,
    onError: (error) => {
      console.error("Failed to create checkout session:", error);
    },
  });
};

export const useRedeemPaymentBypassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["payment-access-code"],
    meta: { errorHandledLocally: true },
    mutationFn: (input: string | { code: string; leagueId: number }) => typeof input === "string"
      ? redeemPaymentBypassCode(input) : redeemPaymentBypassCode(input.code, input.leagueId),
    onSuccess: async (_result, input) => {
      if (typeof input !== "string") await queryClient.invalidateQueries({ queryKey: ["league", input.leagueId] });
      await queryClient.invalidateQueries({ queryKey: ["stripe-state"] });
    },
    retry: false,
  });
};
