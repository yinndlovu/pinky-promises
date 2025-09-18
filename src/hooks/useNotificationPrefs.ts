import { useQuery } from "@tanstack/react-query";
import {
  NOTIFICATION_TYPES,
  getNotificationPreference,
} from "../services/api/settings/notificationPreferenceService";

export function useNotificationPrefs(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["notificationPreferences", userId],
    queryFn: async () => {
      if (!token) {
        return {};
      }
      return fetchPreferencesQuery(token);
    },
    staleTime: 1000 * 60 * 60 * 24 * 2,
    retry: false,
    enabled: !!userId && !!token,
  });
}

const fetchPreferencesQuery = async (token: string) => {
  const prefs: { [key: string]: boolean } = {};
  for (const { key } of NOTIFICATION_TYPES) {
    try {
      prefs[key] = await getNotificationPreference(token, key);
    } catch {
      prefs[key] = false;
    }
  }
  return prefs;
};
