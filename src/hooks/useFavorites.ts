import { useQuery } from "@tanstack/react-query";
import { getUserFavorites } from "../services/api/profiles/favoritesService";

export function useFavorites(userId: string, token: string) {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      return await getUserFavorites(token, userId);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}
