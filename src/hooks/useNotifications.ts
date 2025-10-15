import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/api/notifications/notificationService";
import { Notification } from "../interfaces/Notification";

export function useNotifications(userId: string, token: string | null) {
  return useQuery<Notification[]>({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!token) {
        return [];
      }

      return await getNotifications(userId, token);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 60,
  });
}
