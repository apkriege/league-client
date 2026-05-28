import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlayer, deletePlayer, updatePlayer } from ".";

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leagueId, data }: { leagueId: number; data: any }) => {
      return await createPlayer(leagueId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["league", variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ["players", variables.leagueId] });
    },
    onError: (error) => {
      console.error("Failed to create player:", error);
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await updatePlayer(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (error) => {
      console.error("Failed to update player:", error);
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deletePlayer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (error) => {
      console.error("Failed to remove player:", error);
    },
  });
};
