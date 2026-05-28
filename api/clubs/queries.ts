import { useQuery } from "@tanstack/react-query";
import { getClubs } from ".";

export const useClubs = () => {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });
};
