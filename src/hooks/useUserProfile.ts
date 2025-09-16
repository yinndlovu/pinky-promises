import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../services/api/profiles/profileService";

export function useUserProfile(userId: string, token: string) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      return await getUserProfile(userId, token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 5,
  });
}
