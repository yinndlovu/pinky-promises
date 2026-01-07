import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAttentivenessInsights,
  markAttentivenessInsightsAsShown,
} from "../services/api/attentiveness/attentivenessService";

export function useAttentivenessInsights(
  token: string | null,
  userId?: string
) {
  return useQuery({
    queryKey: ["attentiveness", "insights", userId],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      return await getAttentivenessInsights(token);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: true,
  });
}

export function useMarkAttentivenessAsShown(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weekKey: string) => {
      if (!token) {
        throw new Error("No token");
      }
      return await markAttentivenessInsightsAsShown(token, weekKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attentiveness"] });
    },
  });
}

