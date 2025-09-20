import { useQuery } from "@tanstack/react-query";
import {
  getSpecialDates,
  getUpcomingSpecialDate,
} from "../services/api/ours/specialDateService";

export function useSpecialDates(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["specialDates", userId],
    queryFn: async () => {
      if (!token) {
        return [];
      }

      return await getSpecialDates(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}

export function useUpcomingSpecialDate(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["upcomingSpecialDate", userId],
    queryFn: async () => {
      if (!token) {
        return null;
      }

      return await getUpcomingSpecialDate(token);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 60 * 12,
  });
}
