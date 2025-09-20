import { useQuery } from "@tanstack/react-query";
import { fetchUserStatus } from "../services/api/profiles/userStatusService";
import { getPartnerDistance } from "../services/api/profiles/distanceService";

export function useUserStatus(
  userId: string,
  token: string | null
) {
  return useQuery({
    queryKey: ["status", userId],
    queryFn: async () => {
      if (!token) {
        return null;
      }

      return await fetchUserStatus(token, userId);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePartnerDistance(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["partnerDistance", userId],
    queryFn: async () => {
      if (!token) {
        return null;
      }

      return await getPartnerDistance(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
