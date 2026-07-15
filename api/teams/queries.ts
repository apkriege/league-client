import { useQuery } from "@tanstack/react-query";
import { getTeam } from ".";

export const useTeam = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["team", id],
    queryFn: () => getTeam(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });
};
