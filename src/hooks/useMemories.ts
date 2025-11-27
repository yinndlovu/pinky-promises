import { useQuery } from "@tanstack/react-query";
import { getAllFavoriteMemories } from "../services/api/ours/favoriteMemoriesService";

export function useMemories(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["allFavoriteMemories", userId],
    queryFn: async () => {
      return await getAllFavoriteMemories(token!);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}
