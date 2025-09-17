import { useQuery } from "@tanstack/react-query";
import { getReceivedMessages } from "../services/api/profiles/messageStorageService";

export function useReceivedMessages(userId: string, token: string) {
  return useQuery({
    queryKey: ["partnerStoredMessages", userId],
    queryFn: async () => {
      const response = await getReceivedMessages(token);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 60,
  });
}
