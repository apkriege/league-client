import { useQuery } from "@tanstack/react-query";
import { getEvent, getEvents } from ".";

export const useEvent = (id: number) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
  });
};

export const useEvents = (leagueId: number) => {
  return useQuery({
    queryKey: ["players"],
    queryFn: () => getEvents(leagueId),
  });
};
