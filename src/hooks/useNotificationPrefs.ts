import { useQuery } from "@tanstack/react-query";
import { getNotificationPreferences } from "../services/api/settings/notificationPreferenceService";

export function useNotificationPrefs(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["notificationPreferences", userId],
    queryFn: async () => {
      return await getNotificationPreferences(token!);
    },
    staleTime: 1000 * 60 * 60 * 24 * 2,
    retry: false,
    enabled: !!userId && !!token,
  });
}
