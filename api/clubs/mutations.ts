import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClub, updateClub } from ".";
import type { ClubPayload } from ".";

export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClubPayload) => createClub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
};

export const useUpdateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClubPayload }) => updateClub(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
};
