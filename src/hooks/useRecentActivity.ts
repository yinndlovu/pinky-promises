import { useQuery } from "@tanstack/react-query";
import { getRecentActivities } from "../services/api/home/recentActivityService";
import { formatDateDMY, formatTime } from "../utils/formatters/formatDate";

export function useRecentActivities(userId: string, token: string) {
  return useQuery({
    queryKey: ["recentActivities", userId],
    queryFn: async () => {
      const activitiesData = await getRecentActivities(token);

      return activitiesData.map((activity: any) => ({
        id: activity.id,
        description: activity.activity,
        date: formatDateDMY(activity.createdAt),
        time: formatTime(activity.createdAt),
      }));
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
