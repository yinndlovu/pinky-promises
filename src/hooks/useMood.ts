import { useQuery } from "@tanstack/react-query";
import { getUserMood } from "../services/api/profiles/moodService";

export function useUserMood(partnerId: string, userId: string, token: string) {
  return useQuery({
    queryKey: ["partnerMood", userId],
    queryFn: async () => {
      if (!partnerId) {
        return null;
      }

      return await getUserMood(token, partnerId);
    },
    enabled: !!partnerId && !!token && !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
