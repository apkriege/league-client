import { useQuery } from "@tanstack/react-query";
import { getFlight } from ".";

export const useFlight = (flightId: number) => {
  return useQuery({
    queryKey: ["flight", flightId],
    queryFn: () => getFlight(flightId),
  });
};
