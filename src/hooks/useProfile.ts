import { useQuery } from "@tanstack/react-query";
import { getProfile, getUser } from "../services/api/profiles/profileService";

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

export function useUser(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      return await getUser(token!, userId!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 60 * 12,
  });
}
