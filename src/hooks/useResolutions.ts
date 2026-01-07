import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getResolutions,
  createResolution,
  markResolutionComplete,
  getPartnerResolutions,
} from "../services/api/resolutions/resolutionService";

export function useResolutions(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["resolutions", userId],
    queryFn: async () => {
      return await getResolutions(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateResolution(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      dueDate,
    }: {
      title: string;
      dueDate: string;
    }) => {
      return await createResolution(token!, title, dueDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resolutions"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });
}

export function useMarkResolutionComplete(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resolutionId: number) => {
      return await markResolutionComplete(token!, resolutionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resolutions"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });
}

export function usePartnerResolutions(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["partnerResolutions", userId],
    queryFn: async () => {
      return await getPartnerResolutions(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
