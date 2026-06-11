import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFlightPlayers } from ".";

/**
 * Update players in a flight
 */
export const useUpdateFlightPlayers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flightId, players }: { flightId: number; players: any[] }) => {
      return await updateFlightPlayers(flightId, players);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flight", variables.flightId] });
    },
    onError: (error) => {
      console.error("Failed to update flight players:", error);
    },
  });
};
