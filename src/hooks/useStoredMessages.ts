import { useQuery } from "@tanstack/react-query";
import {
  getReceivedMessages,
  getStoredMessages,
} from "../services/api/profiles/messageStorageService";

export function useStoredMessages(userId: string, token: string) {
  return useQuery({
    queryKey: ["storedMessages", userId],
    queryFn: async () => {
      const response = await getStoredMessages(token);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

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
