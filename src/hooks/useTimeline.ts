import { useQuery } from "@tanstack/react-query";
import { getTimeline } from "../services/api/ours/timelineService";

export function useTimeline(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["timeline", userId],
    queryFn: async () => {
      if (!token) {
        return [];
      }

      return await getTimeline(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 10,
  });
}
