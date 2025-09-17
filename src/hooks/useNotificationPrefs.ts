import { useQuery } from "@tanstack/react-query";
import {
  NOTIFICATION_TYPES,
  getNotificationPreference,
} from "../services/api/settings/notificationPreferenceService";
import useToken from "./useToken";

export function useNotificationPrefs(userId: string) {
  return useQuery({
    queryKey: ["notificationPreferences", userId],
    queryFn: fetchPreferencesQuery,
    staleTime: 1000 * 60 * 60 * 24 * 2,
    retry: false,
    enabled: !!userId,
  });
}

const fetchPreferencesQuery = async () => {
  const token = useToken();

  if (!token) {
    return;
  }

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
