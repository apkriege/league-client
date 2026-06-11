import { useQuery } from "@tanstack/react-query";
import { getAdminLeague, getAdminLeagues } from ".";

export const useAdminLeagues = (enabled = true) => {
  return useQuery({
    queryKey: ["admin-leagues"],
    queryFn: () => getAdminLeagues(),
    enabled,
  });
};

export const useAdminLeague = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["admin-league", id],
    queryFn: () => getAdminLeague(id),
    enabled: enabled && !!id,
  });
};
