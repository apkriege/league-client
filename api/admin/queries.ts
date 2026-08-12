import { useQuery } from "@tanstack/react-query";
import { getAdminBilling, getAdminLeague, getAdminLeagues } from ".";

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

export const useAdminBilling = (enabled = true) =>
  useQuery({
    queryKey: ["admin-billing"],
    queryFn: getAdminBilling,
    enabled,
  });
