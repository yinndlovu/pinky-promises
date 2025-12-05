import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getResolutions,
  createResolution,
  markResolutionComplete,
  type Resolution,
} from "../services/api/resolutions/resolutionService";
import useToken from "./useToken";

export function useResolutions(userId?: string) {
  const token = useToken();

  return useQuery({
    queryKey: ["resolutions", userId],
    queryFn: async () => {
      return await getResolutions(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateResolution() {
  const token = useToken();
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

export function useMarkResolutionComplete() {
  const token = useToken();
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

export function usePartnerResolutions(userId?: string) {
  const token = useToken();

  return useQuery({
    queryKey: ["partnerResolutions", userId],
    queryFn: async () => {
      return await getPartnerResolutions(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

