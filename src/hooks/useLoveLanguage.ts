import { useQuery } from "@tanstack/react-query";
import { getLoveLanguage } from "../services/api/profiles/loveLanguageService";

export function useLoveLanguage(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["loveLanguage", userId],
    queryFn: async () => {
      if (!token) {
        return;
      }
      
      return await getLoveLanguage(token, userId);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}
