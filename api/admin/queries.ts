import { useQuery } from "@tanstack/react-query";
import { getAdminLeague, getAdminLeagues } from ".";

export const useAdminLeagues = () => {
  return useQuery({
    queryKey: ["admin-leagues"],
    queryFn: () => getAdminLeagues(),
  });
};

export const useAdminLeague = (id: number) => {
  return useQuery({
    queryKey: ["admin-league", id],
    queryFn: () => getAdminLeague(id),
  });
};
