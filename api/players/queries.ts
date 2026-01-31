import { useQuery } from "@tanstack/react-query";
import { getPlayerById, getPlayers } from ".";

export const usePlayer = (id: number) => {
  return useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayerById(id),
  });
};

export const usePlayers = () => {
  return useQuery({
    queryKey: ["players"],
    queryFn: () => getPlayers(),
  });
};
