import { useQuery } from "@tanstack/react-query";
import { getUserLeagues } from ".";

export const useUserLeagues = (userId: number) => {
  return useQuery({
    queryKey: ["userLeagues", userId],
    queryFn: () => getUserLeagues(userId),
  });
};
