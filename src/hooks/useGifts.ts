import { useQuery } from "@tanstack/react-query";
import { getGiftsData } from "../services/api/gifts/giftsService";

export function useGifts(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["gifts", userId],
    queryFn: async () => {
      return await getGiftsData(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 15,
  });
}
