import { useQuery } from "@tanstack/react-query";
import { getMood, getUserMood } from "../services/api/profiles/moodService";

export function useMood(userId: string, token: string | undefined) {
  return useQuery({
    queryKey: ["moodData", userId],
    queryFn: async () => {
      if (!token) {
        return;
      }
      
      return await getMood(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserMood(partnerId: string, token: string) {
  return useQuery({
    queryKey: ["partnerMood", partnerId],
    queryFn: async () => {
      if (!partnerId) {
        return null;
      }

      return await getUserMood(token, partnerId);
    },
    enabled: !!partnerId && !!token,
    staleTime: 1000 * 60 * 2,
  });
}
