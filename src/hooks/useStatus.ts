import { useQuery } from "@tanstack/react-query";
import { fetchUserStatus } from "../services/api/profiles/userStatusService";

export function useUserStatus(
  partnerId: string,
  userId: string,
  token: string
) {
  return useQuery({
    queryKey: ["partnerStatus", userId],
    queryFn: async () => {
      if (!partnerId) {
        return null;
      }

      return await fetchUserStatus(token, partnerId);
    },
    enabled: !!partnerId && !!token && !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
