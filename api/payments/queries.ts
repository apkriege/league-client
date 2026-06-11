import { useQuery } from "@tanstack/react-query";
import { getStripeState } from ".";

export const useStripeState = (enabled = true) => {
  return useQuery({
    queryKey: ["stripe-state"],
    queryFn: getStripeState,
    enabled,
  });
};
