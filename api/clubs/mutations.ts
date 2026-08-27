import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClub } from ".";
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
