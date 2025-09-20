import { useQuery } from "@tanstack/react-query";
import { getReceivedPartnerRequests } from "../services/api/profiles/partnerService";

export function useRequests(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["pendingRequestCount", userId],
    queryFn: async () => {
      if (!token) {
        return 0;
      }

      return await getReceivedPartnerRequests(token);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
