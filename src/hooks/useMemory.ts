import { useQuery } from "@tanstack/react-query";
import {
  getAllFavoriteMemories,
  getRecentFavoriteMemories,
} from "../services/api/ours/favoriteMemoriesService";

export function useMemories(userId: string, token: string | undefined) {
  return useQuery({
    queryKey: ["allFavoriteMemories", userId],
    queryFn: async () => {
      if (!token) {
        return;
      }
      
      return await getAllFavoriteMemories(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}

export function useRecentMemories(userId: string, token: string) {
  return useQuery({
    queryKey: ["recentFavoriteMemories", userId],
    queryFn: async () => {
      return await getRecentFavoriteMemories(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}
