import { useQuery } from "@tanstack/react-query";
import { getHomeScreenData } from "../services/api/home/homeService";

export function useHome(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["home", userId],
    queryFn: async () => {
      return await getHomeScreenData(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
