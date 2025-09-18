import { useQuery } from "@tanstack/react-query";
import { getUnseenInteractions } from "../services/api/home/interactionService";

export function useUnseenInteractions(userId: string, token: string | undefined) {
  return useQuery({
    queryKey: ["unseenInteractions", userId],
    queryFn: async () => {
      if (!token) {
        return;
      }
      
      return await getUnseenInteractions(token);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
