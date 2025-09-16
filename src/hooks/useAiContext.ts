import { useQuery } from "@tanstack/react-query";
import { getContext } from "../services/ai/contextService";
import { fetchKeyDetails } from "../services/ai/aiKeyDetailsService";

export const useAiContext = (userId: string, token: string) => {
return useQuery({
    queryKey: ["aiContext", userId],
    queryFn: async () => {
      return await getContext(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 12,
  });
}

export const useKeyDetails = (userId: string, token: string) => {
  return useQuery({
    queryKey: ["keyDetails", userId],
    queryFn: async () => {
      return await fetchKeyDetails(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 4,
  });
}
