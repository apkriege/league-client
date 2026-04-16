import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession, type CreateCheckoutSessionPayload } from ".";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (payload: CreateCheckoutSessionPayload) => {
      return await createCheckoutSession(payload);
    },
    onError: (error) => {
      console.error("Failed to create checkout session:", error);
    },
  });
};
