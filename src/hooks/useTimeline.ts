import { useQuery } from "@tanstack/react-query";
import { getTimeline } from "../services/api/ours/timelineService";

export function useTimeline(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["timeline", userId],
    queryFn: async () => {
      return await getTimeline(token!);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 10,
  });
}
