import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam, deleteTeam, updateTeam } from ".";

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leagueId, data }: { leagueId: number; data: any }) => {
      return await createTeam(leagueId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["league", variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.leagueId] });
    },
    onError: (error) => {
      console.error("Failed to create team:", error);
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await updateTeam(id, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["league"] });
      if (variables.data?.leagueId) {
        queryClient.invalidateQueries({ queryKey: ["league", Number(variables.data.leagueId)] });
        queryClient.invalidateQueries({ queryKey: ["teams", Number(variables.data.leagueId)] });
      }
    },
    onError: (error) => {
      console.error("Failed to update team:", error);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      return await deleteTeam(id);
    },
    onSuccess: (_data, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["league"] });
      if (variables.leagueId) {
        queryClient.invalidateQueries({ queryKey: ["league", Number(variables.leagueId)] });
        queryClient.invalidateQueries({ queryKey: ["teams", Number(variables.leagueId)] });
      }
    },
    onError: (error) => {
      console.error("Failed to remove team:", error);
    },
  });
};
