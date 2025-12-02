import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTrackingStatus,
  getStreakData,
  getStreakHistory,
  getPendingEndedStreak,
  getAllPendingEndedStreaks,
  getRecentStreakMessage,
  getStreakPreview,
  startTracking,
  stopTracking,
  logEndedStreak,
  confirmEndedStreak,
  SocialMediaPlatform,
} from "../services/api/streaks/streakService";

export function useTrackingStatus(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["streak", "status", userId],
    queryFn: async () => {
      return await getTrackingStatus(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStreakData(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["streak", "data", userId],
    queryFn: async () => {
      return await getStreakData(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStreakHistory(
  token: string | null,
  userId: string | undefined,
  platform: SocialMediaPlatform
) {
  return useQuery({
    queryKey: ["streak", "history", userId, platform],
    queryFn: async () => {
      return await getStreakHistory(token!, platform);
    },
    enabled: !!token && !!userId && !!platform,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePendingEndedStreak(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["streak", "pending", userId],
    queryFn: async () => {
      return await getPendingEndedStreak(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60,
  });
}

export function useAllPendingEndedStreaks(
  token: string | null,
  userId?: string
) {
  return useQuery({
    queryKey: ["streak", "pending", "all", userId],
    queryFn: async () => {
      return await getAllPendingEndedStreaks(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60,
  });
}

export function useRecentStreakMessage(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["streak", "recent", userId],
    queryFn: async () => {
      return await getRecentStreakMessage(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStreakPreview(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["streak", "preview", userId],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      return await getStreakPreview(token);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStartTracking(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platforms: SocialMediaPlatform[]) => {
      if (!token) {
        throw new Error("No token");
      }
      return await startTracking(token, platforms);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}

export function useStopTracking(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platform: SocialMediaPlatform) => {
      if (!token) {
        throw new Error("No token");
      }
      return await stopTracking(token, platform);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}

export function useLogEndedStreak(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accusedUserId,
      socialMedia,
    }: {
      accusedUserId: number;
      socialMedia: SocialMediaPlatform;
    }) => {
      if (!token) {
        throw new Error("No token");
      }
      return await logEndedStreak(token, accusedUserId, socialMedia);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}

export function useConfirmEndedStreak(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      streakId,
      confirmed,
    }: {
      streakId: number;
      confirmed: boolean;
    }) => {
      if (!token) {
        throw new Error("No token");
      }
      return await confirmEndedStreak(token, streakId, confirmed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}
