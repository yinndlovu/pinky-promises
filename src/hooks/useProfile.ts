import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../services/api/profiles/profileService";

export function useProfile(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      return await getProfile(token!, userId!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 10,
  });
}
