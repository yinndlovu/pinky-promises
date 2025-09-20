import { useQuery } from "@tanstack/react-query";
import { getContext } from "../services/ai/contextService";
import { fetchKeyDetails } from "../services/ai/aiKeyDetailsService";

export const useAiContext = (userId: string, token: string | null) => {
return useQuery({
    queryKey: ["aiContext", userId],
    queryFn: async () => {
      if (!token) {
        return null;
      }

      return await getContext(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 12,
  });
}

export const useKeyDetails = (userId: string, token: string | null) => {
  return useQuery({
    queryKey: ["keyDetails", userId],
    queryFn: async () => {
      if (!token) {
        return [];
      }
      
      return await fetchKeyDetails(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 4,
  });
}
